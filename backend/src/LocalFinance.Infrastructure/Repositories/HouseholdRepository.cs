using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class HouseholdRepository(AppDbContext db) : IHouseholdRepository
{
    public Task<Household?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Households.FirstOrDefaultAsync(h => h.Id == id, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
