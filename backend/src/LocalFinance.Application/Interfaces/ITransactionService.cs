using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionDto>> ListByMonthAsync(int year, int month, CancellationToken ct = default);
    Task<TransactionDto> CreateAsync(TransactionInput input, CancellationToken ct = default);
    Task<TransactionDto> UpdateAsync(
        Guid id, TransactionInput input, string? scope = null, CancellationToken ct = default);
    Task DeleteAsync(Guid id, string? scope = null, CancellationToken ct = default);
}
