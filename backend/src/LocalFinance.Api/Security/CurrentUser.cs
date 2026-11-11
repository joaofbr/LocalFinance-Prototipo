using System.Security.Claims;
using LocalFinance.Application.Common;

namespace LocalFinance.Api.Security;

public static class CurrentUser
{
    public static Guid Id(this ClaimsPrincipal principal) =>
        ParseOrThrow(principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub"));

    public static Guid HouseholdId(this ClaimsPrincipal principal) =>
        ParseOrThrow(principal.FindFirstValue(AppClaims.Household));

    private static Guid ParseOrThrow(string? value) =>
        Guid.TryParse(value, out var id)
            ? id
            : throw new UnauthorizedException("Sessão inválida. Entre novamente.");
}
