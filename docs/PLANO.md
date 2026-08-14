# Plano de Gerenciamento de Projeto: LocalFinance

> Versão revisada. Substitui a stack Blazor/MudBlazor do plano original por
> **React + Tailwind + Capacitor** (frontend) e **C# Web API REST** (backend),
> com **PostgreSQL** via EF Core. Backend em camadas seguindo **DDD** com
> **injeção de dependência**.

---

## 1. Visão Geral

Sistema de controle financeiro familiar/doméstico, com acesso individual por
integrante. Receitas e despesas são registradas, categorizadas e consolidadas
em resumos mensais.

Diferença principal em relação ao plano original: o frontend agora é uma SPA
(React) consumindo uma **API REST separada**, o que permite empacotar o app
para **mobile (Android/iOS) via Capacitor** além do navegador. Como front e
back ficam desacoplados, a autenticação passa a ser via **JWT (Bearer token)**
em vez de cookie de sessão do Blazor.

---

## 2. Stack Tecnológica

### Frontend (`/frontend`)
- **React 19** + **TypeScript**
- **Vite** (build/dev server)
- **Tailwind CSS v4** (estilização, tokens de tema em `src/index.css`)
- **Capacitor** (empacotamento Android/iOS)
- **React Router** (navegação)
- **TanStack Query** (cache/sincronização de dados da API)
- **React Hook Form** + **Zod** (formulários e validação)
- **Axios** (cliente HTTP) + interceptor de token JWT
- Gráficos (rosca e barras) desenhados em SVG direto, sem biblioteca

