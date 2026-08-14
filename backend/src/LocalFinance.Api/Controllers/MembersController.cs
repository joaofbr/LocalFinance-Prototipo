using LocalFinance.Api.Security;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/members")]
public class MembersController(IMemberService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<MemberDto>> List(CancellationToken ct) =>
        await service.ListAsync(ct);

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> Create(MemberInput input, CancellationToken ct) =>
        await service.CreateAsync(input, ct);

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> Update(Guid id, MemberInput input, CancellationToken ct) =>
        await service.UpdateAsync(id, input, ct);

    [HttpPatch("{id:guid}/active")]
    [Authorize(Roles = "Admin")]
    public async Task<MemberDto> SetActive(Guid id, SetActiveInput input, CancellationToken ct) =>
        await service.SetActiveAsync(id, input.Active, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, User.Id(), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/resend-invite")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResendInvite(Guid id, CancellationToken ct)
    {
        await service.ResendInviteAsync(id, ct);
        return NoContent();
    }
}
