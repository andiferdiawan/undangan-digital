import type { H3Event } from 'h3'
import { z } from 'zod'

export interface GoogleServiceAccount { client_email: string, private_key: string, project_id?: string | null }
export interface SeoConfig { bing_api_key: string | null, google_sa: GoogleServiceAccount | null, gsc_property: string | null }

/** Kredensial Bing Webmaster & Google Search Console dari Vault (diisi di Admin → Pengaturan). */
export async function seoConfig(event: H3Event): Promise<SeoConfig> {
  return await serverRpc<SeoConfig>(event, 'server_seo_config', {})
}

export type SeoField =
  | 'indexnow_at' | 'bing_submitted_at' | 'bing_crawled_at' | 'bing_http_status' | 'bing_checked_at'
  | 'google_verdict' | 'google_coverage' | 'google_last_crawl' | 'google_link' | 'google_checked_at' | 'brave_submitted_at'
export type SeoRecord = { path: string } & Partial<Record<SeoField, string | number | null>>

/** Catat status per URL di public.seo_urls (hanya kolom yang disebut). Gagal mencatat tidak membatalkan aksi utama. */
export async function recordSeo(event: H3Event, rows: SeoRecord[]) {
  if (!rows.length) return
  try {
    await serverRpc(event, 'server_seo_record', { p_rows: rows })
  }
  catch (e) {
    console.warn('[seo] gagal mencatat status URL:', e instanceof Error ? e.message : e)
  }
}

/** Path relatif situs (pathname + query) dari path atau URL absolut; null bila bukan milik situs. */
export function sitePath(origin: string, url: string): string | null {
  try {
    const u = new URL(url, `${origin}/`)
    return u.origin === new URL(origin).origin ? `${u.pathname}${u.search}` : null
  }
  catch {
    return null
  }
}

/** Jalankan fn untuk tiap item dengan paling banyak `limit` sekaligus, urutan hasil sama dengan input. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = Array.from<R>({ length: items.length })
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i]!)
    }
  }))
  return out
}

/** Error dari API mesin pencari (Google/Bing), dengan status HTTP aslinya. */
export class SearchApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

/** Error API mesin pencari → error HTTP 400 dengan pesan yang bisa ditampilkan; status asli di data.status. */
export function searchHttpError(e: unknown) {
  if (e instanceof SearchApiError) return createError({ statusCode: 400, statusMessage: e.message, data: { status: e.status } })
  return e instanceof Error && 'statusCode' in e ? e : createError({ statusCode: 500, statusMessage: e instanceof Error ? e.message : String(e) })
}

/** Daftar path URL publik dari body: path relatif situs saja, tanpa duplikat. */
export const PathList = (max: number) => z.array(z.string().trim().regex(/^\/(?!\/)/).max(500)).min(1).max(max).transform(a => [...new Set(a)])
