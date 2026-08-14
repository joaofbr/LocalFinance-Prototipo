using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class AuthService(
    IUserRepository users,
    IPasswordHasher hasher,
    IJwtTokenGenerator tokens) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await users.GetByEmailAsync(email, ct);
        if (user is not null && user.Active && string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new UnauthorizedException(
                "Você ainda não definiu sua senha. Use o link do e-mail de convite.");
        }
        if (user is null || !hasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("E-mail ou senha inválidos.");
        }
        if (!user.Active)
        {
            throw new UnauthorizedException("Este usuário está desativado.");
        }
        return BuildResponse(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length < 2)
        {
            throw new ValidationException("Informe seu nome.");
        }
        var email = NormalizeEmail(request.Email);
        if (!email.Contains('@'))
        {
            throw new ValidationException("E-mail inválido.");
        }
        if (request.Password.Length < 4)
        {
            throw new ValidationException("A senha deve ter ao menos 4 caracteres.");
        }
        if (await users.GetByEmailAsync(email, ct) is not null)
        {
            throw new ConflictException("Já existe uma conta com este e-mail.");
        }

        var count = await users.CountAsync(ct);
        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = hasher.Hash(request.Password),
            Role = count == 0 ? UserRole.Admin : UserRole.Member,
            Color = AvatarPalette.ForIndex(count),
        };
        await users.AddAsync(user, ct);
        await users.SaveChangesAsync(ct);
        return BuildResponse(user);
    }

    public async Task<UserDto> GetCurrentAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct);
        if (user is null || !user.Active)
        {
            throw new UnauthorizedException("Sessão inválida. Entre novamente.");
        }
        return ToDto(user);
    }

    private AuthResponse BuildResponse(User user)
    {
        var (token, expiresAt) = tokens.Generate(user);
        return new AuthResponse(token, expiresAt, ToDto(user));
    }

    private static UserDto ToDto(User user) => new(
        user.Id.ToString(),
        user.Name,
        user.Email,
        user.Role.ToDto());

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
