import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Bola Ugi — adat Bugis yang lapang & elegan, 3 warna saja (gading, hijau zamrud, emas) dan 2 aset
 * (atap timpalaja & pita walasuji). Konsep 3D mengikuti scroll:
 * - pembuka: rumah panggung Bugis; daun jendela berkisi walasuji terbuka lalu kamera masuk menembus jendela
 * - tengah: kartu datang dari kejauhan (uv-z)
 * - galeri: tiap foto dibingkai jendela dengan daun terbuka, maju-mundur di sumbu Z
 * - penutup: kamera mundur keluar jendela, daun jendela menutup kembali
 */
const IVORY = '#f8f4ec'
const EMERALD = '#1f4a42'
const GOLD = '#b8924a'
const A = '/theme-assets/bola-ugi'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center'
const card = `rounded-[2px] border border-[${GOLD}]/60 bg-white/70 px-7 pb-8 pt-6 shadow-[0_24px_50px_-34px_rgba(31,74,66,0.55)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${EMERALD}] px-7 py-3 font-body text-[12px] uppercase tracking-[0.28em] text-[${IVORY}]`
const band = (cls = '') => img(`mx-auto h-4 w-48 ${cls}`, '{{asset.walasuji}}')
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.4em] text-[${GOLD}]`, t)
const heading = (t: string, light = false) => el('h2', `mt-3 font-heading text-[30px] leading-[1.15] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)
// kisi walasuji (belah ketupat) pada daun jendela — murni CSS
const lattice = `bg-[${IVORY}] [background-image:repeating-linear-gradient(45deg,transparent_0_8px,${GOLD}_8px_9px),repeating-linear-gradient(-45deg,transparent_0_8px,${GOLD}_8px_9px)]`
const plank = `bg-[${IVORY}] bg-[repeating-linear-gradient(0deg,transparent_0_15px,rgba(31,74,66,0.16)_15px_16px)]`

/** Daun jendela; `open` 0..1 = sudut buka. */
function shutters(open: string): ThemeNode[] {
  return [
    div(`absolute inset-y-0 left-0 w-1/2 border border-[${EMERALD}] ${lattice} [transform-origin:left] [transform:perspective(500px)_rotateY(calc(${open}_*_-112deg))]`),
    div(`absolute inset-y-0 right-0 w-1/2 border border-[${EMERALD}] ${lattice} [transform-origin:right] [transform:perspective(500px)_rotateY(calc(${open}_*_112deg))]`),
  ]
}

/**
 * Rumah panggung Bugis (tampak depan). Jendela berada di tengah dinding; titik asal transform
 * di pusat jendela sehingga "zoom" terasa menembus jendela. z = 0..1 kamera masuk.
 */
function house(open: string, z: string): ThemeNode {
  const wall = `absolute ${plank}`
  return div(`absolute inset-0 flex items-center justify-center [opacity:clamp(0,calc((0.94_-_${z})_*_4),1)]`, [
    div(`relative w-[300px] [transform-origin:50%_62%] [transform:scale(calc(1_+_${z}_*_${z}_*_9))]`, [
      img('relative block h-[140px] w-[300px]', '{{asset.timpalaja}}', 'Atap rumah panggung Bugis'),
      div('relative mx-auto -mt-px h-[190px] w-[250px]', [
        div(`${wall} inset-x-0 top-0 h-[34px]`),
        div(`${wall} inset-x-0 bottom-0 h-[36px]`),
        div(`${wall} left-0 top-[34px] h-[120px] w-[73px]`),
        div(`${wall} right-0 top-[34px] h-[120px] w-[73px]`),
        div(`pointer-events-none absolute inset-0 border-2 border-[${EMERALD}]`),
        // kusen jendela
        div(`absolute left-[73px] top-[34px] h-[120px] w-[104px] outline outline-2 outline-[${EMERALD}] ring-1 ring-[${GOLD}] ring-offset-[3px] ring-offset-[${IVORY}]`, shutters(open)),
      ]),
      // tiang panggung
      div('mx-auto flex h-[44px] w-[236px] justify-between', [0, 1, 2, 3, 4].map(() => div(`h-full w-[5px] bg-[${EMERALD}]`))),
      div(`mx-auto h-px w-[280px] bg-[${GOLD}]`),
    ]),
  ])
}

