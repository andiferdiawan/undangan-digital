-- Halaman statis yang bisa diedit admin (tentang kami, kebijakan privasi, dll.)
create table if not exists public.pages (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 300),
  body text not null default '' check (char_length(body) <= 60000),
  sort smallint not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;
drop policy if exists "pages: publik baca yang tayang" on public.pages;
create policy "pages: publik baca yang tayang" on public.pages
  for select to anon, authenticated using (is_published or (select public.is_admin()));
drop policy if exists "pages: admin kelola" on public.pages;
create policy "pages: admin kelola" on public.pages
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;

create or replace function public.touch_pages_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists pages_touch on public.pages;
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_pages_updated_at();
