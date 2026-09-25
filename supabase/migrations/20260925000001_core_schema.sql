-- =====================================================================
--  Marketplace Undangan Digital — skema inti
-- =====================================================================

-- ---------- Profil & peran ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------- Katalog ----------
create table public.categories (
  id smallint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  sort int not null default 0
);

create table public.packages (
  id smallint generated always as identity primary key,
  code text not null unique,
  name text not null,
  guest_limit int not null check (guest_limit > 0),
  price int not null check (price >= 0),
  is_active boolean not null default true,
  sort int not null default 0
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  category_id smallint references public.categories (id) on delete set null,
  thumbnail_url text,
  definition jsonb not null,
  compiled_css text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source text not null default 'manual' check (source in ('manual', 'ai')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index themes_category_id_idx on public.themes (category_id);
create index themes_created_by_idx on public.themes (created_by);

-- ---------- Token akses ----------
create table public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  theme_id uuid not null references public.themes (id),
  package_id smallint not null references public.packages (id),
  guest_limit int not null check (guest_limit > 0),
  price int not null check (price >= 0),
  customer_note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete set null,
  redeemed_at timestamptz
);
create index access_tokens_theme_id_idx on public.access_tokens (theme_id);
create index access_tokens_package_id_idx on public.access_tokens (package_id);
create index access_tokens_created_by_idx on public.access_tokens (created_by);
create index access_tokens_redeemed_by_idx on public.access_tokens (redeemed_by);
create index access_tokens_created_at_idx on public.access_tokens (created_at);

-- ---------- Undangan (workspace user) ----------
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  theme_id uuid not null references public.themes (id),
  token_id uuid unique references public.access_tokens (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 50),
  guest_limit int not null check (guest_limit > 0),
  content jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  assets jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invitations_owner_id_idx on public.invitations (owner_id);
create index invitations_theme_id_idx on public.invitations (theme_id);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  phone text check (phone is null or phone ~ '^[0-9+ -]{6,20}$'),
  group_name text check (group_name is null or char_length(group_name) <= 50),
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  unique (invitation_id, name)
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  attendance text not null check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  pax smallint not null default 1 check (pax between 1 and 10),
  message text check (message is null or char_length(message) <= 500),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index rsvps_invitation_id_idx on public.rsvps (invitation_id, created_at desc);
create index rsvps_guest_id_idx on public.rsvps (guest_id);

-- ---------- Log generator tema AI ----------
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  model text,
  status text not null check (status in ('success', 'invalid', 'error')),
  output jsonb,
  errors jsonb,
  theme_id uuid references public.themes (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index ai_generations_theme_id_idx on public.ai_generations (theme_id);
create index ai_generations_created_by_idx on public.ai_generations (created_by);

-- ---------- updated_at ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger themes_touch before update on public.themes
  for each row execute function public.touch_updated_at();
create trigger invitations_touch before update on public.invitations
  for each row execute function public.touch_updated_at();

-- ---------- Batas kuota tamu ----------
create or replace function public.enforce_guest_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit int;
  v_count int;
begin
  -- Kunci baris undangan agar insert paralel tidak bisa melewati batas
  select guest_limit into v_limit
  from public.invitations where id = new.invitation_id
  for update;

  select count(*) into v_count
  from public.guests where invitation_id = new.invitation_id;

  if v_count >= v_limit then
    raise exception 'GUEST_LIMIT_REACHED'
      using hint = format('Kuota paket Anda %s tamu sudah penuh.', v_limit);
  end if;

  new.name := btrim(new.name);
  return new;
end;
$$;

create trigger guests_enforce_limit before insert on public.guests
  for each row execute function public.enforce_guest_limit();

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.packages enable row level security;
alter table public.themes enable row level security;
alter table public.access_tokens enable row level security;
alter table public.invitations enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.ai_generations enable row level security;

-- profiles
create policy "profil: baca milik sendiri atau admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profil: ubah milik sendiri" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- categories & packages: publik baca, admin kelola
create policy "kategori: publik baca" on public.categories
  for select to anon, authenticated using (true);
create policy "kategori: admin tulis" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "paket: publik baca" on public.packages
  for select to anon, authenticated using (true);
create policy "paket: admin tulis" on public.packages
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- themes
create policy "tema: publik baca yang tayang" on public.themes
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));
create policy "tema: admin tambah" on public.themes
  for insert to authenticated with check ((select public.is_admin()));
create policy "tema: admin ubah" on public.themes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "tema: admin hapus" on public.themes
  for delete to authenticated using ((select public.is_admin()));

-- access_tokens: admin kelola, user lihat token miliknya
create policy "token: admin atau pemilik baca" on public.access_tokens
  for select to authenticated
  using ((select public.is_admin()) or redeemed_by = (select auth.uid()));
create policy "token: admin hapus" on public.access_tokens
  for delete to authenticated using ((select public.is_admin()));

-- invitations: pemilik & admin. Dibuat hanya lewat redeem token.
create policy "undangan: pemilik atau admin baca" on public.invitations
  for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));
create policy "undangan: pemilik ubah" on public.invitations
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
revoke update on public.invitations from authenticated;
grant update (slug, content, style, assets, is_published) on public.invitations to authenticated;

-- guests
create policy "tamu: pemilik kelola" on public.guests
  for all to authenticated
  using (exists (select 1 from public.invitations i
                 where i.id = invitation_id and i.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.invitations i
                      where i.id = invitation_id and i.owner_id = (select auth.uid())));
create policy "tamu: admin baca" on public.guests
  for select to authenticated using ((select public.is_admin()));

-- rsvps: insert publik lewat RPC; pemilik baca/moderasi
create policy "rsvp: pemilik baca" on public.rsvps
  for select to authenticated
  using (exists (select 1 from public.invitations i
                 where i.id = invitation_id and i.owner_id = (select auth.uid())));
create policy "rsvp: pemilik ubah" on public.rsvps
  for update to authenticated
  using (exists (select 1 from public.invitations i
                 where i.id = invitation_id and i.owner_id = (select auth.uid())));
create policy "rsvp: pemilik hapus" on public.rsvps
  for delete to authenticated
  using (exists (select 1 from public.invitations i
                 where i.id = invitation_id and i.owner_id = (select auth.uid())));
revoke update on public.rsvps from authenticated;
grant update (is_visible) on public.rsvps to authenticated;

-- ai_generations: admin
create policy "ai: admin kelola" on public.ai_generations
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