/** Isi di balik jendela: kecil di dalam bingkai jendela, membesar saat kamera masuk. */
function inside(z: string, children: ThemeNode[]): ThemeNode {
  return div(`absolute inset-0 flex items-center justify-center px-6 [transform:translateY(calc((1_-_${z})_*_46px))_scale(calc(0.3_+_${z}_*_0.7))]`, [
    div('w-[300px] text-center', children),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${card} text-center`, [
    band('mb-6'),
    div(`relative mx-auto h-44 w-36 overflow-hidden border-2 border-[${EMERALD}] outline outline-1 outline-offset-4 outline-[${GOLD}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div(`absolute inset-0 grid place-items-center ${lattice}`, [el('span', `bg-[${IVORY}] px-2 font-script text-[40px] text-primary`, `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-6 font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[24px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${GOLD}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Adegan pembuka
const OPEN = ramp(0.04, 3.2)
const ZIN = ramp(0.36, 2.1)
// Adegan penutup
const ZOUT = `calc(1_-_${ramp(0.06, 2.6)})`
const SHUT = `calc(1_-_${ramp(0.5, 4)})`
const END = ramp(0.7, 4)

export const meta = {
  code: 'ADT-005',
  slug: 'bola-ugi',
  name: 'Bola Ugi',
  category: 'adat',
  description: 'Adat Bugis yang lapang dan elegan dengan tiga warna (gading, hijau zamrud, emas) dan konsep 3D: saat di-scroll daun jendela berkisi walasuji pada rumah panggung Bugis terbuka lalu kamera masuk menembus jendela, kartu datang dari kejauhan, foto tampil dalam bingkai jendela, dan di akhir jendela menutup kembali.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: EMERALD,
    secondary_color: GOLD,
    accent_color: GOLD,
    background_color: IVORY,
    surface_color: IVORY,
    text_color: EMERALD,
    muted_color: '#5e746e',
    font_heading: 'Marcellus',
    font_body: 'Lora',
    font_script: 'Allura',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { timpalaja: `${A}/timpalaja.svg`, walasuji: `${A}/walasuji.svg` },
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[${IVORY}] px-8 text-center`,
      children: [
        img('uv-reveal-zoom mx-auto h-[70px] w-[150px]', '{{asset.timpalaja}}', 'Atap rumah panggung Bugis'),
        kicker('Undangan Pernikahan'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-6 font-script text-[58px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[20px] text-[${GOLD}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        band('uv-reveal uv-d2 mt-5'),
        p('uv-reveal uv-d2 mt-4 font-body text-[13px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal uv-d3 relative mt-10', [
          p('font-body text-[13px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[22px] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d4 relative mt-8', [comp('open_button', btn, { label: 'Buka Jendela' })]),
      ],
    },
    // ---------- Pembuka: jendela rumah panggung terbuka, kamera masuk ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.8)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          inside(ZIN, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, 'Bismillahirrahmanirrahim'),
            p('mt-3 font-body text-[13px] italic text-muted', 'Assalamu’alaikum. Dengan rahmat Allah, kami mengundang Anda di hari bahagia'),
            p('mt-3 font-script text-[54px] leading-[1.05] text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
            band('mt-4'),
            p('mt-4 font-body text-[13px] uppercase tracking-[0.3em] text-primary', '{{event_date}}'),
          ]),
          house(OPEN, ZIN),
          p(`pointer-events-none absolute inset-x-0 bottom-8 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk membuka jendela'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${EMERALD}] px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          p(`font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          div(`mx-auto my-6 h-px w-16 bg-[${GOLD}]`),
          p(`font-body text-[16px] italic leading-relaxed text-[${IVORY}]/85`, '“{{quote_text}}”'),
          p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-7 py-24 text-center',
      children: [
        div('uv-z', [kicker('Mempelai'), heading('Dua Hati, Satu Rumah')]),
        p('uv-z mx-auto mt-4 max-w-[300px] font-body text-[14px] italic text-muted', '{{opening_text}}'),
        div('mt-12 grid gap-12', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${EMERALD}] px-7 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Waktu & Tempat'), heading('Hari Bahagia', true)]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `border-t border-[${GOLD}] pt-3 text-center`,
          number_class: `block font-heading text-[30px] leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.25em] text-[${GOLD}]`,
        })]),
        div('mt-12 grid gap-10', [
          el('article', `uv-z ${card} bg-[${IVORY}] text-center`, [
            band('mb-5'),
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[26px] leading-tight text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[15px] text-ink', '{{item.date}}'),
            p('font-body text-[14px] italic text-muted', '{{item.time}}'),
            div(`mx-auto my-5 h-px w-12 bg-[${GOLD}]`),
            p('font-heading text-[18px] text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Kisah Kami'), heading('Perjalanan Cinta')]),
          div('mt-12 grid gap-10', [
            div('uv-z text-center', [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[22px] leading-tight text-primary', '{{item.title}}'),
              p('mx-auto mt-2 max-w-[300px] font-body text-[14px] italic text-ink/80', '{{item.text}}'),
              band('mt-6 opacity-70'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: foto dalam bingkai jendela, maju-mundur di sumbu Z ----------
    {
      type: 'gallery',
      class: 'relative bg-base px-7',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Galeri'), heading('Dari Jendela Kami')]),
          div('mt-14 grid gap-16', [
            div('uv-z relative mx-auto w-[220px]', [
              div(`absolute -left-[38px] inset-y-0 w-[38px] border border-[${EMERALD}] ${lattice} [transform-origin:right] [transform:perspective(500px)_rotateY(62deg)]`),
              div(`absolute -right-[38px] inset-y-0 w-[38px] border border-[${EMERALD}] ${lattice} [transform-origin:left] [transform:perspective(500px)_rotateY(-62deg)]`),
              div(`relative aspect-[4/5] border-[3px] border-[${EMERALD}] outline outline-1 outline-offset-4 outline-[${GOLD}]`, [
                img('h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 pb-24 text-center',
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Kabari Kami')]),
        div(`uv-z mt-10 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[2px] border border-[${GOLD}]/50 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${EMERALD}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${GOLD}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-14 font-heading text-[24px] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/40 py-4`, name_class: 'font-heading text-[16px] text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${EMERALD}] px-7`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true)]),
          p(`uv-z mx-auto mt-4 max-w-[300px] font-body text-[14px] italic text-[${IVORY}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} bg-[${IVORY}] text-center`, [
              band('mb-5'),
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[26px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] italic text-muted', 'a.n. {{item.holder}}'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}] px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-primary` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: kamera mundur keluar jendela, jendela menutup ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div(`px-8 [opacity:${END}]`, [
            p('font-body text-[14px] italic text-muted', '{{closing_text}}'),
          ]),
          div('relative my-2 h-[390px] w-full shrink-0', [
            inside(ZOUT, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, 'Terima Kasih'),
              p('mt-3 font-script text-[54px] leading-[1.05] text-primary', '{{couple_names}}'),
              band('mt-4'),
            ]),
            house(SHUT, ZOUT),
          ]),
          div(`[opacity:${END}]`, [
            p('font-body text-[13px] italic text-muted', '{{closing_greeting}}'),
            p('mt-1 font-script text-[36px] text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
