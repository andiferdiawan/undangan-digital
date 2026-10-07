-- Buku tamu: catat kapan undangan dikirim ke tamu lewat tombol WhatsApp (bisa ditandai/dibatalkan manual).
-- RLS "tamu: pemilik kelola" (for all) sudah mengizinkan pemilik mengubah kolom ini.
alter table public.guests add column if not exists sent_at timestamptz;

comment on column public.guests.sent_at is 'Kapan undangan dikirim ke tamu (klik tombol WhatsApp di Buku Tamu); null = belum dikirim';
