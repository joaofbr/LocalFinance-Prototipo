using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IReportService
{
    Task<List<MonthlyTrendPointDto>> GetMonthlyTrendAsync(
        int year,
        int month,
        int months,
        CancellationToken ct = default);
}
