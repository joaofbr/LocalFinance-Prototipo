using LocalFinance.Application.Common;
using LocalFinance.Application.Dtos;
using LocalFinance.Application.Interfaces;
using LocalFinance.Domain.Entities;
using LocalFinance.Domain.Enums;
using LocalFinance.Domain.Repositories;

namespace LocalFinance.Application.Services;

public class TransactionService(
    ITransactionRepository transactions,
    ICategoryRepository categories,
    IUserRepository users) : ITransactionService
{
    private const int MaxRepeat = 60;

    public async Task<List<TransactionDto>> ListByMonthAsync(int year, int month, CancellationToken ct = default)
    {
        ValidateMonth(month);
        var list = await transactions.ListByMonthAsync(year, month, ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<TransactionDto> CreateAsync(TransactionInput input, CancellationToken ct = default)
    {
        var count = input.Repeat;
        if (count is < 1 or > MaxRepeat)
        {
            throw new ValidationException(
                $"A repetição deve estar entre 1 e {MaxRepeat} meses.");
        }

        var first = new Transaction();
        await ApplyAsync(first, input, ct);

        if (count == 1)
        {
            await transactions.AddAsync(first, ct);
            await transactions.SaveChangesAsync(ct);
            return ToDto(first);
        }

        var kind = EnumMapping.ParseSeriesKind(input.RepeatMode);
        if (kind == SeriesKind.Installment && first.Type == TransactionType.Income)
        {
            throw new ValidationException("Receitas não podem ser parceladas.");
        }

        var seriesId = Guid.NewGuid();
        var batch = new List<Transaction>(count);

        var total = first.Amount;
        var each = kind == SeriesKind.Installment
            ? decimal.Round(total / count, 2)
            : total;

        for (var i = 0; i < count; i++)
        {
            var isLastInstallment = kind == SeriesKind.Installment && i == count - 1;
            batch.Add(new Transaction
            {
                Type = first.Type,
                Amount = isLastInstallment ? total - (each * (count - 1)) : each,
                Date = first.Date.AddMonths(i),
                CategoryId = first.CategoryId,
                UserId = first.UserId,
                Description = first.Description,
                SeriesId = seriesId,
                SeriesKind = kind,
                SeriesIndex = i + 1,
                SeriesTotal = count,
            });
        }

        await transactions.AddRangeAsync(batch, ct);
        await transactions.SaveChangesAsync(ct);
        return ToDto(batch[0]);
    }

    public async Task<TransactionDto> UpdateAsync(
        Guid id, TransactionInput input, string? scope = null, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        var reached = await ResolveScopeAsync(transaction, scope, ct);

        var previousAmount = transaction.Amount;
        await ApplyAsync(transaction, input, ct);
        var amountChanged = previousAmount != transaction.Amount;

        foreach (var sibling in reached.Where(s => s.Id != transaction.Id))
        {
            sibling.Type = transaction.Type;
            sibling.CategoryId = transaction.CategoryId;
            sibling.UserId = transaction.UserId;
            sibling.Description = transaction.Description;

            if (amountChanged && sibling.SeriesKind == SeriesKind.Fixed)
            {
                sibling.Amount = transaction.Amount;
            }
        }

        await transactions.SaveChangesAsync(ct);
        return ToDto(transaction);
    }

    public async Task DeleteAsync(Guid id, string? scope = null, CancellationToken ct = default)
    {
        var transaction = await GetOrThrowAsync(id, ct);
        var reached = await ResolveScopeAsync(transaction, scope, ct);

        if (reached.Count > 0)
        {
            transactions.RemoveRange(reached);
        }
        else
        {
            transactions.Remove(transaction);
        }

        await transactions.SaveChangesAsync(ct);
    }

    private async Task<List<Transaction>> ResolveScopeAsync(
        Transaction transaction, string? scope, CancellationToken ct)
    {
        if (transaction.SeriesId is not Guid seriesId || string.IsNullOrWhiteSpace(scope))
        {
            return [];
        }

        var series = await transactions.ListBySeriesAsync(seriesId, ct);

        return scope.ToLowerInvariant() switch
        {
            "all" => series,
            "future" => series
                .Where(s => s.SeriesIndex >= transaction.SeriesIndex)
                .ToList(),
            _ => [],
        };
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
        transaction.SeriesId?.ToString(),
        transaction.SeriesKind?.ToDto(),
        transaction.SeriesIndex,
        transaction.SeriesTotal);
}
