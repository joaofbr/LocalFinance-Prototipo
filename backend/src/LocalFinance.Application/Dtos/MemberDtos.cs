namespace LocalFinance.Application.Dtos;

public record MemberDto(
    string Id,
    string Name,
    string Email,
    string Role,
    bool Active,
    string Color,
    bool PasswordPending);

public record MemberInput(string Name, string Email, string Role);
