-- Data awal kategori & paket (harga bisa diubah admin kapan saja)
insert into public.categories (slug, name, sort) values
  ('syari', 'Syar''i', 1),
  ('minimalis', 'Minimalis', 2),
  ('floral', 'Floral', 3),
  ('modern', 'Modern', 4),
  ('elegan', 'Elegan & Luxury', 5),
  ('rustic', 'Rustic', 6),
  ('adat', 'Adat & Tradisional', 7)
on conflict (slug) do nothing;

insert into public.packages (code, name, guest_limit, price, sort) values
  ('BASIC-100', 'Paket 100 Tamu', 100, 99000, 1),
  ('PREMIUM-500', 'Paket 500 Tamu', 500, 199000, 2),
  ('EXCLUSIVE-1000', 'Paket 1000 Tamu', 1000, 299000, 3)
on conflict (code) do nothing;
