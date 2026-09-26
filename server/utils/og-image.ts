import { createHash } from 'node:crypto'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import type { ThemeDefinition, ThemeGlobals } from '#shared/theme/schema'
import { withDefaults as contentWithDefaults, type InvitationContent } from '#shared/theme/content'
import { dateParts, safeUrl } from '#shared/theme/context'
import { mergeGlobals } from '#shared/theme/style'

/**
 * Gambar pratinjau link (Open Graph) 1200×630 untuk WhatsApp/medsos.
 * Isi penting diletakkan di tengah karena WhatsApp memotong bagian tengah
 * menjadi persegi pada pratinjau kecil.
 */
export const OG_W = 1200
export const OG_H = 630

export interface OgInput {
  definition: ThemeDefinition
  style?: Record<string, string>
  assets?: Record<string, string>
  content: InvitationContent
  themeName: string
  /** Teks kecil di bawah, mis. undanganvirtual.com/asdar */
  footer: string
}

type Node = { type: string, props: Record<string, any> }
const h = (type: string, style: Record<string, any>, children?: (Node | string | null)[] | string, extra: Record<string, any> = {}): Node =>
  ({ type, props: { style: { display: 'flex', ...style }, children, ...extra } })

// ---------- Font (TTF dari Google Fonts, disimpan di memori) ----------
const fontCache = new Map<string, Promise<ArrayBuffer | null>>()
function loadFont(family: string, weight = 400): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`
  if (!fontCache.has(key)) {
    fontCache.set(key, (async () => {
      try {
        const css = await $fetch<string>(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${weight}`, { responseType: 'text' })
        const url = /src:\s*url\((https:[^)]+\.ttf)\)/.exec(css)?.[1]
        return url ? await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' }) : null
      }
      catch { return null }
    })())
  }
  return fontCache.get(key)!
}

