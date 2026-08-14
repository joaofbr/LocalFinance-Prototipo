using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);

    Task<UserDto> GetCurrentAsync(Guid userId, CancellationToken ct = default);
}
