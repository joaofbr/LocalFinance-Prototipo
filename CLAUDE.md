# LocalFinance

Controle financeiro pessoal ou familiar. Monorepo:

- `backend/`: ASP.NET Core (.NET 10), EF Core, PostgreSQL, JWT. Camadas `Domain`, `Application`,
  `Infrastructure` e `Api` (o Domain não depende de ninguém, a Api só conversa com a Application).
- `frontend/`: React 19, TypeScript, Vite, Tailwind v4, TanStack Query, empacotável com Capacitor.
- `docs/PLANO.md`: plano original. Descreve o modelo antigo de **uma família por instalação**,
  que não vale mais. O modelo atual está neste arquivo e no `README.md`.

## Comandos

| O quê | Comando |
|---|---|
| API (porta 5063) | `cd backend/src/LocalFinance.Api && dotnet run --launch-profile http` |
| Build do backend | `dotnet build backend/LocalFinance.slnx` |
| Nova migration | `dotnet ef migrations add <Nome> --project backend/src/LocalFinance.Infrastructure --startup-project backend/src/LocalFinance.Api --output-dir Persistence/Migrations` |
| Modelo x migrations | `dotnet ef migrations has-pending-model-changes` (mesmos `--project`/`--startup-project`) |
| Front (porta 5173) | `cd frontend && npm run dev` |
| Tipos e lint | `npx tsc -b --noEmit` e `npm run lint` |
| Código morto no front | `npx knip@5.88.1` |

Não existe projeto de testes. Antes de entregar mudança no backend, rode `dotnet build`; no front,
`tsc`, `lint` e `knip`. A API trava as DLLs enquanto roda: pare-a antes de compilar.

## Regras de código

- **Sem comentários em arquivos-fonte.** O código precisa se explicar pelos nomes. Exceções: diretivas
  de ferramenta (`eslint-disable-next-line`) e arquivos gerados pelo EF (`*.Designer.cs`, snapshot).
- Código em inglês; textos de interface e mensagens de erro da API em pt-BR.
- Controllers finos: só leem a identidade do token e repassam ao service.
- Regra de negócio nos services da `Application`. Erros saem como subclasses de `AppException`
  (`ValidationException` 400, `UnauthorizedException` 401, `NotFoundException` 404,
  `ConflictException` 409), que o middleware converte em `ProblemDetails`.
- Repositórios expõem métodos específicos, nunca `IQueryable`.
- Todo acesso a dados é LINQ. SQL cru só existe dentro de migrations e só com constantes do código;
  nunca interpole entrada de usuário em SQL.
- No front, cada feature tem seu `api.ts` e `hooks.ts` (`features/finance`, `features/platform`).
  Toda mutation que falha precisa mostrar o erro ao usuário (`getApiErrorMessage` + toast); não deixe
  falha silenciosa.

## Multi-tenant: famílias (`Household`)

Cada cadastro cria um `Household` isolado, com o usuário como Admin e as 11 categorias de
`Application/Common/DefaultCategories.cs`, tudo num único `SaveChanges`. `User`, `Category` e
`Transaction` têm `HouseholdId`.

Regras para não vazar dados entre contas:

- O `householdId` vem **sempre** de `User.HouseholdId()` (claim `household` do JWT) no controller e é
  passado explicitamente até o repositório. Nunca aceite `householdId` do corpo ou da query.
- Todo método de repositório que lê ou altera dado de família filtra por `HouseholdId`.
- Métodos **sem escopo** existem só para autenticação ou para um usuário já validado na família:
  `IUserRepository.GetByIdAsync`, `GetByEmailAsync` e `ITransactionRepository.CountByUserAsync`.
  Não use esses métodos em fluxo de negócio.
- Ao gravar uma entidade nova, preencha `HouseholdId`. Ao validar uma referência (categoria,
  integrante), valide dentro da família (`GetInHouseholdAsync`, `CountInHouseholdAsync`).
- O e-mail é único no sistema inteiro, não por família.

## Planos: individual e família

- `Household.Plan` (`Individual`/`Family`). Conta nova nasce `Individual`.
- `HouseholdService.SetPlanAsync` é o ponto onde a cobrança do plano família vai entrar. Hoje a troca é
  livre. Voltar ao individual exige que não haja outro integrante ativo.
- `HouseholdService.EnsureFamilyPlanAsync` protege cadastrar e reativar integrante. A trava é no
  servidor; a interface só esconde as opções.
- No front, `useHasFamily()` (plano família **e** mais de um integrante) decide se aparecem seletor
  "De quem é", avatares, filtro e relatório por integrante. Use esse hook, não contagem de membros.
- A navegação usa o campo `plan` de `navConfig.ts`: "Integrantes" no plano família, "Modo família"
  (página de ativação) no individual.

## Aprovação de contas e Console

