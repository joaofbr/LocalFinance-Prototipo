using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class PasswordSetupTokenRepository(AppDbContext db) : IPasswordSetupTokenRepository
{
    public async Task AddAsync(PasswordSetupToken token, CancellationToken ct = default) =>
        await db.PasswordSetupTokens.AddAsync(token, ct);

    public Task<PasswordSetupToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default) =>
        db.PasswordSetupTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public async Task InvalidatePendingAsync(
        Guid userId, DateTime nowUtc, CancellationToken ct = default)
    {
        var pending = await db.PasswordSetupTokens
            .Where(t => t.UserId == userId && t.UsedAt == null)
            .ToListAsync(ct);
        foreach (var token in pending)
        {
            token.UsedAt = nowUtc;
        }
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
