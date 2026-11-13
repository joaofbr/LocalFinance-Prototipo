using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Poupi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/cards")]
public class CardsController(ICardService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<CardDto>> List(CancellationToken ct) =>
        await service.ListAsync(User.HouseholdId(), ct);

    [HttpPost]
    public async Task<CardDto> Create(CardInput input, CancellationToken ct) =>
        await service.CreateAsync(User.HouseholdId(), input, ct);

    [HttpPut("{id:guid}")]
    public async Task<CardDto> Update(Guid id, CardInput input, CancellationToken ct) =>
        await service.UpdateAsync(User.HouseholdId(), id, input, ct);

    [HttpPatch("{id:guid}/active")]
    public async Task<CardDto> SetActive(Guid id, SetActiveInput input, CancellationToken ct) =>
        await service.SetActiveAsync(User.HouseholdId(), id, input.Active, ct);
}
