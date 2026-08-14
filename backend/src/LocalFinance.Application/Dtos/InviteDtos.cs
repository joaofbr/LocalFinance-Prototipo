namespace LocalFinance.Application.Dtos;

public record InviteTargetDto(string Name, string Email);

public record SetPasswordRequest(string Token, string Password);

public record ForgotPasswordRequest(string Email);
