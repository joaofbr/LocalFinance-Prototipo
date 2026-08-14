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
    Task AddAsync(Transaction transaction, CancellationToken ct = default);
    void Remove(Transaction transaction);
    Task SaveChangesAsync(CancellationToken ct = default);
}
