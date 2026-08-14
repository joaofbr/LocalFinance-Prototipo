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
    private const int MaxInstallments = 60;

    public async Task<List<TransactionDto>> ListByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        ValidateMonth(month);
        var list = await transactions.ListByMonthAsync(year, month, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<TransactionDto> CreateAsync(TransactionInput input, CancellationToken ct = default)
    {
        var count = input.Installments;
        if (count is < 1 or > MaxInstallments)
        {
            throw new ValidationException(
                $"O número de parcelas deve estar entre 1 e {MaxInstallments}.");
        }

        var first = new Transaction();
        await ApplyAsync(first, input, ct);

        if (count == 1)
        {
            await transactions.AddAsync(first, ct);
            await transactions.SaveChangesAsync(ct);
            return ToDto(first);
        }

        var total = first.Amount;
        var each = decimal.Round(total / count, 2);
        var groupId = Guid.NewGuid();

        var batch = new List<Transaction>(count);
        for (var i = 0; i < count; i++)
        {
            var isLast = i == count - 1;
            batch.Add(new Transaction
            {
                Type = first.Type,
                Amount = isLast ? total - (each * (count - 1)) : each,
                Date = first.Date.AddMonths(i),
                CategoryId = first.CategoryId,
                UserId = first.UserId,
                Description = first.Description,
                InstallmentGroupId = groupId,
                InstallmentNumber = i + 1,
                InstallmentTotal = count,
            });
        }

        await transactions.AddRangeAsync(batch, ct);
        await transactions.SaveChangesAsync(ct);
        return ToDto(batch[0]);
    }

    public async Task<TransactionDto> UpdateAsync(
        Guid id, TransactionInput input, bool applyToGroup = false, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        await ApplyAsync(transaction, input, ct);

        if (applyToGroup && transaction.InstallmentGroupId is Guid groupId)
        {
            var siblings = await transactions.ListByGroupAsync(groupId, ct);
            foreach (var sibling in siblings.Where(s => s.Id != transaction.Id))
            {
                sibling.Type = transaction.Type;
                sibling.CategoryId = transaction.CategoryId;
                sibling.UserId = transaction.UserId;
                sibling.Description = transaction.Description;
            }
        }

        await transactions.SaveChangesAsync(ct);
        return ToDto(transaction);
    }

    public async Task DeleteAsync(Guid id, bool applyToGroup = false, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);

        if (applyToGroup && transaction.InstallmentGroupId is Guid groupId)
        {
            var siblings = await transactions.ListByGroupAsync(groupId, ct);
            transactions.RemoveRange(siblings);
        }
        else
        {
            transactions.Remove(transaction);
        }

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
        transaction.Description,
        transaction.InstallmentGroupId?.ToString(),
        transaction.InstallmentNumber,
        transaction.InstallmentTotal);
}
