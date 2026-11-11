using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class CategoryRepository(AppDbContext db) : ICategoryRepository
{
    public Task<Category?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.HouseholdId == householdId, ct);

    public Task<List<Category>> ListAsync(Guid householdId, CancellationToken ct = default) =>
        db.Categories
            .Where(c => c.HouseholdId == householdId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task AddAsync(Category category, CancellationToken ct = default) =>
        await db.Categories.AddAsync(category, ct);

    public async Task AddRangeAsync(IEnumerable<Category> items, CancellationToken ct = default) =>
        await db.Categories.AddRangeAsync(items, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
