namespace LocalFinance.Application.Common;

public static class AvatarPalette
{
    private static readonly string[] Colors =
    [
        "#059669",
        "#6366f1",
        "#f97316",
        "#0ea5e9",
        "#ec4899",
        "#8b5cf6",
    ];

    public static string ForIndex(int index) => Colors[index % Colors.Length];
}
