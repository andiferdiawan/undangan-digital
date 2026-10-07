/**
 * Nomor telepon Indonesia → format 62xxxxxxxx (sama dengan normalizePhone di server/utils/server-rpc.ts).
 * Menerima 0812…, +62 812-…, 62812…, 812…; selain itu null.
 */
export function normalizePhoneId(v: string | null | undefined): string | null {
  let d = String(v ?? '').replace(/\D/g, '')
  if (d.startsWith('0')) d = `62${d.slice(1)}`
  else if (d.startsWith('8')) d = `62${d}`
  return /^62\d{8,14}$/.test(d) ? d : null
}

/** Nomor HP (bukan telepon rumah/kantor) — hanya nomor seperti ini yang lazim punya WhatsApp. */
export const isMobileId = (p: string | null | undefined) => /^628\d{7,12}$/.test(normalizePhoneId(p) ?? '')

/** Tampilan rapi: 6281234567890 → +62 812-3456-7890 (nomor rumah/kantor: 0 + angka, tanpa pemisah) */
export function formatPhoneId(v: string | null | undefined): string {
  const p = normalizePhoneId(v)
  if (!p) return String(v ?? '')
  const rest = p.slice(2)
  if (!isMobileId(p)) return `0${rest}`
  return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}${rest.length > 7 ? `-${rest.slice(7)}` : ''}`
}
