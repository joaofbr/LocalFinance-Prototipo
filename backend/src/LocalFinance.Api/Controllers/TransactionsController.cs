using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

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
        await service.ListByMonthAsync(year, month, ct);

    [HttpPost]
    public async Task<TransactionDto> Create(TransactionInput input, CancellationToken ct) =>
        await service.CreateAsync(input, ct);

    [HttpPut("{id:guid}")]
    public async Task<TransactionDto> Update(
        Guid id,
        TransactionInput input,
        [FromQuery] string? scope,
        CancellationToken ct) =>
        await service.UpdateAsync(id, input, IsGroupScope(scope), ct);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromQuery] string? scope,
        CancellationToken ct)
    {
        await service.DeleteAsync(id, IsGroupScope(scope), ct);
        return NoContent();
    }

    private static bool IsGroupScope(string? scope) =>
        string.Equals(scope, "all", StringComparison.OrdinalIgnoreCase);
}
