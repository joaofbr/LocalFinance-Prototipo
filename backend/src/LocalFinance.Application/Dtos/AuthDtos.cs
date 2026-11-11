namespace LocalFinance.Application.Dtos;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Name, string Email, string Password);

public record UserDto(string Id, string Name, string Email, string Role, bool Developer);

public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserDto User,
    string RefreshToken);

public record RegisterResponse(bool PendingApproval, AuthResponse? Session);

public record RefreshRequest(string RefreshToken);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
