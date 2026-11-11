using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public record EmailAction(string Label, string Link);

public static class EmailTemplate
{
    public static EmailMessage Build(
        string name,
        string toEmail,
        string subject,
        string message,
        EmailAction? action = null,
        string? detail = null,
        string? footer = null)
    {
        var firstName = name.Split(' ')[0];
        return new EmailMessage(
            toEmail,
            name,
            subject,
            Html(firstName, message, action, detail, footer),
            Text(firstName, message, action, detail, footer));
    }

    private static string Text(
        string firstName, string message, EmailAction? action, string? detail, string? footer)
    {
        var blocks = new List<string> { $"Olá, {firstName}!", message };
        if (action is not null)
        {
            blocks.Add(action.Link);
        }
        var notes = string.Join("\n", new[] { detail, footer }.Where(n => n is not null));
        if (notes.Length > 0)
        {
            blocks.Add(notes);
        }
        return string.Join("\n\n", blocks) + "\n";
    }

    private static string Html(
        string firstName, string message, EmailAction? action, string? detail, string? footer)
    {
        var button = action is null
            ? string.Empty
            : $"""
              <tr><td align="center" style="padding-bottom:24px">
                <a href="{Escape(action.Link)}"
                   style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;
                          font-weight:bold;font-size:15px;padding:14px 28px;border-radius:12px">
                  {Escape(action.Label)}
                </a>
              </td></tr>
              """;

        var fallback = action is null
            ? string.Empty
            : $"Se o botão não funcionar, copie e cole este endereço no navegador:<br>"
              + $"<span style=\"word-break:break-all\">{Escape(action.Link)}</span>";
        var details = string.Join("<br>", new[] { detail is null ? null : Escape(detail), fallback }
            .Where(part => !string.IsNullOrEmpty(part)));
        var detailRow = details.Length == 0
            ? string.Empty
            : $"""<tr><td style="font-size:13px;line-height:1.6;color:#64748b">{details}</td></tr>""";
        var footerRow = footer is null
            ? string.Empty
            : $"""<tr><td style="font-size:12px;color:#94a3b8;padding-top:20px">{Escape(footer)}</td></tr>""";

        return
            $"""
            <!doctype html>
            <html lang="pt-BR">
              <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
                      <tr><td style="font-size:20px;font-weight:bold;padding-bottom:8px">LocalFinance</td></tr>
                      <tr><td style="font-size:16px;padding-bottom:16px">Olá, {Escape(firstName)}!</td></tr>
                      <tr><td style="font-size:15px;line-height:1.6;padding-bottom:24px">{Escape(message)}</td></tr>
                      {button}
                      {detailRow}
                      {footerRow}
                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
            """;
    }

    private static string Escape(string value) => value
        .Replace("&", "&amp;")
        .Replace("<", "&lt;")
        .Replace(">", "&gt;")
        .Replace("\"", "&quot;");
}
