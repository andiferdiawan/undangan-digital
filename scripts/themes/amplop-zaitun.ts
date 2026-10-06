import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Amplop Zaitun — elegan botanikal hijau zaitun, krem, dan emas dengan tepi kertas sobek. Alur pembuka:
 * 1. sampul: amplop zaitun tertutup bertuliskan "with love" dan segel hati emas — "Buka Undangan"
 * 2. setelah dibuka (uv-play): segel memudar, tutup amplop berayun ke belakang, kartu undangan
 *    "The Wedding day" naik keluar dari amplop
 * Isi: foto, mempelai, kalender sebulan penuh (hari H bertanda hati emas) + hitung mundur, rangkaian acara
 * berikon, lokasi, palet dress code, konfirmasi di kertas sage sobek, ucapan, tanda kasih, dan penutup
 * berupa amplop terbuka berisi kartu terima kasih.
 */
const A = '/theme-assets/amplop-zaitun'

// ---------- Adegan waktu (uv-play): --uv-t 0 → 1 ----------
const T = 'var(--uv-t,1)'
const ramp = (from: number, speed: number) => `clamp(0,(${T}_-_${from})*${speed},1)`
const sm = (r: string) => `calc(${r}*${r}*(3_-_2*${r}))`

// ---------- Tepi kertas sobek (clip-path bergerigi, titik semu-acak yang tetap) ----------
function jagged(seed: number, edge: 'bottom' | 'top'): string {
  let s = seed
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const pts: string[] = []
  const n = 22
  for (let i = n; i >= 0; i--) {
    const x = Math.min(100, Math.max(0, (i / n) * 100 + (i % n ? (rnd() - 0.5) * 3 : 0)))
    const y = edge === 'bottom' ? 45 + rnd() * 55 : rnd() * 55
    pts.push(`${x.toFixed(1)}%_${y.toFixed(0)}%`)
  }
  const base = edge === 'bottom' ? ['0_0', '100%_0'] : ['0_100%', '100%_100%']
  return `[clip-path:polygon(${[...base, ...pts].join(',')})]`
}
/** Kertas krem dari section di atas yang tersobek, menutupi tepi atas section berwarna (+ serat putih). */
const tornTop = (seed: number): ThemeNode[] => [
  div(`pointer-events-none absolute inset-x-0 -top-px h-[24px] bg-white/80 ${jagged(seed, 'bottom')}`),
  div(`pointer-events-none absolute inset-x-0 -top-px h-[17px] bg-base ${jagged(seed + 7, 'bottom')}`),
]
/** Kertas krem section berikutnya yang tersobek, menutupi tepi bawah section berwarna. */
const tornBottom = (seed: number): ThemeNode[] => [
  div(`pointer-events-none absolute inset-x-0 -bottom-px h-[24px] bg-white/80 ${jagged(seed, 'top')}`),
  div(`pointer-events-none absolute inset-x-0 -bottom-px h-[17px] bg-base ${jagged(seed + 7, 'top')}`),
]

// ---------- Tipografi & ornamen ----------
const heading = (t: string, cls = 'text-ink') => el('h2', `font-heading text-[26px] font-medium uppercase leading-tight tracking-[0.18em] ${cls}`, t)
const sprig = (cls = '', light = false) => img(`mx-auto h-5 w-40 ${cls}`, light ? '{{asset.daun_krem}}' : '{{asset.daun_emas}}')
const branch = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.ranting}}')
const btnSolid = 'inline-flex items-center justify-center bg-primary px-8 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-surface shadow-[0_12px_24px_-14px_rgba(40,45,30,0.8)]'
const btnOutlineLight = 'inline-flex items-center justify-center border border-surface/60 px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-surface'
const photoTone = 'sepia-[.1] saturate-[.9]'

