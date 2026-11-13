using Poupi.Application.Dtos;
using Poupi.Domain.Entities;

namespace Poupi.Application.Interfaces;

public interface IMemberInviteService
{
    Task SendInviteAsync(User user, CancellationToken ct = default);

    Task SendPasswordResetAsync(string email, CancellationToken ct = default);

    Task<InviteTargetDto> ValidateTokenAsync(string token, CancellationToken ct = default);

    Task SetPasswordAsync(SetPasswordRequest request, CancellationToken ct = default);

    Task DeclineAsync(string token, CancellationToken ct = default);

    Task ReleasePendingAsync(User user, CancellationToken ct = default);

    Task InvalidatePendingAsync(Guid userId, CancellationToken ct = default);
}
