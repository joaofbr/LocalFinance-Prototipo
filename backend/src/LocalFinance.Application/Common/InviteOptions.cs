namespace LocalFinance.Application.Common;

public class InviteOptions
{
    public const string SectionName = "Invite";

    public string FrontendBaseUrl { get; set; } = "https://localfinance.pages.dev";

    public int ExpiryHours { get; set; } = 48;
}
