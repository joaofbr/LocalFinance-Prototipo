using LocalFinance.Api.Security;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth, IMemberInviteService invites) : ControllerBase
{
    [HttpGet("invite")]
    public async Task<InviteTargetDto> Invite([FromQuery] string token, CancellationToken ct) =>
        await invites.ValidateTokenAsync(token, ct);

    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword(SetPasswordRequest request, CancellationToken ct)
    {
        await invites.SetPasswordAsync(request, ct);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        await invites.SendPasswordResetAsync(request.Email, ct);
        return NoContent();
    }

    [HttpPost("login")]
    public async Task<AuthResponse> Login(LoginRequest request, CancellationToken ct) =>
        await auth.LoginAsync(request, ct);

    [HttpPost("register")]
    public async Task<AuthResponse> Register(RegisterRequest request, CancellationToken ct) =>
        await auth.RegisterAsync(request, ct);

    [Authorize]
    [HttpGet("me")]
    public async Task<UserDto> Me(CancellationToken ct) =>
        await auth.GetCurrentAsync(User.Id(), ct);
}
