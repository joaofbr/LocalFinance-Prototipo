using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.ReadModels;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class TransactionRepository(AppDbContext db) : ITransactionRepository
{
    public Task<Transaction?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default) =>
        db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.HouseholdId == householdId, ct);

    public Task<List<Transaction>> ListByMonthAsync(
        Guid householdId, int year, int month, CancellationToken ct = default)
    {
        var reference = new DateOnly(year, month, 1);
        return db.Transactions
            .Where(t => t.HouseholdId == householdId && t.ReferenceMonth == reference)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(ct);
    }

    public Task<int> CountByUserAsync(Guid userId, CancellationToken ct = default) =>
        db.Transactions.CountAsync(t => t.UserId == userId, ct);

    public async Task<Dictionary<Guid, int>> CountByCategoryAsync(
        Guid householdId, CancellationToken ct = default)
    {
        var counts = await db.Transactions
            .Where(t => t.HouseholdId == householdId)
            .GroupBy(t => t.CategoryId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return counts.ToDictionary(c => c.Key, c => c.Count);
    }

    public async Task<List<MonthlyTotal>> GetMonthlyTotalsAsync(
        Guid householdId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct = default)
    {
        var totals = await db.Transactions
            .Where(t => t.HouseholdId == householdId
                && t.ReferenceMonth >= from
                && t.ReferenceMonth <= to)
            .GroupBy(t => new { t.ReferenceMonth.Year, t.ReferenceMonth.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Income = g.Sum(t => t.Type == TransactionType.Income ? t.Amount : 0),
                Expense = g.Sum(t => t.Type == TransactionType.Expense ? t.Amount : 0),
            })
            .ToListAsync(ct);
        return totals
            .Select(t => new MonthlyTotal(t.Year, t.Month, t.Income, t.Expense))
            .ToList();
    }

    public Task<List<Transaction>> ListBySeriesAsync(
        Guid householdId, Guid seriesId, CancellationToken ct = default) =>
        db.Transactions
            .Where(t => t.HouseholdId == householdId && t.SeriesId == seriesId)
            .OrderBy(t => t.SeriesIndex)
            .ToListAsync(ct);

    public Task<List<Transaction>> ListByIdsAsync(
        Guid householdId, IReadOnlyCollection<Guid> ids, CancellationToken ct = default) =>
        db.Transactions
            .Where(t => t.HouseholdId == householdId && ids.Contains(t.Id))
            .ToListAsync(ct);

    public async Task AddAsync(Transaction transaction, CancellationToken ct = default) =>
        await db.Transactions.AddAsync(transaction, ct);

    public async Task AddRangeAsync(IEnumerable<Transaction> items, CancellationToken ct = default) =>
        await db.Transactions.AddRangeAsync(items, ct);

    public void Remove(Transaction transaction) =>
        db.Transactions.Remove(transaction);

    public void RemoveRange(IEnumerable<Transaction> items) =>
        db.Transactions.RemoveRange(items);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
