# Plano — Sign-In (Autenticação)

**Spec de origem:** `specs/sign-in.md`  
**Status:** plano proposto — aguardando aprovação  
**Idioma da UI:** inglês (decisão já confirmada para o projeto)

## 1. Objetivo

Permitir que uma conta existente entre na plataforma, criar a sessão em cookie e entregar o **layout base** com cabeçalho que alterna entre botão de login e identidade do usuário logado.

## 2. Interpretação da spec (decisões necessárias)

- O trecho "Você não deve implementar qualquer outra funcionalidade que não esteja relacionada com sign-up" é um copia-e-cola das specs antigas. Interpretação adotada: **não sair do escopo de sign-in**.
- "Criar uma home sem nada por enquanto, apenas um título e esqueleto" é substituído pela spec `home.md`, que pede listagem de produtos. **A spec Home prevalece**; este plano apenas remove o stub de redirect de `/`.
- A página de detalhes `/products/id` é interpretada como rota dinâmica `/products/[id]` e é de propriedade da spec Feedback.
- "Sessão do Next.js com cookies" será implementada com cookie `httpOnly` assinado por HMAC, lido via `cookies()` do Next 16. Não há dependência nova obrigatória.
- Avatar: Dicebear é opcional na spec; será usado como `<img>` com seed estável baseada no `id` da conta, sem `next/image` (evita config de `remotePatterns`).

## 3. Contratos compartilhados (congelados para as três specs)

Qualquer agente pode **consumir**, mas só o agente Sign-In pode **implementar**:

```ts
// lib/auth/session.ts
export type SessionAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function getSession(): Promise<{ account: SessionAccount } | null>;
export async function createSession(account: SessionAccount): Promise<void>;
export async function clearSession(): Promise<void>;
```

- Nome do cookie: `pr_session`.
- Payload assinado: `{ sub, email, firstName, lastName, iat, exp }`, HMAC-SHA256 com `SESSION_SECRET`, comparação com `timingSafeEqual`.
- `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge: 604800`, `secure` em produção.
- `getSession()` valida assinatura + expiração e confere que a conta continua `active = true` no Supabase.
- Nenhum client component deve importar `lib/auth/session.ts` nem `lib/supabase/server.ts`.

## 4. Propriedade de arquivos

**Criar / editar (somente este agente):**

- `lib/validations/sign-in.ts`
- `lib/auth/password.ts` (adicionar `verifyPassword`)
- `lib/auth/session.ts`
- `app/api/v1/sign-in/route.ts`
- `app/auth/sign-in/page.tsx`
- `components/sign-in-form.tsx`
- `components/site-header.tsx`
- `app/(platform)/layout.tsx`
- `.env.example` (adicionar apenas `SESSION_SECRET`)
- `app/page.tsx` — **excluir** o stub que redireciona para `/auth/sign-up`

**Não editar:** `app/globals.css`, `app/layout.tsx`, `components/ui/**`, `app/(platform)/page.tsx`, `app/(platform)/products/**`, migrations, `lib/products.ts`, `lib/feedback.ts`, specs ou planos.

Nota sobre `app/layout.tsx`: o cabeçalho entra via **route group `(platform)`**, não no root layout. Isso mantém `/auth/sign-up`, `/auth/sign-in` e o sucesso sem cabeçalho duplicado.

## 5. Implementação técnica

### API `POST /api/v1/sign-in`

1. `runtime = "nodejs"`.
2. Validar body com `signInRequestSchema`: `email` (trim, não vazio, formato de e-mail) e `password` (trim desabilitado, 1–72 caracteres).
3. 400 com `{ error, fieldErrors }` quando inválido.
4. Normalizar e-mail para lowercase e consultar `accounts` por `email` + `active`.
5. Verificar senha com `bcrypt.compare` (`verifyPassword`).
6. Falha de conta, conta inativa ou senha errada → **sempre** `401` com a mesma mensagem: `Email or password is invalid.` (sem dizer qual campo falhou).
7. Sucesso → `createSession(account)` e `200` com `{ account: { id, firstName, lastName, email } }`.
8. Erros inesperados → 500 com mensagem genérica; nunca vazar detalhes do banco.

### Página `/auth/sign-in`

- Server Component com metadata `title: "Sign in"`.
- Mesma linguagem visual do sign-up: régua vertical no desktop, manchete em Instrument Serif, marca ★ em `text-signal`, sem card flutuante, sem orbs, sem palavra isolada em destaque.
- Formulário cliente: `react-hook-form` + `zodResolver`, `mode: "onTouched"`, `noValidate`.
- Campos: Email e Password, com toggle mostrar/ocultar e `autoComplete` correto.
- Erro da API em `<Alert variant="destructive">` vermelho; título "Sign in failed", descrição com a mensagem genérica.
- CTA: "Sign in" → "Signing in…".
- Link discreto para `/auth/sign-up`: "Need an account? Create one."
- Sucesso: `router.push("/")` e `router.refresh()` para o cabeçalho atualizar.

### Layout base e cabeçalho

- `app/(platform)/layout.tsx`: Server Component que renderiza `<SiteHeader />` e depois `{children}`.
- `SiteHeader` (Server Component):
  - Sem sessão: botão/link "Sign in" para `/auth/sign-in`.
  - Com sessão: avatar Dicebear + `firstName lastName` + `email` em linha discreta.
  - Marca "Product Ratings" à esquerda, same tokens visuais já definidos.
  - Sem `use client`; navegação com `next/link`.

## 6. Copy (inglês, voz ativa, sentence case)

- Manchete: "Welcome back to your reviews."
- Apoio: "Sign in to rate products and see what you have already reviewed."
- Erro: "Email or password is invalid."
- CTA: "Sign in" / "Signing in…"
- Cabeçalho logado: nome completo e e-mail; sem ALL-CAPS, sem rótulos decorativos.

## 7. Passos de execução

1. Ler `AGENTS.md`, `docs/plans/sign-in.md` e os guias locais do Next 16 (`cookies.md`, `15-route-handlers.md`, `13-fonts.md`).
2. Criar validação e `verifyPassword`.
3. Criar sessão assinada e `getSession`.
4. Criar route handler com os códigos 400/401/200/500.
5. Criar página e formulário de sign-in.
6. Criar route group, layout e cabeçalho.
7. Excluir `app/page.tsx`.
8. Atualizar `.env.example`.
9. Rodar `npm run typecheck` e `npm run build`; corrigir apenas arquivos de propriedade deste plano.

## 8. Aceitação

- `/auth/sign-in` existe, valida no cliente e mostra alert vermelho no erro.
- Credenciais erradas retornam mensagem genérica idêntica para e-mail e senha.
- Login correto retorna 200, grava cookie `pr_session` e redireciona para `/`.
- Cabeçalho mostra "Sign in" quando deslogado e avatar + nome + e-mail quando logado.
- Rotas do grupo `(platform)` continuam servidas em `/` e `/products/[id]` (criadas pelas outras specs).
- `npm run typecheck` e `npm run build` passam após a integração das três specs.

## 9. Riscos / pendências

- `SESSION_SECRET` precisa existir no ambiente; sem ele, a sessão não deve ser criada silenciosamente — falhar com 500 explícito no servidor.
- O `getSession()` faz uma consulta extra ao banco por request; aceitável para o escopo, mas é ponto de atenção de performance.
- Não implementar sign-out: fora da spec.
