using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IMemberService
{
    Task<List<MemberDto>> ListAsync(CancellationToken ct = default);
    Task<MemberDto> CreateAsync(MemberInput input, CancellationToken ct = default);
    Task<MemberDto> UpdateAsync(Guid id, MemberInput input, CancellationToken ct = default);
    Task<MemberDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default);

    Task ResendInviteAsync(Guid id, CancellationToken ct = default);

    Task DeleteAsync(Guid id, Guid requestedBy, CancellationToken ct = default);
}
