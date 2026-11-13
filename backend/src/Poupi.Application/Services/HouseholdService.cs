using Poupi.Application.Common;
using Poupi.Application.Dtos;
using Poupi.Application.Interfaces;
using Poupi.Domain.Entities;
using Poupi.Domain.Enums;
using Poupi.Domain.Repositories;

namespace Poupi.Application.Services;

public class HouseholdService(
    IHouseholdRepository households,
    IUserRepository users) : IHouseholdService
{
    public async Task<HouseholdDto> GetAsync(Guid householdId, CancellationToken ct = default) =>
        ToDto(await GetOrThrowAsync(householdId, ct));

    public async Task<HouseholdDto> SetPlanAsync(
        Guid householdId, string plan, CancellationToken ct = default)
    {
        var household = await GetOrThrowAsync(householdId, ct);
        var target = EnumMapping.ParseHouseholdPlan(plan);

        if (target == HouseholdPlan.Individual && await users.CountActiveAsync(householdId, ct) > 1)
        {
            throw new ValidationException(
                "Para voltar ao modo individual, desative antes os outros integrantes.");
        }

        household.Plan = target;
        await households.SaveChangesAsync(ct);
        return ToDto(household);
    }

    public async Task EnsureFamilyPlanAsync(Guid householdId, CancellationToken ct = default)
    {
        var household = await GetOrThrowAsync(householdId, ct);
        if (household.Plan != HouseholdPlan.Family)
        {
            throw new ValidationException("Ative o modo família para ter outros integrantes.");
        }
    }

    private async Task<Household> GetOrThrowAsync(Guid householdId, CancellationToken ct) =>
        await households.GetByIdAsync(householdId, ct)
        ?? throw new UnauthorizedException("Sessão inválida. Entre novamente.");

    private static HouseholdDto ToDto(Household household) => new(household.Plan.ToDto());
}
