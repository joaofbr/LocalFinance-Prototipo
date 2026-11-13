using Poupi.Api.Security;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Poupi.Api.Controllers;

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
        await service.GetMonthlyTrendAsync(User.HouseholdId(), year, month, months, ct);
}