- O sistema está em **beta fechado**: todo cadastro cria a família com `Household.Status = Pending`, sem
  sessão. A pessoa vê "Cadastro recebido" e só entra depois de aprovada. Os status são `Pending`,
  `Active` e `Suspended`; recusar apaga a família inteira (`HouseholdRepository.DeleteWithDataAsync`).
- Quem aprova é o **desenvolvedor**: os e-mails de `Platform:DeveloperEmails` (user-secrets ou
  `Platform__DeveloperEmails__0`). Eles recebem o papel `Developer` no token e veem o **Console**
  (`/console`, rotas `api/platform/*`). Cadastro com e-mail de desenvolvedor já nasce ativo: só liste
  e-mails que você controla.
- O Console é o único lugar que atravessa o isolamento entre famílias, então mostra **só dados de conta**
  (titular, e-mail, plano, status, número de integrantes) e números agregados. Nunca exponha lançamentos
  ou valores ali.
- **Cada requisição autenticada confere a sessão no banco** (`JwtBearerEvents.OnTokenValidated` →
  `AuthService.IsSessionValidAsync`): usuário ativo, família ativa, mesma família e mesmo papel do
  token. Suspender uma conta ou rebaixar alguém vale na hora. Login e refresh também recusam família
  pendente ou suspensa (403 com a mensagem certa).
- E-mails: aprovação e recusa avisam o titular (`AccessEmails`). Todos os e-mails usam
  `EmailTemplate`; não copie HTML de e-mail.

## Integrantes e administradores

- Ninguém altera o próprio status nem o próprio papel.
- O último administrador **utilizável** (ativo e com senha definida) não pode ser rebaixado,
  desativado nem excluído (`MemberService.EnsureAnotherAdminAsync`).
- Integrante com lançamentos não pode ser excluído, só desativado, para preservar o histórico.
- `POST /api/members` envia e-mail e usa o limite de taxa `Email`.

## Lançamentos

- Um lançamento dividido vira uma linha por integrante, com o mesmo `SeriesId`/`SeriesIndex` e
  `SplitTotal`. Repetição usa `SeriesKind` (`Fixed` repete o valor; `Installment` divide).
- A edição trata a ocorrência inteira: `TransactionService.RedistributeAsync` reparte o total entre os
  integrantes, aplica a data a todas as partes e cria ou remove partes conforme a lista de integrantes.
- `SliceOf` arredonda para centavos e joga a diferença na última parte.
- No front, **nunca liste partes soltas**: agrupe com `groupTransactions`
  (`features/finance/transactionEntries.ts`). Com filtro por integrante, mostre a parte dele
  (`shareOf`).
- A data padrão do novo lançamento segue o mês selecionado (`defaultDateInPeriod`); datas locais,
  nunca `toISOString()` (que usa UTC e vira o dia à noite no Brasil).

## Migrations

- O startup aplica as migrations **automaticamente em qualquer ambiente**, inclusive no banco real.
  Por isso:
  - Revise sempre o arquivo gerado. O EF já gerou `DeleteData` das categorias do seed, que apagaria
    categorias usadas por lançamentos reais.
  - Coluna nova obrigatória em tabela com dados: adicione como nula, preencha com SQL na própria
    migration e só então torne obrigatória.
  - Teste contra uma base com dados no formato antigo antes de rodar no banco real. Sem Docker,
    `npm i embedded-postgres` sobe um Postgres descartável.
  - Faça backup antes de subir uma migration estrutural.
- `20261111161047_Households.Down` lança `NotSupportedException` de propósito: desfazer juntaria os
  dados de todas as contas num espaço só. Volte por backup.

## Interface: regras de UX e cor

- **Paleta de identidade** (categorias e avatares): só estas 8 cores, validadas com o
  `validate_palette.js` da skill `dataviz` contra os fundos claro (`#ffffff`) e escuro (`#121a18`):
  `#3987e5`, `#d95926`, `#199e70`, `#c98500`, `#d55181`, `#008300`, `#9085e9`, `#e66767`.
  Não use a paleta padrão do Tailwind (índigo e violeta, rosa e vermelho ficam indistinguíveis).
  Mudou a paleta? Rode o validador de novo nos dois modos.
- **Gráficos**: receita e despesa usam `bg-chart-income`/`bg-chart-expense` (tokens com valor próprio
  no tema escuro), não `--income`/`--expense`, que são cores de texto. Verde × vermelho fica na faixa
  de alerta para daltonismo, então todo gráfico com os dois precisa de legenda e valores legíveis sem
  hover (no celular não existe hover).
- **Donut**: no máximo 6 fatias (as 5 maiores + "Outras" em cinza), com espaço entre fatias e legenda
  igual às fatias.
