using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;

namespace LocalFinance.Infrastructure.Persistence;

public static class DefaultCategories
{
    public static readonly Category[] All =
    [
        Make("a1000000-0000-0000-0000-000000000001", "Mercado", CategoryKind.Expense, "#f59e0b", "cart"),
        Make("a1000000-0000-0000-0000-000000000002", "Moradia", CategoryKind.Expense, "#6366f1", "home"),
        Make("a1000000-0000-0000-0000-000000000003", "Transporte", CategoryKind.Expense, "#0ea5e9", "car"),
        Make("a1000000-0000-0000-0000-000000000004", "Alimentação", CategoryKind.Expense, "#f97316", "utensils"),
        Make("a1000000-0000-0000-0000-000000000005", "Saúde", CategoryKind.Expense, "#f43f5e", "heart"),
        Make("a1000000-0000-0000-0000-000000000006", "Educação", CategoryKind.Expense, "#8b5cf6", "cap"),
        Make("a1000000-0000-0000-0000-000000000007", "Lazer", CategoryKind.Expense, "#ec4899", "film"),
        Make("a1000000-0000-0000-0000-000000000008", "Contas & Serviços", CategoryKind.Expense, "#14b8a6", "zap"),
        Make("a1000000-0000-0000-0000-000000000009", "Salário", CategoryKind.Income, "#059669", "wallet"),
        Make("a1000000-0000-0000-0000-00000000000a", "Renda extra", CategoryKind.Income, "#22c55e", "laptop"),
        Make("a1000000-0000-0000-0000-00000000000b", "Investimentos", CategoryKind.Both, "#84cc16", "trendingUp"),
    ];

    private static Category Make(string id, string name, CategoryKind kind, string color, string icon) => new()
    {
        Id = Guid.Parse(id),
        Name = name,
        Kind = kind,
        Color = color,
        Icon = icon,
        Active = true,
    };
}
