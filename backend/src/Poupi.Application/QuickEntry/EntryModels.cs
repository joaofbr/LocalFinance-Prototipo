using Poupi.Domain.Enums;
using Poupi.Domain.ReadModels;

namespace Poupi.Application.QuickEntry;

public sealed record EntryCategory(Guid Id, string Name, CategoryKind Kind);

public sealed record EntryCard(Guid Id, string Name, Guid? OwnerId);

public sealed record EntryMember(Guid Id, string Name);

public sealed record EntryContext(
    Guid CurrentUserId,
    DateOnly Today,
    DateOnly DefaultDate,
    IReadOnlyList<EntryCategory> Categories,
    IReadOnlyList<EntryCard> Cards,
    IReadOnlyList<EntryMember> Members,
    IReadOnlyList<DescriptionUsage> History);

public sealed record EntryDraft(
    TransactionType Type,
    decimal? Amount,
    DateOnly Date,
    Guid? CategoryId,
    List<Guid> MemberIds,
    string Description,
    int Repeat,
    SeriesKind? RepeatKind,
    Guid? CardId,
    List<string> Warnings);
