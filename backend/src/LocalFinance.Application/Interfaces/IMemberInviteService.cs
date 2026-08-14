using LocalFinance.Application.Dtos;
using LocalFinance.Domain.Entities;

namespace LocalFinance.Application.Interfaces;

public interface IMemberInviteService
{
    Task SendInviteAsync(User user, CancellationToken ct = default);

    Task<InviteTargetDto> ValidateTokenAsync(string token, CancellationToken ct = default);

    Task SetPasswordAsync(SetPasswordRequest request, CancellationToken ct = default);
}
