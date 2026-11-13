namespace Poupi.Application.Common;

public class PlatformOptions
{
    public const string SectionName = "Platform";

    public List<string> DeveloperEmails { get; set; } = [];

    public bool IsDeveloper(string email) =>
        DeveloperEmails.Any(developer =>
            string.Equals(developer.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase));
}
