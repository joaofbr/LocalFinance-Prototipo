using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionDto>> ListByMonthAsync(
        Guid householdId, int year, int month, CancellationToken ct = default);
    Task<TransactionDto> CreateAsync(
        Guid householdId, TransactionInput input, CancellationToken ct = default);
    Task<TransactionDto> UpdateAsync(
        Guid householdId, Guid id, TransactionInput input, string? scope = null,
        CancellationToken ct = default);
    Task DeleteAsync(Guid householdId, Guid id, string? scope = null, CancellationToken ct = default);
    Task AssignCardAsync(Guid householdId, AssignCardInput input, CancellationToken ct = default);
}