- Números grandes isolados sem `tabular-nums`; `tabular-nums` só onde números se alinham em coluna.
- Textos: use `plural()` (nunca "lançamento(s)"); valores negativos com o sinal de menos `−`.
- O cabeçalho do app já mostra o título da página: não repita o título num `h2` dentro dela.
- Toda tela que carrega dados trata erro com `QueryError` ("Tentar de novo"), em vez de parecer vazia.
- Celular (390px):
  - Linha de lista é um botão que abre a edição; nada de ícones de ação espremendo o texto.
  - Ação destrutiva fica dentro do formulário e sempre pede confirmação.
  - Grupos de botões quebram de linha (`flex-wrap` + `ml-auto`), não vazam da tela.
- Rótulos de conta dependem do plano: "Conta individual" no individual, "Família · Admin" ou
  "Família · Membro" no família (`features/household/useAccount.ts`).
- Para revisar visualmente, suba a API contra um Postgres descartável com dados de demonstração e
  capture telas com `playwright-core` usando o Chrome instalado (`channel: 'chrome'`), em 390px e
  1280px, nos dois temas. O limite global da API (150 req/min por IP) derruba capturas em sequência;
  espaçe as rodadas.

## Front: armadilhas conhecidas

- O cache do TanStack Query é limpo em login, cadastro e logout (`AuthContext`). Com `staleTime` de 5
  minutos, sem isso a próxima conta no mesmo navegador veria os dados da anterior.
- Se o sucesso de uma mutation faz a própria página se redirecionar (por exemplo, a página depende do
  plano que acabou de mudar), toast e navegação vão no `onSuccess` do `useMutation`, não no
  `mutate(...)`: os callbacks do `mutate` são descartados quando o componente desmonta. Modelo:
  `features/household/useChangePlan.ts`.

## Segurança: o que já foi verificado (review de 2026-11-11)

- Sem SQL injection: todo acesso é LINQ parametrizado; os dois SQL crus (migrations `Households` e
  `HouseholdPlan`) usam só constantes.
- Sem XSS: nenhum `dangerouslySetInnerHTML`, `innerHTML` ou `eval`; os e-mails escapam HTML.
- Isolamento entre famílias conferido em todos os controllers; ID de outra família responde 404.
- JWT HMAC-SHA256 com chave de no mínimo 32 bytes, emissor, audiência e validade conferidos.
- Tokens de convite e de troca de senha: 256 bits, guardados como hash, uso único, com validade.
- Toda requisição autenticada revalida usuário, família e papel no banco (`OnTokenValidated`).
- Refresh tokens vencidos são apagados a cada emissão de sessão.

## Pendências conhecidas

Pontos válidos dos reviews de código e de segurança de 2026-11-11 que ainda não foram resolvidos.

1. **Pré-sequestro por convite.** Qualquer admin pode cadastrar um e-mail que ainda não tem conta. O dono
   desse e-mail não consegue mais criar conta própria (409), e o "esqueci a senha" ativa a conta dentro
   da família de quem convidou. O convite não diz quem convidou. Correção: tabela de convites com aceite
   explícito, cadastro assume convite nunca aceito, e-mail e tela de senha com o nome de quem convidou.
2. **Admin troca o e-mail de quem já tem senha** sem verificação, o que permite tomar a conta via
   "esqueci a senha". Correção: bloquear ou exigir confirmação no e-mail novo.
3. **Trocar o e-mail de um convite pendente não invalida o link já enviado** (vale 48h).
4. **Definir ou redefinir senha não revoga os refresh tokens existentes**
   (`MemberInviteService.SetPasswordAsync`).
5. **Enumeração de e-mail.** O 409 do cadastro e de criar/editar integrante revela se um e-mail tem conta.
   Cadastro e criação têm limite de taxa; edição não.
6. **Corrida na trava de último admin.** Dois admins rebaixando um ao outro ao mesmo tempo podem passar
   os dois pela checagem. Correção: transação serializável ou lock na família.
7. **Isolamento feito à mão.** Depende de passar `householdId` em todo método. Alternativa mais robusta:
   `HasQueryFilter` global por família, com cuidado nos fluxos de autenticação.
8. **Navegação depende de `GET /api/household`.** Enquanto carrega, ou se falhar, "Integrantes" e
   "Modo família" somem do menu. Alternativa: devolver o plano junto do usuário no login e no `/me`.
9. **Proxy reverso.** `KnownProxies`/`KnownIPNetworks` são limpos, então um `X-Forwarded-For` forjado muda
    a chave do limite de taxa. Em produção, configure o proxy conhecido.
10. **Dependência vulnerável.** `System.Security.Cryptography.Pkcs` 10.0.0 (NU1902/NU1903), transitiva via
    MailKit/MimeKit. Atualize quando sair versão corrigida ou fixe a versão no `.csproj`.
11. **Sem testes automatizados.** O `backend/tests/` previsto no plano não existe; os cenários de
    isolamento foram testados à mão contra um Postgres descartável.
