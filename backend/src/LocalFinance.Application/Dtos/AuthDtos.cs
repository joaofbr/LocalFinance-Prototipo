namespace LocalFinance.Application.Dtos;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Name, string Email, string Password);

public record UserDto(string Id, string Name, string Email, string Role);

public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
