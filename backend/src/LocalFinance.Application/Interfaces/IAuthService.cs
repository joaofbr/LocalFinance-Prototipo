using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);

    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);

    Task RevokeAsync(string refreshToken, CancellationToken ct = default);

    Task<AuthResponse> ChangePasswordAsync(
        Guid userId, ChangePasswordRequest request, CancellationToken ct = default);

    Task<UserDto> GetCurrentAsync(Guid userId, CancellationToken ct = default);

    Task<bool> IsSessionValidAsync(
        Guid userId, Guid householdId, bool admin, bool developer, CancellationToken ct = default);
}
