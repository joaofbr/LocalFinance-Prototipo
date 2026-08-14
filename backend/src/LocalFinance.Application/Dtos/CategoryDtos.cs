namespace LocalFinance.Application.Dtos;

public record CategoryDto(
    string Id,
    string Name,
    string Kind,
    string Color,
    string Icon,
    bool Active);

public record CategoryInput(string Name, string Kind, string Color, string Icon);

public record SetActiveInput(bool Active);
