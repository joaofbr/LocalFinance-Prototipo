using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> ListAsync(Guid householdId, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(Guid householdId, CategoryInput input, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(
        Guid householdId, Guid id, CategoryInput input, CancellationToken ct = default);
    Task<CategoryDto> SetActiveAsync(
        Guid householdId, Guid id, bool active, CancellationToken ct = default);
    Task<Dictionary<string, int>> GetUsageAsync(Guid householdId, CancellationToken ct = default);
}
