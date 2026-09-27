-- Sub-kategori untuk jenis acara Aqiqah & Tasyakuran
insert into public.categories (slug, name, sort, group_slug) values
  ('aqiqah-putra', 'Aqiqah Putra', 20, 'aqiqah'),
  ('aqiqah-putri', 'Aqiqah Putri', 21, 'aqiqah')
on conflict (slug) do update set name = excluded.name, group_slug = excluded.group_slug;
