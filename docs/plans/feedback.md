# Plano — Feedback (Avaliações de produtos)

**Spec de origem:** `specs/feedback.md`  
**Status:** plano proposto — aguardando aprovação  
**Idioma da UI:** inglês

## 1. Objetivo

Permitir que pessoas autenticadas adicionem avaliações (nota de 1 a 5 + comentário) e que a página de detalhes do produto mostre as avaliações existentes. Para quem não está logado, mostrar um bloco convidando ao login, sem exibir o formulário.

## 2. Interpretação da spec (decisões necessárias)

- "Você não deve implementar qualquer outra funcionalidade que não esteja relacionada com sign-up" é copia-e-cola; interpretação: **manter escopo de feedback**.
- `/products/id` é interpretado como rota dinâmica `/products/[id]`.
- A spec não define o caminho do endpoint de criação; será `POST /api/v1/feedback` com `productId` no body.
- A listagem de avaliações será feita diretamente no Server Component via Supabase; não é necessário endpoint GET público adicional.
- A página de detalhes é de propriedade **deste** plano. O agente Home apenas cria os links e a tabela `products`; não cria a página de detalhes.
- Sem sessão: bloco de autenticação no lugar do formulário. Com sessão: formulário + listagem.

## 3. Contratos compartilhados (congelados)

Consumidos, não implementados aqui:

```ts
// lib/auth/session.ts — agente Sign-In
getSession(): Promise<{ account: SessionAccount } | null>

// lib/products.ts — agente Home
getProductById(id: string): Promise<Product | null>
type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  score: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Implementados por este plano:

```ts
// lib/feedback.ts
export type ProductFeedback = {
  id: string;
  productId: string;
  score: number;
  comment: string;
  createdBy: string;
  createdAt: string;
};

