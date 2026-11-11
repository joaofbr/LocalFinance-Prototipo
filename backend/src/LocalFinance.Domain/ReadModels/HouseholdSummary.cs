using LocalFinance.Domain.Enums;

namespace LocalFinance.Domain.ReadModels;

public record HouseholdSummary(
    Guid Id,
    HouseholdStatus Status,
    HouseholdPlan Plan,
    DateTime CreatedAt,
    string OwnerName,
    string OwnerEmail,
    int MemberCount);

public record PlatformCounts(
    int ActiveAccounts,
    int PendingAccounts,
    int SuspendedAccounts,
    int FamilyAccounts,
    int Users,
    int SignupsLast30Days);
