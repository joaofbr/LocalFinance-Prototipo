using Poupi.Domain.Entities;

namespace Poupi.Domain.Billing;

public static class CardBilling
{
    public static DateOnly ReferenceMonth(Card? card, DateOnly purchase, int monthsAfter = 0)
    {
        var first = card is null
            ? MonthOf(purchase)
            : BillMonth(card.ClosingDay, card.DueDay, purchase);
        return first.AddMonths(monthsAfter);
    }

    private static DateOnly MonthOf(DateOnly date) => new(date.Year, date.Month, 1);

    private static DateOnly BillMonth(int closingDay, int dueDay, DateOnly purchase)
    {
        var closingMonth = purchase.Day < DayIn(purchase, closingDay)
            ? MonthOf(purchase)
            : MonthOf(purchase).AddMonths(1);
        return dueDay > closingDay ? closingMonth : closingMonth.AddMonths(1);
    }

    private static int DayIn(DateOnly date, int day) =>
        Math.Min(day, DateTime.DaysInMonth(date.Year, date.Month));
}
