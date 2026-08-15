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

    public async Task<List<TransactionDto>> ListByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        ValidateMonth(month);
        var list = await transactions.ListByMonthAsync(year, month, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<TransactionDto> CreateAsync(TransactionInput input, CancellationToken ct = default)
    {
        var months = input.Repeat;
        if (months is < 1 or > MaxRepeat)
        {
            throw new ValidationException(
                $"A repetição deve estar entre 1 e {MaxRepeat} meses.");
        }

        var participants = await ResolveParticipantsAsync(input.MemberIds, ct);
        var template = new Transaction();
        await ApplyAsync(template, input, ct);

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
        Guid id, TransactionInput input, string? scope = null, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        var reached = await ResolveScopeAsync(transaction, scope, ct);

        var previousAmount = transaction.Amount;
        await ApplyAsync(transaction, input, ct);
        var amountChanged = previousAmount != transaction.Amount;

        if (transaction.SplitTotal is null)
        {
            var participants = await ResolveParticipantsAsync(input.MemberIds, ct);
            transaction.UserId = participants[0];
        }

        foreach (var sibling in reached.Where(s => s.Id != transaction.Id))
        {
            sibling.Type = transaction.Type;
            sibling.CategoryId = transaction.CategoryId;
            sibling.Description = transaction.Description;

            if (amountChanged && sibling.SeriesKind == SeriesKind.Fixed)
            {
                sibling.Amount = transaction.Amount;
            }
        }

        await transactions.SaveChangesAsync(ct);
        return ToDto(transaction);
    }

    public async Task DeleteAsync(Guid id, string? scope = null, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        var reached = await ResolveScopeAsync(transaction, scope, ct);

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
        Transaction transaction, string? scope, CancellationToken ct)
    {
        if (transaction.SeriesId is not Guid seriesId)
        {
            return [];
        }

        var series = await transactions.ListBySeriesAsync(seriesId, ct);

        return (scope ?? "one").ToLowerInvariant() switch
        {
            "all" => series,
            "future" => series.Where(s => s.SeriesIndex >= transaction.SeriesIndex).ToList(),
            _ => series.Where(s => s.SeriesIndex == transaction.SeriesIndex).ToList(),
        };
    }

    private async Task<List<Guid>> ResolveParticipantsAsync(
        List<string> memberIds, CancellationToken ct)
    {
        if (memberIds is null || memberIds.Count == 0)
        {
            throw new ValidationException("Selecione ao menos um integrante.");
        }

        var resolved = new List<Guid>();
        foreach (var raw in memberIds.Distinct())
        {
            if (!Guid.TryParse(raw, out var id) || await users.GetByIdAsync(id, ct) is null)
            {
                throw new ValidationException("Integrante não encontrado.");
            }
            resolved.Add(id);
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

    private async Task<Transaction> GetOrThrowAsync(Guid id, CancellationToken ct) =>
        await transactions.GetByIdAsync(id, ct)
        ?? throw new NotFoundException("Lançamento não encontrado.");

    private async Task ApplyAsync(Transaction transaction, TransactionInput input, CancellationToken ct)
    {
        if (input.Amount <= 0)
        {
            throw new ValidationException("Informe um valor maior que zero.");
        }
        if (!Guid.TryParse(input.CategoryId, out var categoryId)
            || await categories.GetByIdAsync(categoryId, ct) is null)
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
