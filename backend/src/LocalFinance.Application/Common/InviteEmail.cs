using LocalFinance.Application.Interfaces;

namespace LocalFinance.Application.Common;

public static class InviteEmail
{
    public static EmailMessage Build(
        string name,
        string toEmail,
        string link,
        int expiryHours,
        string? inviterName,
        string? inviterEmail)
    {
        var inviter = inviterName is null
            ? "Um administrador"
            : $"{inviterName} ({inviterEmail})";
        var who = inviterName ?? "quem convidou";

        return EmailTemplate.Build(
            name,
            toEmail,
            $"{inviterName ?? "Alguém"} convidou você para o LocalFinance",
            $"{inviter} convidou você para participar do controle financeiro da família no "
                + "LocalFinance. Se aceitar, vocês passam a ver e registrar os mesmos lançamentos.",
            new EmailAction("Ver convite", link),
            $"O link vale por {expiryHours} horas e só pode ser usado uma vez.",
            $"Não conhece {who}? Abra o link e recuse o convite, ou ignore este e-mail.");
    }
}
