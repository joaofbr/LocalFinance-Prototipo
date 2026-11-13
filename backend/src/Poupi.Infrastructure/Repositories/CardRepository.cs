using Poupi.Domain.Entities;
using Poupi.Domain.Repositories;
using Poupi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Poupi.Infrastructure.Repositories;

public class CardRepository(AppDbContext db) : ICardRepository
{
    public Task<Card?> GetByIdAsync(Guid householdId, Guid id, CancellationToken ct = default) =>
        db.Cards.FirstOrDefaultAsync(c => c.Id == id && c.HouseholdId == householdId, ct);

    public Task<List<Card>> ListAsync(Guid householdId, CancellationToken ct = default) =>
        db.Cards
            .Where(c => c.HouseholdId == householdId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task AddAsync(Card card, CancellationToken ct = default) =>
        await db.Cards.AddAsync(card, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
