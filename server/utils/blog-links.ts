import { MD_LINK, internalKey, isOwnHost, normalizeUrl, ownLinkPath } from '../../shared/blog-links'

/**
 * Pemeriksaan & perbaikan tautan artikel blog: dipakai generator AI (sebelum artikel disimpan) dan alat audit
 * admin (artikel yang sudah ada). Tautan internal berdomain salah diubah ke path relatif yang valid; tautan
 * eksternal di domain lama yang sudah pindah dialihkan ke domain barunya; yang rusak (404, domain tidak ada,
 * sertifikat bermasalah, server error, tidak merespons) dilepas — teksnya tetap.
 */

export interface LinkCheck {
  url: string
  ok: boolean
  status?: number
  /** Alasan singkat (bahasa Indonesia) untuk laporan admin. */
  reason: string
  /** Tidak sempat diperiksa karena batas waktu proses. */
  unchecked?: boolean
}

export interface LinkChange {
  kind: 'domain' | 'internal' | 'external' | 'moved' | 'source'
  label: string
  from: string
  /** Tujuan baru (path relatif) atau null bila tautan dilepas/dihapus. */
  to: string | null
  reason?: string
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>
type Probe = { status?: number, error?: string, fatal?: boolean }

const UA = 'Mozilla/5.0 (compatible; UndanganVirtualLinkCheck/1.0; +https://undanganvirtual.com)'

/**
 * Domain situs resmi yang sudah tidak aktif → domain penggantinya (path sama). Model AI masih sering menulis
 * domain lama dari data latihnya. URL hasil pengalihan tetap diperiksa seperti tautan lain.
 */
const MOVED_HOSTS: Record<string, string> = {
  'kbbi.kemdikbud.go.id': 'kbbi.kemendikdasmen.go.id',
  'kbbi.kemendikbud.go.id': 'kbbi.kemendikdasmen.go.id',
  'www.indonesia.go.id': 'indonesia.go.id',
  'www.kemenag.go.id': 'kemenag.go.id',
}

/** URL di domain lama yang sudah pindah → URL di domain barunya; selain itu apa adanya. */
export function movedUrl(url: string): string {
  try {
    const u = new URL(url.trim())
    const to = MOVED_HOSTS[u.hostname.toLowerCase()]
    if (!to) return url
    u.hostname = to
    return u.toString()
  }
  catch { return url }
}

function errorReason(e: unknown, timedOut: boolean): { error: string, fatal: boolean } {
  if (timedOut) return { error: 'tidak merespons (waktu habis)', fatal: false }
  const err = e as { code?: string, message?: string, cause?: { code?: string, message?: string } }
  const code = String(err?.cause?.code ?? err?.code ?? '')
  if (code === 'ENOTFOUND') return { error: 'domain tidak ditemukan', fatal: true }
  if (code === 'EAI_AGAIN') return { error: 'domain tidak dapat dihubungi (DNS)', fatal: false }
  if (/CERT|SSL|TLS|ERR_TLS/i.test(code)) return { error: 'sertifikat HTTPS bermasalah', fatal: true }
  if (code === 'ECONNREFUSED') return { error: 'koneksi ditolak server', fatal: false }
  if (code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'ETIMEDOUT') return { error: 'tidak merespons (waktu habis)', fatal: false }
  return { error: `gagal dibuka (${(err?.cause?.message ?? err?.message ?? code) || 'galat jaringan'})`.slice(0, 160), fatal: false }
}

async function probe(fetchImpl: FetchLike, url: string, method: 'HEAD' | 'GET', timeoutMs: number): Promise<Probe> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetchImpl(url, {
      method,
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, 'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', 'accept-language': 'id,en;q=0.8' },
    })
    // Isi halaman tidak dibutuhkan
    res.body?.cancel().catch(() => {})
    return { status: res.status }
  }
  catch (e) {
    return errorReason(e, ctrl.signal.aborted)
  }
  finally {
    clearTimeout(timer)
  }
}

const verdict = (url: string, p: Probe): LinkCheck | null => {
  if (p.status === undefined) return null
  if (p.status < 400) return { url, ok: true, status: p.status, reason: `OK (HTTP ${p.status})` }
  if (p.status === 404 || p.status === 410) return { url, ok: false, status: p.status, reason: `halaman tidak ditemukan (HTTP ${p.status})` }
  // 4xx lain (400/401/403/405/429…) = server menyaring pemeriksa otomatis; pengunjung dengan browser tetap bisa membuka
  if (p.status < 500) return { url, ok: true, status: p.status, reason: `halaman ada, pemeriksa otomatis dibatasi (HTTP ${p.status})` }
  return null // 5xx: coba ulang dulu
}

/**
 * Periksa satu URL: HEAD (ringan), lalu GET bila HEAD gagal/ditolak (banyak server tidak melayani HEAD dengan benar).
 * Galat sementara (server error, waktu habis, koneksi) dicoba ulang sekali selama waktu masih ada.
 */
async function checkOne(fetchImpl: FetchLike, url: string, deadline: number, perRequestMs: number): Promise<LinkCheck> {
  const budget = () => Math.min(perRequestMs, deadline - Date.now())
  const unchecked: LinkCheck = { url, ok: false, unchecked: true, reason: 'tidak sempat diperiksa' }
  if (budget() < 1_500) return unchecked
  const head = await probe(fetchImpl, url, 'HEAD', budget())
  if (head.status !== undefined && head.status < 400) return verdict(url, head)!
  if (head.fatal) return { url, ok: false, reason: head.error! }

  let last: Probe = head
  for (let attempt = 0; attempt < 2; attempt++) {
    if (budget() < 1_500) break
    if (attempt) await new Promise(r => setTimeout(r, Math.min(800, Math.max(0, deadline - Date.now() - 1_500))))
    const get = await probe(fetchImpl, url, 'GET', budget())
    last = get
    const v = verdict(url, get)
    if (v) return v
    if (get.fatal) return { url, ok: false, reason: get.error! }
  }
  if (last.status !== undefined) return { url, ok: false, status: last.status, reason: `server error (HTTP ${last.status})` }
  return last.error ? { url, ok: false, reason: last.error } : unchecked
}