// ---------- Amplop 3D: badan, kartu (dipotong di dasar amplop), kantong depan, tutup berengsel, segel ----------
const EW = 300
const EH = 190
const FLAP = 112
function envelope(o: { top: number, f: string, t: string, seal: string, card?: { top: number, h: number, children: ThemeNode[] } }): ThemeNode {
  const card = o.card
  const sink = card ? o.top + 10 - card.top : 0 // jarak turun kartu saat masih di dalam amplop
  return div(`relative mx-auto h-[${o.top + EH}px] w-[${EW}px] [perspective:1100px] [transform-style:preserve-3d]`, [
    div(`absolute inset-x-0 top-[${o.top}px] h-[${EH}px] rounded-[4px] bg-primary shadow-[0_30px_50px_-26px_rgba(40,45,30,0.8)]`, [
      div('absolute inset-0 rounded-[4px] bg-[linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0.12))]'),
    ]),
    ...(card
      ? [div('absolute inset-x-[14px] bottom-0 top-0 overflow-hidden [transform:translateZ(1px)]', [
          div(`absolute inset-x-0 top-[${card.top}px] h-[${card.h}px] rounded-[2px] bg-surface bg-[linear-gradient(180deg,#fffdf8,#f6f1e6)] px-4 text-center shadow-[0_6px_18px_-10px_rgba(0,0,0,0.45)] outline outline-1 outline-offset-[-8px] outline-accent/45 [transform:translateY(calc((1_-_${o.t})_*_${sink}px))]`, card.children),
        ])]
      : []),
    div(`absolute inset-x-0 top-[${o.top}px] h-[${EH}px] rounded-b-[4px] bg-primary [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)] [transform:translateZ(3px)]`, [
      div('absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.12),transparent_55%)]'),
      p('absolute inset-x-0 bottom-5 font-script text-[30px] leading-none text-surface/85', 'with love'),
    ]),
    div(`absolute inset-x-0 top-[${o.top}px] h-[${FLAP}px] bg-primary [clip-path:polygon(0_0,100%_0,50%_100%)] [transform-origin:top] [transform:rotateX(calc(${o.f}_*_-178deg))_translateZ(2px)]`, [
      div('absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.22))]'),
    ]),
    div(`absolute left-1/2 top-[${o.top + FLAP - 24}px] -ml-[23px] grid h-[46px] w-[46px] place-items-center rounded-full bg-accent shadow-[0_4px_10px_-2px_rgba(0,0,0,0.45)] ring-2 ring-accent/40 ring-offset-1 ring-offset-primary [opacity:${o.seal}] [transform:translateZ(5px)]`, [
      img('w-5', '{{asset.hati}}'),
    ]),
  ])
}

const weddingCard: ThemeNode[] = [
  p('mt-7 font-body text-[10px] font-semibold uppercase tracking-[0.35em] text-muted', 'Undangan Pernikahan'),
  p('mt-3 whitespace-nowrap font-heading text-[30px] font-medium uppercase leading-none tracking-[0.04em] text-ink', 'The Wedding'),
  p('mt-0.5 font-script text-[48px] leading-none text-accent', 'day'),
  p('mt-4 font-script text-[30px] leading-tight text-ink', '{{groom_nickname}} & {{bride_nickname}}'),
  p('mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-muted', '{{event_date}}'),
]

