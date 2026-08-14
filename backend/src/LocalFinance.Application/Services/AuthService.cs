using System.Security.Cryptography;
using System.Text;
using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher hasher,
    IJwtTokenGenerator tokens,
    RefreshTokenOptions refreshOptions) : IAuthService
{
    private const int MinPasswordLength = 8;

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
        return await BuildResponseAsync(user, ct);
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
        if (request.Password.Length < MinPasswordLength)
        {
            throw new ValidationException(
                $"A senha deve ter ao menos {MinPasswordLength} caracteres.");
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
        return await BuildResponseAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var entry = await GetUsableTokenAsync(refreshToken, now, ct);

        entry.RevokedAt = now;
        return await BuildResponseAsync(entry.User!, ct);
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var entry = await refreshTokens.GetByHashAsync(Hash(refreshToken), ct);
        if (entry is null || entry.RevokedAt is not null)
        {
            return;
        }

        entry.RevokedAt = DateTime.UtcNow;
        await refreshTokens.SaveChangesAsync(ct);
    }

    public async Task<AuthResponse> ChangePasswordAsync(
        Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct);
        if (user is null || !user.Active)
        {
            throw new UnauthorizedException("Sessão inválida. Entre novamente.");
        }
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new ValidationException(
                "Sua conta ainda não tem senha definida. Use o link do e-mail de convite.");
        }
        if (!hasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException("A senha atual está incorreta.");
        }
        if (request.NewPassword.Length < MinPasswordLength)
        {
            throw new ValidationException(
                $"A nova senha deve ter ao menos {MinPasswordLength} caracteres.");
        }
        if (hasher.Verify(request.NewPassword, user.PasswordHash))
        {
            throw new ValidationException("A nova senha deve ser diferente da atual.");
        }

        user.PasswordHash = hasher.Hash(request.NewPassword);
        await users.SaveChangesAsync(ct);

        await refreshTokens.RevokeAllForUserAsync(user.Id, DateTime.UtcNow, ct);
        await refreshTokens.SaveChangesAsync(ct);

        return await BuildResponseAsync(user, ct);
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

    private async Task<RefreshToken> GetUsableTokenAsync(
        string refreshToken, DateTime now, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedException("Sessão expirada. Entre novamente.");
        }

        var entry = await refreshTokens.GetByHashAsync(Hash(refreshToken), ct);
        if (entry?.User is null || !entry.IsUsable(now) || !entry.User.Active)
        {
            throw new UnauthorizedException("Sessão expirada. Entre novamente.");
        }
        return entry;
    }

    private async Task<AuthResponse> BuildResponseAsync(User user, CancellationToken ct)
    {
        var (token, expiresAt) = tokens.Generate(user);

        var raw = Generate();
        var now = DateTime.UtcNow;
        await refreshTokens.AddAsync(
            new RefreshToken
            {
                UserId = user.Id,
                TokenHash = Hash(raw),
                ExpiresAt = now.AddDays(refreshOptions.ExpiryDays),
                CreatedAt = now,
            },
            ct);
        await refreshTokens.SaveChangesAsync(ct);

        return new AuthResponse(token, expiresAt, ToDto(user), raw);
    }

    private static string Generate() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');

    private static string Hash(string raw) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));

    private static UserDto ToDto(User user) => new(
        user.Id.ToString(),
        user.Name,
        user.Email,
        user.Role.ToDto());

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
