using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Poupi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/members")]
public class MembersController(IMemberService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<MemberDto>> List(CancellationToken ct) =>
        await service.ListAsync(User.HouseholdId(), ct);

    [EnableRateLimiting(RateLimitPolicies.Email)]
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> Create(MemberInput input, CancellationToken ct) =>
        await service.CreateAsync(User.HouseholdId(), input, ct);

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> Update(Guid id, MemberInput input, CancellationToken ct) =>
        await service.UpdateAsync(User.HouseholdId(), id, input, User.Id(), ct);

    [HttpPatch("{id:guid}/active")]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> SetActive(Guid id, SetActiveInput input, CancellationToken ct) =>
        await service.SetActiveAsync(User.HouseholdId(), id, input.Active, User.Id(), ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(User.HouseholdId(), id, User.Id(), ct);
        return NoContent();
    }

    [EnableRateLimiting(RateLimitPolicies.Email)]
    [HttpPost("{id:guid}/resend-invite")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResendInvite(Guid id, CancellationToken ct)
    {
        await service.ResendInviteAsync(User.HouseholdId(), id, ct);
        return NoContent();
    }
}
