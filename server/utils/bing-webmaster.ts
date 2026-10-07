import type { H3Event } from 'h3'
import { SearchApiError, searchHttpError, seoConfig } from './seo-config'

/**
 * Bing Webmaster Tools API (API key dari Bing Webmaster → Settings → API Access): kuota & kirim URL
 * (SubmitUrlBatch, maks. 500 per panggilan), dan info rayap per URL (GetUrlInfo).
 */
const API = 'https://ssl.bing.com/webmaster/api.svc/json'
export const BING_BATCH = 500

const ERRORS: Record<number, string> = {
  3: 'API key Bing tidak valid. Salin ulang dari Bing Webmaster > Settings > API Access.',
  4: 'Bing membatasi permintaan (throttle). Coba lagi beberapa menit lagi.',
  5: 'Bing membatasi permintaan untuk situs ini. Coba lagi beberapa menit lagi.',
  6: 'Akun Bing Webmaster ini diblokir.',
  14: 'Situs belum terverifikasi di akun Bing Webmaster pemilik API key ini.',
}

async function bing<T>(key: string, method: string, o: { query?: Record<string, string>, body?: unknown } = {}): Promise<T> {
  const url = new URL(`${API}/${method}`)
  url.searchParams.set('apikey', key)
  for (const [k, v] of Object.entries(o.query ?? {})) url.searchParams.set(k, v)
  const res = await fetch(url, {
    method: o.body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: o.body === undefined ? undefined : JSON.stringify(o.body),
    signal: AbortSignal.timeout(20_000),
  })
  const text = await res.text()
  let data: { d?: T, ErrorCode?: number, Message?: string } = {}
  try {
    data = text ? JSON.parse(text) : {}
  }
  catch { /* bukan JSON */ }
  if (!res.ok || data.ErrorCode) {
    const raw = data.Message || text.slice(0, 200) || `status ${res.status}`
    const msg = /quota/i.test(raw) ? `Kuota kirim URL Bing hari ini habis. (${raw})` : ERRORS[data.ErrorCode ?? 0] ?? `Bing API: ${raw}`
    throw new SearchApiError(res.status === 200 ? 400 : res.status, msg)
  }
  return data.d as T
}

/** URL situs persis seperti terdaftar di Bing Webmaster (mis. "https://contoh.com/"), dicocokkan lewat host. */
const siteCache = new Map<string, string>()
export async function bingSite(key: string, origin: string): Promise<string> {
  const host = new URL(origin).hostname.replace(/^www\./, '')
  const cached = siteCache.get(`${key}|${host}`)
  if (cached) return cached
  const sites = await bing<{ Url: string, IsVerified: boolean }[]>(key, 'GetUserSites')
  const hostOf = (u: string) => {
    try {
      return new URL(u).hostname
    }
    catch {
      return ''
    }
  }
  // Utamakan host yang persis sama, lalu varian www/non-www
  const site = (sites ?? []).find(s => hostOf(s.Url) === new URL(origin).hostname)
    ?? (sites ?? []).find(s => hostOf(s.Url).replace(/^www\./, '') === host)
  if (!site) throw new SearchApiError(404, `Situs ${host} belum ditambahkan di akun Bing Webmaster pemilik API key ini.`)
  if (!site.IsVerified) throw new SearchApiError(403, `Situs ${host} belum terverifikasi di Bing Webmaster.`)
  siteCache.set(`${key}|${host}`, site.Url)
  return site.Url
}

/** Sisa kuota kirim URL (harian & bulanan). */
export async function bingQuota(key: string, site: string) {
  const d = await bing<{ DailyQuota: number, MonthlyQuota: number }>(key, 'GetUrlSubmissionQuota', { query: { siteUrl: site } })
  return { daily: d?.DailyQuota ?? 0, monthly: d?.MonthlyQuota ?? 0 }
}

export async function bingSubmitBatch(key: string, site: string, urlList: string[]) {
  await bing(key, 'SubmitUrlBatch', { body: { siteUrl: site, urlList } })
}

/** Tanggal format WCF "/Date(1700000000000-0800)/" → ISO; tanggal kosong .NET (tahun 0001) → null. */
export function msDate(v: unknown): string | null {
  const m = /\/Date\((-?\d+)/.exec(String(v ?? ''))
  if (!m) return null
  const t = Number(m[1])
  return t > Date.UTC(2000, 0, 1) ? new Date(t).toISOString() : null
}

export interface BingUrlInfo { crawled: string | null, http: number | null, discovered: string | null }
/** Info rayap Bing untuk satu URL; URL yang belum dikenal Bing → semua null. */
export async function bingUrlInfo(key: string, site: string, url: string): Promise<BingUrlInfo> {
  try {
    const d = await bing<{ HttpStatus?: number, LastCrawledDate?: string, DiscoveryDate?: string }>(key, 'GetUrlInfo', { query: { siteUrl: site, url } })
    return { crawled: msDate(d?.LastCrawledDate), http: d?.HttpStatus || null, discovered: msDate(d?.DiscoveryDate) }
  }
  catch (e) {
    // ErrorCode 11 (NotFound) / 7 (InvalidUrl): URL belum ada di data Bing
    if (e instanceof SearchApiError && /NotFound|not found/i.test(e.message)) return { crawled: null, http: null, discovered: null }
    throw e
  }
}

/** API key Bing Webmaster & URL situs seperti terdaftar di Bing; error 400 bila belum diatur. */
export async function requireBing(event: H3Event) {
  const cfg = await seoConfig(event)
  if (!cfg.bing_api_key) throw createError({ statusCode: 400, statusMessage: 'API key Bing Webmaster belum diisi di Admin > Pengaturan > Mesin pencari.' })
  try {
    return { key: cfg.bing_api_key, site: await bingSite(cfg.bing_api_key, siteOrigin(event)) }
  }
  catch (e) {
    throw searchHttpError(e)
  }
}
