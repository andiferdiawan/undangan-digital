import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Tongkonan Rindu — adat Toraja yang lapang & elegan, 3 warna saja (gading, hitam arang, merah Toraja) dan
 * 2 aset (tongkonan tampak depan & ukiran pa'barre allo). Konsep 3D mengikuti scroll:
 * - pembuka: tongkonan tampak depan mendekat, daun pintu berukir terbuka, lalu kamera masuk menembus pintu
 *   dan kartu undangan di dalam rumah membesar
 * - tengah: kartu datang dari kejauhan (uv-z), pita segitiga ukiran pa'ssura' sebagai aksen
 * - galeri: cincin foto 3D yang berputar mengikuti scroll (uv-ring)
 * - penutup: kamera mundur keluar rumah, daun pintu menutup kembali
 */
const IVORY = '#f8f3ea'
const CHAR = '#2b2522'
const RED = '#a3322a'
const A = '/theme-assets/tongkonan-rindu'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:900px]'
const card = `rounded-[3px] border border-[${RED}]/60 bg-white/75 px-7 pb-8 pt-7 shadow-[0_24px_50px_-34px_rgba(43,37,34,0.5)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${CHAR}] px-7 py-3 font-body text-[12px] uppercase tracking-[0.28em] text-[${IVORY}]`
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.4em] text-[${RED}]`, t)
const heading = (t: string, light = false) => el('h2', `mt-3 font-heading text-[26px] leading-[1.2] tracking-[0.06em] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)
/** Garis pemisah: benang emas dengan belah ketupat kecil. */
const divider = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-px w-14 bg-[${RED}]`), div(`h-2 w-2 rotate-45 border border-[${RED}]`), div(`h-px w-14 bg-[${RED}]`),
])
/** Pita segitiga ukiran pa'ssura' Toraja — murni CSS. */
const sabbe = (cls = '') => div(`mx-auto h-[7px] w-36 [background-image:conic-gradient(from_135deg_at_50%_0,${RED}_90deg,transparent_0)] [background-size:9px_7px] ${cls}`)

/** Kartu undangan berbingkai emas. */
function letter(inner: ThemeNode[], cls = ''): ThemeNode {
  return div(`flex h-[196px] w-[210px] flex-col items-center justify-center rounded-[3px] border border-[${RED}]/70 bg-[${IVORY}] px-5 py-5 text-center shadow-[0_10px_26px_-12px_rgba(0,0,0,0.3)] outline outline-1 outline-offset-[-7px] outline-[${RED}]/40 ${cls}`, inner)
}

const plank = `bg-[${IVORY}] bg-[repeating-linear-gradient(0deg,transparent_0_15px,rgba(43,37,34,0.14)_15px_16px)]`
// ukiran segitiga pada daun pintu — murni CSS
const carve = `bg-[${CHAR}] [background-image:conic-gradient(from_135deg_at_50%_0,${RED}_90deg,transparent_0)] [background-size:10px_9px]`

/** Daun pintu; `open` 0..1 = sudut buka. */
function doors(open: string): ThemeNode[] {
  return [
    div(`absolute inset-y-0 left-0 w-1/2 border border-[${RED}]/70 ${carve} [transform-origin:left] [transform:perspective(500px)_rotateY(calc(${open}_*_-110deg))]`),
    div(`absolute inset-y-0 right-0 w-1/2 border border-[${RED}]/70 ${carve} [transform-origin:right] [transform:perspective(500px)_rotateY(calc(${open}_*_110deg))]`),
  ]
}

/**
 * Tongkonan tampak depan. Titik asal transform di pusat pintu sehingga zoom terasa masuk ke dalam rumah.
 * near = 0..1 rumah mendekat, open = pintu terbuka, z = 0..1 kamera masuk.
 */
function house(near: string, open: string, z: string): ThemeNode {
  const wall = `absolute ${plank}`
  return div(`absolute inset-0 flex items-center justify-center [opacity:clamp(0,calc((0.94_-_${z})_*_4),1)]`, [
    div(`relative w-[300px] [transform-origin:50%_73.5%] [transform:scale(calc((0.62_+_${near}_*_0.38)_*_(1_+_${z}_*_${z}_*_10)))]`, [
      img('relative block h-[200px] w-[300px]', '{{asset.depan}}', 'Rumah adat tongkonan tampak depan'),
      div('relative mx-auto h-[150px] w-[232px]', [
        div(`${wall} inset-x-0 top-0 h-[40px]`),
        div(`${wall} left-0 top-[40px] h-[110px] w-[85px]`),
        div(`${wall} right-0 top-[40px] h-[110px] w-[85px]`),
        div(`absolute inset-x-0 top-[10px] h-[7px] [background-image:conic-gradient(from_135deg_at_50%_0,${RED}_90deg,transparent_0)] [background-size:9px_7px]`),
        div(`pointer-events-none absolute inset-0 border-x-2 border-b-2 border-[${CHAR}]`),
        // kusen pintu
        div(`absolute left-[85px] top-[40px] h-[110px] w-[62px] outline outline-2 outline-[${CHAR}]`, doors(open)),
      ]),
      div(`mx-auto h-[8px] w-[250px] bg-[${CHAR}]`),
      div('mx-auto flex h-[34px] w-[220px] justify-between', [0, 1, 2, 3, 4].map(() => div(`h-full w-[6px] bg-[${CHAR}]`))),
      div(`mx-auto h-px w-[300px] bg-[${RED}]`),
    ]),
  ])
}

/** Isi di dalam rumah: kecil di ambang pintu, membesar saat kamera masuk. */
function inside(z: string, children: ThemeNode[]): ThemeNode {
  return div(`absolute inset-0 flex items-center justify-center [transform:translateY(calc((1_-_${z})_*_96px))_scale(calc(0.26_+_${z}_*_0.74))]`, children)
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${card} text-center`, [
    div(`relative mx-auto h-44 w-36 overflow-hidden rounded-t-full border border-[${RED}] bg-[${CHAR}]/10 outline outline-1 outline-offset-4 outline-[${RED}]/50`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[44px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    sabbe('mt-6'),
    p(`mt-5 font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[21px] leading-tight tracking-[0.04em] text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${RED}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Adegan pembuka: rumah mendekat, pintu terbuka, kamera masuk
const NEAR = ramp(0.02, 3.4)
const OPEN = ramp(0.3, 3.4)
const ZIN = ramp(0.5, 2.1)
// Adegan penutup: kamera mundur keluar rumah, pintu menutup
const ZOUT = `calc(1_-_${ramp(0.06, 2.6)})`
const SHUT = `calc(1_-_${ramp(0.5, 4)})`
const END = ramp(0.7, 4)

// Cincin galeri: sudut tiap foto (6 posisi) lewat nth-child
const RING = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--a:${i * 60}deg]`).join(' ')


export const meta = {
  code: 'ADT-007',
  slug: 'tongkonan-rindu',
  name: 'Tongkonan Rindu',
  category: 'adat',
  description: 'Adat Toraja yang lapang dan elegan, tiga warna (gading, hitam arang, merah Toraja) dengan efek 3D saat di-scroll: pintu tongkonan tampak depan terbuka lalu kita masuk ke dalam rumah, galeri berupa cincin foto 3D yang berputar, dan di akhir pintu menutup kembali.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: CHAR,
    secondary_color: RED,
    accent_color: RED,
    background_color: IVORY,
    surface_color: IVORY,
    text_color: '#2b2522',
    muted_color: '#7a6a62',
    font_heading: 'Cinzel',
    font_body: 'Lora',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { depan: `${A}/depan.svg`, barre: `${A}/barre-allo.svg` },
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg', '/theme-assets/lontara-bugis/bride.jpg', '/theme-assets/lontara-bugis/groom.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[${IVORY}] px-8 text-center`,
      children: [
        div(`pointer-events-none absolute inset-5 rounded-t-[999px] border border-[${RED}]/45`),
        kicker('Undangan Pernikahan'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-6 font-script text-[56px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[18px] text-[${RED}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        divider('uv-reveal uv-d2 mt-5'),
        p('uv-reveal uv-d2 mt-4 font-body text-[13px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 mx-auto mt-8 w-40', [img('uv-float block w-full', '{{asset.depan}}', 'Rumah adat tongkonan')]),
        div('uv-reveal uv-d4 relative mt-7', [
          p('font-body text-[13px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[19px] tracking-[0.04em] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-8', [comp('open_button', btn, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Pembuka: tongkonan tampak depan, pintu terbuka, masuk ke dalam rumah ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          inside(ZIN, [
            letter([
                img('mx-auto -mt-2 mb-1 w-9', '{{asset.barre}}', ''),
                p(`font-body text-[7.5px] uppercase tracking-[0.28em] text-[${RED}]`, 'The Wedding Of'),
                p('mt-1.5 font-script text-[28px] leading-[1.1] text-primary', '{{groom_nickname}}'),
                p(`font-heading text-[11px] leading-none text-[${RED}]`, '&'),
                p('font-script text-[28px] leading-[1.1] text-primary', '{{bride_nickname}}'),
                sabbe('mt-2 !w-20'),
                p('mt-2 font-body text-[8px] uppercase tracking-[0.22em] text-primary', '{{event_date}}'),
              ], 'scale-[1.3]'),
          ]),
          house(NEAR, OPEN, ZIN),
          div(`pointer-events-none absolute inset-x-0 top-[7%] [opacity:calc(1_-_${ramp(0.3, 4)})]`, [kicker('Selamat datang di tongkonan'), divider('mt-4')]),
          p(`pointer-events-none absolute inset-x-0 bottom-7 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk masuk'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${CHAR}] px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          p(`font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          divider('my-6'),
          p(`font-body text-[16px] italic leading-relaxed text-[${IVORY}]/85`, '“{{quote_text}}”'),
          p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${RED}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-7 py-24 text-center',
      children: [
        div('uv-z', [kicker('Mempelai'), heading('Dua Hati, Satu Niat'), divider('mt-5')]),
        p('uv-z mx-auto mt-5 max-w-[300px] font-body text-[14px] italic text-muted', '{{opening_text}}'),
        div('mt-12 grid gap-12', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${CHAR}] px-7 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Waktu & Tempat'), heading('Hari Bahagia', true), divider('mt-5')]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `rounded-t-full border border-[${RED}]/60 pb-3 pt-5 text-center`,
          number_class: `block font-heading text-[26px] leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${RED}]`,
        })]),
        div('mt-12 grid gap-10', [
          el('article', `uv-z ${card} bg-[${IVORY}] text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[22px] leading-tight tracking-[0.04em] text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[15px] text-ink', '{{item.date}}'),
            p('font-body text-[14px] italic text-muted', '{{item.time}}'),
            sabbe('my-5'),
            p('font-heading text-[16px] tracking-[0.04em] text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${RED}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Kisah Kami'), heading('Perjalanan Cinta'), divider('mt-5')]),
          div('mt-12 grid gap-12', [
            div('uv-z text-center', [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[19px] leading-tight tracking-[0.04em] text-primary', '{{item.title}}'),
              p('mx-auto mt-2 max-w-[300px] font-body text-[14px] italic text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: cincin foto 3D berputar mengikuti scroll ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${CHAR}]`,
      children: [
        div(stage, [
          div('', [kicker('Galeri'), heading('Lingkar Kenangan', true), sabbe('mt-4')]),
          div('mt-14 [perspective:900px]', [
            div(`uv-ring relative h-[230px] w-[150px] [transform-style:preserve-3d] [transform:rotateX(-8deg)_rotateY(calc(${S}_*_-330deg))]`, [
              div(`uv-ring-item absolute inset-0 [backface-visibility:hidden] ${RING} [transform:rotateY(var(--a,0deg))_translateZ(185px)]`, [
                div(`h-full w-full rounded-t-full border border-[${RED}] bg-[${IVORY}] p-1.5 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.7)]`, [
                  img('h-full w-full rounded-t-full object-cover', '{{item.url}}', '{{item.caption}}'),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ]),
          p(`mt-[84px] font-body text-[11px] uppercase tracking-[0.35em] text-[${IVORY}]/60`, 'Scroll untuk memutar'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 py-24 text-center',
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Kabari Kami'), divider('mt-5')]),
        div(`uv-z mt-10 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[2px] border border-[${RED}]/50 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${CHAR}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${RED}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-14 font-heading text-[20px] tracking-[0.04em] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${RED}]/40 py-4`, name_class: 'font-heading text-[15px] tracking-[0.04em] text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${CHAR}] px-7`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true), divider('mt-5')]),
          p(`uv-z mx-auto mt-5 max-w-[300px] font-body text-[14px] italic text-[${IVORY}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} bg-[${IVORY}] text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[22px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] italic text-muted', 'a.n. {{item.holder}}'),
              sabbe('my-5'),
              comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${RED}] px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-primary` }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: kamera mundur keluar rumah, pintu menutup ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div(`px-8 [opacity:${END}]`, [
            p('font-body text-[14px] italic text-muted', '{{closing_text}}'),
          ]),
          div('relative my-3 h-[400px] w-full shrink-0', [
            inside(ZOUT, [
              letter([
                img('mx-auto -mt-2 mb-1 w-9', '{{asset.barre}}', ''),
                p(`font-body text-[7.5px] uppercase tracking-[0.28em] text-[${RED}]`, 'Terima Kasih'),
                p('mt-2 font-script text-[26px] leading-[1.15] text-primary', '{{couple_names}}'),
                sabbe('mt-2 !w-20'),
                p('mt-2 font-body text-[8.5px] italic leading-snug text-muted', '{{closing_greeting}}'),
              ], 'scale-[1.3]'),
            ]),
            house('1', SHUT, ZOUT),
          ]),
          div(`[opacity:${END}]`, [
            p('font-body text-[13px] italic text-muted', '{{closing_greeting}}'),
            p('mt-1 font-script text-[34px] text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
