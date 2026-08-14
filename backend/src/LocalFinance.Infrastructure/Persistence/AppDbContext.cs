using LocalFinance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LocalFinance.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<PasswordSetupToken> PasswordSetupTokens => Set<PasswordSetupToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Name).HasMaxLength(120);
            entity.Property(u => u.Email).HasMaxLength(180);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).HasMaxLength(300);
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(10);
            entity.Property(u => u.Color).HasMaxLength(9);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(80);
            entity.Property(c => c.Kind).HasConversion<string>().HasMaxLength(10);
            entity.Property(c => c.Color).HasMaxLength(9);
            entity.Property(c => c.Icon).HasMaxLength(40);
            entity.HasData(DefaultCategories.All);
        });

        modelBuilder.Entity<PasswordSetupToken>(entity =>
        {
            entity.Property(t => t.TokenHash).HasMaxLength(64);
            entity.HasIndex(t => t.TokenHash).IsUnique();
            entity.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.Type).HasConversion<string>().HasMaxLength(10);
            entity.Property(t => t.Amount).HasPrecision(18, 2);
            entity.Property(t => t.Description).HasMaxLength(200);
            entity.HasIndex(t => t.Date);
            entity.HasOne(t => t.Category)
                .WithMany()
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
