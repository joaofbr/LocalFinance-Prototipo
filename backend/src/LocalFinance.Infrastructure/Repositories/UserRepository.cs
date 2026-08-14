using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<List<User>> ListAsync(CancellationToken ct = default) =>
        db.Users.OrderBy(u => u.CreatedAt).ToListAsync(ct);

    public Task<int> CountAsync(CancellationToken ct = default) =>
        db.Users.CountAsync(ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await db.Users.AddAsync(user, ct);

    public void Remove(User user) => db.Users.Remove(user);

    public Task<int> CountAdminsAsync(CancellationToken ct = default) =>
        db.Users.CountAsync(u => u.Role == UserRole.Admin, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);
}
