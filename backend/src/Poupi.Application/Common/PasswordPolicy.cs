namespace Poupi.Application.Common;

public static class PasswordPolicy
{
    public const int MinLength = 8;
    public const int MaxLength = 128;

    public static void EnsureStrong(string? password)
    {
        var value = password ?? string.Empty;
        var missing = new List<string>();
        if (value.Length < MinLength)
        {
            missing.Add($"ao menos {MinLength} caracteres");
        }
        if (!value.Any(char.IsUpper))
        {
            missing.Add("uma letra maiúscula");
        }
        if (!value.Any(IsSpecial))
        {
            missing.Add("um caractere especial (como ! @ # $ %)");
        }
        if (missing.Count > 0)
        {
            throw new ValidationException($"A senha precisa ter {JoinWithAnd(missing)}.");
        }
        if (value.Length > MaxLength)
        {
            throw new ValidationException($"A senha pode ter no máximo {MaxLength} caracteres.");
        }
    }

    private static bool IsSpecial(char c) => !char.IsLetterOrDigit(c) && !char.IsWhiteSpace(c);

    private static string JoinWithAnd(List<string> items) =>
        items.Count == 1 ? items[0] : $"{string.Join(", ", items[..^1])} e {items[^1]}";
}
