using Poupi.Domain.Enums;

namespace Poupi.Domain.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryKind Kind { get; set; } = CategoryKind.Expense;
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
}
