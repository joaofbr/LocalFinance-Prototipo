using LocalFinance.Application.Dtos;

namespace LocalFinance.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> ListAsync(CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CategoryInput input, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(Guid id, CategoryInput input, CancellationToken ct = default);
    Task<CategoryDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default);
    Task<Dictionary<string, int>> GetUsageAsync(CancellationToken ct = default);
}
