import type { H3Event } from 'h3'
import { googleAccessToken } from './google-auth'
import { type GoogleServiceAccount, SearchApiError, seoConfig } from './seo-config'

/**
 * Google Search Console API dengan service account: daftar properti, kirim/lihat sitemap, dan URL Inspection
 * (status indeks per URL, kuota 2.000/hari per properti). Google tidak punya API "Request indexing" untuk
 * halaman biasa, jadi permintaan indeks tetap lewat tombol di GSC (tautan inspectionResultLink).
 */
const WEBMASTERS = 'https://www.googleapis.com/webmasters/v3'
const SEARCH_CONSOLE = 'https://searchconsole.googleapis.com/v1'

async function gsc<T>(sa: GoogleServiceAccount, url: string, init: { method?: string, body?: unknown, timeoutMs?: number } = {}): Promise<T> {
  const token = await googleAccessToken(sa)
  const res = await fetch(url, {
    method: init.method ?? 'GET',
    headers: { 'authorization': `Bearer ${token}`, 'content-type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(init.timeoutMs ?? 20_000),
  })
  const text = await res.text()
  let data: { error?: { message?: string } } & Record<string, unknown> = {}
  try {
    data = text ? JSON.parse(text) : {}
  }
  catch { /* respons kosong / bukan JSON */ }
  if (!res.ok) {
    const detail = data.error?.message || text.slice(0, 200) || `status ${res.status}`
    if (res.status === 403)
      throw new SearchApiError(403, `Service account ${sa.client_email} belum punya akses ke properti ini. Tambahkan di Search Console > Setelan > Pengguna dan izin (izin Pemilik/Penuh). Detail: ${detail}`)
    if (res.status === 429)
      throw new SearchApiError(429, `Kuota harian Search Console habis, coba lagi besok. Detail: ${detail}`)
    throw new SearchApiError(res.status, `Search Console: ${detail}`)
  }
  return data as T
}

const enc = encodeURIComponent

export interface GscSite { siteUrl: string, permissionLevel: string }
export async function listSites(sa: GoogleServiceAccount): Promise<GscSite[]> {
  const r = await gsc<{ siteEntry?: GscSite[] }>(sa, `${WEBMASTERS}/sites`)
  return r.siteEntry ?? []
}

export interface GscSitemap {
  path: string, lastSubmitted?: string, lastDownloaded?: string, isPending?: boolean
  warnings?: string, errors?: string, contents?: { type: string, submitted?: string, indexed?: string }[]
}
export async function listSitemaps(sa: GoogleServiceAccount, property: string): Promise<GscSitemap[]> {
  const r = await gsc<{ sitemap?: GscSitemap[] }>(sa, `${WEBMASTERS}/sites/${enc(property)}/sitemaps`)
  return r.sitemap ?? []
}
export async function submitSitemap(sa: GoogleServiceAccount, property: string, sitemapUrl: string) {
  await gsc(sa, `${WEBMASTERS}/sites/${enc(property)}/sitemaps/${enc(sitemapUrl)}`, { method: 'PUT' })
}

export interface Inspection { verdict: string | null, coverage: string | null, lastCrawl: string | null, link: string | null }
/** Status indeks satu URL. verdict PASS/PARTIAL = ada di Google; NEUTRAL/FAIL = belum terindeks (lihat coverage). */
export async function inspectUrl(sa: GoogleServiceAccount, property: string, url: string): Promise<Inspection> {
  const r = await gsc<{ inspectionResult?: { inspectionResultLink?: string, indexStatusResult?: { verdict?: string, coverageState?: string, lastCrawlTime?: string } } }>(
    sa, `${SEARCH_CONSOLE}/urlInspection/index:inspect`, { method: 'POST', body: { inspectionUrl: url, siteUrl: property, languageCode: 'id' } },
  )
  const s = r.inspectionResult?.indexStatusResult
  return {
    verdict: s?.verdict ?? null,
    coverage: s?.coverageState ?? null,
    lastCrawl: s?.lastCrawlTime && !s.lastCrawlTime.startsWith('1970') ? s.lastCrawlTime : null,
    link: r.inspectionResult?.inspectionResultLink ?? null,
  }
}

/** Tautan halaman Inspeksi URL di GSC (tempat tombol "Minta pengindeksan"). */
export function gscInspectLink(property: string | null, url: string) {
  return property
    ? `https://search.google.com/search-console/inspect?resource_id=${enc(property)}&id=${enc(url)}`
    : 'https://search.google.com/search-console'
}

/** Properti GSC yang cocok dengan situs ini, dari daftar properti yang bisa diakses service account. */
export function matchProperty(sites: GscSite[], origin: string): string | null {
  const host = new URL(origin).hostname.replace(/^www\./, '')
  const ok = sites.filter(s => s.permissionLevel !== 'siteUnverifiedUser')
  return ok.find(s => s.siteUrl === `sc-domain:${host}`)?.siteUrl
    ?? ok.find(s => s.siteUrl === `${origin}/`)?.siteUrl
    ?? ok.find(s => /^https?:\/\//.test(s.siteUrl) && new URL(s.siteUrl).hostname.replace(/^www\./, '') === host)?.siteUrl
    ?? null
}

/** Service account & properti GSC; error 400 bila belum diatur. */
export async function requireGoogle(event: H3Event, o: { property?: boolean } = { property: true }) {
  const cfg = await seoConfig(event)
  if (!cfg.google_sa) throw createError({ statusCode: 400, statusMessage: 'Service account Google belum diisi di Admin > Pengaturan > Mesin pencari.' })
  if (o.property && !cfg.gsc_property) throw createError({ statusCode: 400, statusMessage: 'Properti Search Console belum dipilih di Admin > Pengaturan > Mesin pencari.' })
  return { sa: cfg.google_sa, property: cfg.gsc_property ?? '' }
}
