using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LocalFinance.Application.Common;
using LocalFinance.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LocalFinance.Infrastructure.Email;

public class BrevoEmailSender(
    HttpClient http,
    IOptions<BrevoOptions> options,
    ILogger<BrevoEmailSender> logger) : IEmailSender
{
    private const string Endpoint = "https://api.brevo.com/v3/smtp/email";

    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        var opts = options.Value;

        var payload = new BrevoPayload(
            new BrevoContact(opts.FromEmail, opts.FromName),
            [new BrevoContact(message.ToEmail, message.ToName)],
            message.Subject,
            message.HtmlBody,
            message.TextBody);

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Add("api-key", opts.ApiKey);

        using var response = await http.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError(
                "Brevo recusou o envio para {Email}. Status {Status}. Resposta: {Body}",
                message.ToEmail, (int)response.StatusCode, body);

            throw new EmailException(
                $"O provedor de e-mail recusou a mensagem ({(int)response.StatusCode}). {Describe(body)}");
        }

        logger.LogInformation("E-mail enviado para {Email}: {Subject}. Resposta: {Body}",
            message.ToEmail, message.Subject, body);
    }

    private static string Describe(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("message", out var m))
            {
                return m.GetString() ?? string.Empty;
            }
        }
        catch (JsonException)
        {
        }
        return body.Length > 200 ? body[..200] : body;
    }

    private record BrevoPayload(
        [property: JsonPropertyName("sender")] BrevoContact Sender,
        [property: JsonPropertyName("to")] BrevoContact[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("htmlContent")] string HtmlContent,
        [property: JsonPropertyName("textContent")] string TextContent);

    private record BrevoContact(
        [property: JsonPropertyName("email")] string Email,
        [property: JsonPropertyName("name")] string Name);
}
