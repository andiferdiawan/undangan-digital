-- Pustaka media admin: gambar & audio yang diunggah sekali, dipakai ulang di banyak tema katalog.
-- File disimpan di bucket theme-assets/library/... (tulis khusus admin, baca publik).

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'audio')),
  name text not null check (char_length(name) between 1 and 120),
  url text not null unique check (url ~ '^https://'),
  path text check (path is null or path ~ '^[A-Za-z0-9._/-]+$'),
  mime text,
  size_bytes integer check (size_bytes is null or size_bytes >= 0),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists media_kind_created_idx on public.media (kind, created_at desc);

alter table public.media enable row level security;
drop policy if exists "media: admin kelola" on public.media;
create policy "media: admin kelola" on public.media
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
grant select, insert, update, delete on public.media to authenticated;

-- Pindahkan musik tema yang sudah ada ke pustaka
insert into public.media (kind, name, url, path, mime)
select distinct on (t.music_url)
  'audio',
  left(regexp_replace(split_part(t.music_url, '/', -1), '\.[a-z0-9]+$', ''), 120),
  t.music_url,
  nullif(substring(t.music_url from '/object/public/theme-assets/(.*)$'), ''),
  'audio/mpeg'
from public.themes t
where t.music_url is not null
on conflict (url) do nothing;
