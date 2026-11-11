using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IPlatformService
{
    Task<PlatformOverviewDto> GetOverviewAsync(CancellationToken ct = default);
    Task<List<AccountDto>> ListAccountsAsync(CancellationToken ct = default);
    Task<AccountActionResultDto> ApproveAsync(
        Guid householdId, Guid developerId, CancellationToken ct = default);
    Task<AccountActionResultDto> RejectAsync(Guid householdId, CancellationToken ct = default);
    Task SuspendAsync(Guid householdId, Guid developerHouseholdId, CancellationToken ct = default);
    Task ReactivateAsync(Guid householdId, CancellationToken ct = default);
}
