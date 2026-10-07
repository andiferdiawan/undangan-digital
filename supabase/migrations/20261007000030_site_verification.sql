-- Kode verifikasi mesin pencari (Bing Webmaster Tools & Google Search Console), diisi dari Admin → Pengaturan.
-- Dipasang sebagai meta msvalidate.01 / google-site-verification di beranda. Nilainya memang publik
-- (tampil di HTML), jadi aman berada di app_settings yang bisa dibaca publik; hanya admin yang bisa mengubah.
alter table public.app_settings
  add column if not exists bing_site_verification text
    check (bing_site_verification is null or bing_site_verification ~ '^[A-Za-z0-9_-]{1,100}$'),
  add column if not exists google_site_verification text
    check (google_site_verification is null or google_site_verification ~ '^[A-Za-z0-9_-]{1,100}$');
