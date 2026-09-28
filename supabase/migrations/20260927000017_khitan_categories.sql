-- Sub-kategori untuk jenis acara Khitanan
insert into public.categories (slug, name, sort, group_slug) values
  ('khitan-ceria', 'Ceria Anak', 30, 'khitanan'),
  ('khitan-klasik', 'Islami Klasik', 31, 'khitanan')
on conflict (slug) do update set name = excluded.name, group_slug = excluded.group_slug;
