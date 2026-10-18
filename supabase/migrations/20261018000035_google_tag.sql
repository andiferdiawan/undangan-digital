-- Google tag (gtag.js) untuk Google Ads / Google Analytics, diisi dari Admin → Pengaturan.
-- google_tag_ids  : ID tag yang dipasang di <head> semua halaman publik (mis. AW-18353791089, G-XXXXXXX).
-- google_ads_purchase: tujuan konversi pembelian Google Ads ("send_to", mis. AW-18353791089/DVP1COLG2aAdEPHA4q9E),
--                     dikirim sekali per pesanan di halaman pesanan setelah lunas (menampilkan token).
-- Nilainya memang publik (tampil di HTML), jadi aman berada di app_settings yang bisa dibaca publik;
-- hanya admin yang bisa mengubah. Format dibatasi ketat karena dirangkai menjadi skrip di halaman.
alter table public.app_settings
  add column if not exists google_tag_ids text[] not null default '{}'
    check (cardinality(google_tag_ids) <= 5
      and array_to_string(google_tag_ids, ',') ~ '^((AW|G|GT|DC)-[A-Z0-9]{4,20}(,(AW|G|GT|DC)-[A-Z0-9]{4,20})*)?$'),
  add column if not exists google_ads_purchase text
    check (google_ads_purchase is null or google_ads_purchase ~ '^AW-[0-9]{6,15}/[A-Za-z0-9_-]{4,40}$');
