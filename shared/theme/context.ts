import type { InvitationContent } from './content'
import type { PlaceholderKey, RepeatSource } from './constants'

const DAYS = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu']
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember']
const TZ_OFFSET = { WIB: '+07:00', WITA: '+08:00', WIT: '+09:00' } as const

export interface DateParts { day: string, num: string, month: string, year: string, full: string, hijri: string }

export function dateParts(iso: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return null
  const d = new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, 12))
  const day = DAYS[d.getUTCDay()]!
  const month = MONTHS[+m[2]! - 1]!
  let hijri = ''
  try {
    hijri = new Intl.DateTimeFormat('id-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(d)
    if (!/\bH\b|AH/.test(hijri)) hijri += ' H'
  }
  catch { /* Intl tanpa kalender Hijriah */ }
  return { day, num: String(+m[3]!), month, year: m[1]!, full: `${day}, ${+m[3]!} ${month} ${m[1]}`, hijri }
}

/** Tanggal di sekitar hari H (untuk strip kalender): H-2, H-1, H+1, H+2. */
function nearbyDays(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  const at = (delta: number) => m ? String(new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]! + delta, 12)).getUTCDate()) : ''
  return { event_day_minus_two: at(-2), event_day_minus_one: at(-1), event_day_plus_one: at(1), event_day_plus_two: at(2) }
}

export function eventStart(ev: { date: string, time_start: string, timezone: keyof typeof TZ_OFFSET }): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ev.date)) return null
  const time = /^\d{2}:\d{2}$/.test(ev.time_start) ? ev.time_start : '00:00'
  const d = new Date(`${ev.date}T${time}:00${TZ_OFFSET[ev.timezone] ?? '+07:00'}`)
  return Number.isNaN(d.getTime()) ? null : d
}

function timeRange(ev: { time_start: string, time_end: string, timezone: string }) {
  const f = (t: string) => t.replace(':', '.')
  if (!ev.time_start) return ''
  return `${f(ev.time_start)} – ${ev.time_end ? f(ev.time_end) : 'Selesai'} ${ev.timezone}`
}

