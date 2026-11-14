using Poupi.Application.Dtos;

namespace Poupi.Application.Interfaces;

public interface IOnboardingService
{
    Task<OnboardingDto> GetAsync(Guid householdId, Guid userId, CancellationToken ct = default);
    Task MarkWelcomeSeenAsync(Guid householdId, Guid userId, CancellationToken ct = default);
    Task DismissChecklistAsync(Guid householdId, Guid userId, CancellationToken ct = default);
    Task DismissFamilyGuideAsync(Guid householdId, Guid userId, CancellationToken ct = default);
}
