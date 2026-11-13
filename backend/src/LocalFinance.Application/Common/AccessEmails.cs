using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class AccessEmails
{
    public static EmailMessage Approved(string name, string toEmail, string loginLink) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Seu acesso ao Poupi foi liberado",
            "Seu cadastro foi aprovado e a sua conta já está liberada. "
                + "Entre com o e-mail e a senha que você escolheu no cadastro.",
            new EmailAction("Entrar no Poupi", loginLink),
            footer: "Obrigado por participar do beta do Poupi.");

    public static EmailMessage Declined(string name, string toEmail) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Seu cadastro no Poupi",
            "Obrigado pelo interesse no Poupi. Neste momento não foi possível liberar o "
                + "acesso para a sua conta, e o cadastro foi removido.",
            footer: "O Poupi está em beta fechado e os acessos são liberados aos poucos.");
}
