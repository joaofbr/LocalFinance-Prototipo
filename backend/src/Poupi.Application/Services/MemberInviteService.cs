using System.Security.Cryptography;
using System.Text;
using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Entities;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class MemberInviteService(
    IUserRepository users,
    IPasswordSetupTokenRepository tokens,
    IRefreshTokenRepository refreshTokens,
    ITransactionRepository transactions,
    IPasswordHasher hasher,
    IEmailSender email,
    InviteOptions options) : IMemberInviteService
{
    public async Task SendInviteAsync(User user, CancellationToken ct = default)
    {
        var link = await CreateLinkAsync(user, ct);
        var inviter = await FindInviterAsync(user, ct);
        await email.SendAsync(
            InviteEmail.Build(
                user.Name, user.Email, link, options.ExpiryHours, inviter?.Name, inviter?.Email),
            ct);
    }

    public async Task SendPasswordResetAsync(string address, CancellationToken ct = default)
    {
        var normalized = address.Trim().ToLowerInvariant();
        var user = await users.GetByEmailAsync(normalized, ct);

        if (user is null || !user.Active)
        {
            return;
        }

        if (IsPendingInvite(user))
        {
            await SendInviteAsync(user, ct);
            return;
        }

        var link = await CreateLinkAsync(user, ct);
        await email.SendAsync(
            PasswordResetEmail.Build(user.Name, user.Email, link, options.ExpiryHours),
            ct);
    }

    public async Task<InviteTargetDto> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var user = (await GetUsableTokenAsync(token, ct)).User!;
        if (!IsPendingInvite(user))
        {
            return new InviteTargetDto(user.Name, user.Email, false, null, null);
        }

        var inviter = await FindInviterAsync(user, ct);
        return new InviteTargetDto(user.Name, user.Email, true, inviter?.Name, inviter?.Email);
    }

    public async Task SetPasswordAsync(SetPasswordRequest request, CancellationToken ct = default)
    {
        PasswordPolicy.EnsureStrong(request.Password);

        var entry = await GetUsableTokenAsync(request.Token, ct);
        var user = entry.User!;
        var now = DateTime.UtcNow;
        user.PasswordHash = hasher.Hash(request.Password);
        entry.UsedAt = now;
        await refreshTokens.RevokeAllForUserAsync(user.Id, now, ct);

        await users.SaveChangesAsync(ct);
    }

    public async Task DeclineAsync(string token, CancellationToken ct = default)
    {
        var user = (await GetUsableTokenAsync(token, ct)).User!;
        if (!IsPendingInvite(user))
        {
            throw new ValidationException("Este link não é de um convite.");
        }
        await ReleasePendingAsync(user, ct);
    }

    public async Task ReleasePendingAsync(User user, CancellationToken ct = default)
    {
        await tokens.InvalidatePendingAsync(user.Id, DateTime.UtcNow, ct);
        if (await transactions.CountByUserAsync(user.Id, ct) == 0)
        {
            users.Remove(user);
        }
        else
        {
            user.Active = false;
            user.Email = ReleasedInvite.EmailFor(user.Id);
        }
        await users.SaveChangesAsync(ct);
    }

    public Task InvalidatePendingAsync(Guid userId, CancellationToken ct = default) =>
        tokens.InvalidatePendingAsync(userId, DateTime.UtcNow, ct);

    private static bool IsPendingInvite(User user) => string.IsNullOrEmpty(user.PasswordHash);

    private async Task<User?> FindInviterAsync(User invitee, CancellationToken ct) =>
        (await users.ListAsync(invitee.HouseholdId, ct))
            .Where(u => u.Id != invitee.Id
                && u.Role == UserRole.Admin
                && u.Active
                && !string.IsNullOrEmpty(u.PasswordHash))
            .OrderBy(u => u.CreatedAt)
            .FirstOrDefault();

    private async Task<string> CreateLinkAsync(User user, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        await tokens.InvalidatePendingAsync(user.Id, now, ct);

        var raw = GenerateToken();
        await tokens.AddAsync(
            new PasswordSetupToken
            {
                UserId = user.Id,
                TokenHash = HashToken(raw),
                ExpiresAt = now.AddHours(options.ExpiryHours),
                CreatedAt = now,
            },
            ct);
        await tokens.SaveChangesAsync(ct);

        return $"{options.FrontendBaseUrl.TrimEnd('/')}/definir-senha?token={Uri.EscapeDataString(raw)}";
    }

    private async Task<PasswordSetupToken> GetUsableTokenAsync(string token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ValidationException("Link de convite inválido.");
        }

        var entry = await tokens.GetByHashAsync(HashToken(token), ct);
        if (entry?.User is null || !entry.IsUsable(DateTime.UtcNow) || !entry.User.Active)
        {
            throw new ValidationException(
                "Este convite não é mais válido. Peça ao administrador para reenviar.");
        }
        return entry;
    }

    private static string GenerateToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');

    private static string HashToken(string raw) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
