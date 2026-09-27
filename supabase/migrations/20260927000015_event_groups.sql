-- Jenis acara (induk kategori): Pernikahan, Aqiqah & Tasyakuran, Khitanan, Ulang Tahun, Kantor & Bisnis, Acara Umum.
-- Kategori gaya yang sudah ada (Syar'i, Rustic, Adat, ...) semuanya berada di bawah Pernikahan.
create table if not exists public.event_groups (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,40}$'),
  name text not null check (char_length(name) between 2 and 60),
  icon text not null default 'event',
  description text check (description is null or char_length(description) <= 200),
  sort smallint not null default 0,
  is_active boolean not null default true
);

alter table public.event_groups enable row level security;
drop policy if exists "jenis acara: publik baca" on public.event_groups;
create policy "jenis acara: publik baca" on public.event_groups
  for select to anon, authenticated using (is_active or (select public.is_admin()));
drop policy if exists "jenis acara: admin kelola" on public.event_groups;
create policy "jenis acara: admin kelola" on public.event_groups
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.event_groups to anon, authenticated;
grant insert, update, delete on public.event_groups to authenticated;

insert into public.event_groups (slug, name, icon, description, sort) values
  ('pernikahan', 'Pernikahan & Lamaran', 'wedding', 'Undangan akad, walimah, resepsi, dan lamaran', 1),
  ('aqiqah', 'Aqiqah & Tasyakuran', 'aqiqah', 'Aqiqah kelahiran buah hati, tasyakuran, dan syukuran', 2),
  ('khitanan', 'Khitanan', 'khitan', 'Walimatul khitan dan syukuran sunatan', 3),
  ('ulang-tahun', 'Ulang Tahun', 'birthday', 'Ulang tahun anak, milad, dan syukuran usia', 4),
  ('kantor', 'Kantor & Bisnis', 'office', 'Peresmian, launching, rapat, gathering, dan seminar perusahaan', 5),
  ('acara', 'Acara Umum', 'event', 'Reuni, kajian, buka puasa bersama, halal bihalal, dan acara lainnya', 6)
on conflict (slug) do nothing;

alter table public.categories
  add column if not exists group_slug text not null default 'pernikahan'
  references public.event_groups (slug) on update cascade;
create index if not exists categories_group_idx on public.categories (group_slug);