/** Hanya URL http(s) yang boleh keluar dari placeholder ke atribut href/src. */
export function safeUrl(v: string | undefined | null): string {
  if (!v) return ''
  const s = String(v).trim()
  if (/^https?:\/\//i.test(s) || s.startsWith('/')) return s
  return ''
}

export function instagramUrl(v: string): string {
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return safeUrl(v)
  return `https://instagram.com/${v.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '')}`
}

export interface RenderContext {
  values: Record<PlaceholderKey, string>
  lists: Record<RepeatSource, Record<string, string>[]>
  assets: Record<string, string>
  countdownTarget: string | null
  calendar: { title: string, start: string, end: string, location: string } | null
  /** Foto slider: Foto Sampul, atau galeri bila kosong. */
  slides: string[]
}

/**
 * Resolusi path aset tema:
 * - https://... dan /path (dari aplikasi) dipakai apa adanya
 * - path relatif -> Supabase Storage bucket theme-assets/{theme_slug}/{path}
 * Aset milik user (invitation.assets) mengganti aset bawaan tema dengan kunci yang sama.
 */
export function resolveAssets(
  themeAssets: Record<string, string>,
  overrides: Record<string, string>,
  themeSlug: string,
  storageBase: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  const all = { ...themeAssets, ...overrides }
  for (const [key, path] of Object.entries(all)) {
    if (!path) continue
    if (/^https:\/\//.test(path) || path.startsWith('/')) out[key] = path
    else out[key] = `${storageBase}/storage/v1/object/public/theme-assets/${themeSlug}/${path}`
  }
  return out
}

export function buildContext(
  c: InvitationContent,
  opts: { guestName?: string, assets: Record<string, string> },
): RenderContext {
  const main = c.events[0]
  const p = main ? dateParts(main.date) : null
  const start = main ? eventStart(main) : null
  const end = main && main.time_end ? eventStart({ ...main, time_start: main.time_end }) : null

  const values: Record<PlaceholderKey, string> = {
    groom_name: c.groom.name,
    groom_nickname: c.groom.nickname,
    groom_parents: c.groom.parents,
    groom_photo: safeUrl(c.groom.photo),
    groom_instagram: instagramUrl(c.groom.instagram),
    bride_name: c.bride.name,
    bride_nickname: c.bride.nickname,
    bride_parents: c.bride.parents,
    bride_photo: safeUrl(c.bride.photo),
    bride_instagram: instagramUrl(c.bride.instagram),
    couple_names: `${c.groom.nickname} & ${c.bride.nickname}`,
    event_date: p?.full ?? '',
    event_day: p?.day ?? '',
    event_date_num: p?.num ?? '',
    ...nearbyDays(main?.date ?? ''),
    event_month: p?.month ?? '',
    event_year: p?.year ?? '',
    event_hijri: p?.hijri ?? '',
    event_time: main ? timeRange(main) : '',
    event_venue: main?.venue ?? '',
    event_address: main?.address ?? '',
    location_map: safeUrl(main?.map_url),
    greeting: c.opening.greeting,
    opening_text: c.opening.text,
    quote_arabic: c.quote.arabic,
    quote_text: c.quote.text,
    quote_source: c.quote.source,
    closing_text: c.closing.text,
    closing_greeting: c.closing.greeting,
    guest_name: opts.guestName ?? '',
    hero_image: opts.assets.hero_image ?? '',
  }

  const lists: RenderContext['lists'] = {
    events: c.events.map((e) => {
      const dp = dateParts(e.date)
      return {
        name: e.name, date: dp?.full ?? '', day: dp?.day ?? '', time: timeRange(e),
        venue: e.venue, address: e.address, map_url: safeUrl(e.map_url),
      }
    }),
    gallery: c.gallery.filter(g => safeUrl(g.url)).map(g => ({ url: safeUrl(g.url), caption: g.caption })),
    story: c.story.map(s => ({ ...s })),
    gifts: c.gifts.map(g => ({ ...g })),
  }

  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  return {
    values,
    lists,
    assets: opts.assets,
    countdownTarget: start ? start.toISOString() : null,
    calendar: start
      ? {
          title: `Pernikahan ${values.couple_names}`,
          start: fmt(start),
          end: fmt(end ?? new Date(start.getTime() + 2 * 3600e3)),
          location: [main?.venue, main?.address].filter(Boolean).join(', '),
        }
      : null,
    slides: (() => {
      const cover = (c.cover_photos ?? []).map(x => safeUrl(x.url)).filter(Boolean)
      return cover.length ? cover : lists.gallery.map(g => g.url ?? '').filter(Boolean)
    })(),
  }
}

const TOKEN = /\{\{\s*([a-z_]+(?:\.[a-z_]+)?)\s*\}\}/g

/** Ganti {{placeholder}} dengan nilai. Output tetap string biasa (dirender sebagai teks, bukan HTML). */
export function interpolate(
  template: string,
  ctx: RenderContext,
  scope?: { item?: Record<string, string>, index?: number },
): string {
  return template.replace(TOKEN, (_, key: string) => lookup(key, ctx, scope))
}

export function lookup(key: string, ctx: RenderContext, scope?: { item?: Record<string, string>, index?: number }): string {
  if (key === 'index') return scope?.index != null ? String(scope.index + 1) : ''
  if (key.startsWith('item.')) return scope?.item?.[key.slice(5)] ?? ''
  if (key.startsWith('asset.')) return ctx.assets[key.slice(6)] ?? ''
  return (ctx.values as Record<string, string>)[key] ?? ''
}

export function placeholdersIn(s: string): string[] {
  return [...s.matchAll(TOKEN)].map(m => m[1]!)
}
