using LocalFinance.Domain.Enums;

namespace LocalFinance.Domain.Entities;

public class Household
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public HouseholdPlan Plan { get; set; } = HouseholdPlan.Individual;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
