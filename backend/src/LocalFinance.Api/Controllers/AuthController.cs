using LocalFinance.Api.Security;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth, IMemberInviteService invites) : ControllerBase
{
    [HttpGet("invite")]
    public async Task<InviteTargetDto> Invite([FromQuery] string token, CancellationToken ct) =>
        await invites.ValidateTokenAsync(token, ct);

    [EnableRateLimiting(RateLimitPolicies.Auth)]
    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword(SetPasswordRequest request, CancellationToken ct)
    {
        await invites.SetPasswordAsync(request, ct);
        return NoContent();
    }

    [EnableRateLimiting(RateLimitPolicies.Email)]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        await invites.SendPasswordResetAsync(request.Email, ct);
        return NoContent();
    }

    [EnableRateLimiting(RateLimitPolicies.Auth)]
    [HttpPost("login")]
    public async Task<AuthResponse> Login(LoginRequest request, CancellationToken ct) =>
        await auth.LoginAsync(request, ct);

    [EnableRateLimiting(RateLimitPolicies.Auth)]
    [HttpPost("register")]
    public async Task<AuthResponse> Register(RegisterRequest request, CancellationToken ct) =>
        await auth.RegisterAsync(request, ct);

    [HttpPost("refresh")]
    public async Task<AuthResponse> Refresh(RefreshRequest request, CancellationToken ct) =>
        await auth.RefreshAsync(request.RefreshToken, ct);

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken ct)
    {
        await auth.RevokeAsync(request.RefreshToken, ct);
        return NoContent();
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<AuthResponse> ChangePassword(
        ChangePasswordRequest request, CancellationToken ct) =>
        await auth.ChangePasswordAsync(User.Id(), request, ct);

    [Authorize]
    [HttpGet("me")]
    public async Task<UserDto> Me(CancellationToken ct) =>
        await auth.GetCurrentAsync(User.Id(), ct);
}
