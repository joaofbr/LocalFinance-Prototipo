using System.Security.Cryptography;
using System.Text;
using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class MemberInviteService(
    IUserRepository users,
    IPasswordSetupTokenRepository tokens,
    IPasswordHasher hasher,
    IEmailSender email,
    InviteOptions options) : IMemberInviteService
{
    private const int MinPasswordLength = 4;

    public async Task SendInviteAsync(User user, CancellationToken ct = default)
    {
        var link = await CreateLinkAsync(user, ct);
        await email.SendAsync(
            InviteEmail.Build(user.Name, user.Email, link, options.ExpiryHours),
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

        var link = await CreateLinkAsync(user, ct);
        await email.SendAsync(
            PasswordResetEmail.Build(user.Name, user.Email, link, options.ExpiryHours),
            ct);
    }

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

    public async Task<InviteTargetDto> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var entry = await GetUsableTokenAsync(token, ct);
        return new InviteTargetDto(entry.User!.Name, entry.User.Email);
    }

    public async Task SetPasswordAsync(SetPasswordRequest request, CancellationToken ct = default)
    {
        if (request.Password.Length < MinPasswordLength)
        {
            throw new ValidationException(
                $"A senha deve ter ao menos {MinPasswordLength} caracteres.");
        }

        var entry = await GetUsableTokenAsync(request.Token, ct);
        var user = entry.User!;
        user.PasswordHash = hasher.Hash(request.Password);
        entry.UsedAt = DateTime.UtcNow;

        await users.SaveChangesAsync(ct);
        await tokens.SaveChangesAsync(ct);
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
