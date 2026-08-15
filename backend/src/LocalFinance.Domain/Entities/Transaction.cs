using LocalFinance.Domain.Enums;

namespace LocalFinance.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public TransactionType Type { get; set; } = TransactionType.Expense;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? SeriesId { get; set; }
    public SeriesKind? SeriesKind { get; set; }
    public int? SeriesIndex { get; set; }
    public int? SeriesTotal { get; set; }
    public int? SplitTotal { get; set; }
}
