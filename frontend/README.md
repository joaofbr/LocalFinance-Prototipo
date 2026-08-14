# LocalFinance: frontend

SPA em React + TypeScript + Tailwind, empacotável para mobile via Capacitor.
Consome a API REST do backend (projeto `../backend`).

> Convenção: **código em inglês** (arquivos, variáveis, funções, tipos);
> **textos de UI em pt-BR**.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens de tema em `src/index.css`, troca claro/escuro via `data-theme`)
- React Router (`react-router-dom`)
- TanStack Query (cache de dados da API)
- React Hook Form + Zod (formulários e validação)
- Axios (cliente HTTP com interceptor de JWT)
- Capacitor (Android/iOS)

## Scripts

```bash
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # type-check + build de produção (dist/)
npm run lint      # eslint
npm run preview   # serve o build de produção
```

### Ao mexer nas dependências

Use `npm install` normal e comite o `package-lock.json` resultante.

Não use `npm install --package-lock-only`: ele grava no lock apenas os binários
nativos da plataforma atual, e o build na Cloudflare (Linux) quebra com
`Cannot find native binding` ao procurar `@rolldown/binding-linux-x64-gnu`.
Um lock saudável tem os 14 binários do rolldown, não um.

O build na Cloudflare usa `npm install`, não `npm ci`, através de
`SKIP_DEPENDENCY_INSTALL=1` mais o comando `npm install && npm run build`.
A validação estrita do `npm ci` rejeita este conjunto de dependências por
causa de duas versões de `ajv` na árvore do ESLint, um problema do npm que
independe do nosso código.

## Configuração

Copie `.env.example` para `.env` e ajuste:

```
VITE_API_URL=http://localhost:5063/api
```

No mobile (emulador/dispositivo), `localhost` não aponta para a máquina de
desenvolvimento, use o IP da rede local.

## Estrutura

```
src/
├── api/             # cliente axios (interceptores de token e 401) + endpoints de auth
├── components/
│   ├── layout/      # AppLayout, Sidebar, BottomNav, configuração de navegação
│   ├── theme/       # ThemeProvider + toggle (claro/escuro)
│   └── ui/          # componentes base (Button, TextField, Icon, Toast, ...)
├── features/
│   ├── auth/        # contexto, hook, schemas, páginas (Login, Register, SetPassword)
│   ├── categories/  # página e modal de categorias
│   ├── dashboard/   # página do dashboard
│   ├── finance/     # estado compartilhado: período, sheet de transação, api, seletores
│   ├── members/     # página e modal de integrantes
│   ├── reports/     # página de relatórios
│   └── transactions/# página de transações
├── lib/             # env, storage do token, formatação, helpers de erro
├── routes/          # guards de rota (ProtectedRoute, PublicOnlyRoute)
├── App.tsx          # definição das rotas
└── main.tsx         # providers (Query, Theme, Router, Auth)
```

O `features/finance/` não tem página própria. Ele concentra o que as outras
telas compartilham: o período selecionado, o sheet global de transação, as
chamadas à API e os seletores que derivam resumos a partir das transações.

## Telas

| Rota | Tela |
|---|---|
| `/login` | Login |
| `/register` | Criar conta |
| `/definir-senha?token=` | Definir senha (resgate do convite) |
| `/` | Dashboard: seletor de mês, cards de resumo, donut por categoria, últimas transações |
| `/transactions` | Transações: lista filtrável, resumo do período, sheet de criar/editar/excluir |
| `/reports` | Relatórios: mensal, por categoria, por integrante |
| `/categories` | Categorias (CRUD) |
| `/members` | Integrantes (somente Admin) |
| `/profile` | Perfil |

## Endpoints de auth consumidos

- `POST /auth/login`: body `{ email, password }`
- `POST /auth/register`: body `{ name, email, password }`
- `GET /auth/me`: reconstrói a sessão a partir do token guardado
- `GET /auth/invite?token=`: valida o convite antes do formulário de senha
- `POST /auth/set-password`: body `{ token, password }`

Login e cadastro respondem `{ token, expiresAt, user: { id, name, email, role } }`.
