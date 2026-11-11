using LocalFinance.Api.Security;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/household")]
public class HouseholdController(IHouseholdService service) : ControllerBase
{
    [HttpGet]
    public async Task<HouseholdDto> Get(CancellationToken ct) =>
        await service.GetAsync(User.HouseholdId(), ct);

    [HttpPut("plan")]
    [Authorize(Roles = "Admin")]
    public async Task<HouseholdDto> SetPlan(SetPlanInput input, CancellationToken ct) =>
        await service.SetPlanAsync(User.HouseholdId(), input.Plan, ct);
}