### Backend (`/backend`)
- **.NET 10** / **ASP.NET Core Web API**
- **Entity Framework Core** (Npgsql / PostgreSQL)
- **JWT Bearer Authentication** (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **MailKit** (envio SMTP dos convites)
- **Swashbuckle / OpenAPI** (documentação e teste dos endpoints)
- Validação feita nos serviços da camada Application, lançando exceções
  traduzidas para `ProblemDetails` por middleware

### Banco de Dados
- **PostgreSQL** (instância local em dev; Neon gerenciado em produção)
- Migrations gerenciadas pelo EF Core

---

## 3. Objetivos

- Registrar receitas e despesas
- Permitir controle por integrante
- Disponibilizar resumo mensal financeiro
- Acessível por web e mobile (app instalável via Capacitor)

---

## 4. Escopo

### Incluído no MVP
- Cadastro e login de usuários (JWT)
- Cadastro de categorias (CRUD)
- Lançamento de receitas e despesas (CRUD)
- Filtros por mês / categoria / integrante
- Resumo mensal (totais e por categoria/integrante)
- App mobile empacotado via Capacitor *(agora dentro do escopo)*

### Fora do escopo inicial
- Integrações bancárias / Open Finance
- Hospedagem em nuvem (deploy fica para fase posterior)
- Multi-família / multi-tenant
- Notificações push

---

## 5. Arquitetura

### 5.1 Estrutura do monorepo

```
LocalFinance/
├── README.md
├── docs/
│   └── PLANO.md
├── backend/
│   ├── LocalFinance.slnx
│   └── src/
│       ├── LocalFinance.Domain/          # Entidades, enums, read models, interfaces de repositório
│       ├── LocalFinance.Application/     # Serviços de caso de uso, DTOs, interfaces
│       ├── LocalFinance.Infrastructure/  # EF Core, repositórios, DbContext, JWT, e-mail, migrations
│       └── LocalFinance.Api/             # Controllers, DI, middleware, Swagger, Program.cs
└── frontend/
    ├── src/
    │   ├── api/          # cliente axios + endpoints de auth
    │   ├── components/   # layout, tema e componentes de UI
    │   ├── features/     # auth, categorias, dashboard, finance, members, reports, transactions
    │   ├── routes/       # guards de rota
    │   └── lib/          # env, storage do token, formatação, erros
    ├── capacitor.config.ts
    └── package.json
```

Cada feature agrupa suas próprias páginas e componentes (`features/<nome>/pages/`,
`features/<nome>/components/`). O `features/finance/` concentra o estado
compartilhado entre telas: período selecionado, sheet de transação, seletores e
chamadas à API.

Os projetos de teste (`backend/tests/`) ainda não existem.

### 5.2 Camadas do backend (DDD) e dependências

Regra de dependência (sempre apontando para dentro):

```
Api ──► Application ──► Domain
 │            │
 └────► Infrastructure ──► Domain
```

- **Domain**: núcleo. Entidades (`User`, `Category`, `Transaction`,
  `PasswordSetupToken`), enums (`TransactionType`, `CategoryKind`, `UserRole`),
  read models (`MonthlyTotal`) e **interfaces de repositório**
  (`IUserRepository`, etc.). Sem dependências externas.
- **Application**: orquestra os casos de uso em serviços (`AuthService`,
  `TransactionService`, etc.), DTOs, validação e mapeamentos.
  Depende só de Domain.
- **Infrastructure**: implementa repositórios e `DbContext` (EF Core),
  geração/validação de JWT, hashing de senha. Depende de Domain (e Application
  para implementar suas interfaces).
- **Api**: controllers REST, configuração de **injeção de dependência**,
  autenticação, middleware de erro, Swagger. Ponto de composição (registra as
  implementações da Infrastructure nas abstrações).

A injeção de dependência é o que mantém o desacoplamento: a Api conhece as
implementações concretas e as registra no container; as camadas internas
dependem apenas das interfaces.

---

## 6. Modelo de Dados

### Entidades

Código em inglês; textos de UI em pt-BR.

**User**
| Campo | Tipo | Observações |
|-------|------|-------------|
| Id | Guid | PK |
| Name | string | |
| Email | string | único, login |
| PasswordHash | string | PBKDF2 com salt |
| Role | enum (Admin, Member) | controle de permissão |
| Active | bool | soft-disable (épico A3) |
| Color | string | cor do avatar, atribuída da paleta |
| CreatedAt | datetime | |

**Category**
| Campo | Tipo | Observações |
|-------|------|-------------|
| Id | Guid | PK |
| Name | string | |
| Kind | enum (Income, Expense, Both) | |
| Color | string | hex, usado no badge e no gráfico |
| Icon | string | nome do ícone no sprite SVG |
| Active | bool | inativar em vez de excluir (épico B2) |

**Transaction**
| Campo | Tipo | Observações |
|-------|------|-------------|
| Id | Guid | PK |
| Type | enum (Income, Expense) | |
| Amount | decimal(18,2) | |
| Date | date | competência |
| Description | string | |
| CategoryId | Guid | FK → Category |
| UserId | Guid | FK → User (integrante) |
| CreatedAt | datetime | |

**PasswordSetupToken** sustenta o convite por e-mail. O integrante cadastrado
pelo Admin não recebe senha, e sim um link de uso único para defini-la.

| Campo | Tipo | Observações |
|-------|------|-------------|
| Id | Guid | PK |
| UserId | Guid | FK → User |
| TokenHash | string | só o hash é persistido |
| ExpiresAt | datetime | 48h por padrão (`Invite:ExpiryHours`) |
| UsedAt | datetime? | nulo enquanto o convite não foi aceito |
| CreatedAt | datetime | |

Relações: `User 1:N Transaction`, `Category 1:N Transaction`,
`User 1:N PasswordSetupToken`.

---

## 7. API REST: endpoints

Base: `/api`. Todos (exceto auth) exigem `Authorization: Bearer <token>`.

### Auth
- `POST /api/auth/login` → `{ token, expiresAt, user }`
- `POST /api/auth/register` *(cria a família; a primeira conta vira Admin)*
- `GET /api/auth/me` → reconstrói a sessão a partir do token
- `GET /api/auth/invite?token=` → dados do convidado, antes do formulário de senha
- `POST /api/auth/set-password` → resgata o convite

### Integrantes
- `GET /api/members`
- `POST /api/members` *(Admin, dispara o convite por e-mail)*
- `PUT /api/members/{id}` *(Admin)*
- `PATCH /api/members/{id}/active` *(Admin, épico A3)*
- `DELETE /api/members/{id}` *(Admin, recusa se houver lançamentos, se for o
  último Admin ou se for o próprio solicitante)*
- `POST /api/members/{id}/resend-invite` *(Admin, invalida o link anterior)*

### Categorias
- `GET /api/categories`
- `GET /api/categories/usage` → contagem de lançamentos por categoria
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `PATCH /api/categories/{id}/active` *(inativa em vez de excluir, épico B2)*

### Transações
- `GET /api/transactions?year=&month=` *(filtros de categoria, integrante e tipo
  são aplicados no cliente, épico C4)*
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`

### Relatórios
- `GET /api/reports/monthly-trend?year=&month=&months=` → receita/despesa por mês

Os resumos por categoria e por integrante são derivados no frontend a partir das
transações do período (`features/finance/selectors.ts`), sem endpoint dedicado.

Convenções: respostas JSON, erros com `ProblemDetails` (RFC 7807), CORS
liberado para a origem do frontend e para o app Capacitor.

---

## 8. Autenticação (JWT)

1. Login valida e-mail/senha (PBKDF2-SHA256, 100 mil iterações, comparação em
   tempo fixo, na Infrastructure).
2. Backend emite **JWT assinado** (HMAC-SHA256) com claims `sub`, `email`,
   `name`, `role` e `jti`, expirando em `Jwt:ExpiryHours` (24h por padrão).
3. Frontend guarda o token no Capacitor Preferences, que no navegador recai em
   `localStorage`, e injeta no header via interceptor Axios.
4. Endpoints protegidos por `[Authorize]`; ações de admin por `[Authorize(Roles="Admin")]`.
5. Um 401 vindo da API limpa a sessão no cliente pelo interceptor de resposta.
6. (Fase posterior) refresh token para sessões longas no mobile.

A aplicação recusa subir se `Jwt:Key` tiver menos de 32 bytes, em vez de assinar
tokens com chave fraca ou vazia.

---

## 9. Frontend: telas

- **Login** e **Criar conta**
- **Definir senha** (`/definir-senha?token=`): resgate do convite
- **Dashboard** (resumo do mês: saldo, receitas, despesas, gráfico por categoria)
- **Transações** (lista com filtros + sheet criar/editar/excluir)
- **Categorias** (CRUD)
- **Integrantes** (Admin: cadastrar, editar, ativar/desativar, excluir, reenviar convite)
- **Relatórios** (mensal, por categoria, por integrante)
- **Perfil**

Layout responsivo (Tailwind) pensado mobile-first para funcionar bem no app
Capacitor: sidebar no desktop, navegação inferior no mobile. Tema claro/escuro
via `data-theme`.

---

## 10. Capacitor (mobile)

- Build web do Vite → empacotado pelo Capacitor.
- Plugins iniciais: `@capacitor/preferences` (token), `@capacitor/app`.
- A `API base URL` aponta para o backend acessível na rede (config por ambiente).
- Geração de projetos Android e iOS quando o MVP web estiver estável.

---

## 11. Cronograma / Fases

| Fase | Entregas | Situação |
|------|----------|----------|
| **0. Setup** | Monorepo, solution backend em camadas, projeto React+Vite+Tailwind, conexão PostgreSQL, migration inicial | Concluída |
| **1. Autenticação** | JWT no backend, telas de login e cadastro, proteção de rotas. A primeira conta criada vira Admin (não há seed de usuário) | Concluída |
| **2. Cadastros** | CRUD de categorias e integrantes (back + front), convite por e-mail com link de senha | Concluída |
| **3. Lançamentos** | CRUD de transações com filtros mês/categoria/integrante | Concluída |
| **4. Relatórios** | Resumo mensal, por categoria, por integrante + gráficos | Concluída |
| **5. Mobile** | Integração Capacitor, build Android/iOS, ajustes de UX mobile | Config criada; projetos nativos pendentes |
| **6. Extras** | Export CSV, backup/restore, refresh token | Não iniciada |

As 11 categorias padrão entram pelo seed da migration inicial (épico E3).
Os projetos de teste previstos em `backend/tests/` ainda não foram criados.

---

## 12. Backlog (épicos)

- **A. Autenticação:** login (A1), cadastrar integrantes como Admin (A2), desativar usuário (A3)
- **B. Categorias:** CRUD (B1), inativar em vez de excluir se houver lançamentos (B2)
- **C. Transações:** criar despesa (C1), criar receita (C2), editar/excluir (C3), filtros (C4)
- **D. Relatórios:** resumo mensal (D1), por categoria (D2), por integrante (D3)
- **E. Operação:** export CSV (E1), backup/restore (E2), seed de categorias padrão (E3)

---

## 13. Riscos e Mitigações

- **Crescimento de escopo** → MVP travado nas fases 0–4; extras só na fase 6.
- **Acoplamento front/back** → contrato definido por OpenAPI (Swagger); tipos do front gerados/derivados do contrato.
- **Segurança do token no mobile** → uso de storage seguro do Capacitor; expiração curta + refresh.
- **Perda de dados** → o plano gratuito do Neon tem retenção curta de histórico, o que torna o export CSV (E2) mais necessário, não menos.
- **CORS / acesso de rede no mobile** → configuração explícita de origens e base URL por ambiente.

---

## 14. Critérios de Sucesso

- Usuários conseguem registrar e consultar gastos pela web e pelo app mobile.
- Resumo mensal correto (receitas, despesas, saldo, por categoria/integrante).
- Persistência garantida no PostgreSQL.
- API documentada (Swagger) e protegida por JWT.
