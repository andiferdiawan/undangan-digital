export const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const tanggal = (iso: string | null | undefined, withTime = false) => {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(iso))
}

/** Ubah pesan error Supabase/Postgres menjadi kalimat yang ramah. */
export function friendlyError(err: { message?: string, hint?: string } | null | undefined): string {
  if (!err) return ''
  const m = err.message ?? ''
  const map: Record<string, string> = {
    TOKEN_INVALID: 'Token tidak ditemukan, sudah dipakai, atau kedaluwarsa.',
    SLUG_UNAVAILABLE: 'Alamat undangan sudah dipakai atau tidak valid.',
    GUEST_LIMIT_REACHED: err.hint || 'Kuota tamu paket Anda sudah penuh.',
    FORBIDDEN: 'Anda tidak memiliki akses.',
    THEME_NOT_PUBLISHED: 'Tema belum dipublikasikan.',
    PACKAGE_NOT_FOUND: 'Paket tidak ditemukan.',
    INSUFFICIENT_BALANCE: err.hint || 'Saldo tidak mencukupi.',
    BELOW_MINIMUM: err.hint || 'Nominal di bawah minimal pencairan.',
    RESELLER_INACTIVE: 'Akun reseller belum aktif.',
    NOT_CANCELLABLE: 'Pengajuan sudah diproses dan tidak bisa dibatalkan.',
    ALREADY_PROCESSED: 'Pengajuan ini sudah diproses.',
    BANK_MISSING: err.hint || 'Lengkapi data rekening terlebih dahulu.',
    ALREADY_RESELLER: 'Akun ini sudah terdaftar sebagai reseller.',
    CODE_TAKEN: 'Kode reseller sudah dipakai, coba yang lain.',
    USER_NOT_FOUND: 'Akun tidak ditemukan.',
    NEED_PASSWORD: 'Email ini belum punya akun. Isi kata sandi sementara untuk membuatkan akunnya.',
    EMAIL_EXISTS: 'Email sudah terdaftar tetapi profilnya tidak ditemukan. Minta pemilik masuk sekali, lalu coba lagi.',
    'email rate limit exceeded': 'Batas kirim email Supabase tercapai. Coba lagi nanti atau pasang SMTP sendiri (Resend).',
    'Invalid login credentials': 'Email atau password salah.',
    'User already registered': 'Email sudah terdaftar. Silakan masuk.',
    'Email not confirmed': 'Email belum dikonfirmasi. Cek kotak masuk Anda.',
  }
  for (const [k, v] of Object.entries(map)) if (m.includes(k)) return v
  if (m.includes('duplicate key') && m.includes('guests')) return 'Nama tamu sudah ada di daftar.'
  if (m.includes('Database error saving new user')) return 'Registrasi gagal: token atau alamat undangan tidak valid.'
  return m || 'Terjadi kesalahan, coba lagi.'
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50)
}

/** Nomor dari runtime config bisa terbaca sebagai angka, jadi selalu dijadikan string. */
export function waLink(phone: string | number, text: string) {
  return `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}
