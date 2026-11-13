namespace Poupi.Infrastructure.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Poupi";
    public string Audience { get; set; } = "Poupi";
    public string Key { get; set; } = string.Empty;
    public int ExpiryHours { get; set; } = 24;
}
