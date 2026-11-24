-- Product reviews written by authenticated accounts.
-- Run after 20261116000000_create_products.sql (products must exist).

create table if not exists public.products_feedbacks (
  id text primary key,
  score integer not null check (score between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  created_by text not null references public.accounts(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade
);

comment on table public.products_feedbacks is
  'Reviews left by accounts. Written by the server using the service role key.';

create index if not exists products_feedbacks_product_id_created_at_idx
  on public.products_feedbacks (product_id, created_at desc);

-- No policies on purpose: clients must not access reviews directly. The API
-- uses the service role key, which bypasses RLS.
alter table public.products_feedbacks enable row level security;
