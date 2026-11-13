using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class ReportService(ITransactionRepository transactions) : IReportService
{
    public async Task<List<MonthlyTrendPointDto>> GetMonthlyTrendAsync(
        Guid householdId,
        int year,
        int month,
        int months,
        CancellationToken ct = default)
    {
        if (month is < 1 or > 12)
        {
            throw new ValidationException("Mês inválido.");
        }
        months = Math.Clamp(months, 1, 24);

        var last = new DateOnly(year, month, 1);
        var first = last.AddMonths(-(months - 1));
        var to = last.AddMonths(1).AddDays(-1);
        var totals = await transactions.GetMonthlyTotalsAsync(householdId, first, to, ct);
        var byBucket = totals.ToDictionary(t => (t.Year, t.Month));

        var points = new List<MonthlyTrendPointDto>(months);
        for (var i = 0; i < months; i++)
        {
            var bucket = first.AddMonths(i);
            byBucket.TryGetValue((bucket.Year, bucket.Month), out var total);
            points.Add(new MonthlyTrendPointDto(
                bucket.Year,
                bucket.Month,
                total?.Income ?? 0,
                total?.Expense ?? 0));
        }
        return points;
    }
}
