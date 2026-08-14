using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class TransactionService(
    ITransactionRepository transactions,
    ICategoryRepository categories,
    IUserRepository users) : ITransactionService
{
    public async Task<List<TransactionDto>> ListByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        ValidateMonth(month);
        var list = await transactions.ListByMonthAsync(year, month, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<TransactionDto> CreateAsync(TransactionInput input, CancellationToken ct = default)
    {
        var transaction = new Transaction();
        await ApplyAsync(transaction, input, ct);
        await transactions.AddAsync(transaction, ct);
        await transactions.SaveChangesAsync(ct);
        return ToDto(transaction);
    }

    public async Task<TransactionDto> UpdateAsync(Guid id, TransactionInput input, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        await ApplyAsync(transaction, input, ct);
        await transactions.SaveChangesAsync(ct);
        return ToDto(transaction);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        transactions.Remove(transaction);
        await transactions.SaveChangesAsync(ct);
    }

    private async Task<Transaction> GetOrThrowAsync(Guid id, CancellationToken ct) =>
        await transactions.GetByIdAsync(id, ct)
        ?? throw new NotFoundException("Lançamento não encontrado.");

    private async Task ApplyAsync(Transaction transaction, TransactionInput input, CancellationToken ct)
    {
        if (input.Amount <= 0)
        {
            throw new ValidationException("Informe um valor maior que zero.");
        }
        if (!Guid.TryParse(input.CategoryId, out var categoryId)
            || await categories.GetByIdAsync(categoryId, ct) is null)
        {
            throw new ValidationException("Categoria não encontrada.");
        }
        if (!Guid.TryParse(input.MemberId, out var userId)
            || await users.GetByIdAsync(userId, ct) is null)
        {
            throw new ValidationException("Integrante não encontrado.");
        }

        transaction.Type = EnumMapping.ParseTransactionType(input.Type);
        transaction.Amount = decimal.Round(input.Amount, 2);
        transaction.Date = input.Date;
        transaction.CategoryId = categoryId;
        transaction.UserId = userId;
        transaction.Description = input.Description.Trim();
    }

    private static void ValidateMonth(int month)
    {
        if (month is < 1 or > 12)
        {
            throw new ValidationException("Mês inválido.");
        }
    }

    private static TransactionDto ToDto(Transaction transaction) => new(
        transaction.Id.ToString(),
        transaction.Type.ToDto(),
        transaction.Amount,
        transaction.Date,
        transaction.CategoryId.ToString(),
        transaction.UserId.ToString(),
        transaction.Description);
}
