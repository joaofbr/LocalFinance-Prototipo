using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class PasswordResetEmail
{
    public static EmailMessage Build(string name, string toEmail, string link, int expiryHours)
    {
        var firstName = name.Split(' ')[0];
        const string subject = "Redefinir sua senha do LocalFinance";

        var text =
            $"""
            Olá, {firstName}!

            Recebemos um pedido para redefinir a senha da sua conta no LocalFinance.
            Para escolher uma nova senha, acesse:

            {link}

            O link vale por {expiryHours} horas e só pode ser usado uma vez.
            Se você não pediu isso, ignore este e-mail: sua senha atual continua valendo.
            """;

        var html =
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
                      <tr><td style="font-size:15px;line-height:1.6;padding-bottom:24px">
                        Recebemos um pedido para redefinir a senha da sua conta.
                        Para escolher uma nova senha:
                      </td></tr>
                      <tr><td align="center" style="padding-bottom:24px">
                        <a href="{Escape(link)}"
                           style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;
                                  font-weight:bold;font-size:15px;padding:14px 28px;border-radius:12px">
                          Redefinir minha senha
                        </a>
                      </td></tr>
                      <tr><td style="font-size:13px;line-height:1.6;color:#64748b">
                        O link vale por {expiryHours} horas e só pode ser usado uma vez.<br>
                        Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                        <span style="word-break:break-all">{Escape(link)}</span>
                      </td></tr>
                      <tr><td style="font-size:12px;color:#94a3b8;padding-top:20px">
                        Se você não pediu isso, ignore este e-mail: sua senha atual continua valendo.
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </body>
            </html>
            """;

        return new EmailMessage(toEmail, name, subject, html, text);
    }

    private static string Escape(string value) => value
        .Replace("&", "&amp;")
        .Replace("<", "&lt;")
        .Replace(">", "&gt;")
        .Replace("\"", "&quot;");
}
