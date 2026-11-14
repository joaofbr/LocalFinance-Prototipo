using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Entities;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class OnboardingService(
    IUserRepository users,
    IHouseholdRepository households,
    ITransactionRepository transactions,
    ICardRepository cards,
    ICategoryRepository categories) : IOnboardingService
{
    public async Task<OnboardingDto> GetAsync(
        Guid householdId, Guid userId, CancellationToken ct = default)
    {
        var user = await GetUserAsync(householdId, userId, ct);
        var household = await households.GetByIdAsync(householdId, ct)
            ?? throw new UnauthorizedException("Sessão inválida. Entre novamente.");
        var members = await users.ListAsync(householdId, ct);
        var founder = members.FirstOrDefault();
        var invited = founder is not null && founder.Id != user.Id;

        var checklist = user.ChecklistDismissedAt is null
            ? await ChecklistAsync(householdId, user, invited, ct)
            : [];
        var familyGuide = household.Plan == HouseholdPlan.Family
            && user.FamilyGuideStartedAt is not null
            && user.FamilyGuideDismissedAt is null
                ? await FamilyGuideAsync(householdId, members, ct)
                : [];

        return new OnboardingDto(
            user.WelcomeSeenAt is null,
            invited,
            invited ? founder!.Name : null,
            checklist,
            familyGuide);
    }

    public async Task MarkWelcomeSeenAsync(
        Guid householdId, Guid userId, CancellationToken ct = default)
    {
        var user = await GetUserAsync(householdId, userId, ct);
        user.WelcomeSeenAt ??= DateTime.UtcNow;
        await users.SaveChangesAsync(ct);
    }

    public async Task DismissChecklistAsync(
        Guid householdId, Guid userId, CancellationToken ct = default)
    {
        var user = await GetUserAsync(householdId, userId, ct);
        user.ChecklistDismissedAt ??= DateTime.UtcNow;
        await users.SaveChangesAsync(ct);
    }

    public async Task DismissFamilyGuideAsync(
        Guid householdId, Guid userId, CancellationToken ct = default)
    {
        var user = await GetUserAsync(householdId, userId, ct);
        user.FamilyGuideDismissedAt ??= DateTime.UtcNow;
        await users.SaveChangesAsync(ct);
    }

    private async Task<List<OnboardingStepDto>> ChecklistAsync(
        Guid householdId, User user, bool invited, CancellationToken ct)
    {
        var hasCard = (await cards.ListAsync(householdId, ct)).Count > 0;
        if (invited)
        {
            return
            [
                new("account", true),
                new("first-transaction", await transactions.HasAnyByUserAsync(householdId, user.Id, ct)),
                new("card", hasCard),
            ];
        }

        var hasOwnCategory = (await categories.ListAsync(householdId, ct))
            .Any(c => !DefaultCategories.IsDefault(c.Name));
        return
        [
            new("account", true),
            new("first-transaction", await transactions.HasAnyAsync(householdId, ct)),
            new("card", hasCard),
            new("category", hasOwnCategory),
        ];
    }

    private async Task<List<OnboardingStepDto>> FamilyGuideAsync(
        Guid householdId, List<User> members, CancellationToken ct) =>
    [
        new("family-mode", true),
        new("invite", members.Count > 1),
        new("split", await transactions.HasSplitAsync(householdId, ct)),
    ];

    private async Task<User> GetUserAsync(Guid householdId, Guid userId, CancellationToken ct) =>
        await users.GetInHouseholdAsync(householdId, userId, ct)
        ?? throw new UnauthorizedException("Sessão inválida. Entre novamente.");
}
