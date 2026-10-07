import { z } from 'zod'

/** Cek apakah Bing sudah merayapi URL (GetUrlInfo). UI memanggil per 20 URL agar progres terlihat. */
const Body = z.object({ paths: PathList(20) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { paths } = await readValidatedBody(event, Body.parse)
  const { key, site } = await requireBing(event)
  const origin = siteOrigin(event)
  const at = new Date().toISOString()

  const results = await mapLimit(paths, 4, async (path) => {
    try {
      return { path, ok: true as const, ...(await bingUrlInfo(key, site, `${origin}${path}`)) }
    }
    catch (e) {
      return { path, ok: false as const, status: e instanceof SearchApiError ? e.status : 500, error: e instanceof Error ? e.message : String(e) }
    }
  })
  await recordSeo(event, results.flatMap(r => r.ok ? [{ path: r.path, bing_crawled_at: r.crawled, bing_http_status: r.http, bing_checked_at: at }] : []))
  return { results, checkedAt: at }
})
