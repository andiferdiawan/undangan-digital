import { z } from 'zod'

/**
 * Cek status indeks Google lewat URL Inspection API (kuota 2.000/hari per properti). UI memanggil per 20 URL;
 * hasil (verdict, coverage, rayap terakhir, tautan ke GSC untuk "Minta pengindeksan") dicatat per URL.
 */
const Body = z.object({ paths: PathList(20) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { paths } = await readValidatedBody(event, Body.parse)
  const { sa, property } = await requireGoogle(event)
  const origin = siteOrigin(event)
  const at = new Date().toISOString()

  let stop = false
  const results = await mapLimit(paths, 4, async (path) => {
    if (stop) return { path, ok: false as const, status: 0, error: 'Dihentikan' }
    try {
      return { path, ok: true as const, ...(await inspectUrl(sa, property, `${origin}${path}`)) }
    }
    catch (e) {
      const status = e instanceof SearchApiError ? e.status : 500
      // Kuota habis / akses ditolak berlaku untuk semua URL: hentikan sisanya
      if (status === 429 || status === 403 || status === 401) stop = true
      return { path, ok: false as const, status, error: e instanceof Error ? e.message : String(e) }
    }
  })
  await recordSeo(event, results.flatMap(r => r.ok
    ? [{ path: r.path, google_verdict: r.verdict, google_coverage: r.coverage, google_last_crawl: r.lastCrawl, google_link: r.link, google_checked_at: at }]
    : []))
  return { results, checkedAt: at, stopped: stop }
})