export async function listFeedback(productId: string): Promise<ProductFeedback[]>;
export async function createFeedback(input: {
  productId: string;
  score: number;
  comment: string;
  createdBy: string;
}): Promise<ProductFeedback>;
```

## 4. Propriedade de arquivos

**Criar / editar (somente este agente):**

- `supabase/migrations/20261116000001_create_products_feedbacks.sql`
- `lib/validations/feedback.ts`
- `lib/feedback.ts`
- `app/api/v1/feedback/route.ts`
- `app/(platform)/products/[id]/page.tsx`
- `components/feedback-form.tsx`
- `components/feedback-list.tsx`
- `components/ui/textarea.tsx` (componente shadcn mínimo, se necessário)

**Não editar:** `app/globals.css`, `app/layout.tsx`, `app/(platform)/layout.tsx`, `components/site-header.tsx`, `lib/auth/**`, `lib/products.ts`, `app/(platform)/page.tsx`, `app/api/v1/products/route.ts`, migration de products, `.env.example`, specs ou planos.

## 5. Implementação técnica

### Migration `products_feedbacks`

```sql
id text primary key                              -- nanoid
score integer not null check (score between 1 and 5)
comment text not null
created_at timestamptz not null default now()
created_by text not null references public.accounts(id) on delete cascade
product_id text not null references public.products(id) on delete cascade
```

- Índice em `(product_id, created_at desc)`.
- RLS habilitado sem policies; acesso exclusivo pelo service role no servidor.
- Timestamp `20261116000001` garante aplicação **depois** da migration de products (`20261116000000`).

### `POST /api/v1/feedback`

- `runtime = "nodejs"`.
- Exigir `getSession()`; sem sessão → `401` com mensagem "Sign in to leave a review."
- Validar body com Zod: `productId` (não vazio), `score` (`z.coerce.number().int().min(1).max(5)`), `comment` (trim, 1–1000 caracteres).
- 400 com `{ error, fieldErrors }` quando inválido.
- Verificar produto com `getProductById(productId)`; inexistente → 404.
- Inserir com `createdBy = session.account.id` e `id = nanoid()`.
- `201` com o feedback criado; erro inesperado → 500 genérico.
- Nunca permitir que o cliente informe `createdBy`.

### Página `/products/[id]`

- Server Component com `params: Promise<{ id: string }>` (Next 16).
- Buscar produto com `getProductById`; inexistente → `notFound()`.
- Buscar avaliações com `listFeedback(id)`.
- Buscar sessão com `getSession()`.
- Estrutura:
  1. Cabeçalho do produto (já dentro do layout `(platform)`, que inclui o `SiteHeader`).
  2. Informações: título em Instrument Serif, descrição, link externo discreto e imagem com fallback tipográfico.
  3. `FeedbackList` com todas as avaliações (nota, comentário, autor por nome quando disponível, data relativa via `date-fns` — já instalado).
  4. Abaixo da lista: `FeedbackForm` se logado; senão, bloco "Sign in to leave a review." com link para `/auth/sign-in`.
- Sem cards idênticos, sem sombras suaves, sem gradientes; listas com régua de 1px.

### `FeedbackForm` (`"use client"`)

- `react-hook-form` + `zodResolver`, `mode: "onTouched"`.
- Nota de 1 a 5 em `<fieldset>` com `<legend>`; cinco botões com `aria-pressed` e estados visíveis de seleção em `text-signal`. Navegação por teclado preservada (botões nativos).
- Comentário em `<textarea>` via `components/ui/textarea.tsx`.
- `useMutation` chamando `POST /api/v1/feedback`.
- Erro em `<Alert variant="destructive">`; mensagens da API aparecem no alert e `fieldErrors` são aplicados nos campos com `setError`.
- Sucesso: `form.reset()`, `router.refresh()` para atualizar a listagem servidor, e confirmação curta "Review added." via estado local com `aria-live="polite"`.
- Loading: botão "Add review" → "Adding review…", desabilitado durante a mutation.

## 6. UX / design

- Paleta e fontes atuais permanecem intactas.
- Manchete: nome do produto (dado real), sem copy promocional inventada.
- Seção de avaliações com título "Reviews" e contagem discreta, sem ALL-CAPS.
- Bloco de não autenticado: texto direto e CTA "Sign in" — sem medo, sem culpa, sem "apologize".
- Ratios e foco visíveis; `prefers-reduced-motion` já tratado globalmente; não adicionar animações por item.

## 7. Passos de execução

1. Ler `AGENTS.md`, este plano e o guia de rotas dinâmicas do Next 16 em `03-layouts-and-pages.md`.
2. Criar migration e `lib/feedback.ts`.
3. Criar validação e route handler.
4. Criar `components/ui/textarea.tsx`, `FeedbackForm` e `FeedbackList`.
5. Criar `app/(platform)/products/[id]/page.tsx`.
6. Rodar `npm run typecheck` e `npm run build`; corrigir somente arquivos deste plano.

## 8. Aceitação

- `/products/{id}` mostra nome, imagem e descrição do produto.
- Todas as avaliações existentes aparecem na página.
- Pessoa deslogada vê bloco exigindo autenticação e **não vê** o formulário.
- Pessoa logada consegue enviar nota 1–5 + comentário e vê a nova avaliação na lista após o envio.
- Nota fora de 1–5 e comentário vazio são rejeitados com 400 e mensagens claras.
- Inserção sem sessão retorna 401; produto inexistente retorna 404.
- `npm run typecheck` e `npm run build` passam após integração das três specs.

## 9. Riscos / pendências

- Dependência de contratos produzidos pelas outras duas specs (`getSession`, `getProductById`). Se algum contrato mudar, avisar o orquestrador em vez de editar arquivos de outro agente.
- Exibir nome do autor exige join com `accounts`; se não houver dados suficientes no row retornado, usar apenas data e nota, sem inventar identidade.
- Sem banco local configurado, validação final é build + tipos; não há testes automatizados no repo.
