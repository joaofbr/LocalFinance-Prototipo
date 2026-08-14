namespace LocalFinance.Application.Dtos;

public record TransactionDto(
    string Id,
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description);

public record TransactionInput(
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description);
