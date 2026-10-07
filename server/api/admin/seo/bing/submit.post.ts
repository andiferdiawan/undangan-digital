import { z } from 'zod'

/** Kirim URL ke Bing Webmaster API (SubmitUrlBatch, 500 per panggilan), dibatasi sisa kuota harian. */
const Body = z.object({ paths: PathList(10_000) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { paths } = await readValidatedBody(event, Body.parse)
  const { key, site } = await requireBing(event)
  const origin = siteOrigin(event)

  let quota: { daily: number, monthly: number }
  try {
    quota = await bingQuota(key, site)
  }
  catch (e) {
    throw searchHttpError(e)
  }
  const todo = paths.slice(0, Math.max(0, quota.daily))
  const sent: string[] = []
  let error: string | null = null
  for (let i = 0; i < todo.length; i += BING_BATCH) {
    const chunk = todo.slice(i, i + BING_BATCH)
    try {
      await bingSubmitBatch(key, site, chunk.map(p => `${origin}${p}`))
      sent.push(...chunk)
    }
    catch (e) {
      error = e instanceof Error ? e.message : String(e)
      break
    }
  }
  const at = new Date().toISOString()
  await recordSeo(event, sent.map(path => ({ path, bing_submitted_at: at })))
  return { sent: sent.length, skipped: paths.length - sent.length, quotaLeft: Math.max(0, quota.daily - sent.length), error }
})
