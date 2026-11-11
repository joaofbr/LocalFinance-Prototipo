using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class InviteEmail
{
    public static EmailMessage Build(string name, string toEmail, string link, int expiryHours) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Seu acesso ao LocalFinance",
            "Você foi adicionado ao LocalFinance para dividir o controle financeiro da família. "
                + "Para acessar, defina sua senha.",
            new EmailAction("Definir minha senha", link),
            $"O link vale por {expiryHours} horas e só pode ser usado uma vez.",
            "Se você não esperava este convite, ignore este e-mail.");
}
