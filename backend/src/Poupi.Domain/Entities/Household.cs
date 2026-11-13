using Poupi.Domain.Enums;

namespace Poupi.Domain.Entities;

public class Household
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public HouseholdPlan Plan { get; set; } = HouseholdPlan.Individual;
    public HouseholdStatus Status { get; set; } = HouseholdStatus.Pending;
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
