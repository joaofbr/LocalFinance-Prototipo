using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class AccessEmails
{
    public static EmailMessage Approved(string name, string toEmail, string loginLink) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Seu acesso ao LocalFinance foi liberado",
            "Seu cadastro foi aprovado e a sua conta já está liberada. "
                + "Entre com o e-mail e a senha que você escolheu no cadastro.",
            new EmailAction("Entrar no LocalFinance", loginLink),
            footer: "Obrigado por participar do beta do LocalFinance.");

    public static EmailMessage Declined(string name, string toEmail) =>
        EmailTemplate.Build(
            name,
            toEmail,
            "Seu cadastro no LocalFinance",
            "Obrigado pelo interesse no LocalFinance. Neste momento não foi possível liberar o "
                + "acesso para a sua conta, e o cadastro foi removido.",
            footer: "O LocalFinance está em beta fechado e os acessos são liberados aos poucos.");
}
