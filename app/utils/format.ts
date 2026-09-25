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

export function waLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}
