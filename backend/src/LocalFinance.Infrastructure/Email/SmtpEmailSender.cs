using LocalFinance.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace LocalFinance.Infrastructure.Email;

public class SmtpEmailSender(
    IOptions<SmtpOptions> options,
    ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        var opts = options.Value;

        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress(opts.FromName, opts.FromEmail));
        mail.To.Add(new MailboxAddress(message.ToName, message.ToEmail));
        mail.Subject = message.Subject;
        mail.Body = new BodyBuilder
        {
            HtmlBody = message.HtmlBody,
            TextBody = message.TextBody,
        }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(
            opts.Host,
            opts.Port,
            opts.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto,
            ct);
        if (!string.IsNullOrWhiteSpace(opts.User))
        {
            await client.AuthenticateAsync(opts.User, opts.Password, ct);
        }
        await client.SendAsync(mail, ct);
        await client.DisconnectAsync(true, ct);

        logger.LogInformation("E-mail enviado para {Email}: {Subject}",
            message.ToEmail, message.Subject);
    }
}
