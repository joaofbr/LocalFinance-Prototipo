using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Entities;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class CategoryService(
    ICategoryRepository categories,
    ITransactionRepository transactions) : ICategoryService
{
    public async Task<List<CategoryDto>> ListAsync(Guid householdId, CancellationToken ct = default)
    {
        var list = await categories.ListAsync(householdId, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<CategoryDto> CreateAsync(
        Guid householdId, CategoryInput input, CancellationToken ct = default)
    {
        var category = new Category { HouseholdId = householdId, Active = true };
        Apply(category, input);
        await categories.AddAsync(category, ct);
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<CategoryDto> UpdateAsync(
        Guid householdId, Guid id, CategoryInput input, CancellationToken ct = default)
    {
        var category = await GetOrThrowAsync(householdId, id, ct);
        Apply(category, input);
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<CategoryDto> SetActiveAsync(
        Guid householdId, Guid id, bool active, CancellationToken ct = default)
    {
        var category = await GetOrThrowAsync(householdId, id, ct);
        category.Active = active;
        await categories.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<Dictionary<string, int>> GetUsageAsync(
        Guid householdId, CancellationToken ct = default)
    {
        var counts = await transactions.CountByCategoryAsync(householdId, ct);
        return counts.ToDictionary(pair => pair.Key.ToString(), pair => pair.Value);
    }

    private async Task<Category> GetOrThrowAsync(Guid householdId, Guid id, CancellationToken ct) =>
        await categories.GetByIdAsync(householdId, id, ct)
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
