import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Piringan Rindu — vintage premium bertema piringan hitam, 3 warna saja (hijau botol, krem, kuningan)
 * dan 2 aset (piringan & ornamen). Konsep 3D mengikuti scroll:
 * - pembuka: piringan keluar dari sampul, meja putar miring ke sumbu Z, lengan jarum turun, piringan berputar
 * - tengah: tiap bagian adalah "track" dengan kartu yang datang dari kejauhan (uv-z)
 * - galeri: sampul-sampul foto di peti rekaman rebah satu per satu (uv-flip-book)
 * - penutup: sampul naik menutup piringan kembali
 */
const INK = '#2c3a2e'
const CREAM = '#efe6d2'
const BRASS = '#a88748'
const A = '/theme-assets/piringan-rindu'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:1000px]'
const frame = `rounded-[4px] border border-[${BRASS}]/70 bg-[${CREAM}] outline outline-1 outline-offset-[-9px] outline-[${BRASS}]/40 p-8 shadow-[0_24px_50px_-30px_rgba(28,38,29,0.6)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full border border-[${BRASS}] bg-[${INK}] px-7 py-3 font-body text-[13px] uppercase tracking-[0.25em] text-[${CREAM}]`
const ornament = (cls = '') => img(`mx-auto h-6 w-52 ${cls}`, '{{asset.ornamen}}')
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.4em] text-[${BRASS}]`, t)
const heading = (t: string, light = false) => el('h2', `mt-2 font-heading text-[38px] font-semibold italic leading-[1.05] ${light ? `text-[${CREAM}]` : 'text-primary'}`, t)
const bg = `bg-[radial-gradient(circle_at_50%_40%,#f8f2e4_0%,${CREAM}_58%,#e2d6bc_100%)]`

/** Sampul piringan: persegi hijau botol berbingkai kuningan ganda. */
function sleeve(cls: string, children: ThemeNode[]): ThemeNode {
  return div(`absolute inset-0 ${cls}`, [
    div(`flex h-full w-full flex-col items-center justify-center rounded-[3px] border border-[${BRASS}]/80 bg-[${INK}] px-5 text-center shadow-[0_26px_50px_-24px_rgba(28,38,29,0.85)] outline outline-1 outline-offset-[-10px] outline-[${BRASS}]/45`, children),
  ])
}

/** Piringan hitam; `spin` = sudut putar (ekspresi CSS), label berisi teks kecil. */
function record(cls: string, spin: string, label: ThemeNode[]): ThemeNode {
  return div(`absolute inset-0 ${cls}`, [
    div(`relative h-full w-full [transform:rotate(${spin})]`, [
      div(`relative h-full w-full motion-safe:animate-spin motion-safe:[animation-duration:9s]`, [
        img('h-full w-full drop-shadow-[0_18px_22px_rgba(28,38,29,0.45)]', '{{asset.piringan}}', 'Piringan hitam'),
        div(`absolute inset-[34%] grid place-items-center rounded-full text-center`, label),
      ]),
    ]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${frame} text-center`, [
    div(`relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-[${INK}]/10 ring-1 ring-[${BRASS}] ring-offset-4 ring-offset-[${CREAM}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top sepia-[.3]', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[46px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-5 font-body text-[11px] uppercase tracking-[0.35em] text-[${BRASS}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[28px] font-semibold italic leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${BRASS}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Peti rekaman: indeks sampul & tumpukan (sampul pertama paling depan) lewat nth-child
const PAGES = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${6 - i}]`).join(' ')

// Adegan pembuka
const OUT = ramp(0.03, 3.2) // piringan keluar, sampul turun
const TILT = ramp(0.32, 3.6) // meja putar miring
const ARM = ramp(0.55, 4.5) // lengan jarum turun
const TXT = ramp(0.7, 4) // teks undangan muncul
// Adegan penutup
const IN = ramp(0.08, 2.6) // sampul naik menutup piringan
const END = ramp(0.62, 4)

export const meta = {
  code: 'LUX-004',
  slug: 'piringan-rindu',
  name: 'Piringan Rindu',
  category: 'elegan',
  description: 'Vintage premium bertema piringan hitam, tiga warna (hijau botol, krem, kuningan) dengan efek 3D saat di-scroll: piringan keluar dari sampul dan berputar di meja putar, kartu datang dari kejauhan, sampul foto rebah satu per satu, lalu piringan kembali ke sampulnya.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: BRASS,
    accent_color: BRASS,
    background_color: CREAM,
    surface_color: CREAM,
    text_color: INK,
    muted_color: '#5f6b5c',
    font_heading: 'Playfair Display',
    font_body: 'Cormorant Garamond',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[16px] leading-relaxed',
  assets: { piringan: `${A}/piringan.svg`, ornamen: `${A}/ornamen.svg` },
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden ${bg} px-6 text-center`,
      children: [
        div(`pointer-events-none absolute inset-4 rounded-[4px] border border-[${BRASS}]/60`),
        div(`pointer-events-none absolute inset-6 rounded-[2px] border border-[${BRASS}]/30`),
        kicker('Side A · The Wedding Of'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-5 font-script text-[56px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[24px] italic text-[${BRASS}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        ornament('uv-reveal uv-d2 mt-4'),
        p('uv-reveal uv-d2 mt-3 font-body text-[15px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 relative mx-auto mt-7 h-28 w-28', [record('', '0deg', [])]),
        div('uv-reveal uv-d4 relative mt-6', [
          p('font-body text-[14px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[24px] font-semibold italic text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-7', [comp('open_button', btn, { label: 'Putar Undangan' })]),
      ],
    },
    // ---------- Pembuka: piringan keluar dari sampul & diputar ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3)] ${bg}`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[10%] [opacity:calc(1_-_${TILT})]`, [kicker('Now Playing'), ornament('mt-3')]),
          div(`relative -mt-10 h-[220px] w-[220px] [transform-style:preserve-3d] [transform:translateY(calc(${TILT}_*_-24px))_rotateX(calc(${TILT}_*_54deg))_scale(calc(1_+_${TILT}_*_0.1))]`, [
            // alas meja putar
            div(`absolute inset-[-20px] rounded-[12px] border border-[${BRASS}]/70 bg-[${INK}]/[0.06] outline outline-1 outline-offset-[-7px] outline-[${BRASS}]/35 [opacity:${TILT}] [transform:translateZ(-2px)]`),
            record(`[transform:translateX(calc((1_-_${OUT})_*_19%))]`, `calc(${S}_*_1440deg)`, [
              p(`font-script text-[17px] leading-none text-[${CREAM}]`, '{{groom_nickname}} & {{bride_nickname}}'),
            ]),
            sleeve(`[transform:translateZ(4px)_translateX(calc(-19%_-_${OUT}_*_8%))_translateY(calc(${OUT}_*_150%))_rotate(calc(${OUT}_*_-10deg))] [opacity:calc(1_-_${OUT}_*_1.3)]`, [
              p(`font-body text-[9px] uppercase tracking-[0.35em] text-[${BRASS}]`, 'Side A'),
              p(`mt-2 font-script text-[36px] leading-[1.05] text-[${CREAM}]`, '{{groom_nickname}}'),
              p(`font-heading text-[16px] italic text-[${BRASS}]`, '&'),
              p(`font-script text-[36px] leading-[1.05] text-[${CREAM}]`, '{{bride_nickname}}'),
              img('mx-auto mt-2 h-4 w-32', '{{asset.ornamen}}'),
            ]),
            // lengan jarum
            div(`absolute right-[-30px] top-[-22px] h-7 w-7 [opacity:${TILT}] [transform:translateZ(10px)]`, [
              div(`absolute inset-0 rounded-full border-2 border-[${CREAM}]/70 bg-[${BRASS}]`),
              div(`absolute left-[12px] top-[13px] h-[168px] w-[4px] rounded-full bg-[${BRASS}] [transform-origin:top] [transform:rotate(calc(-10deg_+_${ARM}_*_30deg))]`, [
                div(`absolute bottom-[-6px] left-[-5px] h-[16px] w-[14px] rounded-[3px] bg-[${BRASS}] ring-1 ring-[${CREAM}]/60`),
              ]),
            ]),
          ]),
          div(`absolute inset-x-0 bottom-[9%] px-8 [opacity:${TXT}] [transform:translateY(calc((1_-_${TXT})_*_24px))]`, [
            p(`font-body text-[11px] uppercase tracking-[0.3em] text-[${BRASS}]`, 'Bismillahirrahmanirrahim'),
            p('mx-auto mt-2 max-w-[290px] font-body text-[16px] italic leading-snug text-muted', 'Dengan memohon rahmat Allah, izinkan lagu cinta kami mengalun di hari bahagia'),
            p('mt-2 font-script text-[40px] leading-none text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
            p('mt-2 font-body text-[13px] uppercase tracking-[0.3em] text-primary', '{{event_date}}'),
          ]),
          p(`pointer-events-none absolute inset-x-0 bottom-8 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk memutar'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${INK}] px-6 py-24 text-center`,
      children: [
        div('uv-z', [
          ornament(),
          p(`mt-6 font-arabic text-[21px] leading-loose text-[${CREAM}]`, '{{quote_arabic}}'),
          p(`mt-4 font-heading text-[19px] italic leading-snug text-[${CREAM}]/90`, '“{{quote_text}}”'),
          p(`mt-3 font-body text-[12px] uppercase tracking-[0.3em] text-[${BRASS}]`, '{{quote_source}}'),
          ornament('mt-6'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        div('uv-z', [kicker('Track 01 · Dengan Penuh Syukur'), heading('Kedua Mempelai'), ornament('mt-4')]),
        p('uv-z mx-auto mt-4 max-w-[300px] font-body text-[16px] italic text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-10', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${INK}] px-6 py-20 text-center`,
      children: [
        div('uv-z', [kicker('Track 02 · Save The Date'), heading('Waktu & Tempat', true), ornament('mt-4')]),
        div('uv-z mt-8', [comp('countdown', '', {
          item_class: `rounded-full border border-[${BRASS}]/60 py-4 text-center`,
          number_class: `block font-heading text-[28px] font-semibold leading-none text-[${CREAM}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${BRASS}]`,
        })]),
        div('mt-10 grid gap-10', [
          el('article', `uv-z ${frame} text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${BRASS}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[28px] font-semibold italic leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-body text-[16px] text-ink', '{{item.date}}'),
            p('font-body text-[15px] italic text-muted', '{{item.time}}'),
            img('mx-auto my-4 h-5 w-40', '{{asset.ornamen}}'),
            p('font-heading text-[19px] font-semibold text-primary', '{{item.venue}}'),
            p('font-body text-[15px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${BRASS}] px-6 py-2.5 font-body text-[13px] uppercase tracking-[0.2em] text-[${CREAM}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-6',
      children: [
        div('py-20 text-center', [
          div('uv-z', [kicker('Track 03 · Kisah Kami'), heading('Perjalanan Cinta'), ornament('mt-4')]),
          div('mt-10 grid gap-8', [
            div(`uv-z ${frame} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${BRASS}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[24px] font-semibold italic leading-tight text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[16px] italic text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: sampul foto di peti rekaman rebah satu per satu ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${INK}]`,
      children: [
        div(stage, [
          div('absolute inset-x-0 top-[9%]', [kicker('Track 04 · Koleksi Kenangan'), heading('Momen Kami', true)]),
          div('uv-flip-book relative mt-20 h-[260px] w-[260px]', [
            div(`uv-flip-page absolute inset-0 ${PAGES}`, [
              div(`h-full w-full rounded-[3px] border border-[${BRASS}]/80 bg-[${CREAM}] p-2.5 shadow-[0_22px_40px_-18px_rgba(0,0,0,0.7)] [backface-visibility:hidden] [transform-origin:bottom_center] [transform:perspective(1000px)_rotateX(calc(clamp(0,${S}*7_-_var(--i,0)*1.05,1)*-100deg))]`, [
                img('h-full w-full rounded-[2px] object-cover sepia-[.3]', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
            div(`uv-flip-end absolute inset-0 z-0 grid place-items-center rounded-[3px] border border-[${BRASS}]/70 bg-[${CREAM}] p-6`, [
              div('', [
                div('relative mx-auto h-24 w-24', [record('', '0deg', [])]),
                p('mt-4 font-script text-[32px] leading-tight text-primary', 'dan lagu kami terus mengalun…'),
              ]),
            ]),
          ]),
          p(`absolute inset-x-0 bottom-[7%] font-body text-[11px] uppercase tracking-[0.35em] text-[${BRASS}]`, 'Scroll untuk memilah kenangan'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        div('uv-z', [kicker('Track 05 · Konfirmasi Kehadiran'), heading('Kirim Balasan'), ornament('mt-4')]),
        div(`uv-z mt-8 ${frame} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[3px] border border-[${BRASS}]/60 bg-white/60 px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${INK}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[12px] uppercase tracking-[0.2em] text-[${BRASS}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-12 font-heading text-[26px] font-semibold italic text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${BRASS}]/40 py-4`, name_class: 'font-heading text-[17px] font-semibold italic text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${INK}] px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true), ornament('mt-4')]),
          p(`uv-z mx-auto mt-4 max-w-[300px] font-body text-[16px] italic text-[${CREAM}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-8', [
            div(`uv-z ${frame} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${BRASS}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[26px] font-semibold tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[15px] italic text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${BRASS}] px-5 py-2 font-body text-[12px] uppercase tracking-[0.2em] text-primary` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: piringan kembali masuk sampul ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] ${bg}`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[10%] px-8 [opacity:calc(1_-_${IN}_*_1.4)]`, [
            p('font-body text-[16px] italic text-muted', '{{closing_text}}'),
          ]),
          div('relative -mt-6 h-[220px] w-[220px]', [
            record(`[transform:translateX(calc(${IN}_*_19%))]`, `calc(${S}_*_-720deg)`, []),
            sleeve(`[transform:translateX(calc(-19%_*_${IN}))_translateY(calc((1_-_${IN})_*_160%))_rotate(calc((1_-_${IN})_*_12deg))] [opacity:calc(${IN}_*_2)]`, [
              p(`font-body text-[9px] uppercase tracking-[0.35em] text-[${BRASS}]`, 'Side B · Terima Kasih'),
              p(`mt-2 font-script text-[30px] leading-tight text-[${CREAM}]`, '{{couple_names}}'),
              img('mx-auto mt-2 h-4 w-32', '{{asset.ornamen}}'),
              p(`mt-2 px-2 font-body text-[11px] italic leading-snug text-[${CREAM}]/75`, '{{closing_greeting}}'),
            ]),
          ]),
          div(`absolute inset-x-0 bottom-[11%] [opacity:${END}]`, [
            p('font-script text-[36px] text-primary', 'with love,'),
            p(`font-body text-[12px] uppercase tracking-[0.35em] text-[${BRASS}]`, '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
