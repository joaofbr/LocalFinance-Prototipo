using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;

namespace LocalFinance.Application.Common;

public static class DefaultCategories
{
    private static readonly (string Name, CategoryKind Kind, string Color, string Icon)[] Templates =
    [
        ("Mercado", CategoryKind.Expense, "#f59e0b", "cart"),
        ("Moradia", CategoryKind.Expense, "#6366f1", "home"),
        ("Transporte", CategoryKind.Expense, "#0ea5e9", "car"),
        ("Alimentação", CategoryKind.Expense, "#f97316", "utensils"),
        ("Saúde", CategoryKind.Expense, "#f43f5e", "heart"),
        ("Educação", CategoryKind.Expense, "#8b5cf6", "cap"),
        ("Lazer", CategoryKind.Expense, "#ec4899", "film"),
        ("Contas & Serviços", CategoryKind.Expense, "#14b8a6", "zap"),
        ("Salário", CategoryKind.Income, "#059669", "wallet"),
        ("Renda extra", CategoryKind.Income, "#22c55e", "laptop"),
        ("Investimentos", CategoryKind.Both, "#84cc16", "trendingUp"),
    ];

    public static List<Category> For(Guid householdId) =>
        Templates
            .Select(t => new Category
            {
                HouseholdId = householdId,
                Name = t.Name,
                Kind = t.Kind,
                Color = t.Color,
                Icon = t.Icon,
                Active = true,
            })
            .ToList();
}
