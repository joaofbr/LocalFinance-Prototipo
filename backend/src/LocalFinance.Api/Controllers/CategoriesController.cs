using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public class CategoriesController(ICategoryService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<CategoryDto>> List(CancellationToken ct) =>
        await service.ListAsync(ct);

    [HttpGet("usage")]
    public async Task<Dictionary<string, int>> Usage(CancellationToken ct) =>
        await service.GetUsageAsync(ct);

    [HttpPost]
    public async Task<CategoryDto> Create(CategoryInput input, CancellationToken ct) =>
        await service.CreateAsync(input, ct);

    [HttpPut("{id:guid}")]
    public async Task<CategoryDto> Update(Guid id, CategoryInput input, CancellationToken ct) =>
        await service.UpdateAsync(id, input, ct);

    [HttpPatch("{id:guid}/active")]
    public async Task<CategoryDto> SetActive(Guid id, SetActiveInput input, CancellationToken ct) =>
        await service.SetActiveAsync(id, input.Active, ct);
}
