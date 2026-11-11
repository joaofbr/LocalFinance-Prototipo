using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IReportService
{
    Task<List<MonthlyTrendPointDto>> GetMonthlyTrendAsync(
        Guid householdId,
        int year,
        int month,
        int months,
        CancellationToken ct = default);
}
