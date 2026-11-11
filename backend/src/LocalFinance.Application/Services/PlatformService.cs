using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace LocalFinance.Application.Services;

public class PlatformService(
    IHouseholdRepository households,
    IUserRepository users,
    IEmailSender email,
    InviteOptions invite,
    ILogger<PlatformService> logger) : IPlatformService
{
    private const int SignupWindowDays = 30;

    public async Task<PlatformOverviewDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var counts = await households.GetCountsAsync(
            DateTime.UtcNow.AddDays(-SignupWindowDays), ct);
        return new PlatformOverviewDto(
            counts.ActiveAccounts,
            counts.PendingAccounts,
            counts.SuspendedAccounts,
            counts.FamilyAccounts,
            counts.Users,
            counts.SignupsLast30Days);
    }

    public async Task<List<AccountDto>> ListAccountsAsync(CancellationToken ct = default)
    {
        var summaries = await households.ListSummariesAsync(ct);
        return summaries
            .Select(s => new AccountDto(
                s.Id.ToString(),
                s.Status.ToDto(),
                s.Plan.ToDto(),
                s.CreatedAt,
                s.OwnerName,
                s.OwnerEmail,
                s.MemberCount))
            .ToList();
    }

    public async Task<AccountActionResultDto> ApproveAsync(
        Guid householdId, Guid developerId, CancellationToken ct = default)
    {
        var household = await GetInStatusAsync(householdId, HouseholdStatus.Pending, ct);
        household.Status = HouseholdStatus.Active;
        household.ApprovedAt = DateTime.UtcNow;
        household.ApprovedBy = developerId;
        await households.SaveChangesAsync(ct);

        var loginLink = $"{invite.FrontendBaseUrl.TrimEnd('/')}/login";
        var owners = await OwnersAsync(householdId, ct);
        return await NotifyAllAsync(
            owners.Select(o => AccessEmails.Approved(o.Name, o.Email, loginLink)), ct);
    }

    public async Task<AccountActionResultDto> RejectAsync(
        Guid householdId, CancellationToken ct = default)
    {
        await GetInStatusAsync(householdId, HouseholdStatus.Pending, ct);
        var owners = await OwnersAsync(householdId, ct);

        await households.DeleteWithDataAsync(householdId, ct);

        return await NotifyAllAsync(
            owners.Select(o => AccessEmails.Declined(o.Name, o.Email)), ct);
    }

    public async Task SuspendAsync(
        Guid householdId, Guid developerHouseholdId, CancellationToken ct = default)
    {
        if (householdId == developerHouseholdId)
        {
            throw new ValidationException("Você não pode suspender a própria conta.");
        }
        var household = await GetInStatusAsync(householdId, HouseholdStatus.Active, ct);
        household.Status = HouseholdStatus.Suspended;
        await households.SaveChangesAsync(ct);
    }

    public async Task ReactivateAsync(Guid householdId, CancellationToken ct = default)
    {
        var household = await GetInStatusAsync(householdId, HouseholdStatus.Suspended, ct);
        household.Status = HouseholdStatus.Active;
        await households.SaveChangesAsync(ct);
    }

    private async Task<Household> GetInStatusAsync(
        Guid householdId, HouseholdStatus expected, CancellationToken ct)
    {
        var household = await households.GetByIdAsync(householdId, ct)
            ?? throw new NotFoundException("Conta não encontrada.");
        if (household.Status != expected)
        {
            throw new ConflictException("Esta conta mudou de situação. Atualize a lista e tente de novo.");
        }
        return household;
    }

    private async Task<List<User>> OwnersAsync(Guid householdId, CancellationToken ct) =>
        (await users.ListAsync(householdId, ct))
            .Where(u => u.Role == UserRole.Admin)
            .ToList();

    private async Task<AccountActionResultDto> NotifyAllAsync(
        IEnumerable<EmailMessage> messages, CancellationToken ct)
    {
        var allSent = true;
        foreach (var message in messages)
        {
            try
            {
                await email.SendAsync(message, ct);
            }
            catch (Exception ex)
            {
                allSent = false;
                logger.LogError(ex, "Falha ao enviar \"{Subject}\" para {Email}.",
                    message.Subject, message.ToEmail);
            }
        }
        return new AccountActionResultDto(allSent);
    }
}