// ---------- Gambar → data URI (SVG & foto) ----------
async function toDataUri(url: string, origin: string): Promise<{ src: string, ratio: number } | null> {
  if (!url) return null
  const abs = url.startsWith('/') ? `${origin}${url}` : url
  if (!/^https?:\/\//.test(abs)) return null
  try {
    const res = await fetch(abs, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const type = (res.headers.get('content-type') || '').split(';')[0]!.trim()
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > 6_000_000) return null
    let ratio = 1
    if (type.includes('svg')) {
      const vb = /viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(buf.toString('utf8'))
      if (vb) ratio = Number(vb[1]) / Number(vb[2])
    }
    return { src: `data:${type || 'image/png'};base64,${buf.toString('base64')}`, ratio }
  }
  catch { return null }
}

/** Aset ilustrasi utama tema untuk pratinjau (bukan pola/bingkai/ornamen kecil). */
const DECOR = /pattern|fan|grain|kraft|sabbe|passura|ombak|frame|corner|divider|line|lights|twine|star|crescent|walasuji|ukiran|atap|petals|squiggle/
function pickIllustration(assets: Record<string, string>): string {
  for (const k of ['couple', 'hero', 'shapes', 'floral', 'pampas', 'rumah', 'tongkonan', 'losari', 'barre'])
    if (assets[k]) return assets[k]!
  return Object.entries(assets).find(([k, v]) => !DECOR.test(k) && /\.(svg|png|jpe?g|webp)$/i.test(v))?.[1] ?? ''
}

function isDark(hex: string): boolean {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return false
  const [r, g, b] = [m[1], m[2], m[3]].map(x => parseInt(x!, 16) / 255)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! < 0.45
}

export function ogVersion(input: { names: string, date: string, themeId: string, photo: string, style?: unknown }): string {
  return createHash('sha1').update(JSON.stringify(input)).digest('hex').slice(0, 10)
}

export async function renderOgImage(input: OgInput, origin: string): Promise<Buffer> {
  const g: ThemeGlobals = mergeGlobals(input.definition.globals, input.style)
  const c = input.content
  const names = `${c.groom.nickname} & ${c.bride.nickname}`
  const date = dateParts(c.events[0]?.date ?? '')?.full ?? ''

  // Sumber visual: foto (Foto Sampul → galeri → foto sampul override) atau ilustrasi tema
  const assets = { ...(input.definition.assets ?? {}), ...(input.assets ?? {}) }
  const photoUrl = safeUrl(c.cover_photos[0]?.url) || safeUrl(input.assets?.hero_image) || safeUrl(c.gallery[0]?.url)
  const [photo, illus, fHead, fScript, fBody, fBodyBold] = await Promise.all([
    photoUrl ? toDataUri(photoUrl, origin) : Promise.resolve(null),
    photoUrl ? Promise.resolve(null) : toDataUri(pickIllustration(assets), origin),
    loadFont(g.font_heading),
    loadFont(g.font_script),
    loadFont(g.font_body),
    loadFont(g.font_body, 600),
  ])
  const fonts = [
    fHead && { name: 'Heading', data: fHead, weight: 400 as const, style: 'normal' as const },
    fScript && { name: 'Script', data: fScript, weight: 400 as const, style: 'normal' as const },
    fBody && { name: 'Body', data: fBody, weight: 400 as const, style: 'normal' as const },
    fBodyBold && { name: 'Body', data: fBodyBold, weight: 600 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string, data: ArrayBuffer, weight: 400 | 600, style: 'normal' }[]
  if (!fonts.length) throw createError({ statusCode: 503, statusMessage: 'Font tidak tersedia' })

  const nameSize = names.length > 22 ? 84 : names.length > 16 ? 100 : 118
  const onPhoto = !!photo
  const dark = !onPhoto && isDark(g.background_color)
  const ink = onPhoto ? '#ffffff' : g.primary_color
  const sub = onPhoto ? 'rgba(255,255,255,0.88)' : g.muted_color

  const textBlock = h('div', { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }, [
    h('div', { fontFamily: 'Body', fontSize: 22, fontWeight: 600, letterSpacing: 8, textTransform: 'uppercase', color: onPhoto ? '#ffffff' : g.accent_color }, 'The Wedding of'),
    h('div', { fontFamily: 'Script', fontSize: nameSize, lineHeight: 1.15, color: ink, marginTop: 8, maxWidth: 1000, justifyContent: 'center' }, names),
    date ? h('div', { fontFamily: 'Heading', fontSize: 30, color: sub, marginTop: 10 }, date) : null,
  ])

  const footer = h('div', {
    position: 'absolute', bottom: 28, left: 0, right: 0, justifyContent: 'center',
  }, [
    h('div', {
      fontFamily: 'Body', fontSize: 20, fontWeight: 600, color: onPhoto ? '#ffffff' : g.primary_color,
      backgroundColor: onPhoto ? 'rgba(0,0,0,0.28)' : dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
      border: dark ? `1px solid ${g.primary_color}66` : 'none', padding: '8px 22px', borderRadius: 999,
    }, `${input.footer}  ·  ${input.themeName}`),
  ])

  let tree: Node
  if (photo) {
    tree = h('div', { width: OG_W, height: OG_H, position: 'relative', backgroundColor: g.secondary_color }, [
      h('img', { position: 'absolute', left: 0, top: 0, width: OG_W, height: OG_H, objectFit: 'cover', objectPosition: '50% 22%' }, undefined, { src: photo.src, width: OG_W, height: OG_H }),
      h('div', { position: 'absolute', left: 0, top: 0, width: OG_W, height: OG_H, backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.25) 40%, ${g.secondary_color}F2 100%)` }),
      h('div', { position: 'absolute', left: 0, right: 0, bottom: 96, justifyContent: 'center' }, [textBlock]),
      footer,
    ])
  }
  else {
    const ih = 270
    const iw = Math.round(ih * (illus?.ratio ?? 1))
    tree = h('div', {
      width: OG_W, height: OG_H, position: 'relative', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundColor: g.background_color,
      backgroundImage: `radial-gradient(circle at 50% 38%, ${g.surface_color} 0%, ${g.background_color} 62%)`,
    }, [
      // bingkai tipis
      h('div', { position: 'absolute', left: 24, top: 24, right: 24, bottom: 24, border: `2px solid ${g.accent_color}55`, borderRadius: 28 }),
      illus ? h('img', { width: Math.min(iw, 560), height: ih, objectFit: 'contain', marginTop: -44 }, undefined, { src: illus.src, width: Math.min(iw, 560), height: ih }) : null,
      h('div', { marginTop: illus ? 4 : 0 }, [textBlock]),
      footer,
    ])
  }

  const svg = await satori(tree as any, { width: OG_W, height: OG_H, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_W }, font: { loadSystemFonts: false } }).render().asPng()
}

export function contentOf(raw: unknown): InvitationContent {
  return contentWithDefaults(raw)
}
