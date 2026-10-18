/**
 * Google tag (gtag.js) untuk Google Ads / Google Analytics, diatur di Admin → Pengaturan.
 * Admin boleh menempel seluruh kode dari Google; yang disimpan hanya ID tag & tujuan konversi ("send_to"),
 * lalu skripnya dirangkai di sini. Format divalidasi ketat (juga di database) karena dimasukkan ke skrip halaman.
 */

export const GTAG_ID = /^(?:AW|G|GT|DC)-[A-Z0-9]{4,20}$/
export const ADS_SEND_TO = /^AW-\d{6,15}\/[\w-]{4,40}$/

export interface GoogleTagSettings { google_tag_ids: string[] | null, google_ads_purchase: string | null }

/** Ambil ID tag dari teks yang ditempel: kode gtag.js lengkap, atau ID dipisah koma/spasi. */
export function parseTagIds(text: string): string[] {
  const found = String(text ?? '').toUpperCase().match(/\b(?:AW|G|GT|DC)-[A-Z0-9]{4,20}\b/g) ?? []
  return [...new Set(found)].filter(id => GTAG_ID.test(id)).slice(0, 5)
}

/** Ambil tujuan konversi dari teks yang ditempel: cuplikan event lengkap ('send_to': '…') atau "AW-…/label" saja. */
export function parseSendTo(text: string): string | null {
  const m = String(text ?? '').match(/AW-\d{6,15}\/[\w-]{4,40}/)
  return m && ADS_SEND_TO.test(m[0]) ? m[0] : null
}

/** ID yang dipasang di <head>: ID tersimpan + akun Google Ads dari tujuan konversi (agar konversi tetap terkirim). */
export function activeTagIds(s: GoogleTagSettings | null | undefined): string[] {
  const ids = (s?.google_tag_ids ?? []).filter(id => GTAG_ID.test(id))
  const purchase = s?.google_ads_purchase && ADS_SEND_TO.test(s.google_ads_purchase) ? s.google_ads_purchase.split('/')[0]! : null
  return [...new Set(purchase ? [...ids, purchase] : ids)]
}

/** Isi skrip inline gtag (sama dengan kode resmi Google), satu baris config per ID. */
export function gtagInline(ids: string[]): string {
  return [
    'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'js\',new Date());',
    ...ids.filter(id => GTAG_ID.test(id)).map(id => `gtag('config','${id}');`),
  ].join('')
}

/** Halaman yang tidak dipasangi tag (area admin tidak perlu dilacak). */
export const isGoogleTagExcluded = (path: string) => path === '/admin' || path.startsWith('/admin/')

type Gtag = (...args: unknown[]) => void
const gtagFn = () => (import.meta.client ? (window as unknown as { gtag?: Gtag }).gtag : undefined)

/**
 * Konversi pembelian Google Ads, sekali per pesanan: ditandai di localStorage agar tidak terkirim ulang saat halaman
 * dibuka lagi, dan transaction_id membuat Google Ads mengabaikan duplikat dari perangkat lain.
 */
export function reportAdsPurchase(sendTo: string | null | undefined, order: { id: string, merchant_ref: string, amount: number }) {
  const gtag = gtagFn()
  if (!gtag || !sendTo || !ADS_SEND_TO.test(sendTo)) return false
  const key = `uv-ads-conv-${order.id}`
  try {
    if (localStorage.getItem(key)) return false
    localStorage.setItem(key, new Date().toISOString())
  }
  catch { /* mode privat: tetap kirim, Google Ads menyaring duplikat lewat transaction_id */ }
  gtag('event', 'conversion', { send_to: sendTo, value: Number(order.amount) || 0, currency: 'IDR', transaction_id: order.merchant_ref })
  return true
}

/** Page view untuk akun Google Ads saat pindah halaman di dalam aplikasi (GA4 sudah mencatatnya sendiri). */
export function reportAdsPageView(ids: string[]) {
  const gtag = gtagFn()
  const ads = ids.filter(id => id.startsWith('AW-'))
  if (!gtag || !ads.length) return
  gtag('event', 'page_view', { send_to: ads, page_location: location.href, page_path: location.pathname, page_title: document.title })
}
