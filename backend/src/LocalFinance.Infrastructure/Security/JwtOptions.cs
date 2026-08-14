namespace LocalFinance.Infrastructure.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "LocalFinance";
    public string Audience { get; set; } = "LocalFinance";
    public string Key { get; set; } = string.Empty;
    public int ExpiryHours { get; set; } = 24;
}
