namespace LocalFinance.Domain.Entities;

public class Card
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ClosingDay { get; set; }
    public int DueDay { get; set; }
    public Guid? OwnerId { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
