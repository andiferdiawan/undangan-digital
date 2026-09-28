-- Sub-kategori untuk jenis acara Kantor & Bisnis serta Acara Umum
insert into public.categories (slug, name, sort, group_slug) values
  ('peresmian-korporat', 'Peresmian & Korporat', 50, 'kantor'),
  ('seminar-rapat', 'Seminar & Rapat Kerja', 51, 'kantor'),
  ('pengajian-silaturahmi', 'Pengajian & Halal Bihalal', 60, 'acara'),
  ('reuni-gathering', 'Reuni & Gathering', 61, 'acara')
on conflict (slug) do update set name = excluded.name, group_slug = excluded.group_slug;
