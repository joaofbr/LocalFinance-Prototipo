using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Poupi.Domain.Enums;
using Poupi.Domain.ReadModels;

namespace Poupi.Application.QuickEntry;

public sealed partial class TransactionInterpreter
{
    public const int MaxRepeat = 60;
    private const int DefaultFixedMonths = 12;
    private const int MaxDescriptionLength = 200;
    private const decimal MaxAmount = 10_000_000m;
    private const string FallbackDescription = "Lançamento";

    private static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");

    private static readonly char[] EdgePunctuation =
        [',', '.', ';', ':', '!', '?', '(', ')', '"', '\'', '“', '”', '‘', '’'];

    private static readonly HashSet<string> Fillers =
    [
        "de", "do", "da", "dos", "das", "no", "na", "nos", "nas", "em", "com", "o", "a", "os", "as", "um", "uma",
        "pro", "pra", "para", "pelo", "pela", "e", "por", "via", "eu", "entre", "reais", "real", "r$", "+", "-", "=",
    ];

    private static readonly HashSet<string> LeadIns =
    [
        "de", "do", "da", "no", "na", "em", "com", "o", "a", "pelo", "pela", "via", "pro", "pra", "para",
        "e", "entre", "por",
    ];

    private static readonly HashSet<string> AmountLeadIns = ["de", "por", "r$", "foi", "deu", "custou"];
    private static readonly HashSet<string> CurrencyWords = ["reais", "real", "conto", "contos", "pila", "pilas"];
    private static readonly HashSet<string> IncomeWords =
    [
        "recebi", "recebemos", "recebeu", "receberam", "recebo", "recebe", "recebido", "recebida", "recebidos",
        "recebimento", "ganhei", "ganhamos", "ganhou", "ganharam", "entrou", "entraram", "caiu", "cairam", "receita",
    ];
    private static readonly HashSet<string> ExpenseWords =
    [
        "paguei", "pagamos", "pagou", "pagaram", "pago", "paga", "gastei", "gastamos", "gastou", "gastaram", "gasto",
        "comprei", "compramos", "comprou", "compraram", "despesa", "saiu", "sairam", "debitou", "debitaram",
    ];
    private static readonly HashSet<string> CashWords = ["pix", "debito", "dinheiro", "avista", "especie"];
    private static readonly HashSet<string> CardWords = ["cartao", "credito"];
    private static readonly HashSet<string> SplitWords =
        ["dividido", "dividida", "dividir", "divide", "dividi", "rachado", "rachada", "rachar", "rachei", "racha"];
    private static readonly HashSet<string> FixedWords = ["fixo", "fixa", "mensal", "mensalmente"];
    private static readonly HashSet<string> InstallmentWords = ["parcelado", "parcelada"];
    private static readonly HashSet<string> InstallmentUnits = ["x", "vezes", "vez", "parcelas", "parcela"];
    private static readonly HashSet<string> MonthUnits = ["meses"];
    private static readonly string[][] FixedPhrases = [["todo", "mes"], ["todos", "os", "meses"], ["por", "mes"]];

    private static readonly HashSet<string> KeywordSet = CategoryKeywords.Rules
        .SelectMany(rule => rule.Keywords)
        .ToHashSet();

    private readonly EntryContext context;
    private readonly List<Token> tokens;
    private readonly List<HistoryEntry> history;
    private readonly List<string> warnings = [];
    private string? unresolvedCard;

    private TransactionInterpreter(string text, EntryContext context)
    {
        this.context = context;
        tokens = Tokenize(text);
        history = context.History
            .Select(usage =>
            {
                var key = KeyOfText(usage.Description);
                return new HistoryEntry(key, key.Split(' ').Where(IsSignificant).ToArray(), usage);
            })
            .ToList();
    }

    public static EntryDraft Interpret(string text, EntryContext context) =>
        new TransactionInterpreter(text, context).Run();

