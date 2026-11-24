-- Products catalog. IDs are generated with nanoid() in the API layer.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  image_url text,
  external_link text not null,
  score boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  'Public product catalog. Written by the server using the service role key.';

comment on column public.products.image_url is
  'Optional absolute URL used by the catalog listing.';

create index if not exists products_created_at_id_idx
  on public.products (created_at desc, id desc);

-- No policies on purpose: clients read through /api/v1/products and cannot
-- write directly. The service role key bypasses RLS.
alter table public.products enable row level security;

-- public.set_updated_at() is created by 20261112000000_create_accounts.sql.
drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();
