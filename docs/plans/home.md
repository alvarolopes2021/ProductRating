# Plano — Home (Catálogo de produtos)

**Spec de origem:** `specs/home.md`  
**Status:** plano proposto — aguardando aprovação  
**Idioma da UI:** inglês

## 1. Objetivo

Substituir o stub de `/` por uma home pública que lista produtos de forma paginada com infinite scrolling, criar a tabela `products`, o endpoint de listagem e um endpoint protegido para inserção manual de produtos.

## 2. Interpretação da spec (decisões necessárias)

- "Você não deve implementar qualquer outra funcionalidade que não esteja relacionada com sign-up" é copia-e-cola; interpretação: **manter escopo de home/catálogo**.
- `score: boolean` na tabela `products` será seguido **literalmente** (`boolean not null default false`). Se o objetivo for média de avaliações numérica, será uma decisão futura — a spec Feedback usa `score: int` na tabela de feedbacks.
- A spec pede "imagem" na listagem e no POST, mas não lista coluna de imagem. Será adicionada `image_url text` — inclusão necessária para atender ao requisito visual.
- O POST da spec está escrito como `/products`; para consistência com o GET será `/api/v1/products`.
- "200 ou array vazio" será implementado como `200` com `{ items: [], nextPage: null }`, necessário para o infinite query.
- Home e POST de inserção são **públicos**; nenhuma autenticação é exigida (decisão posterior à aprovação do plano). O payload do POST usa `name`, `link` e `image`.
- A spec Sign-In pedia "home sem nada"; a spec Home prevalece, conforme combinado no plano de Sign-In.

## 3. Contratos compartilhados (congelados)

Nenhum contrato de sessão é consumido: a home e o POST de produtos são públicos.

Implementado por este agente e consumido pelo agente Feedback:

```ts
// lib/products.ts
export type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  score: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listProducts(
  page: number,
  limit: number,
): Promise<{ items: Product[]; nextPage: number | null }>;

export async function getProductById(id: string): Promise<Product | null>;
```

`lib/products.ts` é de propriedade deste plano. O agente Feedback pode **importar** `getProductById` e o tipo `Product`, mas não pode editar o arquivo.

## 4. Propriedade de arquivos

**Criar / editar (somente este agente):**

- `supabase/migrations/20261116000000_create_products.sql`
- `lib/validations/product.ts`
- `lib/products.ts`
- `app/api/v1/products/route.ts`
- `app/(platform)/page.tsx`
- `components/product-feed.tsx`
- `components/product-card.tsx`

**Não editar:** `app/globals.css`, `app/layout.tsx`, `app/(platform)/layout.tsx`, `components/site-header.tsx`, `lib/auth/**`, `lib/feedback.ts`, `app/(platform)/products/**`, migrations de feedback, `app/page.tsx` (excluído pelo agente Sign-In), `.env.example`, specs ou planos.

Nota: `/` passa a existir em `app/(platform)/page.tsx`. O agente Sign-In remove o `app/page.tsx` antigo; as duas ações são complementares e não editam o mesmo arquivo.

## 5. Implementação técnica

### Migration `products`

```sql
id text primary key                 -- nanoid gerado na API
name text not null
description text                    -- opcional
image_url text                      -- opcional, necessária para a listagem
external_link text not null
score boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

- Reutilizar `public.set_updated_at()` com trigger `products_set_updated_at`.
- `create index products_created_at_id_idx on public.products (created_at desc, id desc)`.
- RLS habilitado **sem policies**, mesmo padrão de `accounts`; acesso somente via service role no servidor.

### `GET /api/v1/products`

- Query params validados com Zod: `page` (coerce int, default 1, min 1), `limit` (coerce int, default 12, min 1, max 24).
- Buscar `limit + 1` registros para descobrir `hasMore` sem `count`.
- Ordenação: `created_at desc`, `id desc`.
- Resposta `200`: `{ items, nextPage: number | null }`.
- Sem produtos: `200` com `{ items: [], nextPage: null }`.
- Erro de banco: 500 com mensagem genérica, sem vazar detalhes.

### `POST /api/v1/products` (ingestão pública)

- Endpoint público: sem sessão, sem permissão e sem chave de admin.
- Body validado: `name` (2–120), `link` (URL http/https), `image` opcional (URL http/https).
- Mapeamento: `link` → `external_link`, `image` → `image_url`; `description` é gravado como `null`.
- `id` gerado com `nanoid()` na API.
- Resposta `201` com `{ product }`; 409 não é necessário (sem unicidade declarada).

### Home e infinite scrolling

- `app/(platform)/page.tsx` (Server Component) busca a primeira página via `listProducts(1, 12)` e passa como `initialData` para `ProductFeed`.
- `ProductFeed` (`"use client"`): `useInfiniteQuery` com `queryKey: ["products"]`, `queryFn` chamando `/api/v1/products?page=...&limit=12`, `getNextPageParam: (last) => last.nextPage ?? undefined`.
- `IntersectionObserver` em um sentinel ao fim da lista; `fetchNextPage` quando `hasNextPage && !isFetchingNextPage`.
- Estados explícitos: carregando inicial (esqueleto discreto), "No products yet." para vazio, erro com mensagem e ação "Try again".
- `aria-live="polite"` para status de carregamento; sem animação por item, sem gradientes.

### `ProductCard`

- Título é link para `/products/{id}`.
- Imagem com `loading="lazy"` e `alt` igual ao nome; fallback tipográfico quando `imageUrl` é nulo.
- Descrição com no máximo duas linhas.
- Itens separados por régua de 1px (`border-border`), não por cards arredondados com sombra.

## 6. UX / design

- Manter tokens atuais de `app/globals.css` (paper, ink, indigo, signal) e as fontes Sora + Instrument Serif.
- Manchete da home em Instrument Serif: "Products worth talking about." Sem destaque de palavra isolada.
- Abaixo, uma linha curta em Sora explicando que a listagem é pública.
- Lista em coluna única no mobile; em desktop, grade de duas ou três colunas com régua entre linhas.
- Copy em sentence case; nenhum ALL-CAPS, nenhum eyebrow decorativo, nenhum "→" appending em CTA.

## 7. Passos de execução

1. Ler `AGENTS.md`, este plano e `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.
2. Criar migration e `lib/products.ts`.
3. Criar validação e route handler (GET + POST).
4. Criar página `(platform)/page.tsx`, `ProductFeed` e `ProductCard`.
5. Rodar `npm run typecheck` e `npm run build`; corrigir somente arquivos deste plano.

## 8. Aceitação

- `/` lista produtos públicos, sem exigir login.
- Paginação carrega mais itens ao rolar, sem duplicatas e sem loop de requisições.
- Cada item mostra título (link), imagem e descrição simples.
- Clique no título navega para `/products/{id}` (página criada pelo agente Feedback).
- `POST /api/v1/products` aceita anônimo, recebe `name`/`link`/`image` e cria produto com 201.
- Migration aplicável junto com a migration de feedback (ordem por timestamp).
- `npm run typecheck` e `npm run build` passam após integração das três specs.

## 9. Riscos / pendências

- A coluna `image_url` é uma adição em relação à lista literal de colunas da spec; registrada e justificada acima.
- `score` boolean pode ser insuficiente para exibir média de avaliações; está fora do escopo desta spec e será revisitado se o produto evoluir.
- Sem banco configurado localmente, a verificação é de build/tipos; não há testes automatizados no repo.
