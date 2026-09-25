# Undangan Virtual — Marketplace Undangan Digital

Marketplace undangan pernikahan digital dengan **Nuxt 4 + Supabase**. Pengunjung memilih tema di katalog, memesan lewat WhatsApp,
lalu mengaktifkan **token 6 karakter** dari admin untuk membuat akun dan workspace undangannya sendiri.

## Fitur

| Peran | Fitur |
|---|---|
| **Pengunjung** | Katalog tema + filter kategori (Syar'i, Minimalis, Floral, …) + pencarian, pratinjau langsung di bingkai ponsel, tombol *Pesan* → WhatsApp admin berisi ID tema & paket |
| **User** | Aktivasi token → akun + workspace otomatis (tema & kuota sesuai token), editor konten per section dengan **live preview** & simpan otomatis, ganti warna/font/aset tema, unggah foto & galeri, buku tamu (manual / import massal, terkunci sesuai kuota), **magic link** per tamu `domain.com/andi-siti?to=Budi`, kirim via WhatsApp, rekap RSVP & ucapan |
| **Tamu** | Undangan mobile dengan sampul bernama tamu, hitung mundur, peta, simpan ke kalender, RSVP, buku ucapan, amplop digital |
| **Admin** | Token generator (tema → paket → generate → salin pesan WA), analitik (pendapatan bulanan, user aktif, conversion token, leaderboard tema), manajemen tema, **generator tema AI** |

## Arsitektur

```
Nuxt 4 (SSR)  ──►  Supabase
  app/              Postgres + RLS  (tabel, trigger kuota, RPC publik)
  server/api/admin  Auth            (email + password, token via metadata)
  shared/theme      Storage         (invitation-media, theme-assets)
        │
        └──►  Claude API (generator tema AI, server-only)
```

> **Hosting:** Supabase tidak menyediakan hosting aplikasi web (SSR). Deploy Nuxt ke **Vercel** (disarankan),
> Netlify, atau Cloudflare Pages. Supabase dipakai sebagai backend: database, auth, dan storage.

### Standardized Template Framework (`shared/theme/`)

Tema **bukan** HTML bebas. Setiap tema adalah JSON terstruktur yang tervalidasi:

- **Global variables** — `primary_color`, `secondary_color`, `accent_color`, `background_color`, `surface_color`, `text_color`, `muted_color`, `font_heading`, `font_body`, `font_script`. Dipakai lewat kelas `bg-primary`, `text-ink`, `font-heading`, dst. User mengganti warna di dashboard → CSS variable berubah.
- **Section mapping** — tema dibagi per section bertag: `cover`, `hero`, `quote`, `profile`, `story`, `countdown`, `event`, `gallery`, `rsvp`, `wishes`, `gift`, `closing`. **Wajib**: hero, profile, event, gallery.
- **Placeholder** — `{{bride_name}}`, `{{groom_name}}`, `{{event_date}}`, `{{location_map}}`, `{{guest_name}}`, … serta `{{item.*}}` di dalam `repeat` (events, gallery, story, gifts). Data yang diketik user otomatis mengisi tema apa pun.
- **Aset terisolasi** — `assets: { key: path }` dipakai via `{{asset.key}}`. Path relatif → bucket `theme-assets/{slug}/`. User dapat mengganti aset (mis. latar sampul → foto prewedding) tanpa mengubah tema.
- **Komponen interaktif** — `open_button`, `countdown`, `rsvp_form`, `wishes`, `copy_button`, `map_button`, `calendar_button`, `guest_name`.

Pipeline validasi (`validate.ts` + `server/utils/theme-compiler.ts`): skema Zod → placeholder & section wajib → URL hanya dari placeholder yang disanitasi →
kelas Tailwind dikompilasi **sekali** menjadi CSS (UnoCSS, di-scope ke `.invite-root`) dan disimpan di `themes.compiled_css`.
Renderer (`app/components/invite/`) tidak pernah memakai `v-html` untuk konten tema.

### Generator tema AI

`/admin/tema/baru` → brief desain → Claude (`claude-opus-5`, structured outputs dengan JSON schema) → validasi →
bila gagal, error dikirim balik untuk satu putaran perbaikan → pratinjau + editor JSON → simpan sebagai produk (draf/tayang).
Log setiap generate tersimpan di tabel `ai_generations`.

## Menjalankan lokal

```bash
cp .env.example .env      # isi SUPABASE_URL & SUPABASE_KEY (publishable key)
npm install
npm run dev               # http://localhost:3000
```

## Deploy ke Vercel

1. Import repositori ini di [vercel.com/new](https://vercel.com/new) (preset **Nuxt** terdeteksi otomatis).
2. Isi *Environment Variables*:

   | Nama | Nilai |
   |---|---|
   | `SUPABASE_URL` | `https://cyyjwhcmetldnxhaqife.supabase.co` |
   | `SUPABASE_KEY` | publishable key (Supabase → Project Settings → API Keys) |
   | `NUXT_PUBLIC_ADMIN_WHATSAPP` | nomor WA admin, mis. `6281234567890` |
   | `NUXT_PUBLIC_SITE_URL` | domain undangan, mis. `https://undangin.id` |
   | `NUXT_PUBLIC_SITE_NAME` | nama brand (opsional, default `Undangan Virtual`) |
   | `NUXT_ANTHROPIC_API_KEY` | API key Claude untuk generator tema AI (rahasia) |
   | `NUXT_TRIPAY_MODE` | `sandbox` atau `production` |
   | `NUXT_TRIPAY_API_KEY` | API key Tripay (rahasia) |
   | `NUXT_TRIPAY_PRIVATE_KEY` | private key Tripay (rahasia) |
   | `NUXT_TRIPAY_MERCHANT_CODE` | kode merchant Tripay, mis. `T12345` |
   | `NUXT_SERVER_RPC_SECRET` | string acak panjang; hash SHA-256-nya disimpan di `private.secrets` (rahasia) |

3. Di Supabase → **Authentication → URL Configuration**: isi *Site URL* dengan domain Vercel Anda dan tambahkan
   `https://domain-anda/confirm` serta `https://domain-anda/reset-password` ke *Redirect URLs*.
4. Deploy. Generator AI butuh 1–3 menit per tema; batas durasi fungsi sudah dinaikkan ke 300 detik di `nuxt.config.ts`.

### Menjadikan akun Anda admin

Daftar/masuk sekali, lalu jalankan di Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'email-anda@contoh.com';
```

Untuk membuat akun admin tanpa token, buat user di **Authentication → Users → Add user**, lalu jalankan query di atas.

## Reseller & pembayaran (Tripay)

- **Alur pembeli:** katalog → `/checkout/<tema>` → pilih metode (QRIS/VA/e-wallet) → `/pesanan/<id>` → setelah lunas
  token aktivasi muncul otomatis → `/daftar?token=…`.
- **Callback Tripay:** set di dashboard merchant ke `https://<domain>/api/payments/tripay/callback`. Signature
  `X-Callback-Signature` diverifikasi, lalu status dicek ulang ke API Tripay sebelum pesanan ditandai lunas.
  Callback dengan `merchant_ref` yang tidak diawali `UDG-` diabaikan (aman jika merchant dipakai situs lain).
- **Reseller:** daftar di `/reseller`, disetujui admin di `/admin/reseller` (bisa pakai tarif default atau tarif
  khusus). Pembeli lewat `/r/KODE` atau `?ref=KODE` tercatat 30 hari sebagai penjualan reseller; reseller juga bisa
  membuat link pembayaran dari dashboard-nya.
- **Bagi hasil:** dihitung dari harga paket (biaya gateway ditanggung pembeli/platform) dan tarifnya dikunci per
  pesanan. Semua saldo berasal dari ledger append-only `ledger_entries`.
- **Pencairan:** reseller mengajukan kapan saja (≥ minimum), saldo langsung ditahan, dan dijadwalkan ke tanggal
  pencairan berikutnya (atur di `/admin/pengaturan`, default 5 & 25). Admin mentransfer **manual** ke rekening
  reseller, lalu menandai "sudah ditransfer" dengan nomor referensi di `/admin/pencairan` (ada ekspor CSV).
- **Produksi:** ganti `NUXT_TRIPAY_MODE=production` + kunci produksi, dan ubah URL callback di merchant produksi.

## Database

Migrasi ada di `supabase/migrations/` (sudah diterapkan ke project Supabase). Ringkasan:

- `themes`, `categories`, `packages` — katalog (publik baca yang *published*)
- `access_tokens` — token 6 karakter terikat tema + kuota paket; dibuat lewat RPC `admin_generate_token`
- `invitations` — workspace user, dibuat otomatis saat registrasi (trigger `handle_new_user` → `redeem_token_for`)
- `guests` — trigger `enforce_guest_limit` mengunci penambahan tamu saat kuota penuh (termasuk import massal)
- `rsvps` — diisi tamu lewat RPC `submit_rsvp` (maks. 3 kiriman per nama)
- RPC publik: `check_token`, `is_slug_available`, `get_public_invitation`, `get_wishes`, `mark_guest_opened`, `submit_rsvp`
- `admin_stats` — data dashboard analitik (khusus admin)

Tema bawaan ditulis di `scripts/themes/*.ts`. Setelah mengubahnya, jalankan `npm run seed:themes` lalu jalankan
`supabase/seed/themes.sql` di SQL Editor.

## Struktur

```
app/            halaman, komponen (invite/, catalog/, dashboard/, admin/), composables
server/         API admin (compile, generate AI, simpan tema), util kompilasi CSS & AI
shared/theme/   kontrak framework tema: konstanta, skema, validator, konten, konteks placeholder
scripts/        tema bawaan + pembuat seed SQL
supabase/       migrasi & seed
public/theme-assets/  ornamen SVG tema bawaan (ilustrasi mempelai faceless, lampion, pola, dll.)
prototype/      prototipe HTML statis awal
```
