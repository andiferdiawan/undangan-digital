import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { classifyTraffic } from '#shared/traffic'

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|twitterbot|discord|slack|curl|wget|python|axios|node-fetch|go-http|java\/|monitor|uptime/i
export const REF_MAX_AGE = 60 * 60 * 24 * 30

/** Info pengunjung untuk pencatatan klik/kunjungan (tanpa menyimpan IP). */
export function visitorInfo(event: H3Event, referrer: string, query: Record<string, string | undefined> = {}) {
  const ua = getHeader(event, 'user-agent') ?? ''
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? ''
  const day = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)
  const secret = String(useRuntimeConfig(event).serverRpcSecret ?? '')
  const t = classifyTraffic({ referrer, siteHost: new URL(siteOrigin(event)).hostname, query })
  return {
    bot: !ua || BOT.test(ua),
    visitor: createHash('sha256').update(`${ip}|${ua}|${day}|${secret}`).digest('hex').slice(0, 32),
    device: /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'tablet' : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop',
    country: (getHeader(event, 'x-vercel-ip-country') ?? '').slice(0, 2).toUpperCase() || null,
    source: t.source,
    referrer_host: t.referrer_host,
  }
}

/** Simpan atribusi reseller (last click) selama 30 hari. */
export function setReferralCookies(event: H3Event, code: string, linkId: string | null) {
  const opts = { maxAge: REF_MAX_AGE, sameSite: 'lax' as const, path: '/', secure: !import.meta.dev }
  setCookie(event, 'ref', code, opts)
  if (linkId) setCookie(event, 'ref_link', linkId, opts)
  else deleteCookie(event, 'ref_link', { path: '/' })
}
