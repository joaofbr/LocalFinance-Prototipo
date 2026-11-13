using Poupi.Domain.Entities;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;
using Poupi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Poupi.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetWithHouseholdAsync(Guid id, CancellationToken ct = default) =>
        db.Users.Include(u => u.Household).FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetInHouseholdAsync(Guid householdId, Guid id, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id && u.HouseholdId == householdId, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<List<User>> ListAsync(Guid householdId, CancellationToken ct = default) =>
        db.Users
            .Where(u => u.HouseholdId == householdId)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync(ct);

    public Task<int> CountAsync(Guid householdId, CancellationToken ct = default) =>
        db.Users.CountAsync(u => u.HouseholdId == householdId, ct);

    public Task<int> CountActiveAsync(Guid householdId, CancellationToken ct = default) =>
        db.Users.CountAsync(u => u.HouseholdId == householdId && u.Active, ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await db.Users.AddAsync(user, ct);

    public void Remove(User user) => db.Users.Remove(user);

    public Task<int> CountUsableAdminsAsync(Guid householdId, CancellationToken ct = default) =>
        db.Users.CountAsync(
            u => u.HouseholdId == householdId
                && u.Role == UserRole.Admin
                && u.Active
                && u.PasswordHash != "",
            ct);

    public Task<int> CountInHouseholdAsync(
        Guid householdId, IReadOnlyCollection<Guid> ids, CancellationToken ct = default) =>
        db.Users.CountAsync(u => u.HouseholdId == householdId && ids.Contains(u.Id), ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
