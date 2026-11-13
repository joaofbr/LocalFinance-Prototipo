namespace Poupi.Application.Dtos;

public record PlatformOverviewDto(
    int ActiveAccounts,
    int PendingAccounts,
    int SuspendedAccounts,
    int FamilyAccounts,
    int Users,
    int SignupsLast30Days);

public record AccountActionResultDto(bool EmailSent);

public record AccountDto(
    string Id,
    string Status,
    string Plan,
    DateTime CreatedAt,
    string OwnerName,
    string OwnerEmail,
    int MemberCount);
