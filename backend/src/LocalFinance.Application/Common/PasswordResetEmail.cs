using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class PasswordResetEmail
{
    public static EmailMessage Build(string name, string toEmail, string link, int expiryHours) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Redefinir sua senha do Poupi",
            "Recebemos um pedido para redefinir a senha da sua conta no Poupi. "
                + "Para escolher uma nova senha, use o botão abaixo.",
            new EmailAction("Redefinir minha senha", link),
            $"O link vale por {expiryHours} horas e só pode ser usado uma vez.",
            "Se você não pediu isso, ignore este e-mail: sua senha atual continua valendo.");
}
