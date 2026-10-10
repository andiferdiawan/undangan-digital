/**
 * Aturan tautan artikel blog yang dipakai bersama oleh generator AI, alat audit admin, dan renderer.
 *
 * Model AI kadang menulis tautan internal dengan domain yang salah (mis. https://undanganvirtual.id/blog/...)
 * padahal situs ini undanganvirtual.com. Domain milik sendiri maupun domain lain yang namanya sama dengan merek
 * (TLD apa pun, dengan/tanpa tanda hubung atau www) selalu diperlakukan sebagai tautan internal: diubah ke path
 * relatif, lalu divalidasi ke daftar halaman yang benar-benar ada.
 */

/** Nama merek tanpa spasi/tanda hubung/TLD: undanganvirtual.com, undangan-virtual.id, www.undanganvirtual.co.id. */
export const SITE_BRAND = 'undanganvirtual'

const bare = (host: string) => host.trim().toLowerCase().replace(/\.$/, '').replace(/^www\./, '')

/** Host situs sendiri (persis/subdomain) atau domain tiruan merek. */
export function isOwnHost(hostname: string, siteHost?: string): boolean {
  const h = bare(hostname)
  if (!h) return false
  const site = siteHost ? bare(siteHost) : ''
  if (site && (h === site || h.endsWith(`.${site}`))) return true
  // Label sebelum TLD yang sama dengan merek: undanganvirtual.id, undangan-virtual.co.id, blog.undanganvirtual.net
  return h.split('.').slice(0, -1).some(label => label.replace(/-/g, '') === SITE_BRAND)
}

/** Kunci halaman internal dari path: "/#harga" apa adanya; selain itu tanpa query, hash & garis miring akhir. */
export function internalKey(path: string): string {
  const p = path.trim()
  if (p.startsWith('/#')) return p
  return p.split('#')[0]!.split('?')[0]!.replace(/\/+$/, '') || '/'
}

/** URL absolut ke situs sendiri/tiruan merek → path relatif ("/blog/x", "/#harga"); selain itu null. */
export function ownLinkPath(url: string, siteHost?: string): string | null {
  let u: URL
  try { u = new URL(url.trim()) }
  catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  if (!isOwnHost(u.hostname, siteHost)) return null
  const path = decodeSafe(u.pathname) || '/'
  return path === '/' && u.hash ? `/${u.hash}` : `${path}${u.search}${u.hash}`
}

const decodeSafe = (s: string) => {
  try { return decodeURI(s) }
  catch { return s }
}

/** Bentuk baku URL eksternal (untuk membandingkan isi artikel, sumber, dan hasil pemeriksaan). */
export function normalizeUrl(url: string): string {
  try { return new URL(url.trim()).toString() }
  catch { return url.trim() }
}

/**
 * Tautan Markdown [teks](url) — sama dengan pola renderer. URL boleh memuat satu tingkat tanda kurung berpasangan,
 * mis. https://id.wikipedia.org/wiki/Dasbor_(komputasi).
 */
export const MD_LINK = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g

/** URL eksternal untuk ditulis di Markdown: tanda kurung di-encode agar tidak memotong sintaks tautan. */
export const mdUrl = (url: string) => url.replace(/\(/g, '%28').replace(/\)/g, '%29')
