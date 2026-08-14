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

O build da Cloudflare roda `npm ci` com **npm 10.9.2**, e um `package-lock.json`
gerado pelo npm 11 é rejeitado por essa versão. Depois de adicionar ou atualizar
qualquer pacote, regere o lock com a mesma versão do build:

```bash
npx npm@10.9.2 install --package-lock-only
```

Sem isso o deploy falha com `npm ci can only install packages when your
package.json and package-lock.json are in sync`, listando pacotes que existem
localmente mas não no lock.

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
