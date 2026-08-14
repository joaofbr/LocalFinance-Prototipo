using LocalFinance.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace LocalFinance.Infrastructure.Email;

public class LogEmailSender(ILogger<LogEmailSender> logger) : IEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        logger.LogWarning(
            """
            ================ E-MAIL NÃO ENVIADO (SMTP não configurado) ================
            Para....: {Name} <{Email}>
            Assunto.: {Subject}
            --------------------------------------------------------------------------
            {Body}
            ==========================================================================
            """,
            message.ToName, message.ToEmail, message.Subject, message.TextBody);
        return Task.CompletedTask;
    }
}
