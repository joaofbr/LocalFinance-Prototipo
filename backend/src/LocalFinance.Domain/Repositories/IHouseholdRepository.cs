using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface IHouseholdRepository
{
    Task<Household?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
