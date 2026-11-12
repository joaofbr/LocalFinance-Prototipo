using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Billing;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class TransactionService(
    ITransactionRepository transactions,
    ICategoryRepository categories,
    ICardRepository cards,
    IUserRepository users) : ITransactionService
{
    private const int MaxRepeat = 60;

    private sealed record Placement(DateOnly Date, DateOnly ReferenceMonth, Guid? CardId);

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
        var card = await ResolveCardAsync(householdId, input.CardId, template.Type, null, ct);
        template.CardId = card?.Id;
        template.ReferenceMonth = CardBilling.ReferenceMonth(card, template.Date);

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

            var date = template.Date.AddMonths(m);
            var reference = kind == SeriesKind.Installment
                ? CardBilling.ReferenceMonth(card, template.Date, m)
                : CardBilling.ReferenceMonth(card, date);
            for (var p = 0; p < participants.Count; p++)
            {
                batch.Add(new Transaction
                {
                    HouseholdId = householdId,
                    Type = template.Type,
                    Amount = SliceOf(monthAmount, participants.Count, p),
                    Date = date,
                    ReferenceMonth = reference,
                    CardId = card?.Id,
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
        var card = await ResolveCardAsync(householdId, input.CardId, template.Type, transaction.CardId, ct);
        var cardChanged = transaction.CardId != card?.Id;
        var dateChanged = transaction.Date != template.Date;

        var series = await LoadSeriesAsync(householdId, transaction, ct);
        var reached = InScope(series, transaction, scope);
        if (reached.Count == 0)
        {
            reached = [transaction];
        }
        var firstInstallmentDate = series.FirstOrDefault(t => t.SeriesIndex == 1)?.Date;

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
            var dateEdited = isTarget && dateChanged;
            var reference = cardChanged || dateEdited
                ? ReferenceFor(card, parts[0], date, dateEdited ? null : firstInstallmentDate)
                : parts[0].ReferenceMonth;

            var assigned = await RedistributeAsync(
                parts, participants, template, total, new Placement(date, reference, card?.Id), seriesId, ct);
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
        Placement placement,
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
            part.Date = placement.Date;
            part.ReferenceMonth = placement.ReferenceMonth;
            part.CardId = placement.CardId;
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
        var series = await LoadSeriesAsync(householdId, transaction, ct);
        var reached = InScope(series, transaction, scope);

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

    public async Task AssignCardAsync(
        Guid householdId, AssignCardInput input, CancellationToken ct = default)
    {
        var ids = new List<Guid>();
        foreach (var raw in input.TransactionIds ?? [])
        {
            if (!Guid.TryParse(raw, out var id))
            {
                throw new NotFoundException("Lançamento não encontrado.");
            }
            if (!ids.Contains(id))
            {
                ids.Add(id);
            }
        }
        if (ids.Count == 0)
        {
            throw new ValidationException("Selecione ao menos um lançamento.");
        }

        var found = await transactions.ListByIdsAsync(householdId, ids, ct);
        if (found.Count != ids.Count)
        {
            throw new NotFoundException("Lançamento não encontrado.");
        }
        var card = await ResolveCardAsync(householdId, input.CardId, TransactionType.Expense, null, ct)
            ?? throw new ValidationException("Escolha um cartão.");
        if (found.Any(t => t.Type != TransactionType.Expense))
        {
            throw new ValidationException("Cartão de crédito vale só para despesas.");
        }

        foreach (var transaction in found)
        {
            transaction.CardId = card.Id;
        }
        await transactions.SaveChangesAsync(ct);
    }

    private async Task<Card?> ResolveCardAsync(
        Guid householdId, string? cardId, TransactionType type, Guid? currentCardId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cardId))
        {
            return null;
        }
        if (!Guid.TryParse(cardId, out var id)
            || await cards.GetByIdAsync(householdId, id, ct) is not Card card)
        {
            throw new ValidationException("Cartão não encontrado.");
        }
        if (type != TransactionType.Expense)
        {
            throw new ValidationException("Cartão de crédito vale só para despesas.");
        }
        if (!card.Active && card.Id != currentCardId)
        {
            throw new ValidationException("Este cartão está arquivado.");
        }
        return card;
    }

    private static DateOnly ReferenceFor(
        Card? card, Transaction occurrence, DateOnly date, DateOnly? firstInstallmentDate)
    {
        if (occurrence.SeriesKind != SeriesKind.Installment || occurrence.SeriesIndex is not > 1)
        {
            return CardBilling.ReferenceMonth(card, date);
        }
        var monthsAfter = occurrence.SeriesIndex.Value - 1;
        var purchase = firstInstallmentDate ?? date.AddMonths(-monthsAfter);
        return CardBilling.ReferenceMonth(card, purchase, monthsAfter);
    }

    private async Task<List<Transaction>> LoadSeriesAsync(
        Guid householdId, Transaction transaction, CancellationToken ct) =>
        transaction.SeriesId is Guid seriesId
            ? await transactions.ListBySeriesAsync(householdId, seriesId, ct)
            : [];

    private static List<Transaction> InScope(
        List<Transaction> series, Transaction transaction, string? scope)
    {
        if (series.Count == 0)
        {
            return [];
        }

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
        transaction.ReferenceMonth,
        transaction.CategoryId.ToString(),
        transaction.UserId.ToString(),
        transaction.Description,
        transaction.CardId?.ToString(),
        transaction.SeriesId?.ToString(),
        transaction.SeriesKind?.ToDto(),
        transaction.SeriesIndex,
        transaction.SeriesTotal,
        transaction.SplitTotal);
}
