using LocalFinance.Api.Security;
using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Authorize(Roles = AppClaims.DeveloperRole)]
[Route("api/platform")]
public class PlatformController(IPlatformService service) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<PlatformOverviewDto> Overview(CancellationToken ct) =>
        await service.GetOverviewAsync(ct);

    [HttpGet("accounts")]
    public async Task<List<AccountDto>> Accounts(CancellationToken ct) =>
        await service.ListAccountsAsync(ct);

    [HttpPost("accounts/{id:guid}/approve")]
    public async Task<AccountActionResultDto> Approve(Guid id, CancellationToken ct) =>
        await service.ApproveAsync(id, User.Id(), ct);

    [HttpPost("accounts/{id:guid}/reject")]
    public async Task<AccountActionResultDto> Reject(Guid id, CancellationToken ct) =>
        await service.RejectAsync(id, ct);

    [HttpPost("accounts/{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, CancellationToken ct)
    {
        await service.SuspendAsync(id, User.HouseholdId(), ct);
        return NoContent();
    }

    [HttpPost("accounts/{id:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken ct)
    {
        await service.ReactivateAsync(id, ct);
        return NoContent();
    }
}