/**
 * Periksa banyak URL eksternal sekaligus (konkurensi terbatas, satu kali per URL). Hasil dikunci dengan URL baku
 * (normalizeUrl). URL yang tidak sempat diperiksa sebelum `deadline` ditandai `unchecked`.
 */
export async function checkExternalUrls(urls: string[], o: { deadline: number, perRequestMs?: number, concurrency?: number, fetchImpl?: FetchLike }) {
  const list = [...new Set(urls.map(normalizeUrl))].filter(u => /^https?:\/\//i.test(u))
  const out = new Map<string, LinkCheck>()
  const fetchImpl = o.fetchImpl ?? ((u, init) => fetch(u, init))
  let next = 0
  const worker = async () => {
    while (next < list.length) {
      const url = list[next++]!
      out.set(url, await checkOne(fetchImpl, url, o.deadline, o.perRequestMs ?? 8_000))
    }
  }
  await Promise.all(Array.from({ length: Math.min(o.concurrency ?? 6, list.length) }, worker))
  return out
}

/** Semua URL eksternal (bukan situs sendiri/tiruan merek) di isi artikel & daftar sumber, setelah pengalihan domain pindah. */
export function externalUrls(body: string, sources: { url: string }[], siteHost: string): string[] {
  const urls: string[] = []
  for (const m of String(body ?? '').matchAll(MD_LINK)) urls.push(m[2]!.trim())
  for (const s of sources ?? []) urls.push(String(s?.url ?? '').trim())
  return [...new Set(urls.filter(u => /^https?:\/\//i.test(u) && !ownLinkPath(u, siteHost)).map(u => normalizeUrl(movedUrl(u))))]
}

/**
 * Perbaiki tautan di isi artikel & daftar sumber:
 * - URL absolut ke situs sendiri/tiruan merek (mis. https://undanganvirtual.id/blog/x) → path relatif bila halamannya
 *   ada, selain itu dijadikan teks biasa;
 * - path internal yang halamannya tidak ada → teks biasa;
 * - URL eksternal di domain lama yang sudah pindah → URL di domain barunya (bila tidak rusak);
 * - URL eksternal yang rusak (`broken`: URL baku → alasan) → teks biasa;
 * - sumber: alihkan domain pindah; buang yang bukan https, berdomain situs sendiri/tiruan merek, atau rusak.
 */
export function repairLinks(o: {
  body: string
  sources: { title: string, url: string }[]
  isValid: (key: string) => boolean
  siteHost: string
  broken: Map<string, string>
}) {
  const changes: LinkChange[] = []
  const body = String(o.body ?? '').replace(MD_LINK, (whole, label: string, rawUrl: string) => {
    const url = rawUrl.trim()
    const own = ownLinkPath(url, o.siteHost)
    if (own !== null) {
      const key = internalKey(own)
      if (o.isValid(key)) {
        changes.push({ kind: 'domain', label, from: url, to: key })
        return `[${label}](${key})`
      }
      changes.push({ kind: 'domain', label, from: url, to: null, reason: 'halaman tidak ada di situs' })
      return label
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
      if (o.isValid(internalKey(url))) return whole
      changes.push({ kind: 'internal', label, from: url, to: null, reason: 'halaman tidak ada di situs' })
      return label
    }
    if (/^https?:\/\//i.test(url)) {
      const moved = movedUrl(url)
      const why = o.broken.get(normalizeUrl(moved))
      if (why) {
        changes.push({ kind: 'external', label, from: url, to: null, reason: why })
        return label
      }
      if (moved !== url) {
        changes.push({ kind: 'moved', label, from: url, to: moved, reason: 'situs pindah ke domain baru' })
        return `[${label}](${moved})`
      }
    }
    return whole
  })

  const sources: { title: string, url: string }[] = []
  for (const s of o.sources ?? []) {
    const orig = String(s?.url ?? '').trim()
    const url = movedUrl(orig)
    let reason: string | undefined
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:') reason = 'bukan https'
      else if (isOwnHost(u.hostname, o.siteHost)) reason = 'domain situs sendiri, bukan sumber eksternal'
    }
    catch { reason = 'URL tidak valid' }
    reason ??= o.broken.get(normalizeUrl(url))
    if (reason) {
      changes.push({ kind: 'source', label: String(s?.title ?? ''), from: orig, to: null, reason })
      continue
    }
    if (url !== orig) changes.push({ kind: 'source', label: String(s?.title ?? ''), from: orig, to: url, reason: 'situs pindah ke domain baru' })
    if (!sources.some(x => normalizeUrl(x.url) === normalizeUrl(url))) sources.push({ title: String(s.title ?? ''), url })
  }
  return { body, sources, changes }
}

/** URL rusak/tidak terverifikasi dari hasil pemeriksaan → peta untuk repairLinks. */
export function brokenMap(checks: Map<string, LinkCheck>, o: { includeUnchecked: boolean }) {
  const m = new Map<string, string>()
  for (const [url, c] of checks) {
    if (!c.ok && (o.includeUnchecked || !c.unchecked)) m.set(url, c.reason)
  }
  return m
}
