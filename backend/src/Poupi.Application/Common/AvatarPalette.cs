namespace Poupi.Application.Common;

public static class AvatarPalette
{
    private static readonly string[] Colors =
    [
        "#3987e5",
        "#d95926",
        "#199e70",
        "#d55181",
        "#9085e9",
        "#c98500",
    ];

    public static string ForIndex(int index) => Colors[index % Colors.Length];
}
