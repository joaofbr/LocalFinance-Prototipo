using System.Security.Claims;
using LocalFinance.Application.Common;

namespace LocalFinance.Api.Security;

public static class CurrentUser
{
    public static Guid Id(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");
        return Guid.TryParse(value, out var id)
            ? id
            : throw new UnauthorizedException("Sessão inválida. Entre novamente.");
    }
}
