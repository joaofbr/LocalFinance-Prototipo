using Poupi.Application.Dtos;

namespace Poupi.Application.Interfaces;

public interface IHouseholdService
{
    Task<HouseholdDto> GetAsync(Guid householdId, CancellationToken ct = default);
    Task<HouseholdDto> SetPlanAsync(Guid householdId, string plan, CancellationToken ct = default);
    Task EnsureFamilyPlanAsync(Guid householdId, CancellationToken ct = default);
}
