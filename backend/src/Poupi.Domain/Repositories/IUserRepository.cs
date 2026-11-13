using Poupi.Domain.Entities;

namespace Poupi.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetWithHouseholdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetInHouseholdAsync(Guid householdId, Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<List<User>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task<int> CountAsync(Guid householdId, CancellationToken ct = default);
    Task<int> CountActiveAsync(Guid householdId, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    void Remove(User user);
    Task<int> CountUsableAdminsAsync(Guid householdId, CancellationToken ct = default);
    Task<int> CountInHouseholdAsync(
        Guid householdId, IReadOnlyCollection<Guid> ids, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
