namespace LocalFinance.Infrastructure.Email;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool UseStartTls { get; set; } = true;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "LocalFinance";

    public bool RequiresAuth => !string.IsNullOrWhiteSpace(User);

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host)
        && !string.IsNullOrWhiteSpace(FromEmail)
        && (!RequiresAuth || !string.IsNullOrWhiteSpace(Password));

    public bool IsMissingPassword => !string.IsNullOrWhiteSpace(Host)
        && !string.IsNullOrWhiteSpace(FromEmail)
        && RequiresAuth
        && string.IsNullOrWhiteSpace(Password);
}
