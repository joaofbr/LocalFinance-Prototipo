using Poupi.Domain.Enums;

namespace Poupi.Application.QuickEntry;

public sealed record KeywordRule(string Category, TransactionType Type, string[] Keywords);

public static class CategoryKeywords
{
    public static readonly KeywordRule[] Rules =
    [
        new("Salário", TransactionType.Income,
        [
            "salario", "holerite", "adiantamento", "decimo terceiro", "13o", "plr", "contracheque",
        ]),
        new("Renda extra", TransactionType.Income,
        [
            "freela", "freelance", "bico", "comissao", "reembolso", "cashback", "vendi", "bonus", "renda extra",
        ]),
        new("Investimentos", TransactionType.Income,
        [
            "rendimento", "rendimentos", "dividendo", "dividendos", "resgate", "resgatei", "juros",
        ]),
        new("Investimentos", TransactionType.Expense,
        [
            "investimento", "investi", "aplicacao", "apliquei", "aporte", "tesouro", "cdb", "acoes", "poupanca",
            "cripto", "bitcoin", "lci", "lca", "fii", "fiis",
        ]),
        new("Mercado", TransactionType.Expense,
        [
            "mercado", "supermercado", "feira", "hortifruti", "sacolao", "acougue", "atacadao", "assai",
            "carrefour", "atacarejo", "compras do mes",
        ]),
        new("Alimentação", TransactionType.Expense,
        [
            "ifood", "restaurante", "almoco", "jantar", "janta", "lanche", "lanchonete", "pizza", "hamburguer",
            "burger", "padaria", "cafe", "cafeteria", "marmita", "delivery", "sorvete", "acai", "rappi",
            "sushi", "churrasco", "pastel", "salgado", "comida",
        ]),
        new("Transporte", TransactionType.Expense,
        [
            "uber", "taxi", "gasolina", "combustivel", "etanol", "diesel", "posto", "estacionamento", "onibus",
            "metro", "trem", "passagem", "pedagio", "ipva", "oficina", "mecanico", "licenciamento", "brt",
            "carro", "moto", "pneu", "lavagem", "lava jato",
        ]),
        new("Moradia", TransactionType.Expense,
        [
            "aluguel", "condominio", "iptu", "reforma", "diarista", "faxina", "moveis", "movel", "encanador",
            "eletricista", "pintura",
        ]),
        new("Saúde", TransactionType.Expense,
        [
            "farmacia", "drogaria", "remedio", "medico", "medica", "consulta", "dentista", "exame", "hospital",
            "plano de saude", "academia", "terapia", "psicologo", "psicologa", "otica", "vacina", "fisioterapia",
        ]),
        new("Educação", TransactionType.Expense,
        [
            "escola", "faculdade", "curso", "livro", "material escolar", "mensalidade escolar", "udemy", "alura",
            "ingles", "apostila", "matricula",
        ]),
        new("Lazer", TransactionType.Expense,
        [
            "cinema", "show", "teatro", "viagem", "hotel", "pousada", "passeio", "bar", "balada", "cerveja",
            "jogo", "game", "ingresso", "parque", "festa", "praia", "airbnb",
        ]),
        new("Contas & Serviços", TransactionType.Expense,
        [
            "luz", "energia", "agua", "internet", "celular", "telefone", "gas", "netflix", "spotify", "streaming",
            "assinatura", "disney", "prime video", "hbo", "youtube", "icloud", "seguro", "tv",
            "conta de luz", "conta de agua",
        ]),
    ];
}
