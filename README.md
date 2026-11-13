# Product Ratings

Plataforma de avaliações de produtos. Este repositório contém a base do projeto
e o fluxo de **criação de conta (sign-up)**.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** + **Shadcn UI**
- **React Hook Form** + **Zod**
- **TanStack React Query** (mutation de sign-up)
- **Supabase** (PostgreSQL)
- **bcrypt** (hash de senha)
- **Biome** (lint e formatação)
- **Bun** (runtime / package manager)

## Pré-requisitos

- Node.js 20.9+
- Bun 1.4+

## Configuração

1. Instale as dependências:

   ```bash
   bun install
   ```

2. Crie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

   Preencha com as credenciais do projeto Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

   > A `service_role` key é **somente para o servidor**. Nunca a exponha no
   > cliente.

3. Aplique a migration no Supabase. Copie o conteúdo de
   `supabase/migrations/20261112000000_create_accounts.sql` no **SQL Editor** do
   Supabase e execute.

4. Suba o servidor de desenvolvimento:

   ```bash
   bun dev
   ```

   Acesse <http://localhost:3000/auth/sign-up>.

## Scripts

| Comando         | Descrição                          |
| --------------- | ---------------------------------- |
| `bun dev`       | Servidor de desenvolvimento        |
| `bun build`     | Build de produção                  |
| `bun start`     | Servidor de produção               |
| `bun lint`      | Checagem do Biome (sem alterar)    |
| `bun check`     | Biome: lint + formatação + imports |
| `bun typecheck` | Verificação de tipos com `tsc`     |

## Rotas

| Rota                    | Descrição                        |
| ----------------------- | -------------------------------- |
| `/`                     | Redireciona para `/auth/sign-up` |
| `/auth/sign-up`         | Formulário de criação de conta   |
| `/auth/sign-up/success` | Confirmação de conta criada      |
| `POST /api/v1/sign-up`  | Cria a conta                     |

### Contrato da API

`POST /api/v1/sign-up`

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "password": "super-secret"
}
```

Respostas:

- `201` — conta criada:

  ```json
  {
    "account": {
      "id": "V1StGXR8_Z5jdHi6B-myT",
      "firstName": "Ada",
      "lastName": "Lovelace",
      "email": "ada@example.com"
    }
  }
  ```

- `400` — corpo inválido/malformado (inclui `fieldErrors`).
- `409` — e-mail já cadastrado.
- `500` — erro inesperado.

## Segurança

- Senhas são hasheadas com **bcrypt** (`cost = 10`); o salt fica embutido no
  hash e também é persistido na coluna `accounts.salt`.
- O client Supabase usado pela API usa a `service_role` key e **nunca** é
  importado em componentes de cliente.
- A tabela `accounts` tem **RLS habilitado sem policies**, bloqueando acesso
  direto de clientes anônimos/autenticados.
- Em produção (Vercel) o tráfego é servido via HTTPS.

## Escopo atual

Implementado apenas o fluxo de sign-up. Login, recuperação de senha,
verificação/envio de e-mail e demais funcionalidades **não** fazem parte desta
entrega.
