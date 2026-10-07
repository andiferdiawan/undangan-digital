import type { H3Event } from 'h3'

/**
 * Kunci IndexNow (protokol Bing/Yandex/Seznam/Naver untuk memberi tahu URL baru/berubah secara instan).
 * Wajib publik: file public/<kunci>.txt berisi kunci ini, jadi tidak perlu dirahasiakan.
 */
export const INDEXNOW_KEY = '08931bd5378fa4a1181bac9db673ad48'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS = 10_000

export interface IndexNowResult { sent: number, status: number | null, skipped?: string, error?: string }

/**
 * Kirim path situs (mis. "/tema/xyz") atau URL absolut milik situs ke IndexNow. Tidak pernah melempar error:
 * dipanggil sesudah aksi utama (tayangkan tema, terbitkan artikel), dan kegagalan cukup dicatat di log.
 * Dilewati saat `nuxi dev` (siteUrl bawaan menunjuk situs produksi) dan di localhost/http.
 */
export async function submitIndexNow(event: H3Event, paths: string[], o: { timeoutMs?: number } = {}): Promise<IndexNowResult> {
  if (import.meta.dev) return { sent: 0, status: null, skipped: 'Mode pengembangan' }
  const origin = siteOrigin(event)
  const site = new URL(origin)
  if (site.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(site.hostname))
    return { sent: 0, status: null, skipped: `Origin ${origin} bukan situs https publik` }

  const urlList = [...new Set(paths.map((p) => {
    try {
      const u = new URL(p, `${origin}/`)
      return u.origin === site.origin ? u.href : null
    }
    catch {
      return null
    }
  }).filter((u): u is string => !!u))].slice(0, MAX_URLS)
  if (!urlList.length) return { sent: 0, status: null, skipped: 'Tidak ada URL' }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: site.host, key: INDEXNOW_KEY, keyLocation: `${origin}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(o.timeoutMs ?? 5000),
    })
    // 200 = diterima, 202 = diterima (kunci sedang diverifikasi); selain itu catat untuk diperiksa
    if (res.status !== 200 && res.status !== 202) {
      console.warn(`[indexnow] status ${res.status} untuk ${urlList.length} URL:`, (await res.text().catch(() => '')).slice(0, 300))
      return { sent: urlList.length, status: res.status }
    }
    const at = new Date().toISOString()
    await recordSeo(event, urlList.map(u => ({ path: sitePath(origin, u)!, indexnow_at: at })))
    return { sent: urlList.length, status: res.status }
  }
  catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    console.warn('[indexnow] gagal mengirim:', error)
    return { sent: 0, status: null, error }
  }
}

/** URL yang perlu diberitahukan untuk sebuah tema: halaman tema, katalog, dan katalog jenis acara & kategorinya. */
export async function themeIndexPaths(event: H3Event, t: { slug: string, category_id: number | null }): Promise<string[]> {
  const paths = [`/tema/${encodeURIComponent(t.slug)}`, '/katalog']
  if (t.category_id) {
    const { data } = await publicDb(event).from('categories').select('slug, group_slug').eq('id', t.category_id).maybeSingle()
    const cat = data as { slug: string, group_slug: string | null } | null
    if (cat) {
      const group = cat.group_slug ?? 'pernikahan'
      paths.push(`/katalog/${group}`, `/katalog/${group}/${cat.slug}`)
    }
  }
  return paths
}
