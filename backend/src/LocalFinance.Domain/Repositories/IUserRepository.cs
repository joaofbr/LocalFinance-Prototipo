using LocalFinance.Domain.Entities;

namespace LocalFinance.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<List<User>> ListAsync(CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    void Remove(User user);
    Task<int> CountAdminsAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
