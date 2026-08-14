using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface IPasswordSetupTokenRepository
{
    Task AddAsync(PasswordSetupToken token, CancellationToken ct = default);

    Task<PasswordSetupToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default);

    Task InvalidatePendingAsync(Guid userId, DateTime nowUtc, CancellationToken ct = default);

    Task SaveChangesAsync(CancellationToken ct = default);
}
