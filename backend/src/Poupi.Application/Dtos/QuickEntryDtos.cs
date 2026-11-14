namespace Poupi.Application.Dtos;

public record InterpretInput(string? Text, DateOnly? Today = null, DateOnly? DefaultDate = null);

public record TransactionDraftDto(
    string Type,
    decimal? Amount,
    DateOnly Date,
    string? CategoryId,
    List<string> MemberIds,
    string Description,
    int Repeat,
    string? RepeatMode,
    string? CardId,
    List<string> Warnings);
