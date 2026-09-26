-- Slug halaman statis & rute sistem tidak boleh dipakai sebagai alamat undangan
create or replace function public.is_reserved_slug(p_slug text)
returns boolean
language sql
immutable
set search_path to ''
as $$
  select p_slug = any (array[
    'admin', 'dashboard', 'daftar', 'masuk', 'keluar', 'login', 'register',
    'api', 'tema', 'preview', 'katalog', 'harga', 'bantuan', 'auth', 'confirm',
    'reset-password', 'lupa-password', 'undangan', 'assets', 'static', 'public', 'nuxt',
    'checkout', 'pesanan', 'reseller', 'r', 'bayar', 'pembayaran',
    'tentang-kami', 'kebijakan-privasi', 'syarat-ketentuan', 'kebijakan-pengembalian', 'kontak',
    'halaman', 'og', 'media', 'sitemap', 'robots', 'faq', 'privacy', 'terms', 'about', 'contact'
  ]);
$$;
