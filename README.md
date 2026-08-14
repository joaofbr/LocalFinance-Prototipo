# LocalFinance

Controle financeiro familiar: React + TypeScript no front, ASP.NET Core (.NET 10)
com EF Core e PostgreSQL no back, autenticação por JWT.

O plano completo (escopo, modelo de dados, épicos) está em [docs/PLANO.md](docs/PLANO.md).

```
backend/    solution em camadas (Domain / Application / Infrastructure / Api)
frontend/   SPA em React + Vite + Tailwind, empacotável via Capacitor
docs/       plano de projeto
```

## Pré-requisitos

- .NET SDK 10
- Node.js 20+
- PostgreSQL 14+ (local, em container, ou um serviço gerenciado como o Neon)

## Rodando

### 1. Chave de assinatura do JWT

Nenhuma chave vem no repositório, então este passo é obrigatório na primeira vez.
A aplicação recusa subir com chave menor que 32 bytes, em vez de emitir tokens
assinados com chave fraca.

```bash
cd backend/src/LocalFinance.Api
dotnet user-secrets set "Jwt:Key" "<32+ bytes>"
```

Para gerar uma chave aleatória:

```powershell
# PowerShell
$b = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
dotnet user-secrets set "Jwt:Key" ([Convert]::ToBase64String($b))
```

```bash
# bash
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)"
```

O segredo fica no perfil do usuário, fora da pasta do projeto. A alternativa é a
variável de ambiente `Jwt__Key`, útil em container e em CI.

### 2. Backend

```bash
cd backend/src/LocalFinance.Api && dotnet run
```

Sobe em `http://localhost:5063`, com Swagger em `http://localhost:5063/swagger`.

O startup aplica as migrations em qualquer ambiente, sem precisar rodar
`dotnet ef database update` na mão. As 11 categorias padrão entram pelo seed da
migration inicial.

A connection string padrão aponta para `localhost:5432`, banco `localfinance`,
usuário `postgres`. Para usar outro servidor (o Neon, por exemplo), sobrescreva
sem versionar:

```bash
dotnet user-secrets set "ConnectionStrings:Default" "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require"
```

### 3. Frontend

```bash
cd frontend && npm install && npm run dev
```

Sobe em `http://localhost:5173`, origem já liberada no CORS da API.

### 4. Primeiro acesso

Não há usuário semeado: crie o seu em **Criar conta**. A primeira conta cadastrada
vira **Admin** da família, e é ela que enxerga a tela de Integrantes.

Os integrantes que o Admin cadastrar **não recebem senha**. Eles recebem um e-mail
com um link para definir a própria senha (`/definir-senha?token=...`). O link vale
48 horas, só pode ser usado uma vez, e um reenvio invalida o anterior. Enquanto o
convite não for aceito, o integrante aparece como *Convite pendente* na tela de
Integrantes, com botão para reenviar.

Sem SMTP configurado (ver abaixo), o e-mail **não é enviado**: ele é escrito no log
da API, com o link. Em desenvolvimento isso basta para percorrer o fluxo, é só
copiar o link do console.

## Configuração

### Backend

`appsettings.Development.json` traz apenas a connection string do Postgres local e o
nível de log. Segredos ficam fora de arquivo versionado, via `dotnet user-secrets`
ou variável de ambiente:

| Chave | Variável de ambiente | Obrigatória |
|---|---|---|
| `Jwt:Key` | `Jwt__Key` | Sim, mínimo 32 bytes |
| `ConnectionStrings:Default` | `ConnectionStrings__Default` | Só fora do Postgres local |
| `Smtp:Password` | `Smtp__Password` | Só se for enviar e-mail de verdade |

#### Publicação

Duas chaves só importam quando o app sai da sua máquina:

| Chave | Para que serve |
|---|---|
| `Cors:Origins` | Array com a origem do frontend publicado. As de desenvolvimento (`localhost:5173` e Capacitor) já estão no código; esta soma a elas. Sem isso o navegador bloqueia todas as chamadas. |
| `Invite:FrontendBaseUrl` | Domínio usado no link do convite. Continua em `localhost:5173` por padrão, o que geraria links quebrados em produção. |

Como variável de ambiente, um array vira índice: `Cors__Origins__0=https://seu-app.pages.dev`.

O container lê a porta de `PORT`, como Koyeb, Render e Cloud Run injetam. O
`Dockerfile` fica em `backend/`.

#### E-mail dos convites

Enquanto o SMTP não estiver completo, os convites são apenas escritos no log, o
que basta em dev. **Em produção a aplicação recusa subir nesse estado**, para que
nenhum convite passe despercebido no log.

"Completo" significa `Smtp:Host` e `Smtp:FromEmail` preenchidos e, se `Smtp:User`
estiver definido, `Smtp:Password` também. Definir o usuário sem a senha é o caso
que mais engana: o servidor recusa a autenticação e o convite não sai. Nesse
estado o startup avisa no console e cai no log, em vez de falhar só na hora do
envio. Para enviar de verdade:

```jsonc
"Smtp": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "UseStartTls": true,
  "User": "voce@gmail.com",
  "Password": "",            // use Smtp__Password ou user-secrets, nunca aqui
  "FromEmail": "voce@gmail.com",
  "FromName": "LocalFinance"
}
```

```bash
dotnet user-secrets set "Smtp:Password" "<senha de app>"
```

No Gmail é preciso uma *senha de app*, porque a senha normal da conta não funciona
com SMTP. Ela só fica disponível com a verificação em duas etapas ativa, e é gerada
em <https://myaccount.google.com/apppasswords>. São 16 caracteres, que podem ser
colados com ou sem os espaços. Autenticar com a senha normal da conta devolve
`535 5.7.8 Username and Password not accepted`.

`Invite:FrontendBaseUrl` define o domínio usado no link do convite. Precisa ser um
endereço que o integrante consiga abrir, e não `localhost`, quando sair da sua máquina.

### Frontend

`.env` (veja `.env.example`):

| Variável | Para que serve |
|---|---|
| `VITE_API_URL` | Base da API. Precisa bater com a porta em que o backend está ouvindo. No emulador ou celular, use o IP da máquina na rede, não `localhost`. |

## Estado atual

Fases 0 a 4 do plano concluídas: autenticação, CRUD de categorias, integrantes e
transações, filtros e relatórios, com front e back ligados de ponta a ponta.

Ainda em aberto: fase 5 (empacotar Android/iOS com Capacitor, cuja config já existe
em `frontend/capacitor.config.ts`, faltando os projetos nativos) e fase 6 (export
CSV, backup/restore, refresh token). Os projetos de teste `backend/tests/` previstos
no plano também ainda não existem.
