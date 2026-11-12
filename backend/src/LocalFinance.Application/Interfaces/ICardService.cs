using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface ICardService
{
    Task<List<CardDto>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task<CardDto> CreateAsync(Guid householdId, CardInput input, CancellationToken ct = default);
    Task<CardDto> UpdateAsync(Guid householdId, Guid id, CardInput input, CancellationToken ct = default);
    Task<CardDto> SetActiveAsync(Guid householdId, Guid id, bool active, CancellationToken ct = default);
}
