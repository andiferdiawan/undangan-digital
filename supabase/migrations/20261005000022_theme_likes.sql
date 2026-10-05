-- Tema yang disukai user (tombol hati di katalog).
-- Pengunjung tanpa akun menyimpan suka di localStorage; setelah login, suka itu digabung ke tabel ini.

create table if not exists public.theme_likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  theme_id   uuid not null references public.themes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, theme_id)
);

create index if not exists theme_likes_theme_id_idx on public.theme_likes (theme_id);

alter table public.theme_likes enable row level security;

drop policy if exists "theme_likes: baca milik sendiri" on public.theme_likes;
create policy "theme_likes: baca milik sendiri" on public.theme_likes
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "theme_likes: tambah milik sendiri" on public.theme_likes;
create policy "theme_likes: tambah milik sendiri" on public.theme_likes
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "theme_likes: hapus milik sendiri" on public.theme_likes;
create policy "theme_likes: hapus milik sendiri" on public.theme_likes
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.theme_likes from anon;
revoke update, truncate, references, trigger on public.theme_likes from authenticated;
grant select, insert, delete on public.theme_likes to authenticated;
