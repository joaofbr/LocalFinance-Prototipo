namespace LocalFinance.Application.Dtos;

public record TransactionDto(
    string Id,
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description,
    string? SeriesId = null,
    string? SeriesKind = null,
    int? SeriesIndex = null,
    int? SeriesTotal = null);

public record TransactionInput(
    string Type,
    decimal Amount,
    DateOnly Date,
    string CategoryId,
    string MemberId,
    string Description,
    int Repeat = 1,
    string RepeatMode = "installment");
