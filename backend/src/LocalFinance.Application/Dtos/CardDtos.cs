namespace LocalFinance.Application.Dtos;

public record CardDto(
    string Id,
    string Name,
    int ClosingDay,
    int DueDay,
    string? OwnerId,
    bool Active);

public record CardInput(string Name, int ClosingDay, int DueDay, string? OwnerId);
