import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Merah Delima — modern editorial putih bersih & merah delima (burgundy): sampul berkolom merah dengan tulisan
 * tangan tipis vertikal, foto yang memudar lembut ke putih di tepinya, tanggal besar bertumpuk "26 / 07 / 26",
 * susunan acara di sepanjang garis bergelombang dengan ikon cincin, coretan berulang "this is love" di atas foto,
 * tiga pesan bernomor "01/ 02/ 03/", dan pita merah untuk hadiah & penutup.
 * Foto tampil apa adanya (berwarna atau hitam-putih sesuai foto asli pelanggan).
 * Warna turunan dari globals (bg-primary, text-primary, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/merah-delima'

const script = (t: string, cls = '') => el('h2', `font-script text-[46px] font-normal leading-[0.95] text-primary ${cls}`, t)
const small = (t: string, cls = '') => p(`font-body text-[14px] font-light leading-relaxed text-muted ${cls}`, t)
const link = 'inline-block border-b border-primary pb-0.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary'
const pill = 'inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-body text-[12px] font-medium uppercase tracking-[0.22em] text-surface'
/** Foto memudar ke putih di sisi atas & bawah (gaya cetak editorial). */
const fadeY = '[mask-image:linear-gradient(180deg,transparent_0%,#000_18%,#000_72%,transparent_100%)]'
const fadeB = '[mask-image:linear-gradient(180deg,#000_0%,#000_62%,transparent_100%)]'
const photoTone = ''

/** Tiga pesan bernomor untuk tamu (teks tetap, sopan & syar'i). */
const wishes: [string, string][] = [
  ['01/', 'Mohon hadir tepat waktu agar dapat mengikuti seluruh rangkaian acara bersama kami sejak awal.'],
  ['02/', 'Kenakan pakaian yang sopan dan nyaman; nuansa merah, putih, atau krem akan menyempurnakan suasana.'],
  ['03/', 'Doa restu Anda adalah hadiah terindah. Kehadiran Anda sudah lebih dari cukup bagi kami.'],
]

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal text-center', [
    div(`relative mx-auto aspect-[3/4] w-full overflow-hidden ${fadeB}`, [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center bg-secondary/40', [el('span', 'font-script text-[56px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p('-mt-6 font-script text-[38px] leading-none text-primary', `{{${who}_nickname}}`),
    el('h3', 'mt-3 font-body text-[13px] font-semibold uppercase leading-snug tracking-[0.12em] text-ink', `{{${who}_name}}`),
    p('mt-1 font-body text-[13px] font-light leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
  ])
}

export const meta = {
  code: 'MOD-016',
  slug: 'merah-delima',
  name: 'Merah Delima',
  category: 'modern',
  description: 'Modern editorial putih & merah delima: sampul berkolom merah dengan tulisan tangan vertikal, foto memudar lembut ke putih, tanggal besar bertumpuk, susunan acara di garis bergelombang berikon cincin, coretan "this is love", dan tiga pesan bernomor.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#8a1c2c',
    secondary_color: '#f1e3e3',
    accent_color: '#b4505e',
    background_color: '#ffffff',
    surface_color: '#ffffff',
    text_color: '#2a2224',
    muted_color: '#6f6466',
    font_heading: 'Montserrat',
    font_body: 'Montserrat',
    font_script: 'Mea Culpa',
  },
  root_class: 'text-[16px] leading-relaxed text-ink',
  assets: {
    cincin: `${A}/cincin.svg`,
    gelombang: `${A}/gelombang.svg`,
    hati: `${A}/hati.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-3.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-3.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: kolom merah bertulisan vertikal + foto memudar ----------
    {
      type: 'cover',
      class: 'relative flex min-h-[100svh] overflow-hidden bg-base text-center',
      children: [
        div('relative w-[64px] shrink-0 bg-primary', [
          p('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-script text-[54px] leading-none text-surface', 'Wedding Invitation'),
        ]),
        div('relative flex min-w-0 flex-1 flex-col', [
          p('uv-reveal relative z-10 px-5 pt-14 font-script text-[54px] leading-[0.9] text-primary', '{{groom_nickname}}'),
          p('uv-reveal uv-d1 relative z-10 -mt-1 pl-16 pr-4 font-script text-[54px] leading-[0.9] text-primary', '{{bride_nickname}}'),
          div(`relative -mt-6 h-[60svh] min-h-[380px] w-full ${fadeY}`, [
            comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
          ]),
          div('relative -mt-4 px-5 pb-12', [
            p('uv-reveal font-body text-[11px] uppercase tracking-[0.3em] text-primary', '{{event_dd}} · {{event_mm}} · {{event_yy}}'),
            p('uv-reveal uv-d1 mt-5 font-body text-[13px] font-light text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
            comp('guest_name', 'mt-1 block font-body text-[16px] font-semibold uppercase tracking-[0.08em] text-ink', { fallback: 'Tamu Undangan' }),
            div('uv-reveal-pop uv-d2 mt-6', [comp('open_button', pill, { label: 'Buka Undangan' })]),
          ]),
        ]),
      ],
    },
    // ---------- Pembuka: "Kami menikah!" + foto + tanggal besar bertumpuk ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base pb-14 text-center',
      children: [
        div('relative px-6 pt-14', [
          p('uv-reveal font-script text-[58px] leading-[0.9] text-primary', '{{groom_nickname}}'),
          p('uv-reveal uv-d1 -mt-2 pl-20 font-script text-[58px] leading-[0.9] text-primary', '{{bride_nickname}}'),
        ]),
        div(`relative -mt-4 h-[440px] w-full ${fadeY}`, [
          comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
        ]),
        div('relative -mt-6 px-8', [
          script('Kami menikah!', 'uv-reveal text-[44px]'),
          small('{{greeting}}', 'uv-reveal uv-d1 mt-4'),
          small('{{opening_text}}', 'uv-reveal uv-d1 mx-auto mt-2 max-w-[300px]'),
          div('uv-reveal-zoom mt-8 grid justify-center font-script text-[76px] leading-[0.82] text-primary', [
            el('span', '', '{{event_dd}}'),
            el('span', 'pl-14', '{{event_mm}}'),
            el('span', 'pl-28', '{{event_yy}}'),
          ]),
          p('uv-reveal mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-muted', '{{event_day}}'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 text-center',
      children: [
        div('mx-auto h-px w-16 bg-primary/40'),
        p('uv-reveal mt-10 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[14px] font-light italic leading-relaxed text-ink/80', '“{{quote_text}}”'),
        p('uv-reveal uv-d2 mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-primary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-6 pb-16 text-center',
      children: [
        script('Kedua mempelai', 'uv-reveal'),
        div('mt-8 grid grid-cols-2 gap-4', [person('groom'), person('bride')]),
      ],
    },
    // ---------- Susunan acara: garis bergelombang + ikon cincin ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-6 py-14 text-center',
      children: [
        script('Susunan acara', 'uv-reveal'),
        img('uv-reveal mx-auto mt-5 w-20', '{{asset.cincin}}'),
        div('relative mx-auto mt-8 max-w-[340px]', [
          img('pointer-events-none absolute inset-y-0 left-0 h-full w-[90px]', '{{asset.gelombang}}'),
          div('relative grid gap-10 pl-[86px] text-left', [
            el('article', 'uv-reveal', [
              p('font-body text-[22px] font-extralight leading-tight tracking-[0.04em] text-primary', '{{item.time}}'),
              p('mt-1 font-body text-[15px] font-semibold uppercase tracking-[0.08em] text-ink', '{{item.name}}'),
              small('{{item.date}}', 'text-[13px]'),
              p('mt-3 font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-primary', '{{item.venue}}'),
              small('{{item.address}}', 'text-[13px] leading-snug'),
              comp('map_button', `mt-3 ${link}`, { href: '{{item.map_url}}', label: 'Lihat di peta' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
        ]),
      ],
    },
    // ---------- Hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative bg-primary px-7 py-14 text-center text-surface',
      children: [
        el('h2', 'uv-reveal font-script text-[46px] leading-none text-surface', 'Menuju hari bahagia'),
        div('uv-reveal mx-auto mt-8 max-w-[320px]', [comp('countdown', '', {
          item_class: 'relative border-r border-surface/25 py-1 text-center last:border-r-0',
          number_class: 'block font-body text-[32px] font-extralight leading-none text-surface',
          label_class: 'mt-2 block font-body text-[10px] uppercase tracking-[0.2em] text-surface/75',
        })]),
        div('mt-8', [comp('calendar_button', '', { label: 'Simpan tanggal', button_class: 'inline-flex items-center justify-center rounded-full border border-surface/70 px-7 py-2.5 font-body text-[12px] uppercase tracking-[0.22em] text-surface' })]),
      ],
    },
    // ---------- Galeri: coretan "this is love" di atas foto ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('py-14', [
          div('relative px-4', [
            div('uv-reveal relative z-10 -mb-16 text-left font-script text-[50px] leading-[0.85] text-primary', [
              p('', 'this is love'),
              p('pl-6', 'this is love'),
              p('pl-12', 'this is love'),
            ]),
            div(`relative h-[420px] w-full ${fadeY}`, [
              comp('photo_slider', 'absolute inset-0', { interval: '4500', image_class: photoTone, dots: 'false' }),
            ]),
          ]),
          div('mt-6 grid grid-cols-2 gap-2 px-5', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden', [
              img(`absolute inset-0 h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Beberapa pesan: 01/ 02/ 03/ ----------
    {
      type: 'story',
      class: 'relative bg-base px-7 pb-14 text-center',
      children: [
        script('Beberapa pesan', 'uv-reveal'),
        div('mx-auto mt-8 grid max-w-[320px] gap-8', wishes.map(([n, t], i) => div(`uv-reveal uv-d${i + 1}`, [
          p('font-script text-[44px] leading-none text-primary', n),
          small(t, 'mt-2'),
        ]))),
        div('mt-14 grid gap-9', [
          div('uv-reveal mx-auto max-w-[300px]', [
            p('font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-primary', '{{item.date}}'),
            p('mt-1 font-script text-[36px] leading-none text-primary', '{{item.title}}'),
            small('{{item.text}}', 'mt-2'),
          ], { repeat: 'story' }),
        ], { if: 'story' }),
      ],
    },
    // ---------- Hadiah ----------
    {
      type: 'gift',
      class: 'relative bg-secondary/50 px-7 text-center',
      children: [
        div('py-14', [
          script('Tanda kasih', 'uv-reveal'),
          small('Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
          div('mt-8 grid gap-4', [
            div('uv-reveal bg-surface px-5 py-6 shadow-[0_10px_30px_-18px_rgba(138,28,44,0.5)]', [
              p('font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-primary', '{{item.bank}}'),
              p('mt-2 font-body text-[22px] font-light tracking-[0.12em] text-ink', '{{item.number}}'),
              small('a.n. {{item.holder}}', 'text-[13px]'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin nomor', button_class: pill })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Konfirmasi ----------
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 py-14 text-center',
      children: [
        script('Ada pertanyaan?', 'uv-reveal'),
        small('Mohon konfirmasi kehadiran Anda melalui formulir berikut agar kami dapat menyambut Anda dengan sebaik-baiknya.', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
        div('uv-reveal mt-8 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-primary/30 bg-transparent px-1 py-2.5 font-body text-[15px] text-ink outline-none focus:border-primary',
          button_class: `w-full ${pill} disabled:opacity-60`,
          label_class: 'grid gap-1 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-primary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative bg-base px-7 pb-14 text-center',
      children: [
        script('Ucapan & doa', 'uv-reveal'),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'border-b border-primary/15 bg-transparent px-1 py-4 text-left',
          name_class: 'font-body text-[13px] font-semibold uppercase tracking-[0.1em] text-primary',
          text_class: 'mt-1 font-body text-[14px] font-light leading-relaxed text-muted',
        })]),
      ],
    },
    // ---------- Penutup: foto memudar + pita merah ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div(`relative h-[460px] w-full ${fadeY}`, [
          comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
        ]),
        div('relative -mt-10 px-8 pb-10', [
          el('h2', 'uv-reveal font-script text-[48px] leading-[0.95] text-primary', 'Sampai jumpa di hari bahagia kami'),
          small('{{closing_text}}', 'uv-reveal uv-d1 mx-auto mt-5 max-w-[300px]'),
          img('uv-reveal mx-auto mt-6 w-10', '{{asset.hati}}'),
        ]),
        div('bg-primary px-8 py-10 text-surface', [
          p('font-body text-[11px] uppercase tracking-[0.3em] text-surface/75', '{{closing_greeting}}'),
          p('mt-2 font-script text-[46px] leading-none', '{{couple_names}}'),
        ]),
      ],
    },
  ],
}
