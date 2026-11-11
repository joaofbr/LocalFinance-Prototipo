using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;

namespace LocalFinance.Application.Common;

public static class DefaultCategories
{
    private static readonly (string Name, CategoryKind Kind, string Color, string Icon)[] Templates =
    [
        ("Mercado", CategoryKind.Expense, "#d95926", "cart"),
        ("Moradia", CategoryKind.Expense, "#3987e5", "home"),
        ("Transporte", CategoryKind.Expense, "#199e70", "car"),
        ("Alimentação", CategoryKind.Expense, "#c98500", "utensils"),
        ("Saúde", CategoryKind.Expense, "#e66767", "heart"),
        ("Educação", CategoryKind.Expense, "#9085e9", "cap"),
        ("Lazer", CategoryKind.Expense, "#d55181", "film"),
        ("Contas & Serviços", CategoryKind.Expense, "#008300", "zap"),
        ("Salário", CategoryKind.Income, "#008300", "wallet"),
        ("Renda extra", CategoryKind.Income, "#199e70", "laptop"),
        ("Investimentos", CategoryKind.Both, "#3987e5", "trendingUp"),
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
