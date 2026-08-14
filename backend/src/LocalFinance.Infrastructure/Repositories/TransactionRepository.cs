using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.ReadModels;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class TransactionRepository(AppDbContext db) : ITransactionRepository
{
    public Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Transactions.FirstOrDefaultAsync(t => t.Id == id, ct);

    public Task<List<Transaction>> ListByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        var from = new DateOnly(year, month, 1);
        var to = from.AddMonths(1);
        return db.Transactions
            .Where(t => t.Date >= from && t.Date < to)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(ct);
    }

    public Task<int> CountByUserAsync(Guid userId, CancellationToken ct = default) =>
        db.Transactions.CountAsync(t => t.UserId == userId, ct);

    public async Task<Dictionary<Guid, int>> CountByCategoryAsync(CancellationToken ct = default)
    {
        var counts = await db.Transactions
            .GroupBy(t => t.CategoryId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return counts.ToDictionary(c => c.Key, c => c.Count);
    }

    public async Task<List<MonthlyTotal>> GetMonthlyTotalsAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct = default)
    {
        var totals = await db.Transactions
            .Where(t => t.Date >= from && t.Date <= to)
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
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

    public Task<List<Transaction>> ListByGroupAsync(Guid groupId, CancellationToken ct = default) =>
        db.Transactions
            .Where(t => t.InstallmentGroupId == groupId)
            .OrderBy(t => t.InstallmentNumber)
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
