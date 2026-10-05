import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Cetak Kenangan — fotografi Gen Z lovely: kamera cetak instan putih, latar cairan ungu, hasil cetak
 * bergaya thermal (merah bertitik). Aset: kamera & latar cair. Alur 3D mengikuti scroll:
 * - pembuka: kamera datang sambil berputar, "cekrek!" (kilat flash), kertas foto keluar dari celah
 *   cetak, lalu kamera naik & hasil cetak mendekat jadi kartu undangan
 * - tengah: kartu cetak & struk acara datang dari kejauhan (uv-z)
 * - galeri: hasil cetak digeser satu per satu (gallery_carousel)
 * - penutup: kamera mencetak struk "Terima kasih"
 */
const PURPLE = '#4b2a7a'
const LAV = '#cbb8ee'
const SOFT = '#f3eefc'
const PINK = '#f2a7c3'
const INK = '#b4505a'
const A = '/theme-assets/cetak-kenangan'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-5 text-center'
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${PURPLE}] px-7 py-3 font-body text-[13px] font-semibold tracking-[0.12em] text-white shadow-[0_14px_30px_-12px_rgba(75,42,122,0.8)]`
const kicker = (t: string, cls = '') => p(`font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[${PURPLE}]/70 ${cls}`, t)
const heading = (t: string, light = false) => el('h2', `mt-2 font-heading text-[30px] font-bold leading-[1.1] ${light ? 'text-white' : `text-[${PURPLE}]`}`, t)
// Efek cetak thermal: monokrom merah + titik dot matrix
const thermal = '[filter:grayscale(1)_sepia(1)_hue-rotate(-52deg)_saturate(3.2)_contrast(1.05)_brightness(1.02)]'
const dots = '[background-image:radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1.3px)] [background-size:4px_4px]'
// Struk: tepi bawah bergerigi
const receipt = `bg-white [mask-image:conic-gradient(from_-45deg_at_bottom,#0000,#000_1deg_89deg,#0000_90deg)_50%/14px_100%]`
const dashed = `border-t-2 border-dashed border-[${PURPLE}]/25`

/** Kertas foto hasil cetak (foto sampul/galeri bergaya thermal). */
function printPaper(lines: ThemeNode[]): ThemeNode {
  return div('w-[164px] bg-white px-2.5 pb-3 pt-2.5 text-center shadow-[0_18px_30px_-16px_rgba(75,42,122,0.55)]', [
    div(`relative h-[150px] overflow-hidden bg-[${INK}]/15`, [
      div('absolute inset-0 grid place-items-center font-script text-[26px] leading-tight text-[#b4505a]', '{{couple_names}}'),
      div(`absolute inset-0 ${thermal}`, [comp('photo_slider', '', { dots: 'false', interval: '3800' })]),
      div(`pointer-events-none absolute inset-0 ${dots}`),
    ]),
    ...lines,
  ])
}

/**
 * Kamera + kertas yang keluar dari celah cetak. print 0..1 = kertas keluar, lift 0..1 = kamera naik & memudar,
 * hasil cetak membesar ke tengah.
 */
function camera(o: { print: string, lift: string, paper: ThemeNode }): ThemeNode {
  return div(`relative h-[460px] w-[260px] shrink-0 [transform:translateY(calc(${o.lift}_*_-150px))]`, [
    // kertas: terpotong tepat di celah cetak agar tampak keluar dari kamera
    div(`absolute left-[48px] top-[196px] h-[290px] w-[164px] overflow-hidden [transform-origin:50%_0] [transform:scale(calc(1_+_${o.lift}_*_0.55))]`, [
      div(`[transform:translateY(calc((${o.print}_-_1)_*_100%))]`, [o.paper]),
    ]),
    img(`absolute left-0 top-0 w-[260px] drop-shadow-[0_24px_30px_rgba(75,42,122,0.45)] [opacity:calc(1_-_${o.lift}_*_1.6)]`, '{{asset.kamera}}', 'Kamera cetak'),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  const tilt = who === 'groom' ? '-rotate-3' : 'rotate-3'
  return div(`uv-z mx-auto w-[250px] ${tilt}`, [
    div('relative bg-white p-3 pb-4 shadow-[0_22px_40px_-20px_rgba(75,42,122,0.6)]', [
      div(`absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-[${PINK}]/70`),
      div(`relative aspect-square overflow-hidden bg-[${LAV}]/40`, [
        img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div(`absolute inset-0 grid place-items-center font-script text-[48px] text-[${PURPLE}]`, `{{${who}_nickname}}`, { if: `!${who}_photo` }),
      ]),
      p(`mt-3 font-script text-[28px] leading-none text-[${PURPLE}]`, `{{${who}_nickname}} ♡`),
    ]),
    el('h3', `mt-5 font-heading text-[20px] font-bold leading-tight text-[${PURPLE}]`, `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] font-semibold text-[${INK}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Adegan pembuka
const IN = ramp(0, 7) // kamera datang
const FLASH = `calc(${ramp(0.12, 22)}_-_${ramp(0.15, 9)})` // kilat sesaat
const PRINT = ramp(0.2, 2.6) // kertas keluar
const LIFT = ramp(0.66, 4) // kamera naik, hasil cetak mendekat
// Adegan penutup
const PRINT2 = ramp(0.12, 2.4)
const END = ramp(0.6, 4)

export const meta = {
  code: 'MOD-010',
  slug: 'cetak-kenangan',
  name: 'Cetak Kenangan',
  category: 'modern',
  description: 'Fotografi Gen Z yang manis: kamera cetak instan putih di atas latar cairan ungu. Efek 3D saat di-scroll: kamera berputar mendekat, cekrek! kilat flash, foto kalian tercetak keluar bergaya thermal, struk acara, dan galeri cetak yang bisa digeser.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: PURPLE,
    secondary_color: LAV,
    accent_color: PINK,
    background_color: SOFT,
    surface_color: '#ffffff',
    text_color: '#2e2140',
    muted_color: '#7a6d8c',
    font_heading: 'Poppins',
    font_body: 'DM Sans',
    font_script: 'Caveat',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { kamera: `${A}/kamera.svg`, cair: `${A}/cair.svg` },
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden px-6 text-center',
      bg: '{{asset.cair}}',
      children: [
        div('uv-reveal-zoom relative mx-auto w-[210px] [perspective:800px]', [
          img('uv-float w-full drop-shadow-[0_24px_30px_rgba(75,42,122,0.45)]', '{{asset.kamera}}', 'Kamera cetak'),
          p(`absolute -right-3 -top-4 rotate-12 rounded-full bg-[${PINK}] px-3 py-1 font-script text-[20px] text-white shadow`, 'say cheese!'),
        ]),
        div(`uv-reveal uv-d2 relative mt-6 rounded-[22px] bg-white/80 px-7 py-6 shadow-[0_20px_40px_-24px_rgba(75,42,122,0.6)] backdrop-blur`, [
          kicker('The Wedding Of'),
          el('h1', `mt-2 font-heading text-[34px] font-bold leading-[1.05] text-[${PURPLE}]`, [
            el('span', 'block', '{{groom_nickname}}'),
            el('span', `block font-script text-[30px] font-normal text-[${INK}]`, '&'),
            el('span', 'block', '{{bride_nickname}}'),
          ]),
          p('mt-2 font-body text-[12px] font-medium uppercase tracking-[0.25em] text-muted', '{{event_date}}'),
          div(`mx-auto my-4 w-40 ${dashed}`),
          p('font-body text-[12px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', `mt-1 block font-heading text-[19px] font-semibold text-[${PURPLE}]`, { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d4 relative mt-6', [comp('open_button', btn, { label: 'Cekrek! Buka Undangan' })]),
      ],
    },
    // ---------- Pembuka: kamera memotret, foto tercetak keluar ----------
    {
      type: 'hero',
      class: 'uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3.2)]',
      bg: '{{asset.cair}}',
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[8%] px-6 [opacity:calc(1_-_${PRINT}_*_2)]`, [kicker('Senyum dulu, ya'), heading('3… 2… 1…')]),
          div(`[perspective:900px]`, [
            div(`[transform:translateZ(calc((1_-_${IN})_*_-450px))_rotateY(calc((1_-_${IN})_*_-30deg))]`, [
              camera({
                print: PRINT,
                lift: LIFT,
                paper: printPaper([
                  p(`mt-2.5 font-body text-[7.5px] font-semibold uppercase tracking-[0.3em] text-[${INK}]`, 'The Wedding Of'),
                  p(`mt-1 font-script text-[24px] leading-none text-[${INK}]`, '{{groom_nickname}} & {{bride_nickname}}'),
                  p(`mt-1 font-body text-[8px] uppercase tracking-[0.2em] text-[${INK}]/80`, '{{event_date}}'),
                  div(`mx-auto mt-2 w-24 border-t border-dashed border-[${INK}]/40`),
                  p(`mt-1.5 font-body text-[7px] uppercase tracking-[0.25em] text-[${INK}]/70`, 'printed with love ♡'),
                ]),
              }),
            ]),
          ]),
          p(`pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -rotate-6 rounded-full bg-white px-4 py-1 font-script text-[30px] text-[${INK}] shadow-lg [opacity:calc(${ramp(0.13, 12)}_-_${ramp(0.3, 6)})]`, 'cekrek!'),
          div(`pointer-events-none absolute inset-0 bg-white [opacity:${FLASH}]`),
          p(`pointer-events-none absolute inset-x-0 bottom-8 font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[${PURPLE}]/70 [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk memotret'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${PURPLE}] px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          p(`font-arabic text-[21px] leading-loose text-white`, '{{quote_arabic}}'),
          p(`mt-4 font-body text-[15px] leading-relaxed text-white/85`, '“{{quote_text}}”'),
          p(`mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-[${PINK}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-6 py-24 text-center',
      children: [
        div('uv-z', [kicker('Dua Frame, Satu Cerita'), heading('Kenalan dulu, yuk')]),
        p('uv-z mx-auto mt-4 max-w-[310px] font-body text-[14px] text-muted', '{{opening_text}}'),
        div('mt-14 grid gap-16', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: 'relative px-6 py-24 text-center',
      bg: '{{asset.cair}}',
      children: [
        div('uv-z', [kicker('Save The Date'), heading('Struk Hari Bahagia')]),
        div('uv-z mt-8', [comp('countdown', '', {
          item_class: `rounded-[14px] bg-white/80 py-3 text-center shadow-[0_10px_24px_-14px_rgba(75,42,122,0.6)]`,
          number_class: `block font-heading text-[28px] font-bold leading-none text-[${PURPLE}]`,
          label_class: `font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[${INK}]`,
        })]),
        div('mt-10 grid gap-8', [
          el('article', `uv-z mx-auto w-full max-w-[320px] ${receipt} px-6 pb-10 pt-6 text-left font-body shadow-[0_20px_40px_-24px_rgba(75,42,122,0.6)]`, [
            p(`text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-[${INK}]`, '— {{item.day}} —'),
            el('h3', `mt-2 text-center font-heading text-[24px] font-bold leading-tight text-[${PURPLE}]`, '{{item.name}}'),
            div(`my-4 ${dashed}`),
            div('flex justify-between gap-3 text-[14px] text-ink', [p('text-muted', 'Tanggal'), p('text-right font-medium', '{{item.date}}')]),
            div('mt-1 flex justify-between gap-3 text-[14px] text-ink', [p('text-muted', 'Waktu'), p('text-right font-medium', '{{item.time}}')]),
            div('mt-1 flex justify-between gap-3 text-[14px] text-ink', [p('text-muted', 'Tempat'), p('text-right font-medium', '{{item.venue}}')]),
            p('mt-2 text-[13px] text-muted', '{{item.address}}'),
            div(`my-4 ${dashed}`),
            div('text-center', [comp('map_button', btn, { href: '{{item.map_url}}', label: 'Buka Maps' }, { if: 'item.map_url' })]),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border-2 border-[${PURPLE}] bg-white/70 px-6 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-[${PURPLE}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-6',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Roll Film Kami'), heading('Dari kenal sampai halal')]),
          div('mt-10 grid gap-6 text-left', [
            div(`uv-z rounded-[18px] bg-white p-5 shadow-[0_16px_34px_-22px_rgba(75,42,122,0.6)] ring-1 ring-[${LAV}]`, [
              p(`font-script text-[22px] leading-none text-[${INK}]`, '{{item.date}}'),
              el('h3', `mt-1 font-heading text-[18px] font-bold leading-tight text-[${PURPLE}]`, '{{item.title}}'),
              p('mt-1 font-body text-[14px] text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: `relative bg-[${PURPLE}] py-24 text-center`,
      children: [
        div('', [
          div('uv-z px-6', [p(`font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-[${PINK}]`, 'Galeri'), heading('Hasil cetakan kami', true)]),
          div('mt-10', [comp('gallery_carousel', '', {
            item_class: `bg-white p-2.5 pb-3 font-script text-[20px] text-[${PURPLE}] shadow-[0_22px_40px_-18px_rgba(0,0,0,0.6)]`,
            image_class: 'aspect-[4/5] object-cover',
            text_class: 'font-body text-white/70',
            button_class: `!bg-white !text-[${PURPLE}]`,
            dot_class: `text-[${PINK}]`,
          })]),
          p('mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60', 'Geser atau tekan panah untuk foto berikutnya'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-24 text-center',
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Ikut masuk frame?')]),
        div(`uv-z mt-8 rounded-[22px] bg-white p-6 text-left shadow-[0_20px_40px_-26px_rgba(75,42,122,0.6)] ring-1 ring-[${LAV}]`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[14px] border border-[${LAV}] bg-[${SOFT}] px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${PURPLE}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted`,
          }),
        ]),
        el('h3', `uv-z mb-4 mt-12 font-heading text-[22px] font-bold text-[${PURPLE}]`, 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${LAV}] py-4`, name_class: `font-heading text-[15px] font-semibold text-[${PURPLE}]` }),
      ],
    },
    {
      type: 'gift',
      class: 'relative px-6',
      bg: '{{asset.cair}}',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital')]),
          p('uv-z mx-auto mt-4 max-w-[300px] font-body text-[14px] text-ink/80', 'Doa restu Anda sudah lebih dari cukup. Bila ingin memberi tanda kasih, bisa lewat:'),
          div('mt-10 grid gap-8', [
            div(`uv-z mx-auto w-full max-w-[300px] ${receipt} px-6 pb-10 pt-6 font-body shadow-[0_20px_40px_-24px_rgba(75,42,122,0.6)]`, [
              p(`text-[11px] font-semibold uppercase tracking-[0.3em] text-[${INK}]`, '{{item.bank}}'),
              p(`mt-2 font-heading text-[22px] font-bold tracking-wider text-[${PURPLE}]`, '{{item.number}}'),
              p('text-[13px] text-muted', 'a.n. {{item.holder}}'),
              div(`my-4 ${dashed}`),
              comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full bg-[${PURPLE}] px-5 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-white` }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: kamera mencetak struk terima kasih ----------
    {
      type: 'closing',
      class: 'uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.2)]',
      bg: '{{asset.cair}}',
      children: [
        div(stage, [
          div('px-6', [p('font-body text-[14px] text-ink/80', '{{closing_text}}')]),
          div('mt-4', [
            camera({
              print: PRINT2,
              lift: '0',
              paper: div(`w-[164px] ${receipt} px-3 pb-6 pt-3 text-center font-body`, [
                p(`text-[8px] font-semibold uppercase tracking-[0.3em] text-[${INK}]`, 'Struk Bahagia'),
                div(`my-2 ${dashed}`),
                p(`font-script text-[30px] leading-none text-[${PURPLE}]`, 'Terima kasih!'),
                p('mt-2 text-[9px] leading-snug text-muted', '{{closing_greeting}}'),
                div(`my-2 ${dashed}`),
                p(`font-heading text-[12px] font-bold text-[${PURPLE}]`, '{{couple_names}}'),
                p(`mt-1 text-[8px] uppercase tracking-[0.25em] text-[${INK}]`, '♡ ♡ ♡'),
              ]),
            }),
          ]),
          div(`-mt-6 [opacity:${END}]`, [
            p(`font-script text-[34px] leading-tight text-[${PURPLE}]`, 'see you there ♡'),
          ]),
        ]),
      ],
    },
  ],
}
