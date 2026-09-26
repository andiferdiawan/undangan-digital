/**
 * Menghasilkan template email Supabase Auth bermerek Undangan Virtual ke supabase/templates/.
 * Jalankan: npx tsx scripts/build-email-templates.ts
 * Lalu salin subjek & isi ke Supabase Dashboard → Authentication → Emails (lihat supabase/templates/README.md).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { brandEmailHtml, type BrandEmail } from '../server/utils/email-layout'

// Variabel Go template Supabase: {{ .ConfirmationURL }}, {{ .Email }}, {{ .NewEmail }}
const URL = '{{ .ConfirmationURL }}'
const templates: Record<string, { subject: string, email: BrandEmail }> = {
  confirmation: {
    subject: 'Konfirmasi email Anda — Undangan Virtual',
    email: {
      preheader: 'Satu langkah lagi untuk mulai membuat undangan digital Anda.',
      title: 'Assalamu\'alaikum, selamat datang!',
      body: [
        'Terima kasih telah mendaftar di <strong>Undangan Virtual</strong>. Silakan konfirmasi alamat email <strong>{{ .Email }}</strong> agar akun Anda aktif.',
      ],
      button: { label: 'Konfirmasi Email', url: URL },
      note: 'Jika Anda tidak merasa mendaftar, abaikan email ini. Akun tidak akan aktif tanpa konfirmasi.',
    },
  },
  recovery: {
    subject: 'Atur ulang kata sandi — Undangan Virtual',
    email: {
      preheader: 'Tautan untuk membuat kata sandi baru akun Undangan Virtual Anda.',
      title: 'Lupa kata sandi?',
      body: [
        'Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>{{ .Email }}</strong>. Klik tombol di bawah untuk membuat kata sandi baru.',
      ],
      button: { label: 'Buat Kata Sandi Baru', url: URL },
      note: 'Tautan ini hanya berlaku sebentar dan sekali pakai. Jika Anda tidak memintanya, abaikan email ini; kata sandi Anda tetap aman.',
    },
  },
  magic_link: {
    subject: 'Tautan masuk Anda — Undangan Virtual',
    email: {
      preheader: 'Masuk ke akun Undangan Virtual tanpa kata sandi.',
      title: 'Masuk ke Undangan Virtual',
      body: ['Klik tombol di bawah untuk masuk ke akun <strong>{{ .Email }}</strong>.'],
      button: { label: 'Masuk Sekarang', url: URL },
      note: 'Tautan ini hanya berlaku sebentar dan sekali pakai. Jika Anda tidak memintanya, abaikan email ini.',
    },
  },
  email_change: {
    subject: 'Konfirmasi perubahan email — Undangan Virtual',
    email: {
      preheader: 'Konfirmasi alamat email baru akun Undangan Virtual Anda.',
      title: 'Konfirmasi email baru',
      body: ['Anda meminta perubahan email akun dari <strong>{{ .Email }}</strong> menjadi <strong>{{ .NewEmail }}</strong>. Klik tombol di bawah untuk mengonfirmasi.'],
      button: { label: 'Konfirmasi Perubahan', url: URL },
      note: 'Jika Anda tidak meminta perubahan ini, segera hubungi kami melalui WhatsApp.',
    },
  },
  invite: {
    subject: 'Anda diundang ke Undangan Virtual',
    email: {
      preheader: 'Aktifkan akun Undangan Virtual Anda.',
      title: 'Anda diundang!',
      body: ['Akun <strong>{{ .Email }}</strong> telah dibuatkan di <strong>Undangan Virtual</strong>. Klik tombol di bawah untuk mengaktifkannya dan membuat kata sandi.'],
      button: { label: 'Aktifkan Akun', url: URL },
    },
  },
  reauthentication: {
    subject: 'Kode verifikasi — Undangan Virtual',
    email: {
      preheader: 'Kode verifikasi untuk tindakan di akun Anda.',
      title: 'Kode verifikasi Anda',
      body: ['Gunakan kode berikut untuk melanjutkan:', '<strong style="font-size:26px;letter-spacing:6px;color:#2f4a3a">{{ .Token }}</strong>'],
      note: 'Jangan bagikan kode ini kepada siapa pun, termasuk yang mengaku dari Undangan Virtual.',
    },
  },
}

mkdirSync('supabase/templates', { recursive: true })
const rows: string[] = []
for (const [name, t] of Object.entries(templates)) {
  writeFileSync(`supabase/templates/${name}.html`, brandEmailHtml(t.email))
  rows.push(`| ${name} | ${t.subject} | \`supabase/templates/${name}.html\` |`)
}
writeFileSync('supabase/templates/README.md', `# Template email Supabase Auth — Undangan Virtual

Dihasilkan oleh \`scripts/build-email-templates.ts\` (jangan edit HTML-nya manual; ubah script lalu jalankan ulang).

Pasang di Supabase Dashboard → Authentication → Emails → Templates: salin **Subject** dan isi file HTML ke tiap template.

| Template | Subject | File |
|---|---|---|
${rows.join('\n')}

Nama pengirim ("Undangan Virtual <noreply@undanganvirtual.com>") diatur lewat **Custom SMTP**
(Authentication → Emails → SMTP Settings), bukan di template.
`)
console.log(`${rows.length} template ditulis ke supabase/templates/`)
