using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface IMemberService
{
    Task<List<MemberDto>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task<MemberDto> CreateAsync(Guid householdId, MemberInput input, CancellationToken ct = default);
    Task<MemberDto> UpdateAsync(
        Guid householdId, Guid id, MemberInput input, Guid requestedBy,
        CancellationToken ct = default);
    Task<MemberDto> SetActiveAsync(
        Guid householdId, Guid id, bool active, Guid requestedBy, CancellationToken ct = default);

    Task ResendInviteAsync(Guid householdId, Guid id, CancellationToken ct = default);

    Task DeleteAsync(Guid householdId, Guid id, Guid requestedBy, CancellationToken ct = default);
}
