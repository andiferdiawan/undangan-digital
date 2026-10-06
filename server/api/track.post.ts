import { createHash } from 'node:crypto'
import { z } from 'zod'
import { TRAFFIC_SOURCES, pageTypeOf } from '#shared/traffic'

/** Catat satu kunjungan halaman publik (dipanggil plugin analytics.client). Bot & halaman privat diabaikan. */
const s = (n: number) => z.string().trim().max(n).nullish()
const Body = z.object({
  path: z.string().trim().min(1).max(300).regex(/^\/[\w\-/.~%]*$/),
  is_entry: z.boolean().optional(),
  source: z.enum(TRAFFIC_SOURCES as [string, ...string[]]),
  referrer_host: s(120),
  engine: s(40),
  utm_source: s(80),
  utm_medium: s(80),
  utm_campaign: s(120),
})
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http|java\/|monitor|uptime/i

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)
  const ua = getHeader(event, 'user-agent') ?? ''
  if (!ua || BOT.test(ua)) return null
  const raw = await readBody(event).catch(() => null)
  const parsed = Body.safeParse(typeof raw === 'string' ? JSON.parse(raw || 'null') : raw)
  if (!parsed.success) return null
  const v = parsed.data
  const path = v.path.toLowerCase().replace(/\/+$/, '') || '/'
  const pageType = pageTypeOf(path)
  if (!pageType) return null

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? ''
  const day = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)
  const secret = String(useRuntimeConfig(event).serverRpcSecret ?? '')
  const visitor = createHash('sha256').update(`${ip}|${ua}|${day}|${secret}`).digest('hex').slice(0, 32)
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'tablet' : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop'
  const country = (getHeader(event, 'x-vercel-ip-country') ?? '').slice(0, 2).toUpperCase() || null

  try {
    await serverRpc(event, 'server_track_view', {
      p_view: { ...v, path, page_type: pageType, is_entry: !!v.is_entry, device, country, visitor },
    })
  }
  catch (e) {
    console.error('[track]', e instanceof Error ? e.message : e)
  }
  return null
})
