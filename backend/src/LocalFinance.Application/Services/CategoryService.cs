using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class CategoryService(
    ICategoryRepository categories,
    ITransactionRepository transactions) : ICategoryService
{
    public async Task<List<CategoryDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await categories.ListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<CategoryDto> CreateAsync(CategoryInput input, CancellationToken ct = default)
    {
        var category = new Category { Active = true };
        Apply(category, input);
        await categories.AddAsync(category, ct);
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, CategoryInput input, CancellationToken ct = default)
    {
        var category = await GetOrThrowAsync(id, ct);
        Apply(category, input);
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<CategoryDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default)
    {
        var category = await GetOrThrowAsync(id, ct);
        category.Active = active;
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<Dictionary<string, int>> GetUsageAsync(CancellationToken ct = default)
    {
        var counts = await transactions.CountByCategoryAsync(ct);
        return counts.ToDictionary(pair => pair.Key.ToString(), pair => pair.Value);
    }

    private async Task<Category> GetOrThrowAsync(Guid id, CancellationToken ct) =>
        await categories.GetByIdAsync(id, ct)
        ?? throw new NotFoundException("Categoria não encontrada.");

    private static void Apply(Category category, CategoryInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Name))
        {
            throw new ValidationException("Informe o nome da categoria.");
        }
        if (string.IsNullOrWhiteSpace(input.Color) || string.IsNullOrWhiteSpace(input.Icon))
        {
            throw new ValidationException("Selecione cor e ícone da categoria.");
        }
        category.Name = input.Name.Trim();
        category.Kind = EnumMapping.ParseCategoryKind(input.Kind);
        category.Color = input.Color;
        category.Icon = input.Icon;
    }

    private static CategoryDto ToDto(Category category) => new(
        category.Id.ToString(),
        category.Name,
        category.Kind.ToDto(),
        category.Color,
        category.Icon,
        category.Active);
}
