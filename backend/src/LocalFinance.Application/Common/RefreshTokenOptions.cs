namespace LocalFinance.Application.Common;

public class RefreshTokenOptions
{
    public const string SectionName = "RefreshToken";

    public int ExpiryDays { get; set; } = 30;
}