    public static string Normalize(string value)
    {
        var decomposed = value.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }
        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private EntryDraft Run()
    {
        var date = ReadDate();
        var (repeat, repeatKind) = ReadRepeat();
        var amount = ReadAmount();
        var card = ReadPayment();
        var mentionedMembers = ReadMembers();
        var explicitType = ReadTypeWords();

        var named = FindNamedCategory();
        var words = FreeWords([]);
        var withoutCategory = named is { Exact: true } ? FreeWords(named.Indexes) : words;
        if (withoutCategory.Count == 0)
        {
            withoutCategory = words;
        }

        var keys = new[] { KeyOf(words), KeyOf(withoutCategory) }.Where(k => k.Length > 0).ToHashSet();
        var exact = Hits(history.Where(entry => keys.Contains(entry.Key)), _ => 1);
        var keyword = FindKeyword();
        var overlap = OverlapHits(withoutCategory);

        var type = explicitType
            ?? TypeOf(named?.Category.Kind)
            ?? DominantType(exact)
            ?? keyword?.Rule.Type
            ?? DominantType(overlap)
            ?? TransactionType.Expense;

        var category = Fits(named?.Category, type)
            ?? BestCategory(exact, type)
            ?? Fits(keyword?.Category, type)
            ?? BestCategory(overlap, type);

        if (category is null)
        {
            warnings.Add("Não reconheci a categoria. Escolha em Ajustar.");
        }
        if (type == TransactionType.Expense && unresolvedCard is not null)
        {
            warnings.Add(unresolvedCard);
        }
        if (type == TransactionType.Income && card is not null)
        {
            warnings.Add("Cartão vale só para despesas, então a receita ficou sem cartão.");
            card = null;
        }
        if (type == TransactionType.Income && repeatKind == SeriesKind.Installment)
        {
            warnings.Add("Receitas não podem ser parceladas, então ficou sem repetição.");
            repeat = 1;
            repeatKind = null;
        }

        var describedWords = category is not null && category == named?.Category ? withoutCategory : words;
        return new EntryDraft(
            type,
            amount,
            date,
            category?.Id,
            ResolveMembers(mentionedMembers, card),
            Describe(describedWords, category),
            repeat,
            repeatKind,
            card?.Id,
            warnings);
    }

    private DateOnly ReadDate()
    {
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }

            var key = tokens[i].Key;
            DateOnly? relative = key switch
            {
                "hoje" => context.Today,
                "ontem" => context.Today.AddDays(-1),
                "anteontem" => context.Today.AddDays(-2),
                _ => null,
            };
            if (relative is DateOnly day)
            {
                UseWithLeadIns(i);
                return day;
            }

            var length = 0;
            DateOnly? found = null;
            if (DayMonth().Match(key) is { Success: true } match)
            {
                length = 1;
                found = BuildDate(
                    int.Parse(match.Groups[1].Value),
                    int.Parse(match.Groups[2].Value),
                    match.Groups[3].Success ? int.Parse(match.Groups[3].Value) : null);
            }
            else if (key == "dia" && Free(i + 1) && int.TryParse(tokens[i + 1].Key, out var dayOfMonth))
            {
                length = 2;
                found = BuildDate(dayOfMonth, context.DefaultDate.Month, null);
            }

