# Undangan Digital — Tema Syar'i

Undangan pernikahan digital satu halaman, dirancang **khusus untuk ponsel** (mobile-first).
Di layar lebar tampilannya tetap selebar ponsel (maks. 480px) di tengah layar.

Tersedia dua desain (data sama, dari `assets/config.js`):

| Halaman | Desain |
|---|---|
| `index.html` | **Modern** — palet segar krem–sage–terakota, lampion berayun, bulan sabit, siluet masjid, ilustrasi karakter mempelai muslim *faceless* (tanpa wajah), tanggal Hijriah, dan linimasa ta'aruf → khitbah → akad |
| `klasik.html` | **Klasik** — krem & hijau dengan monogram inisial |

Tema syar'i: tanpa foto mempelai dan tanpa musik, dilengkapi Bismillah, QS. Ar-Rum: 21,
doa untuk pengantin, dan adab menghadiri walimah.

## Fitur
- Sampul dengan nama tamu dari URL: `index.html?to=Bapak+Fulan`
- Tanggal Masehi & Hijriah otomatis
- Hitung mundur ke akad nikah + tombol simpan ke Google Calendar
- Detail Akad & Walimah dengan tautan Google Maps
- Konfirmasi kehadiran (RSVP) & ucapan dikirim via WhatsApp
- Amplop digital dengan tombol salin nomor rekening
- Navigasi bawah ala aplikasi, animasi halus, mendukung safe-area iPhone

## Cara menyesuaikan
Ubah semua data (nama, orang tua, tanggal, lokasi, nomor WhatsApp, rekening) di
[`assets/config.js`](assets/config.js). Tidak perlu mengubah HTML.

## Menjalankan
Buka `index.html` langsung di browser, atau host di GitHub Pages / Netlify / Vercel
(situs statis, tanpa build).

## Hosting (GitHub Pages)
1. Buka **Settings → Pages** di repositori ini.
2. Pada *Build and deployment*, pilih **Source: Deploy from a branch**.
3. Pilih branch `claude/undangan-digital-mobile-syari-l035x8`, folder `/ (root)`, lalu **Save**.
4. Setelah 1–2 menit, undangan tersedia di
   `https://andiferdiawan.github.io/undangan-digital/`

Link per tamu: `https://andiferdiawan.github.io/undangan-digital/?to=Bapak+Fulan`
