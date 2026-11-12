namespace LocalFinance.Application.Common;

public static class ReleasedInvite
{
    private const string Domain = "convite-recusado.localfinance.invalid";

    public static string EmailFor(Guid userId) => $"{userId:N}@{Domain}";

    public static bool IsReleased(string email) =>
        email.EndsWith("@" + Domain, StringComparison.OrdinalIgnoreCase);
}