            if (length == 0)
            {
                continue;
            }
            UseWithLeadIns(i, length);
            if (found is DateOnly date)
            {
                return date;
            }
            warnings.Add($"Não entendi a data, então usei {context.DefaultDate.ToString("dd/MM", PtBr)}.");
            return context.DefaultDate;
        }
        return context.DefaultDate;
    }

    private DateOnly? BuildDate(int day, int month, int? year)
    {
        if (month is < 1 or > 12)
        {
            return null;
        }
        var resolvedYear = year switch
        {
            null => context.DefaultDate.Year,
            < 100 => 2000 + year.Value,
            _ => year.Value,
        };
        if (resolvedYear is < 2000 or > 2100 || day < 1 || day > DateTime.DaysInMonth(resolvedYear, month))
        {
            return null;
        }

        var date = new DateOnly(resolvedYear, month, day);
        if (year is null)
        {
            var distance = date.DayNumber - context.DefaultDate.DayNumber;
            if (distance > 183)
            {
                date = date.AddYears(-1);
            }
            else if (distance < -183)
            {
                date = date.AddYears(1);
            }
        }
        return date;
    }

    private (int Repeat, SeriesKind? Kind) ReadRepeat()
    {
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }

            var key = tokens[i].Key;
            int? count = null;
            SeriesKind? kind = null;
            var length = 1;
            if (Installments().Match(key) is { Success: true } match)
            {
                count = int.Parse(match.Groups[1].Value);
                kind = SeriesKind.Installment;
            }
            else if (int.TryParse(key, NumberStyles.None, CultureInfo.InvariantCulture, out var number)
                && number is >= 2 and <= MaxRepeat
                && Free(i + 1))
            {
                var unit = tokens[i + 1].Key;
                if (InstallmentUnits.Contains(unit))
                {
                    (count, kind, length) = (number, SeriesKind.Installment, 2);
                }
                else if (MonthUnits.Contains(unit))
                {
                    (count, kind, length) = (number, SeriesKind.Fixed, 2);
                }
            }

            if (count is not int months)
            {
                continue;
            }
            UseWithLeadIns(i, length);
            UseAll(InstallmentWords);
            if (kind == SeriesKind.Fixed)
            {
                UseFixedWords();
            }
            if (months == 1)
            {
                return (1, null);
            }
            if (months is < 2 or > MaxRepeat)
            {
                warnings.Add($"A repetição vai de 2 a {MaxRepeat} meses, então ficou sem repetição.");
                return (1, null);
            }
            return (months, kind);
        }

        return UseFixedWords() ? (DefaultFixedMonths, SeriesKind.Fixed) : (1, null);
    }

    private bool UseFixedWords()
    {
        var found = UseAll(FixedWords);
        foreach (var phrase in FixedPhrases)
        {
            var at = FindSequence(phrase);
            if (at >= 0)
            {
                UseWithLeadIns(at, phrase.Length);
                found = true;
            }
        }
        return found;
    }

    private decimal? ReadAmount()
    {
        var candidates = new List<AmountCandidate>();
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i) || ParseNumber(tokens[i].Key) is not { } parsed)
            {
                continue;
            }

            var value = parsed.Value;
            var length = 1;
            if (FreeIs(i + 1, "mil"))
            {
                value *= 1000m;
                length = 2;
            }
            var currencyAfter = Free(i + length) && CurrencyWords.Contains(tokens[i + length].Key);
            if (currencyAfter)
            {
                length++;
            }
            candidates.Add(new AmountCandidate(i, length, value, currencyAfter || FreeIs(i - 1, "r$"), parsed.Decimals));
        }

        var chosen = candidates.FirstOrDefault(c => c.Currency)
            ?? candidates.FirstOrDefault(c => c.Decimals)
            ?? candidates.MaxBy(c => c.Value);
        if (chosen is null)
        {
            warnings.Add("Não achei o valor. Escreva, por exemplo: mercado 89,90.");
            return null;
        }

        Use(chosen.Index, chosen.Length);
        for (var j = chosen.Index - 1; Free(j) && AmountLeadIns.Contains(tokens[j].Key); j--)
        {
            tokens[j].Used = true;
        }
        if (chosen.Value <= 0 || chosen.Value > MaxAmount)
        {
            warnings.Add("O valor precisa ficar entre R$ 0,01 e R$ 10 milhões.");
            return null;
        }
        return decimal.Round(chosen.Value, 2);
    }

    private static (decimal Value, bool Decimals)? ParseNumber(string key)
    {
        var multiplier = 1m;
        if (key.Length > 1 && key.EndsWith('k'))
        {
            multiplier = 1000m;
            key = key[..^1];
        }

        string invariant;
        if (ThousandsWithDots().IsMatch(key))
        {
            invariant = key.Replace(".", string.Empty).Replace(',', '.');
        }
        else if (ThousandsWithCommas().IsMatch(key))
        {
            invariant = key.Replace(",", string.Empty);
        }
        else if (PlainNumber().IsMatch(key))
        {
            invariant = key.Replace(',', '.');
        }
        else
        {
            return null;
        }

        return decimal.TryParse(invariant, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var value)
            ? (value * multiplier, invariant.Contains('.'))
            : null;
    }

    private EntryCard? ReadPayment()
    {
        EntryCard? chosen = null;
        var chosenAt = -1;
        var chosenLength = 0;
        foreach (var card in context.Cards)
        {
            var words = NameWords(card.Name).Where(w => !CardWords.Contains(w)).ToArray();
            if (words.Length == 0)
            {
                continue;
            }

            var at = FindSequence(words);
            var length = words.Length;
            if (at < 0 && words.Length > 1 && CanMatchCardByFirstWord(words[0]))
            {
                at = FindSequence([words[0]]);
                length = 1;
            }
            if (at >= 0 && length > chosenLength)
            {
                (chosen, chosenAt, chosenLength) = (card, at, length);
            }
        }

        if (chosen is not null)
        {
            UseWithLeadIns(chosenAt, chosenLength);
            UseAll(CardWords);
            return chosen;
        }

        var cash = FindSequence(["a", "vista"]);
        if (cash >= 0)
        {
            UseWithLeadIns(cash, 2);
        }
        UseAll(CashWords);

        if (!UseAll(CardWords))
        {
            return null;
        }
        if (context.Cards.Count == 1)
        {
            return context.Cards[0];
        }
        unresolvedCard = context.Cards.Count > 1
            ? "Você tem mais de um cartão. Diga qual (ex.: no nubank) ou escolha em Ajustar."
            : "Você ainda não tem cartão cadastrado, então ficou à vista.";
        return null;
    }

    private bool CanMatchCardByFirstWord(string word) =>
        word.Length >= 3
        && !KeywordSet.Contains(word)
        && !context.Categories.Any(c => NameWords(c.Name).Contains(word))
        && context.Cards.Count(c => NameWords(c.Name).FirstOrDefault() == word) == 1;

    private List<Guid> ReadMembers()
    {
        if (context.Members.Count < 2)
        {
            return [];
        }

        var mentioned = new List<Guid>();
        var split = false;
        var self = false;
        var everyone = false;
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }

            var key = tokens[i].Key;
            var member = context.Members.FirstOrDefault(m => NameWords(m.Name).FirstOrDefault() == key);
            if (member is not null)
            {
                var before = i - 1;
                while (Free(before) && tokens[before].Key is "o" or "a")
                {
                    before--;
                }
                split |= FreeIs(before, "com");
                if (member.Id == context.CurrentUserId)
                {
                    self = true;
                }
                else if (!mentioned.Contains(member.Id))
                {
                    mentioned.Add(member.Id);
                }
                UseWithLeadIns(i);
            }
            else if (key == "eu")
            {
                self = true;
                UseWithLeadIns(i);
            }
            else if (SplitWords.Contains(key))
            {
                split = true;
                UseWithLeadIns(i);
            }
            else if (key == "todos")
            {
                everyone = true;
                UseWithLeadIns(i);
            }
        }

        var halves = FindSequence(["meio", "a", "meio"]);
        if (halves >= 0)
        {
            split = true;
            UseWithLeadIns(halves, 3);
        }

        if (everyone || (split && mentioned.Count == 0))
        {
            return context.Members.Select(m => m.Id).ToList();
        }
        if (mentioned.Count == 0)
        {
            return [];
        }
        return split || self ? [context.CurrentUserId, .. mentioned] : mentioned;
    }

    private List<Guid> ResolveMembers(List<Guid> mentioned, EntryCard? card)
    {
        if (mentioned.Count > 0)
        {
            return mentioned;
        }
        if (card?.OwnerId is Guid owner && context.Members.Any(m => m.Id == owner))
        {
            return [owner];
        }
        return [context.CurrentUserId];
    }

    private TransactionType? ReadTypeWords()
    {
        TransactionType? found = null;
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }
            var key = tokens[i].Key;
            if (IncomeWords.Contains(key))
            {
                found ??= TransactionType.Income;
                Use(i);
            }
            else if (ExpenseWords.Contains(key))
            {
                found ??= TransactionType.Expense;
                Use(i);
            }
        }
        return found;
    }

    private CategoryMatch? FindNamedCategory()
    {
        CategoryMatch? best = null;
        foreach (var category in context.Categories)
        {
            var words = NameWords(category.Name);
            if (words.Length == 0)
            {
                continue;
            }

            CategoryMatch? candidate = null;
            var at = FindSequence(words);
            var loose = at < 0 && words[0].Length >= 4 ? FindLoose(words[0]) : -1;
            if (at >= 0)
            {
                candidate = new CategoryMatch(category, Enumerable.Range(at, words.Length).ToArray(), true);
            }
            else if (loose >= 0)
            {
                candidate = new CategoryMatch(category, [loose], false);
            }

            if (candidate is null)
            {
                continue;
            }
            var better = best is null
                || (candidate.Exact && !best.Exact)
                || (candidate.Exact == best.Exact && candidate.Indexes.Length > best.Indexes.Length);
            if (better)
            {
                best = candidate;
            }
        }
        return best;
    }

    private int FindLoose(string word)
    {
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }
            var key = tokens[i].Key;
            if (key == word || key + "s" == word || word + "s" == key)
            {
                return i;
            }
        }
        return -1;
    }

    private KeywordHit? FindKeyword()
    {
        for (var i = 0; i < tokens.Count; i++)
        {
            if (!Free(i))
            {
                continue;
            }
            foreach (var rule in CategoryKeywords.Rules)
            {
                if (rule.Keywords.Any(keyword => MatchesAt(i, keyword)))
                {
                    var target = Normalize(rule.Category);
                    return new KeywordHit(rule, context.Categories.FirstOrDefault(c => Normalize(c.Name) == target));
                }
            }
        }
        return null;
    }

    private bool MatchesAt(int index, string keyword)
    {
        var parts = keyword.Split(' ');
        for (var k = 0; k < parts.Length; k++)
        {
            if (!Free(index + k))
            {
                return false;
            }
            var key = tokens[index + k].Key;
            var plural = k == parts.Length - 1 && key.Length > 3 && key.EndsWith('s') && key[..^1] == parts[k];
            if (key != parts[k] && !plural)
            {
                return false;
            }
        }
        return true;
    }

    private List<HistoryHit> OverlapHits(List<Token> words)
    {
        var significant = words.Select(t => t.Key).Where(IsSignificant).ToHashSet();
        if (significant.Count == 0)
        {
            return [];
        }
        return Hits(
            history.Where(entry => entry.Words.Any(significant.Contains)),
            entry => entry.Words.Count(significant.Contains));
    }

    private List<HistoryHit> Hits(IEnumerable<HistoryEntry> entries, Func<HistoryEntry, int> shared)
    {
        var categoriesById = context.Categories.ToDictionary(c => c.Id);
        return entries
            .Where(entry => categoriesById.ContainsKey(entry.Usage.CategoryId))
            .GroupBy(entry => (entry.Usage.CategoryId, entry.Usage.Type))
            .Select(group => new HistoryHit(
                categoriesById[group.Key.CategoryId],
                group.Key.Type,
                group.Sum(entry => entry.Usage.Count),
                group.Max(shared)))
            .OrderByDescending(hit => hit.Shared)
            .ThenByDescending(hit => hit.Count)
            .ToList();
    }

    private static TransactionType? DominantType(List<HistoryHit> hits) =>
        hits.Count == 0 ? null : hits[0].Type;

    private static EntryCategory? BestCategory(List<HistoryHit> hits, TransactionType type) =>
        hits.FirstOrDefault(hit => hit.Type == type && Fits(hit.Category, type) is not null)?.Category;

    private static EntryCategory? Fits(EntryCategory? category, TransactionType type) =>
        category is null || category.Kind == CategoryKind.Both || TypeOf(category.Kind) == type ? category : null;

    private static TransactionType? TypeOf(CategoryKind? kind) => kind switch
    {
        CategoryKind.Income => TransactionType.Income,
        CategoryKind.Expense => TransactionType.Expense,
        _ => null,
    };

    private static string Describe(List<Token> words, EntryCategory? category)
    {
        var text = string.Join(' ', words.Select(t => t.Raw));
        if (text.Length == 0)
        {
            return category?.Name ?? FallbackDescription;
        }
        if (text.Length > MaxDescriptionLength)
        {
            text = text[..MaxDescriptionLength].TrimEnd();
        }
        return char.ToUpper(text[0], PtBr) + text[1..];
    }

    private List<Token> FreeWords(IReadOnlyCollection<int> exclude)
    {
        var list = tokens.Where((token, index) => !token.Used && !exclude.Contains(index)).ToList();
        while (list.Count > 0 && Fillers.Contains(list[0].Key))
        {
            list.RemoveAt(0);
        }
        while (list.Count > 0 && Fillers.Contains(list[^1].Key))
        {
            list.RemoveAt(list.Count - 1);
        }
        return list;
    }

    private static string KeyOf(List<Token> words) => string.Join(' ', words.Select(t => t.Key));

    private static string KeyOfText(string text) => string.Join(' ', Tokenize(text).Select(t => t.Key));

    private static bool IsSignificant(string key) =>
        key.Length >= 3 && !Fillers.Contains(key) && !key.Any(char.IsDigit);

    private static string[] NameWords(string name) =>
        Normalize(name)
            .Split([' ', '&', '/'], StringSplitOptions.RemoveEmptyEntries)
            .Select(word => word.Trim(EdgePunctuation))
            .Where(word => word.Length > 0 && !Fillers.Contains(word))
            .ToArray();

    private static List<Token> Tokenize(string text)
    {
        var list = new List<Token>();
        foreach (var piece in text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries))
        {
            var raw = piece.Trim(EdgePunctuation);
            if (raw.Length > 2 && raw.StartsWith("r$", StringComparison.OrdinalIgnoreCase))
            {
                list.Add(new Token(raw[..2], "r$"));
                raw = raw[2..];
            }
            if (raw.Length > 0)
            {
                list.Add(new Token(raw, Normalize(raw)));
            }
        }
        return list;
    }

    private bool Free(int index) => index >= 0 && index < tokens.Count && !tokens[index].Used;

    private bool FreeIs(int index, string key) => Free(index) && tokens[index].Key == key;

    private void Use(int index, int count = 1)
    {
        for (var k = index; k < index + count; k++)
        {
            tokens[k].Used = true;
        }
    }

    private void UseWithLeadIns(int index, int count = 1)
    {
        Use(index, count);
        for (var j = index - 1; Free(j) && LeadIns.Contains(tokens[j].Key); j--)
        {
            tokens[j].Used = true;
        }
    }

    private bool UseAll(HashSet<string> keys)
    {
        var found = false;
        for (var i = 0; i < tokens.Count; i++)
        {
            if (Free(i) && keys.Contains(tokens[i].Key))
            {
                UseWithLeadIns(i);
                found = true;
            }
        }
        return found;
    }

    private int FindSequence(IReadOnlyList<string> keys)
    {
        for (var i = 0; i + keys.Count <= tokens.Count; i++)
        {
            var match = true;
            for (var k = 0; k < keys.Count && match; k++)
            {
                match = FreeIs(i + k, keys[k]);
            }
            if (match)
            {
                return i;
            }
        }
        return -1;
    }

    [GeneratedRegex(@"^(\d{1,2})/(\d{1,2})(?:/(\d{2}|\d{4}))?$")]
    private static partial Regex DayMonth();

    [GeneratedRegex(@"^(\d{1,2})x$")]
    private static partial Regex Installments();

    [GeneratedRegex(@"^\d{1,3}(\.\d{3})+(,\d{1,2})?$")]
    private static partial Regex ThousandsWithDots();

    [GeneratedRegex(@"^\d{1,3}(,\d{3})+(\.\d{1,2})?$")]
    private static partial Regex ThousandsWithCommas();

    [GeneratedRegex(@"^\d+([.,]\d{1,2})?$")]
    private static partial Regex PlainNumber();

    private sealed class Token(string raw, string key)
    {
        public string Raw { get; } = raw;
        public string Key { get; } = key;
        public bool Used { get; set; }
    }

    private sealed record HistoryEntry(string Key, string[] Words, DescriptionUsage Usage);

    private sealed record HistoryHit(EntryCategory Category, TransactionType Type, int Count, int Shared);

    private sealed record AmountCandidate(int Index, int Length, decimal Value, bool Currency, bool Decimals);

    private sealed record CategoryMatch(EntryCategory Category, int[] Indexes, bool Exact);

    private sealed record KeywordHit(KeywordRule Rule, EntryCategory? Category);
}
