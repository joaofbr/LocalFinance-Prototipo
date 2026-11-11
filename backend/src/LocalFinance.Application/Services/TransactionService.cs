using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class TransactionService(
    ITransactionRepository transactions,
    ICategoryRepository categories,
    IUserRepository users) : ITransactionService
{
    private const int MaxRepeat = 60;

    public async Task<List<TransactionDto>> ListByMonthAsync(
        Guid householdId, int year, int month, CancellationToken ct = default)
    {
        ValidateMonth(month);
        var list = await transactions.ListByMonthAsync(householdId, year, month, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<TransactionDto> CreateAsync(
        Guid householdId, TransactionInput input, CancellationToken ct = default)
    {
        var months = input.Repeat;
        if (months is < 1 or > MaxRepeat)
        {
            throw new ValidationException(
                $"A repetição deve estar entre 1 e {MaxRepeat} meses.");
        }

        var participants = await ResolveParticipantsAsync(householdId, input.MemberIds, ct);
        var template = new Transaction { HouseholdId = householdId };
        await ApplyAsync(householdId, template, input, ct);

        var kind = months > 1 ? EnumMapping.ParseSeriesKind(input.RepeatMode) : (SeriesKind?)null;
        if (kind == SeriesKind.Installment && template.Type == TransactionType.Income)
        {
            throw new ValidationException("Receitas não podem ser parceladas.");
        }

        if (months == 1 && participants.Count == 1)
        {
            template.UserId = participants[0];
            await transactions.AddAsync(template, ct);
            await transactions.SaveChangesAsync(ct);
            return ToDto(template);
        }

        var seriesId = Guid.NewGuid();
        var batch = new List<Transaction>(months * participants.Count);

        for (var m = 0; m < months; m++)
        {
            var monthAmount = kind == SeriesKind.Installment
                ? SliceOf(template.Amount, months, m)
                : template.Amount;

            for (var p = 0; p < participants.Count; p++)
            {
                batch.Add(new Transaction
                {
                    HouseholdId = householdId,
                    Type = template.Type,
                    Amount = SliceOf(monthAmount, participants.Count, p),
                    Date = template.Date.AddMonths(m),
                    CategoryId = template.CategoryId,
                    UserId = participants[p],
                    Description = template.Description,
                    SeriesId = seriesId,
                    SeriesKind = kind,
                    SeriesIndex = m + 1,
                    SeriesTotal = months,
                    SplitTotal = participants.Count > 1 ? participants.Count : null,
                });
            }
        }

        await transactions.AddRangeAsync(batch, ct);
        await transactions.SaveChangesAsync(ct);
        return ToDto(batch[0]);
    }

    public async Task<TransactionDto> UpdateAsync(
        Guid householdId, Guid id, TransactionInput input, string? scope = null,
        CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(householdId, id, ct);
        var participants = await ResolveParticipantsAsync(householdId, input.MemberIds, ct);
        var template = new Transaction();
        await ApplyAsync(householdId, template, input, ct);

        if (template.Type == TransactionType.Income && transaction.SeriesKind == SeriesKind.Installment)
        {
            throw new ValidationException("Receitas não podem ser parceladas.");
        }

        var reached = await ResolveScopeAsync(householdId, transaction, scope, ct);
        if (reached.Count == 0)
        {
            reached = [transaction];
        }

        var targetIndex = transaction.SeriesIndex;
        var previousTotal = reached.Where(t => t.SeriesIndex == targetIndex).Sum(t => t.Amount);
        var amountChanged = previousTotal != template.Amount;
        var seriesId = transaction.SeriesId ?? (participants.Count > 1 ? Guid.NewGuid() : null);

        var edited = transaction;
        foreach (var occurrence in reached.GroupBy(t => t.SeriesIndex))
        {
            var parts = occurrence.ToList();
            var isTarget = occurrence.Key == targetIndex;
            var total = isTarget || (amountChanged && transaction.SeriesKind == SeriesKind.Fixed)
                ? template.Amount
                : parts.Sum(t => t.Amount);
            var date = isTarget ? template.Date : parts[0].Date;

            var assigned = await RedistributeAsync(parts, participants, template, total, date, seriesId, ct);
            if (isTarget)
            {
                edited = assigned[0];
            }
        }

        await transactions.SaveChangesAsync(ct);
        return ToDto(edited);
    }

    private async Task<List<Transaction>> RedistributeAsync(
        List<Transaction> parts,
        List<Guid> participants,
        Transaction template,
        decimal total,
        DateOnly date,
        Guid? seriesId,
        CancellationToken ct)
    {
        var model = parts[0];
        var spare = parts.Where(p => !participants.Contains(p.UserId)).ToList();
        var assigned = new List<Transaction>(participants.Count);

        for (var i = 0; i < participants.Count; i++)
        {
            var part = parts.FirstOrDefault(p => p.UserId == participants[i]);
            if (part is null && spare.Count > 0)
            {
                part = spare[0];
                spare.RemoveAt(0);
            }

            var isNew = part is null;
            part ??= new Transaction
            {
                HouseholdId = model.HouseholdId,
                SeriesKind = model.SeriesKind,
                SeriesIndex = model.SeriesIndex,
                SeriesTotal = model.SeriesTotal,
            };

            part.UserId = participants[i];
            part.Type = template.Type;
            part.CategoryId = template.CategoryId;
            part.Description = template.Description;
            part.Date = date;
            part.Amount = SliceOf(total, participants.Count, i);
            part.SeriesId = seriesId;
            if (seriesId is not null)
            {
                part.SeriesIndex ??= 1;
                part.SeriesTotal ??= 1;
            }
            part.SplitTotal = participants.Count > 1 ? participants.Count : null;

            if (isNew)
            {
                await transactions.AddAsync(part, ct);
            }
            assigned.Add(part);
        }

        if (spare.Count > 0)
        {
            transactions.RemoveRange(spare);
        }
        return assigned;
    }

    public async Task DeleteAsync(
        Guid householdId, Guid id, string? scope = null, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(householdId, id, ct);
        var reached = await ResolveScopeAsync(householdId, transaction, scope, ct);

        if (reached.Count > 0)
        {
            transactions.RemoveRange(reached);
        }
        else
        {
            transactions.Remove(transaction);
        }

        await transactions.SaveChangesAsync(ct);
    }

    private async Task<List<Transaction>> ResolveScopeAsync(
        Guid householdId, Transaction transaction, string? scope, CancellationToken ct)
    {
        if (transaction.SeriesId is not Guid seriesId)
        {
            return [];
        }

        var series = await transactions.ListBySeriesAsync(householdId, seriesId, ct);

        return (scope ?? "one").ToLowerInvariant() switch
        {
            "all" => series,
            "future" => series.Where(s => s.SeriesIndex >= transaction.SeriesIndex).ToList(),
            _ => series.Where(s => s.SeriesIndex == transaction.SeriesIndex).ToList(),
        };
    }

    private async Task<List<Guid>> ResolveParticipantsAsync(
        Guid householdId, List<string> memberIds, CancellationToken ct)
    {
        if (memberIds is null || memberIds.Count == 0)
        {
            throw new ValidationException("Selecione ao menos um integrante.");
        }

        var resolved = new List<Guid>();
        foreach (var raw in memberIds)
        {
            if (!Guid.TryParse(raw, out var id))
            {
                throw new ValidationException("Integrante não encontrado.");
            }
            if (!resolved.Contains(id))
            {
                resolved.Add(id);
            }
        }

        if (await users.CountInHouseholdAsync(householdId, resolved, ct) != resolved.Count)
        {
            throw new ValidationException("Integrante não encontrado.");
        }
        return resolved;
    }

    private static decimal SliceOf(decimal total, int parts, int index)
    {
        if (parts == 1)
        {
            return total;
        }
        var each = decimal.Round(total / parts, 2);
        return index == parts - 1 ? total - (each * (parts - 1)) : each;
    }

    private async Task<Transaction> GetOrThrowAsync(Guid householdId, Guid id, CancellationToken ct) =>
        await transactions.GetByIdAsync(householdId, id, ct)
        ?? throw new NotFoundException("Lançamento não encontrado.");

    private async Task ApplyAsync(
        Guid householdId, Transaction transaction, TransactionInput input, CancellationToken ct)
    {
        if (input.Amount <= 0)
        {
            throw new ValidationException("Informe um valor maior que zero.");
        }
        if (!Guid.TryParse(input.CategoryId, out var categoryId)
            || await categories.GetByIdAsync(householdId, categoryId, ct) is null)
        {
            throw new ValidationException("Categoria não encontrada.");
        }

        transaction.Type = EnumMapping.ParseTransactionType(input.Type);
        transaction.Amount = decimal.Round(input.Amount, 2);
        transaction.Date = input.Date;
        transaction.CategoryId = categoryId;
        transaction.Description = input.Description.Trim();
    }

    private static void ValidateMonth(int month)
    {
        if (month is < 1 or > 12)
        {
            throw new ValidationException("Mês inválido.");
        }
    }

    private static TransactionDto ToDto(Transaction transaction) => new(
        transaction.Id.ToString(),
        transaction.Type.ToDto(),
        transaction.Amount,
        transaction.Date,
        transaction.CategoryId.ToString(),
        transaction.UserId.ToString(),
        transaction.Description,
        transaction.SeriesId?.ToString(),
        transaction.SeriesKind?.ToDto(),
        transaction.SeriesIndex,
        transaction.SeriesTotal,
        transaction.SplitTotal);
}
