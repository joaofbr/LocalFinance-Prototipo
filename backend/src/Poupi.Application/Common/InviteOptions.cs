namespace Poupi.Application.Common;

public class InviteOptions
{
    public const string SectionName = "Invite";

    public string FrontendBaseUrl { get; set; } = "https://poupi.pages.dev";

    public int ExpiryHours { get; set; } = 48;
}
