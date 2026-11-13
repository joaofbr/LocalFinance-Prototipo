using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Poupi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public class CategoriesController(ICategoryService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<CategoryDto>> List(CancellationToken ct) =>
        await service.ListAsync(User.HouseholdId(), ct);

    [HttpGet("usage")]
    public async Task<Dictionary<string, int>> Usage(CancellationToken ct) =>
        await service.GetUsageAsync(User.HouseholdId(), ct);

    [HttpPost]
    public async Task<CategoryDto> Create(CategoryInput input, CancellationToken ct) =>
        await service.CreateAsync(User.HouseholdId(), input, ct);

    [HttpPut("{id:guid}")]
    public async Task<CategoryDto> Update(Guid id, CategoryInput input, CancellationToken ct) =>
        await service.UpdateAsync(User.HouseholdId(), id, input, ct);

    [HttpPatch("{id:guid}/active")]
    public async Task<CategoryDto> SetActive(Guid id, SetActiveInput input, CancellationToken ct) =>
        await service.SetActiveAsync(User.HouseholdId(), id, input.Active, ct);
}
