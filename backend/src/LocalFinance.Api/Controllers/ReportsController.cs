using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalFinance.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reports")]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("monthly-trend")]
    public async Task<List<MonthlyTrendPointDto>> MonthlyTrend(
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int months = 6,
        CancellationToken ct = default) =>
        await service.GetMonthlyTrendAsync(year, month, months, ct);
}
