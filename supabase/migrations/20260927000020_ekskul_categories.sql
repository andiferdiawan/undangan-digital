-- Sub-kategori ekstrakurikuler / UKM di bawah Acara Umum
insert into public.categories (slug, name, sort, group_slug) values
  ('ekskul-pramuka', 'Pramuka & Kepanduan', 62, 'acara'),
  ('ekskul-pmr', 'PMR & Kesehatan', 63, 'acara'),
  ('ekskul-seni', 'Seni & Budaya', 64, 'acara')
on conflict (slug) do update set name = excluded.name, group_slug = excluded.group_slug;
