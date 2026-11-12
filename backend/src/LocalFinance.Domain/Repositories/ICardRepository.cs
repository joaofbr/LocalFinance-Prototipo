using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface ICardRepository
{
    Task<Card?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default);
    Task<List<Card>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task AddAsync(Card card, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
