using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace LocalFinance.Application.Services;

public class MemberService(
    IUserRepository users,
    ITransactionRepository transactions,
    IMemberInviteService invites,
    ILogger<MemberService> logger) : IMemberService
{

    public async Task<List<MemberDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await users.ListAsync(ct);
        return list.Select(user => ToDto(user)).ToList();
    }

    public async Task<MemberDto> CreateAsync(MemberInput input, CancellationToken ct = default)
    {
        var email = Validate(input);
        if (await users.GetByEmailAsync(email, ct) is not null)
        {
            throw new ConflictException("Já existe um integrante com este e-mail.");
        }

        var count = await users.CountAsync(ct);
        var user = new User
        {
            Name = input.Name.Trim(),
            Email = email,
            PasswordHash = string.Empty,
            Role = EnumMapping.ParseUserRole(input.Role),
            Color = AvatarPalette.ForIndex(count),
        };
        await users.AddAsync(user, ct);
        await users.SaveChangesAsync(ct);

        var inviteSent = true;
        try
        {
            await invites.SendInviteAsync(user, ct);
        }
        catch (Exception ex)
        {
            inviteSent = false;
            logger.LogError(ex,
                "Integrante {Email} criado, mas o convite não pôde ser enviado.",
                user.Email);
        }

        return ToDto(user, inviteSent);
    }

    public async Task DeleteAsync(Guid id, Guid requestedBy, CancellationToken ct = default)
    {
        var user = await GetOrThrowAsync(id, ct);

        if (user.Id == requestedBy)
        {
            throw new ValidationException(
                "Você não pode excluir a própria conta. Peça a outro administrador.");
        }

        if (user.Role == UserRole.Admin && await users.CountAdminsAsync(ct) <= 1)
        {
            throw new ValidationException(
                "Este é o único administrador da família. Promova outro integrante antes de excluir.");
        }

        var lancamentos = await transactions.CountByUserAsync(user.Id, ct);
        if (lancamentos > 0)
        {
            throw new ConflictException(
                $"{user.Name} tem {lancamentos} lançamento(s) e não pode ser excluído sem apagar " +
                "esse histórico. Use \"Desativar\" para tirar o acesso mantendo os registros.");
        }

        users.Remove(user);
        await users.SaveChangesAsync(ct);
    }

    public async Task ResendInviteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetOrThrowAsync(id, ct);
        if (!user.Active)
        {
            throw new ValidationException(
                "Reative o integrante antes de reenviar o convite.");
        }
        await invites.SendInviteAsync(user, ct);
    }

    public async Task<MemberDto> UpdateAsync(Guid id, MemberInput input, CancellationToken ct = default)
    {
        var email = Validate(input);
        var user = await GetOrThrowAsync(id, ct);
        var existing = await users.GetByEmailAsync(email, ct);
        if (existing is not null && existing.Id != id)
        {
            throw new ConflictException("Já existe um integrante com este e-mail.");
        }
        user.Name = input.Name.Trim();
        user.Email = email;
        user.Role = EnumMapping.ParseUserRole(input.Role);
        await users.SaveChangesAsync(ct);
        return ToDto(user);
    }

    public async Task<MemberDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default)
    {
        var user = await GetOrThrowAsync(id, ct);
        user.Active = active;
        await users.SaveChangesAsync(ct);
        return ToDto(user);
    }

    private async Task<User> GetOrThrowAsync(Guid id, CancellationToken ct) =>
        await users.GetByIdAsync(id, ct)
        ?? throw new NotFoundException("Integrante não encontrado.");

    private static string Validate(MemberInput input)
    {
        if (string.IsNullOrWhiteSpace(input.Name) || input.Name.Trim().Length < 2)
        {
            throw new ValidationException("Informe o nome.");
        }
        var email = input.Email.Trim().ToLowerInvariant();
        if (!email.Contains('@'))
        {
            throw new ValidationException("E-mail inválido.");
        }
        return email;
    }

    private static MemberDto ToDto(User user, bool? inviteSent = null) => new(
        user.Id.ToString(),
        user.Name,
        user.Email,
        user.Role.ToDto(),
        user.Active,
        user.Color,
        string.IsNullOrEmpty(user.PasswordHash),
        inviteSent);
}
