using Poupi.Domain.Enums;

namespace Poupi.Domain.ReadModels;

public record DescriptionUsage(string Description, Guid CategoryId, TransactionType Type, int Count);
