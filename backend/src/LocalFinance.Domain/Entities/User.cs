using LocalFinance.Domain.Enums;

namespace LocalFinance.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Member;
    public bool Active { get; set; } = true;
    public string Color { get; set; } = "#059669";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
