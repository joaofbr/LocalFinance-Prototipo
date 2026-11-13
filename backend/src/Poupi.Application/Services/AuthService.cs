using System.Security.Cryptography;
using System.Text;
using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Entities;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class AuthService(
    IUserRepository users,
    IHouseholdRepository households,
    IMemberInviteService invites,
    ICategoryRepository categories,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher hasher,
    IJwtTokenGenerator tokens,
    RefreshTokenOptions refreshOptions,
    PlatformOptions platform) : IAuthService
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
        await EnsureHouseholdActiveAsync(user.HouseholdId, ct);
        return await BuildResponseAsync(user, ct);
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
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
        PasswordPolicy.EnsureStrong(request.Password);
        var existing = await users.GetByEmailAsync(email, ct);
        if (existing is not null)
        {
            if (!string.IsNullOrEmpty(existing.PasswordHash))
            {
                throw new ConflictException("Já existe uma conta com este e-mail.");
            }
            await invites.ReleasePendingAsync(existing, ct);
        }

        var developer = platform.IsDeveloper(email);
        var household = new Household
        {
            Status = developer ? HouseholdStatus.Active : HouseholdStatus.Pending,
            ApprovedAt = developer ? DateTime.UtcNow : null,
        };
        var user = new User
        {
            Household = household,
            HouseholdId = household.Id,
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = hasher.Hash(request.Password),
            Role = UserRole.Admin,
            Color = AvatarPalette.ForIndex(0),
        };
        await users.AddAsync(user, ct);
        await categories.AddRangeAsync(DefaultCategories.For(household.Id), ct);
        await users.SaveChangesAsync(ct);

        return household.Status == HouseholdStatus.Active
            ? new RegisterResponse(false, await BuildResponseAsync(user, ct))
            : new RegisterResponse(true, null);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var entry = await GetUsableTokenAsync(refreshToken, now, ct);
        await EnsureHouseholdActiveAsync(entry.User!.HouseholdId, ct);

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
        PasswordPolicy.EnsureStrong(request.NewPassword);
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

    public async Task<bool> IsSessionValidAsync(
        Guid userId, Guid householdId, bool admin, bool developer, CancellationToken ct = default)
    {
        var user = await users.GetWithHouseholdAsync(userId, ct);
        return user is { Active: true, Household.Status: HouseholdStatus.Active }
            && user.HouseholdId == householdId
            && (user.Role == UserRole.Admin) == admin
            && platform.IsDeveloper(user.Email) == developer;
    }

    private async Task EnsureHouseholdActiveAsync(Guid householdId, CancellationToken ct)
    {
        var household = await households.GetByIdAsync(householdId, ct);
        switch (household?.Status)
        {
            case HouseholdStatus.Active:
                return;
            case HouseholdStatus.Pending:
                throw new ForbiddenException(
                    "Seu cadastro ainda está em análise. Avisaremos por e-mail assim que o acesso for liberado.");
            default:
                throw new ForbiddenException("O acesso desta conta está suspenso.");
        }
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
        var (token, expiresAt) = tokens.Generate(user, platform.IsDeveloper(user.Email));

        var raw = Generate();
        var now = DateTime.UtcNow;
        await refreshTokens.DeleteExpiredAsync(now, ct);
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

    private UserDto ToDto(User user) => new(
        user.Id.ToString(),
        user.Name,
        user.Email,
        user.Role.ToDto(),
        platform.IsDeveloper(user.Email));

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
