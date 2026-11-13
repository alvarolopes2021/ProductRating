-- Accounts table (custom authentication, passwords hashed with bcrypt).
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create table if not exists public.accounts (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  password text not null,
  salt text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.accounts is
  'Application accounts. Written by the server using the service role key.';

comment on column public.accounts.password is
  'bcrypt hash. bcrypt embeds the salt in the hash itself.';

comment on column public.accounts.salt is
  'bcrypt salt, persisted to satisfy the schema. Verification uses the password hash only.';

-- Emails are unique regardless of casing.
create unique index if not exists accounts_email_lower_key
  on public.accounts ((lower(email)));

-- No policies on purpose: anonymous/authenticated clients must not access this
-- table. The API uses the service role key, which bypasses RLS.
alter table public.accounts enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists accounts_set_updated_at on public.accounts;

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row
  execute function public.set_updated_at();
