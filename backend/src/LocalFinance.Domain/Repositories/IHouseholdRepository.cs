using LocalFinance.Domain.Entities;
using LocalFinance.Domain.ReadModels;

namespace LocalFinance.Domain.Repositories;

public interface IHouseholdRepository
{
    Task<Household?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<HouseholdSummary>> ListSummariesAsync(CancellationToken ct = default);
    Task<PlatformCounts> GetCountsAsync(DateTime signupsSince, CancellationToken ct = default);
    Task DeleteWithDataAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
