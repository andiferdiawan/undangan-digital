import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

/**
 * Gambar pratinjau link (Open Graph) 1200×630 bergaya iklan brand Undangan Virtual:
 * logo, tagline, dan fitur tetap sama; hanya nama mempelai & tanggal di layar ponsel
 * yang dinamis mengikuti undangan.
 */
export const OG_W = 1200
export const OG_H = 630

const C = {
  cream: '#fbf7f0', green: '#2f4a3a', greenDark: '#243a2d', sage: '#5f8666',
  text: '#4a6c52', clay: '#d9825b', clayDark: '#964c30', clayLight: '#fbe3d2',
}

type Node = { type: string, props: Record<string, any> }
const h = (type: string, style: Record<string, any>, children?: (Node | string | null)[] | string, extra: Record<string, any> = {}): Node =>
  ({ type, props: { style: { display: 'flex', ...style }, children, ...extra } })

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

const LOGO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="16" fill="#eef3ec"/><rect x="17" y="10" width="30" height="27" rx="3.5" fill="#b9d3b3"/><path d="M32 27.5s-6.6-3.9-6.6-8.2a3.6 3.6 0 0 1 6.6-2 3.6 3.6 0 0 1 6.6 2c0 4.3-6.6 8.2-6.6 8.2z" fill="#d9825b"/><path d="M8 27 L32 43.5 L56 27 V49 a5 5 0 0 1 -5 5 H13 a5 5 0 0 1 -5 -5Z" fill="#3b5744"/><path d="M13.5 32.5 L32 45.5 L50.5 32.5" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 6.5 l1.7 4.4 4.4 1.7 -4.4 1.7 -1.7 4.4 -1.7 -4.4 -4.4 -1.7 4.4 -1.7z" fill="#d9825b"/></svg>`)

/** Panel kanan: hijau dengan pola bintang delapan tipis */
const PANEL = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="430" height="630"><defs><pattern id="p" width="70" height="70" patternUnits="userSpaceOnUse"><g fill="none" stroke="#fbf7f0" stroke-opacity=".13" stroke-width="1.5"><rect x="20" y="20" width="30" height="30"/><rect x="20" y="20" width="30" height="30" transform="rotate(45 35 35)"/></g></pattern></defs><rect width="430" height="630" fill="${C.green}"/><rect width="430" height="630" fill="url(#p)"/></svg>`)

// ---------- Font (TTF dari Google Fonts, disimpan di memori) ----------
const fontCache = new Map<string, Promise<ArrayBuffer>>()
function loadFont(family: string, weight: number): Promise<ArrayBuffer> {
  const key = `${family}:${weight}`
  if (!fontCache.has(key)) {
    const p = (async () => {
      const css = await $fetch<string>(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`, { responseType: 'text' })
      const url = /src:\s*url\((https:[^)]+\.ttf)\)/.exec(css)?.[1]
      if (!url) throw new Error(`Font ${family} tidak ditemukan`)
      return await $fetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' })
    })()
    p.catch(() => fontCache.delete(key)) // coba lagi pada permintaan berikutnya
    fontCache.set(key, p)
  }
  return fontCache.get(key)!
}

/** Ukuran huruf nama agar muat di layar ponsel (lebar ±190px). */
function nameSize(name: string) {
  return Math.max(18, Math.min(30, Math.floor(190 / Math.max(1, name.length * 0.56))))
}

export async function renderBrandOg(opts: { groom: string, bride: string, date: string }): Promise<Buffer> {
  const [marcellus, jakarta500, jakarta600] = await Promise.all([
    loadFont('Marcellus', 400),
    loadFont('Plus Jakarta Sans', 500),
    loadFont('Plus Jakarta Sans', 600),
  ])
  const groom = opts.groom.trim().slice(0, 28) || 'Mempelai'
  const bride = opts.bride.trim().slice(0, 28) || 'Mempelai'
  const tag = (t: string) => h('div', { fontSize: 17, fontWeight: 600, color: C.clayDark, backgroundColor: C.clayLight, padding: '9px 16px', borderRadius: 999 }, t)
  const name = (t: string) => h('div', { fontFamily: 'Marcellus', fontSize: nameSize(t), color: C.green, lineHeight: 1.15, textAlign: 'center', justifyContent: 'center', maxWidth: 190 }, t)

  const tree = h('div', { width: OG_W, height: OG_H, position: 'relative', backgroundColor: C.cream, fontFamily: 'Jakarta' }, [
    // Kiri: brand
    h('div', { position: 'absolute', left: 80, top: 0, width: 640, height: OG_H, flexDirection: 'column', justifyContent: 'center' }, [
      h('div', { alignItems: 'center' }, [
        h('img', { width: 60, height: 60 }, undefined, { src: LOGO, width: 60, height: 60 }),
        h('div', { fontFamily: 'Marcellus', fontSize: 34, color: C.green, marginLeft: 16 }, 'Undangan Virtual'),
      ]),
      h('div', { flexDirection: 'column', fontFamily: 'Marcellus', fontSize: 66, lineHeight: 1.08, marginTop: 38 }, [
        h('div', { color: C.green }, 'Satu Link,'),
        h('div', { color: C.clay }, 'Sejuta Doa Restu'),
      ]),
      h('div', { flexDirection: 'column', fontSize: 23, fontWeight: 500, color: C.text, marginTop: 22, lineHeight: 1.45 }, [
        h('div', {}, 'Undangan pernikahan digital syar\'i & modern.'),
        h('div', {}, 'Isi sendiri dari ponsel, kirim ke setiap tamu.'),
      ]),
      h('div', { marginTop: 34, gap: 10 }, [tag('Syar\'i'), tag('Musik latar'), tag('RSVP'), tag('Amplop digital')]),
    ]),
    h('div', { position: 'absolute', left: 80, bottom: 42, fontSize: 19, fontWeight: 600, color: C.sage, letterSpacing: 0.4 }, 'undanganvirtual.com'),

    // Kanan: panel hijau + ponsel berisi nama mempelai (dinamis)
    h('img', { position: 'absolute', right: 0, top: 0, width: 430, height: OG_H }, undefined, { src: PANEL, width: 430, height: OG_H }),
    h('div', {
      position: 'absolute', left: 870, top: 100, width: 230, height: 430, borderRadius: 34,
      backgroundColor: C.cream, border: `8px solid ${C.greenDark}`, boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16,
    }, [
      h('div', { fontSize: 11, fontWeight: 500, letterSpacing: 2.2, color: C.sage }, 'THE WEDDING OF'),
      h('div', { marginTop: 14 }, [name(groom)]),
      h('div', { fontFamily: 'Marcellus', fontSize: 24, color: C.clay, marginTop: 2 }, '&'),
      h('div', { marginTop: 2 }, [name(bride)]),
      opts.date ? h('div', { fontSize: 12, fontWeight: 500, color: C.text, marginTop: 14, textAlign: 'center' }, opts.date) : null,
      h('div', { marginTop: 22, backgroundColor: C.green, color: '#ffffff', fontSize: 11, fontWeight: 600, padding: '9px 16px', borderRadius: 999 }, 'Buka Undangan'),
    ]),
  ])

  const svg = await satori(tree as any, {
    width: OG_W,
    height: OG_H,
    fonts: [
      { name: 'Marcellus', data: marcellus, weight: 400, style: 'normal' },
      { name: 'Jakarta', data: jakarta500, weight: 500, style: 'normal' },
      { name: 'Jakarta', data: jakarta600, weight: 600, style: 'normal' },
    ],
  })
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_W }, font: { loadSystemFonts: false } }).render().asPng()
}
