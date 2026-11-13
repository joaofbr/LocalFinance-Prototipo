namespace Poupi.Application.Dtos;

public record InviteTargetDto(
    string Name,
    string Email,
    bool IsInvite,
    string? InvitedByName,
    string? InvitedByEmail);

public record SetPasswordRequest(string Token, string Password);

public record DeclineInviteRequest(string Token);

public record ForgotPasswordRequest(string Email);
