using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Poupi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public class TransactionsController(ITransactionService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<TransactionDto>> List(
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken ct) =>
        await service.ListByMonthAsync(User.HouseholdId(), year, month, ct);

    [HttpPost]
    public async Task<TransactionDto> Create(TransactionInput input, CancellationToken ct) =>
        await service.CreateAsync(User.HouseholdId(), input, ct);

    [HttpPost("assign-card")]
    public async Task<IActionResult> AssignCard(AssignCardInput input, CancellationToken ct)
    {
        await service.AssignCardAsync(User.HouseholdId(), input, ct);
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<TransactionDto> Update(
        Guid id,
        TransactionInput input,
        [FromQuery] string? scope,
        CancellationToken ct) =>
        await service.UpdateAsync(User.HouseholdId(), id, input, scope, ct);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromQuery] string? scope,
        CancellationToken ct)
    {
        await service.DeleteAsync(User.HouseholdId(), id, scope, ct);
        return NoContent();
    }
}