// Ikon rangkaian acara bergantian per urutan acara (cincin, hidangan, kamera, musik)
const ICON_BY_ORDER = [1, 2, 3, 4].map(i => `[&:nth-child(4n+${i % 4})_img:nth-child(${i})]:block`).join(' ').replace('4n+0', '4n')

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal', [
    div(`relative mx-auto aspect-[4/5] w-[210px] bg-secondary/30 outline outline-1 outline-offset-[6px] outline-accent/60`, [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[50px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p('mt-7 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-accent', who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[28px] font-semibold leading-tight text-ink', `{{${who}_name}}`),
    p('mx-auto mt-1 max-w-[280px] font-body text-[13px] text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-primary underline decoration-accent/60 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-007',
  slug: 'amplop-zaitun',
  name: 'Amplop Zaitun',
  category: 'elegan',
  description: 'Elegan botanikal hijau zaitun, krem, dan emas dengan tepi kertas sobek. Dibuka seperti surat: amplop "with love" terbuka dan kartu "The Wedding day" naik keluar. Kalender sebulan dengan hati emas di hari H, rangkaian acara berikon, lokasi, palet dress code, dan amplop terima kasih di penutup.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#646e50',
    secondary_color: '#a9af93',
    accent_color: '#b8955a',
    background_color: '#f3efe6',
    surface_color: '#fbf9f4',
    text_color: '#3b3e33',
    muted_color: '#76796a',
    font_heading: 'Cormorant Garamond',
    font_body: 'Montserrat',
    font_script: 'Pinyon Script',
  },
  root_class: 'text-[14px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    ranting: `${A}/ranting-zaitun.svg`,
    ranting_garis: `${A}/ranting-garis.svg`,
    daun_emas: `${A}/daun-emas.svg`,
    daun_krem: `${A}/daun-krem.svg`,
    hati: `${A}/ikon-hati.svg`,
    cincin: `${A}/ikon-cincin.svg`,
    hidangan: `${A}/ikon-hidangan.svg`,
    kamera: `${A}/ikon-kamera.svg`,
    musik: `${A}/ikon-musik.svg`,
    lokasi: `${A}/ikon-lokasi.svg`,
    // Foto dekorasi pembuka bagian lokasi (bisa diganti pelanggan dengan foto gedung/tempat acaranya)
    tempat: '/theme-assets/rustic-senja/decor-2.jpg',
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/decor-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride.jpg',
  },
  sections: [
    // ---------- Sampul: amplop tertutup ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden bg-base bg-[radial-gradient(circle_at_50%_40%,#faf7f0,transparent_70%)] px-6 py-12 text-center',
      children: [
        branch('-left-16 -top-14 w-44 -scale-y-100 opacity-90'),
        branch('-bottom-14 -right-16 w-44 rotate-180 opacity-90'),
        p('uv-reveal relative font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-muted', 'Undangan Pernikahan'),
        el('h1', 'uv-reveal-zoom uv-d1 relative mt-3 font-script text-[46px] leading-tight text-ink', '{{groom_nickname}} & {{bride_nickname}}'),
        p('uv-reveal uv-d2 relative mt-1 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 relative mt-8', [envelope({ top: 0, f: '0', t: '0', seal: '1' })]),
        p('uv-reveal uv-d4 relative mt-8 font-body text-[12px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
        comp('guest_name', 'relative mt-1 block font-heading text-[26px] font-semibold leading-snug text-ink', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', btnSolid, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Pembuka: amplop terbuka, kartu naik keluar ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-10 text-center',
      children: [
        branch('-left-14 -top-10 w-48 -scale-y-100 opacity-80'),
        branch('-right-14 top-[380px] w-44 rotate-180 opacity-70'),
        div('uv-play relative [--uv-dur:4.6s]', [
          envelope({
            top: 290,
            f: sm(ramp(0.05, 3.4)),
            t: sm(ramp(0.32, 2.2)),
            seal: `calc(1_-_${ramp(0, 8)})`,
            card: { top: 20, h: 380, children: weddingCard },
          }),
        ]),
        div('uv-reveal relative mx-auto mt-14 max-w-[320px]', [
          div('relative aspect-[4/5] overflow-hidden bg-secondary/40 shadow-[0_26px_40px_-26px_rgba(40,45,30,0.8)]', [
            div('absolute inset-0 grid place-items-center px-6', [el('span', 'font-script text-[42px] leading-tight text-primary', '{{couple_names}}')]),
            comp('photo_slider', '', { interval: '5000', image_class: photoTone }),
          ]),
        ]),
        p('uv-reveal relative mt-8 text-[14px] text-accent', '♥'),
        p('uv-reveal uv-d1 relative mt-2 font-script text-[38px] leading-tight text-ink', '{{groom_nickname}} & {{bride_nickname}}'),
        p('uv-reveal uv-d2 relative mx-auto mt-3 max-w-[290px] font-body text-[13px] leading-relaxed text-muted', 'Dua hati, satu tujuan. Tak ada yang lebih membahagiakan selain berbagi momen ini bersama Anda, dengan cinta dan kehangatan.'),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 pt-4 text-center',
      children: [
        sprig('uv-reveal'),
        p('uv-reveal uv-d1 mt-6 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d2 mx-auto mt-3 max-w-[320px] font-heading text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        p('uv-reveal uv-d3 mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-7 pb-20 pt-6 text-center',
      children: [
        branch('-right-16 top-[330px] w-40 rotate-180 opacity-60'),
        div('uv-reveal relative', [heading('Mempelai'), sprig('mt-2')]),
        p('uv-reveal uv-d1 relative mt-5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted', '{{greeting}}'),
        p('uv-reveal uv-d2 relative mx-auto mt-3 max-w-[300px] font-body text-[13px] leading-relaxed text-muted', '{{opening_text}}'),
        div('relative mt-12 grid gap-12', [
          person('groom'),
          p('uv-reveal font-script text-[52px] leading-none text-accent', '&'),
          person('bride'),
        ]),
      ],
    },
    // ---------- Kalender sebulan (zaitun) + hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-primary px-7 pb-20 pt-20 text-center text-surface',
      children: [
        ...tornTop(11),
        img('pointer-events-none absolute -bottom-2 -right-10 w-48 opacity-60', '{{asset.ranting_garis}}'),
        el('h2', 'uv-reveal relative font-heading text-[32px] font-medium uppercase leading-none tracking-[0.35em]', '{{event_month}}'),
        p('uv-reveal uv-d1 relative mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-surface/70', '{{event_year}}'),
        div('uv-reveal uv-d2 relative mx-auto mt-7 max-w-[310px]', [comp('month_calendar', '', {
          head_class: 'pb-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-surface/60',
          day_class: 'font-body text-[14px] text-surface/90',
          active_class: 'font-body text-[14px] font-bold text-surface',
          marker: 'heart',
          marker_class: 'text-accent',
        })]),
        sprig('uv-reveal relative mt-9', true),
        p('uv-reveal relative mt-6 font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-surface/80', 'Menghitung Hari'),
        div('uv-reveal relative mx-auto mt-3 max-w-[300px]', [comp('countdown', '', {
          item_class: 'border-r border-surface/20 py-1 text-center [&:last-child]:border-r-0',
          number_class: 'block font-heading text-[34px] font-medium leading-none text-surface',
          label_class: 'mt-1 block font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-surface/65',
        })]),
        div('relative mt-9', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnOutlineLight })]),
        ...tornBottom(23),
      ],
    },
    // ---------- Rangkaian acara, lokasi, dress code ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('relative px-7 pb-14 pt-14', [
          div('uv-reveal', [heading('Rangkaian Acara'), sprig('mt-2')]),
          div('relative mx-auto mt-10 max-w-[330px] text-left', [
            div('absolute bottom-4 left-[77px] top-3 w-px bg-accent/45'),
            div('relative grid gap-9', [
              el('article', `uv-reveal relative grid grid-cols-[56px_42px_1fr] items-start ${ICON_BY_ORDER}`, [
                div('flex justify-center pt-0.5', [
                  img('hidden h-10 w-12', '{{asset.cincin}}'),
                  img('hidden h-10 w-12', '{{asset.hidangan}}'),
                  img('hidden h-10 w-12', '{{asset.kamera}}'),
                  img('hidden h-10 w-12', '{{asset.musik}}'),
                ]),
                div('flex justify-center pt-1.5', [div('h-3 w-3 rounded-full bg-accent ring-4 ring-base')]),
                div('', [
                  p('font-body text-[15px] font-semibold text-ink', '{{item.time}}'),
                  p('mt-0.5 font-body text-[12px] font-semibold uppercase tracking-[0.18em] text-primary', '{{item.name}}'),
                  p('mt-1 font-body text-[12px] text-muted', '{{item.date}}'),
                  p('font-body text-[12px] text-muted', '{{item.venue}}'),
                  comp('map_button', 'mt-1.5 inline-block font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-accent underline underline-offset-4', { href: '{{item.map_url}}', label: 'Lihat peta' }, { if: 'item.map_url' }),
                ]),
              ], { repeat: 'events' }),
            ]),
          ]),
        ]),
        div('uv-reveal relative', [
          div('relative h-[230px] overflow-hidden', [
            img(`h-full w-full object-cover ${photoTone}`, '{{asset.tempat}}', 'Dekorasi tempat acara'),
            ...tornBottom(37),
          ]),
          div('px-7 pb-14 pt-5', [
            img('mx-auto w-9', '{{asset.lokasi}}'),
            el('h3', 'mt-2 font-heading text-[24px] font-semibold uppercase leading-tight tracking-[0.12em] text-ink', '{{event_venue}}'),
            p('mx-auto mt-2 max-w-[290px] font-body text-[13px] leading-relaxed text-muted', '{{event_address}}'),
            comp('map_button', `mt-6 ${btnSolid}`, { href: '{{location_map}}', label: 'Lihat di Peta' }, { if: 'location_map' }),
          ]),
        ]),
        div('mx-8 border-t border-accent/30'),
        div('relative px-7 pb-20 pt-14', [
          div('uv-reveal', [heading('Dress Code'), sprig('mt-2')]),
          p('uv-reveal uv-d1 mx-auto mt-5 max-w-[290px] font-body text-[13px] leading-relaxed text-muted', 'Hari ini sangat istimewa bagi kami. Kami akan senang sekali bila Anda berkenan hadir dengan busana bernuansa palet berikut.'),
          div('uv-reveal uv-d2 mt-7 flex justify-center gap-3', [
            div('h-10 w-10 rounded-full bg-primary shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'),
            div('h-10 w-10 rounded-full bg-[#cfb99c] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'),
            div('h-10 w-10 rounded-full bg-[#e3d9c7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'),
            div('h-10 w-10 rounded-full bg-surface shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]'),
            div('h-10 w-10 rounded-full bg-[linear-gradient(135deg,#e2c98f,#b8955a_55%,#e9d6a6)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'),
          ]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('pb-16 pt-4 text-center', [
          div('uv-reveal', [heading('Kisah Kami'), sprig('mt-2')]),
          div('mx-auto mt-10 grid max-w-[320px] gap-8 border-l border-accent/45 pl-6 text-left', [
            div('uv-reveal relative', [
              div('absolute -left-[30.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-base'),
              p('font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-accent', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[22px] font-semibold leading-tight text-ink', '{{item.title}}'),
              p('mt-1 font-body text-[13px] leading-relaxed text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('relative pb-20 pt-4', [
          branch('-left-14 top-0 w-40 -scale-y-100 opacity-60'),
          div('uv-reveal relative', [heading('Galeri'), sprig('mt-2')]),
          div('relative mt-10 grid grid-cols-2 gap-x-4 gap-y-5', [
            el('figure', 'uv-reveal bg-surface p-2 pb-6 shadow-[0_14px_26px_-18px_rgba(40,45,30,0.7)] [&:nth-child(odd)]:rotate-[-2deg] [&:nth-child(even)]:mt-6 [&:nth-child(even)]:rotate-[2deg]', [
              img(`aspect-[4/5] w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Konfirmasi di kertas sage sobek ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-secondary px-7 pb-24 pt-20 text-center text-ink',
      children: [
        ...tornTop(41),
        img('uv-reveal relative mx-auto w-10', '{{asset.hati}}'),
        el('h2', 'uv-reveal uv-d1 relative mt-4 font-heading text-[23px] font-semibold uppercase leading-tight tracking-[0.16em] text-ink', 'Tamu & Keluarga Terkasih'),
        p('uv-reveal uv-d2 relative mx-auto mt-3 max-w-[300px] font-body text-[13px] leading-relaxed text-ink/80', 'Kami ingin hari bahagia ini terasa nyaman bagi semua. Mohon kabari kami kehadiran Anda melalui formulir berikut.'),
        div('uv-reveal relative mt-8 bg-surface p-6 text-left shadow-[0_24px_40px_-26px_rgba(40,45,30,0.75)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full border border-primary/25 bg-white px-4 py-3 font-body text-[15px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btnSolid} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted',
          }),
        ]),
        ...tornBottom(53),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-14 text-center',
      children: [
        div('uv-reveal', [heading('Ucapan & Doa'), sprig('mt-2')]),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'border border-primary/15 bg-surface p-4',
          name_class: 'font-heading text-[18px] font-semibold text-ink',
          text_class: 'mt-1 font-body text-[13px] leading-relaxed text-muted',
        })]),
      ],
    },
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-7 text-center',
      children: [
        div('pb-16 pt-6', [
          div('uv-reveal', [heading('Tanda Kasih'), sprig('mt-2')]),
          p('uv-reveal uv-d1 mx-auto mt-5 max-w-[300px] font-body text-[13px] leading-relaxed text-muted', 'Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-4', [
            div('uv-reveal bg-primary px-6 py-7 text-surface shadow-[0_20px_34px_-24px_rgba(40,45,30,0.9)]', [
              p('font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-surface/75', '{{item.bank}}'),
              p('mt-2 font-heading text-[30px] font-medium tracking-wider', '{{item.number}}'),
              p('font-body text-[13px] text-surface/80', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'bg-surface px-5 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary' })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: amplop terbuka berisi kartu terima kasih ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-6 pb-32 pt-6 text-center',
      children: [
        branch('-bottom-16 -left-16 w-48 opacity-80'),
        branch('-bottom-16 -right-16 w-48 -scale-x-100 opacity-80'),
        div('uv-reveal relative', [heading('Terima Kasih'), sprig('mt-2')]),
        p('uv-reveal uv-d1 relative mx-auto mt-5 max-w-[300px] font-body text-[13px] leading-relaxed text-muted', '{{closing_text}}'),
        div('uv-reveal-pop uv-d2 relative mt-10', [envelope({
          top: 150,
          f: '1',
          t: '1',
          seal: '0',
          card: {
            top: 0,
            h: 270,
            children: [
              p('mt-7 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-muted', 'Sampai Jumpa'),
              p('mt-2 font-script text-[32px] leading-tight text-ink', '{{couple_names}}'),
              p('mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-accent', '{{event_date}}'),
            ],
          },
        })]),
        p('uv-reveal relative mt-10 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted', '{{closing_greeting}}'),
      ],
    },
  ],
}
