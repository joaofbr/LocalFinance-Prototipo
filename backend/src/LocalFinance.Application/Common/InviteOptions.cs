namespace LocalFinance.Application.Common;

public class InviteOptions
{
    public const string SectionName = "Invite";

    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";

    public int ExpiryHours { get; set; } = 48;
}
