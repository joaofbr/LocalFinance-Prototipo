using Poupi.Domain.Entities;
using Poupi.Domain.ReadModels;

namespace Poupi.Domain.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default);
    Task<List<Transaction>> ListByMonthAsync(Guid householdId, int year, int month, CancellationToken ct = default);
    Task<int> CountByUserAsync(Guid userId, CancellationToken ct = default);
    Task<bool> HasAnyAsync(Guid householdId, CancellationToken ct = default);
    Task<bool> HasAnyByUserAsync(Guid householdId, Guid userId, CancellationToken ct = default);
    Task<bool> HasSplitAsync(Guid householdId, CancellationToken ct = default);
    Task<Dictionary<Guid, int>> CountByCategoryAsync(Guid householdId, CancellationToken ct = default);
    Task<List<MonthlyTotal>> GetMonthlyTotalsAsync(
        Guid householdId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<List<DescriptionUsage>> ListDescriptionUsageAsync(
        Guid householdId, DateOnly since, CancellationToken ct = default);
    Task<List<Transaction>> ListBySeriesAsync(Guid householdId, Guid seriesId, CancellationToken ct = default);
    Task<List<Transaction>> ListByIdsAsync(
        Guid householdId, IReadOnlyCollection<Guid> ids, CancellationToken ct = default);
    Task AddAsync(Transaction transaction, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Transaction> items, CancellationToken ct = default);
    void Remove(Transaction transaction);
    void RemoveRange(IEnumerable<Transaction> items);
    Task SaveChangesAsync(CancellationToken ct = default);
}
