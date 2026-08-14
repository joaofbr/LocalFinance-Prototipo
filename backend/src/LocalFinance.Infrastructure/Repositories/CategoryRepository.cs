using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class CategoryRepository(AppDbContext db) : ICategoryRepository
{
    public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<List<Category>> ListAsync(CancellationToken ct = default) =>
        db.Categories.OrderBy(c => c.Name).ToListAsync(ct);

    public async Task AddAsync(Category category, CancellationToken ct = default) =>
        await db.Categories.AddAsync(category, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
