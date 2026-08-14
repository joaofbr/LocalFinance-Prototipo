namespace LocalFinance.Domain.ReadModels;

public record MonthlyTotal(int Year, int Month, decimal Income, decimal Expense);
