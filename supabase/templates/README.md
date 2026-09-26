# Template email Supabase Auth — Undangan Virtual

Dihasilkan oleh `scripts/build-email-templates.ts` (jangan edit HTML-nya manual; ubah script lalu jalankan ulang).

Pasang di Supabase Dashboard → Authentication → Emails → Templates: salin **Subject** dan isi file HTML ke tiap template.

| Template | Subject | File |
|---|---|---|
| confirmation | Konfirmasi email Anda — Undangan Virtual | `supabase/templates/confirmation.html` |
| recovery | Atur ulang kata sandi — Undangan Virtual | `supabase/templates/recovery.html` |
| magic_link | Tautan masuk Anda — Undangan Virtual | `supabase/templates/magic_link.html` |
| email_change | Konfirmasi perubahan email — Undangan Virtual | `supabase/templates/email_change.html` |
| invite | Anda diundang ke Undangan Virtual | `supabase/templates/invite.html` |
| reauthentication | Kode verifikasi — Undangan Virtual | `supabase/templates/reauthentication.html` |

Nama pengirim ("Undangan Virtual <noreply@undanganvirtual.com>") diatur lewat **Custom SMTP**
(Authentication → Emails → SMTP Settings), bukan di template.
