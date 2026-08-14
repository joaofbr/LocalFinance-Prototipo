using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Category>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
