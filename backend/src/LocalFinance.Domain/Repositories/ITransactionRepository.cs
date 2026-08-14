using LocalFinance.Domain.Entities;
using LocalFinance.Domain.ReadModels;

namespace LocalFinance.Domain.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Transaction>> ListByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<int> CountByUserAsync(Guid userId, CancellationToken ct = default);
    Task<Dictionary<Guid, int>> CountByCategoryAsync(CancellationToken ct = default);
    Task<List<MonthlyTotal>> GetMonthlyTotalsAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<List<Transaction>> ListByGroupAsync(Guid groupId, CancellationToken ct = default);
    Task AddAsync(Transaction transaction, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<Transaction> items, CancellationToken ct = default);
    void Remove(Transaction transaction);
    void RemoveRange(IEnumerable<Transaction> items);
    Task SaveChangesAsync(CancellationToken ct = default);
}
