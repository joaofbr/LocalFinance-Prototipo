using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Application.QuickEntry;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class QuickEntryService(
    ITransactionRepository transactions,
    ICategoryRepository categories,
    ICardRepository cards,
    IUserRepository users,
    IHouseholdRepository households) : IQuickEntryService
{
    private const int MaxTextLength = 160;
    private const int HistoryMonths = 12;
    private static readonly TimeSpan BrasiliaOffset = TimeSpan.FromHours(-3);

    public async Task<TransactionDraftDto> InterpretAsync(
        Guid householdId, Guid userId, InterpretInput input, CancellationToken ct = default)
    {
        var text = input.Text?.Trim() ?? string.Empty;
        if (text.Length == 0)
        {
            throw new ValidationException("Escreva o lançamento. Ex.: mercado 89,90");
        }
        if (text.Length > MaxTextLength)
        {
            throw new ValidationException($"Escreva em até {MaxTextLength} caracteres.");
        }

        var household = await households.GetByIdAsync(householdId, ct)
            ?? throw new NotFoundException("Conta não encontrada.");
        var today = input.Today ?? DateOnly.FromDateTime(DateTime.UtcNow.Add(BrasiliaOffset));
        var defaultDate = input.DefaultDate ?? today;

        var activeCategories = (await categories.ListAsync(householdId, ct))
            .Where(c => c.Active)
            .Select(c => new EntryCategory(c.Id, c.Name, c.Kind))
            .ToList();
        var activeCards = (await cards.ListAsync(householdId, ct))
            .Where(c => c.Active)
            .Select(c => new EntryCard(c.Id, c.Name, c.OwnerId))
            .ToList();
        var members = household.Plan == HouseholdPlan.Family
            ? (await users.ListAsync(householdId, ct))
                .Where(u => u.Active)
                .Select(u => new EntryMember(u.Id, u.Name))
                .ToList()
            : [];
        var history = await transactions.ListDescriptionUsageAsync(
            householdId, today.AddMonths(-HistoryMonths), ct);

        var draft = TransactionInterpreter.Interpret(
            text,
            new EntryContext(userId, today, defaultDate, activeCategories, activeCards, members, history));

        return new TransactionDraftDto(
            draft.Type.ToDto(),
            draft.Amount,
            draft.Date,
            draft.CategoryId?.ToString(),
            draft.MemberIds.Select(id => id.ToString()).ToList(),
            draft.Description,
            draft.Repeat,
            draft.RepeatKind?.ToDto(),
            draft.CardId?.ToString(),
            draft.Warnings);
    }
}
