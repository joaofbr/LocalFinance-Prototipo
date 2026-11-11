using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.ReadModels;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class HouseholdRepository(AppDbContext db) : IHouseholdRepository
{
    public Task<Household?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Households.FirstOrDefaultAsync(h => h.Id == id, ct);

    public async Task<List<HouseholdSummary>> ListSummariesAsync(CancellationToken ct = default)
    {
        var rows = await db.Households
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new
            {
                h.Id,
                h.Status,
                h.Plan,
                h.CreatedAt,
                Owner = db.Users
                    .Where(u => u.HouseholdId == h.Id && u.Role == UserRole.Admin)
                    .OrderBy(u => u.CreatedAt)
                    .Select(u => new { u.Name, u.Email })
                    .FirstOrDefault(),
                MemberCount = db.Users.Count(u => u.HouseholdId == h.Id),
            })
            .ToListAsync(ct);

        return rows
            .Select(r => new HouseholdSummary(
                r.Id,
                r.Status,
                r.Plan,
                r.CreatedAt,
                r.Owner?.Name ?? "—",
                r.Owner?.Email ?? "—",
                r.MemberCount))
            .ToList();
    }

    public async Task<PlatformCounts> GetCountsAsync(
        DateTime signupsSince, CancellationToken ct = default)
    {
        var byStatus = await db.Households
            .GroupBy(h => h.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Status, g => g.Count, ct);

        return new PlatformCounts(
            byStatus.GetValueOrDefault(HouseholdStatus.Active),
            byStatus.GetValueOrDefault(HouseholdStatus.Pending),
            byStatus.GetValueOrDefault(HouseholdStatus.Suspended),
            await db.Households.CountAsync(
                h => h.Status == HouseholdStatus.Active && h.Plan == HouseholdPlan.Family, ct),
            await db.Users.CountAsync(u => u.Active, ct),
            await db.Households.CountAsync(h => h.CreatedAt >= signupsSince, ct));
    }

    public async Task DeleteWithDataAsync(Guid id, CancellationToken ct = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Transactions.Where(t => t.HouseholdId == id).ExecuteDeleteAsync(ct);
        await db.Categories.Where(c => c.HouseholdId == id).ExecuteDeleteAsync(ct);
        await db.Users.Where(u => u.HouseholdId == id).ExecuteDeleteAsync(ct);
        await db.Households.Where(h => h.Id == id).ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
