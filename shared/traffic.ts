/**
 * Klasifikasi trafik untuk analitik halaman publik (dipakai plugin browser & endpoint /api/track).
 */
export type TrafficSource = 'organik' | 'iklan' | 'sosial' | 'referral' | 'langsung'
export type PageType = 'beranda' | 'katalog' | 'tema' | 'pratinjau' | 'blog' | 'artikel' | 'undangan' | 'reseller' | 'halaman' | 'lainnya'

export const TRAFFIC_SOURCES: TrafficSource[] = ['organik', 'iklan', 'sosial', 'referral', 'langsung']

const ENGINES: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)yahoo\./, 'Yahoo'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yandex\./, 'Yandex'],
  [/(^|\.)ecosia\.org$/, 'Ecosia'],
  [/(^|\.)baidu\.com$/, 'Baidu'],
  [/(^|\.)brave\.com$/, 'Brave'],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/, 'AI Search'],
]
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|t\.co|x\.com|twitter\.com|tiktok\.com|youtube\.com|youtu\.be|pinterest\.[a-z.]+|linkedin\.com|lnkd\.in|whatsapp\.com|wa\.me|l\.wl\.co|telegram\.org|t\.me|threads\.net|line\.me)$/
const PAID_MEDIUM = /^(cpc|ppc|paid|paidsearch|paid[_-]?social|ads?|display|cpm|banner|retargeting|sponsored)$/i
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid', 'twclid', 'li_fat_id']

export interface TrafficInput {
  referrer: string
  siteHost: string
  query: Record<string, string | undefined>
}
export interface TrafficInfo {
  source: TrafficSource
  referrer_host: string | null
  engine: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

/** Sumber sesi dari referrer + parameter UTM/klik iklan pada halaman masuk. */
export function classifyTraffic({ referrer, siteHost, query }: TrafficInput): TrafficInfo {
  let host: string | null = null
  try { host = referrer ? new URL(referrer).hostname.replace(/^www\./, '').toLowerCase() : null }
  catch { host = null }
  const self = siteHost.replace(/^www\./, '').toLowerCase()
  if (host && (host === self || host.endsWith(`.${self}`))) host = null
  const utm = (k: string) => (query[k] ? String(query[k]).slice(0, 120) : null)
  const info = { referrer_host: host, engine: null as string | null, utm_source: utm('utm_source'), utm_medium: utm('utm_medium'), utm_campaign: utm('utm_campaign') }
  const engine = host ? ENGINES.find(([re]) => re.test(host!))?.[1] ?? null : null
  info.engine = engine

  const paid = CLICK_IDS.some(k => query[k]) || (info.utm_medium ? PAID_MEDIUM.test(info.utm_medium) : false)
  if (paid) {
    const ads = query.gclid || query.gbraid || query.wbraid ? 'Google Ads' : query.fbclid ? 'Meta Ads' : query.ttclid ? 'TikTok Ads' : query.msclkid ? 'Microsoft Ads' : null
    return { ...info, source: 'iklan', engine: ads ?? (engine ? `${engine} Ads` : info.utm_source) }
  }
  if (engine) return { ...info, source: 'organik' }
  const um = (info.utm_medium ?? '').toLowerCase()
  if (um === 'organic') return { ...info, source: 'organik' }
  if ((host && SOCIAL.test(host)) || um === 'social') return { ...info, source: 'sosial' }
  if (host || info.utm_source) return { ...info, source: 'referral' }
  return { ...info, source: 'langsung' }
}

const STATIC_PAGES = new Set(['tentang-kami', 'syarat-ketentuan', 'kebijakan-privasi', 'kebijakan-pengembalian', 'kontak', 'favorit'])
/** Halaman privat/transaksional yang tidak dihitung. */
const PRIVATE = /^\/(dashboard|admin|masuk|daftar|confirm|reset-password|checkout|pesanan|r|api|og|reseller\/dashboard)(\/|$)/

/** Jenis halaman dari path; null = tidak dilacak. */
export function pageTypeOf(path: string): PageType | null {
  if (PRIVATE.test(path)) return null
  if (path === '/') return 'beranda'
  if (path.startsWith('/katalog')) return 'katalog'
  if (/^\/tema\/[^/]+$/.test(path)) return 'tema'
  if (/^\/pratinjau\/[^/]+$/.test(path)) return 'pratinjau'
  if (/^\/blog\/(kategori|penulis)\//.test(path) || path === '/blog') return 'blog'
  if (/^\/blog\/[^/]+$/.test(path)) return 'artikel'
  if (path === '/reseller') return 'reseller'
  const one = /^\/([a-z0-9-]+)$/.exec(path)?.[1]
  if (one) return STATIC_PAGES.has(one) ? 'halaman' : 'undangan'
  return 'lainnya'
}
