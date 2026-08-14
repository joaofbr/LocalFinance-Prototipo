namespace LocalFinance.Application.Dtos;

public record TransactionDto(
    string Id,
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description,
    string? InstallmentGroupId = null,
    int? InstallmentNumber = null,
    int? InstallmentTotal = null);

public record TransactionInput(
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description,
    int Installments = 1);
