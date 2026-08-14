using LocalFinance.Domain.Enums;

namespace LocalFinance.Application.Common;

public static class EnumMapping
{
    public static string ToDto(this TransactionType type) =>
        type == TransactionType.Income ? "income" : "expense";

    public static TransactionType ParseTransactionType(string value) => value switch
    {
        "income" => TransactionType.Income,
        "expense" => TransactionType.Expense,
        _ => throw new ValidationException("Tipo de lançamento inválido."),
    };

    public static string ToDto(this CategoryKind kind) => kind switch
    {
        CategoryKind.Income => "income",
        CategoryKind.Expense => "expense",
        _ => "both",
    };

    public static CategoryKind ParseCategoryKind(string value) => value switch
    {
        "income" => CategoryKind.Income,
        "expense" => CategoryKind.Expense,
        "both" => CategoryKind.Both,
        _ => throw new ValidationException("Tipo de categoria inválido."),
    };

    public static string ToDto(this UserRole role) =>
        role == UserRole.Admin ? "Admin" : "Member";

    public static UserRole ParseUserRole(string value) => value switch
    {
        "Admin" => UserRole.Admin,
        "Member" => UserRole.Member,
        _ => throw new ValidationException("Papel inválido."),
    };
}
