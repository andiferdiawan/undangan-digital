/** Identitas brand & teks SEO dipakai bersama di seluruh halaman. */
export const BRAND = {
  name: 'Undangan Virtual',
  tagline: 'Satu Link, Sejuta Doa Restu',
  description:
    'Buat undangan pernikahan digital syar\'i dan modern dalam hitungan menit. Pilih tema, isi dari ponsel, lalu kirim link personal ke setiap tamu, lengkap dengan RSVP, musik latar, peta lokasi, dan amplop digital.',
  keywords:
    'undangan digital, undangan pernikahan digital, undangan online, undangan website, undangan syar\'i, undangan nikah islami, undangan virtual, e-invitation pernikahan',
}

/** Halaman privat/transaksional yang tidak perlu diindeks mesin pencari. */
export const NOINDEX_PREFIXES = ['/dashboard', '/admin', '/masuk', '/daftar', '/confirm', '/reset-password', '/checkout', '/pesanan', '/r/', '/reseller/dashboard', '/pratinjau/']

/** Origin kanonik situs (NUXT_PUBLIC_SITE_URL), jatuh ke origin permintaan saat kosong. */
export function useSiteOrigin() {
  const config = useRuntimeConfig()
  const req = useRequestURL()
  return String(config.public.siteUrl || req.origin).replace(/\/$/, '')
}

/** Sisipkan JSON-LD (schema.org) ke <head>. */
export function useJsonLd(key: string, data: () => Record<string, unknown> | null) {
  useHead(() => {
    const d = data()
    return d
      ? { script: [{ key: `ld-${key}`, type: 'application/ld+json', innerHTML: JSON.stringify(d).replace(/</g, '\\u003c') }] }
      : {}
  })
}

/** Hash pendek (FNV-1a) untuk cache-buster URL gambar pratinjau. */
export function shortHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}
