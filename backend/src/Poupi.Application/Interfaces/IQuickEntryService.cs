using Poupi.Application.Dtos;

namespace Poupi.Application.Interfaces;

public interface IQuickEntryService
{
    Task<TransactionDraftDto> InterpretAsync(
        Guid householdId, Guid userId, InterpretInput input, CancellationToken ct = default);
}
