using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default);
    Task<List<Category>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Category> items, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
