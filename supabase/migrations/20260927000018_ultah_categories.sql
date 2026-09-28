-- Sub-kategori untuk jenis acara Ulang Tahun
insert into public.categories (slug, name, sort, group_slug) values
  ('ulang-tahun-anak', 'Ulang Tahun Anak', 40, 'ulang-tahun'),
  ('milad-dewasa', 'Milad Dewasa', 41, 'ulang-tahun')
on conflict (slug) do update set name = excluded.name, group_slug = excluded.group_slug;
