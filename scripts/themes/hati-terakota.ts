import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Hati Terakota — modern bergaya poster: peach lembut, terakota/karat, dan cokelat bata. Judul besar
 * bersans ramping (Oswald), tulisan tangan krem (Sacramento), hati terakota raksasa di sampul dengan
 * tanggal bertumpuk "06 / 08 / 26", pita teks berjalan "KAMI MENIKAH", kalender lima hari dengan
 * tanggal di dalam hati, susunan acara di atas foto, hitung mundur "tak sabar bertemu", dan foto
 * berbingkai krem dengan bayangan pekat.
 */
const A = '/theme-assets/hati-terakota'

// ---------- Gaya ----------
const btn = 'inline-flex items-center justify-center gap-2 bg-primary px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-surface'
const btnLight = 'inline-flex items-center justify-center gap-2 bg-surface px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-primary'
const btnLine = 'inline-flex items-center justify-center gap-2 border border-surface/70 px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-surface'
/** Judul besar bergaya poster */
const big = (t: string, cls = '') => p(`font-heading font-semibold uppercase leading-[0.95] ${cls}`, t)
const caps = (t: string, cls = '') => p(`font-body text-[11px] font-semibold uppercase tracking-[0.22em] ${cls}`, t)
const txt = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[14px] leading-relaxed ${cls}`, t, opt)
const script = (t: string, cls = '') => p(`font-script leading-none ${cls}`, t)
const heart = (cls: string) => img(`pointer-events-none select-none ${cls}`, '{{asset.hati}}', '')
/** Foto berbingkai krem dengan bayangan pekat bergeser */
/** cls wajib memuat posisi (relative/absolute) */
const frame = (cls: string, children: ThemeNode[]) => div(`overflow-hidden rounded-[22px] border-[5px] border-surface bg-secondary/20 shadow-[8px_8px_0_rgb(var(--c-secondary)/0.85)] ${cls}`, children)
const slider = (interval: string) => [
  div('absolute inset-0 grid place-items-center px-4', [big('{{couple_names}}', 'text-center text-[28px] text-surface/70')]),
  comp('photo_slider', '', { interval, dots: 'false' }),
]
/** Pita teks berjalan (isi digandakan 2× agar geseran -50% menyambung). */
function marquee(word: string, cls: string): ThemeNode {
  const half = Array.from({ length: 4 }, () => word)
  return div(`relative h-[44px] overflow-hidden whitespace-nowrap ${cls}`, [
    div('uv-marquee absolute inset-y-0 left-0 items-center [--uv-dur:20s]', [...half, ...half].map(w => p('px-3 font-heading text-[18px] font-medium uppercase tracking-[0.06em]', w))),
  ])
}
/** Satu sel kalender lima hari */
const cell = (num: string) => div('border-r border-primary/35 py-3 text-center last:border-r-0', [big(num, 'text-[34px] font-medium text-primary')])

function person(who: 'groom' | 'bride'): ThemeNode {
  const flip = who === 'bride'
  return div(`uv-reveal grid grid-cols-[1fr_1.1fr] items-center gap-5 ${flip ? 'text-right' : 'text-left'}`, [
    frame(`relative aspect-[3/4] ${flip ? 'order-last rotate-[3deg]' : '-rotate-[3deg]'}`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [big(`{{${who}_nickname}}`, 'text-[26px] text-surface')], { if: `!${who}_photo` }),
    ]),
    div('', [
      script(who === 'groom' ? 'mempelai pria' : 'mempelai wanita', 'text-[30px] text-primary'),
      big(`{{${who}_name}}`, 'mt-2 text-[26px] leading-[1.05] text-ink'),
      txt(`{{${who}_parents}}`, 'mt-2 text-[13px] text-muted', { if: `${who}_parents` }),
      el('a', 'mt-3 inline-block font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-primary underline underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
    ]),
  ])
}

export const meta = {
  code: 'MOD-013',
  slug: 'hati-terakota',
  name: 'Hati Terakota',
  category: 'modern',
  description: 'Modern bergaya poster dalam nuansa peach & terakota: hati terakota raksasa dengan tanggal bertumpuk di sampul, judul besar bersans ramping, pita teks "KAMI MENIKAH", kalender lima hari dengan tanggal di dalam hati, susunan acara di atas foto, dan hitung mundur "tak sabar bertemu".',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#a3391f',
    secondary_color: '#5e2214',
    accent_color: '#e8987a',
    background_color: '#f7dccb',
    surface_color: '#fdf1e7',
    text_color: '#5a2416',
    muted_color: '#97563f',
    font_heading: 'Oswald',
    font_body: 'Montserrat',
    font_script: 'Sacramento',
  },
  root_class: 'text-[15px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    hati: `${A}/hati.svg`,
    panah: `${A}/panah.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/bride.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul: hati terakota raksasa, nama, tanggal bertumpuk, foto, pita teks ----------
    {
      type: 'cover',
      class: 'relative flex flex-col overflow-hidden bg-base text-left',
      children: [
        div('my-auto w-full', [
        div('relative h-[560px]', [
          div('uv-reveal-zoom absolute -left-[78px] top-[150px] w-[410px] -rotate-[10deg]', [heart('w-full')]),
          div('uv-reveal absolute inset-x-6 top-9 text-right', [
            big('{{groom_nickname}}', 'text-[40px] text-primary'),
            big('& {{bride_nickname}}', 'mt-1 text-[40px] text-primary'),
          ]),
          script('kami menikah!', 'uv-reveal uv-d1 absolute left-6 top-[214px] -rotate-[12deg] text-[34px] text-surface'),
          div('uv-reveal uv-d2 absolute left-10 top-[276px]', [
            big('{{event_dd}}', 'text-[60px] font-bold text-surface'),
            big('{{event_mm}}', 'text-[60px] font-bold text-surface'),
            big('{{event_yy}}', 'text-[60px] font-bold text-surface'),
          ]),
          frame('uv-reveal uv-d3 absolute right-4 top-[208px] h-[290px] w-[188px] rotate-[5deg]', slider('4800')),
        ]),
        div('relative px-6 pb-7 pt-2', [
          caps('Kepada Yth.', 'text-muted'),
          comp('guest_name', 'mt-1 block font-heading text-[24px] font-medium uppercase leading-tight text-ink', { fallback: 'Tamu Undangan' }),
          div('mt-4', [comp('open_button', btn, { label: 'Buka Undangan' })]),
        ]),
        ]),
        marquee('Kami Menikah ♥', 'relative bg-primary text-surface'),
      ],
    },
    // ---------- Sapaan + kalender lima hari ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-6 pb-14 pt-14',
      children: [
        caps('{{greeting}}', 'uv-reveal text-muted'),
        big('Keluarga & sahabat tercinta!', 'uv-reveal uv-d1 mt-3 text-[46px] text-primary'),
        txt('{{opening_text}}', 'uv-reveal uv-d2 mt-5 max-w-[330px] text-ink'),
        div('uv-reveal mt-10 flex items-end justify-between', [caps('{{event_month}}', 'text-primary'), caps('{{event_year}}', 'text-primary')]),
        div('uv-reveal uv-d1 mt-2 grid grid-cols-5 border-y border-primary/40', [
          cell('{{event_day_minus_two}}'),
          cell('{{event_day_minus_one}}'),
          div('relative border-r border-primary/35 py-3 text-center', [
            heart('uv-reveal-pop absolute left-1/2 top-1/2 w-[70px] -translate-x-1/2 -translate-y-1/2'),
            big('{{event_date_num}}', 'relative text-[34px] font-medium text-surface'),
          ]),
          cell('{{event_day_plus_one}}'),
          cell('{{event_day_plus_two}}'),
        ]),
        div('relative mt-7 flex items-start justify-center gap-2', [
          img('uv-reveal mt-1 w-[56px] -scale-x-100', '{{asset.panah}}', ''),
          script('kami menunggumu!', 'uv-reveal uv-d1 -rotate-[5deg] text-[42px] text-primary'),
        ]),
        div('mt-6 text-center', [
          caps('{{event_venue}}', 'uv-reveal text-ink'),
          txt('{{event_address}}', 'uv-reveal uv-d1 mx-auto mt-1 max-w-[300px] text-[13px] text-muted'),
          div('uv-reveal uv-d2 mt-5', [comp('map_button', btn, { href: '{{location_map}}', label: 'Rute Lokasi' }, { if: 'location_map' })]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-primary px-8 py-14 text-center text-surface',
      children: [
        p('uv-reveal font-heading text-[30px]', '♥'),
        p('uv-reveal uv-d1 mt-3 font-arabic text-[22px] leading-loose', '{{quote_arabic}}', { if: 'quote_arabic' }),
        txt('“{{quote_text}}”', 'uv-reveal uv-d2 mx-auto mt-3 max-w-[330px] text-[15px] italic text-surface/90'),
        caps('{{quote_source}}', 'uv-reveal uv-d3 mt-5 text-surface/80'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-14',
      children: [
        big('Kedua mempelai', 'uv-reveal text-[46px] text-primary'),
        txt('{{opening_text}}', 'uv-reveal uv-d1 mt-3 max-w-[330px] text-ink/80'),
        div('mt-10 grid gap-12', [
          person('groom'),
          heart('uv-reveal-pop mx-auto w-12'),
          person('bride'),
        ]),
      ],
    },
    // ---------- Susunan acara di atas foto ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-primary text-surface',
      children: [
        div('relative h-[300px] overflow-hidden', [
          ...slider('5600'),
          div('pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(60,20,10,0.15),rgba(60,20,10,0.1)_45%,rgb(var(--c-primary)))]'),
        ]),
        div('relative -mt-20 px-6 pb-14', [
          big('Susunan acara kami', 'uv-reveal text-[48px]'),
          div('mt-8 grid gap-7', [
            el('article', 'uv-reveal border-t border-surface/35 pt-5', [
              big('{{item.time}}', 'text-[26px] font-medium'),
              caps('{{item.name}}', 'mt-2 text-[12px] text-surface'),
              txt('{{item.date}}', 'mt-1 text-[13px] text-surface/75'),
              caps('{{item.venue}}', 'mt-3 text-[11px] text-surface'),
              txt('{{item.address}}', 'text-[13px] text-surface/75'),
              div('mt-4', [comp('map_button', btnLine, { href: '{{item.map_url}}', label: 'Lihat Peta' }, { if: 'item.map_url' })]),
            ], { repeat: 'events' }),
          ]),
        ]),
      ],
    },
    // ---------- Hitung mundur: tak sabar bertemu ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-secondary px-6 pb-14 pt-14 text-center text-surface',
      children: [
        heart('pointer-events-none absolute -right-16 top-6 w-[220px] rotate-[14deg] opacity-40'),
        big('Tak sabar bertemu denganmu!', 'uv-reveal relative text-[46px]'),
        frame('uv-reveal uv-d1 relative mx-auto mt-8 h-[300px] w-[240px] -rotate-[3deg] shadow-[8px_8px_0_rgb(var(--c-primary))]', slider('5200')),
        div('uv-reveal uv-d2 relative mx-auto mt-10 max-w-[330px]', [comp('countdown', '', {
          item_class: 'border-r border-surface/35 py-1 text-center [&:last-child]:border-r-0',
          number_class: 'block font-heading text-[42px] font-medium leading-none text-surface',
          label_class: 'mt-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-surface/75',
        })]),
        div('relative mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLight })]),
      ],
    },
    {
      type: 'story',
      class: 'relative overflow-hidden bg-surface px-6',
      children: [
        div('py-14', [
          big('Kisah kami', 'uv-reveal text-[46px] text-primary'),
          div('mt-8 grid gap-8 border-l-2 border-primary/40 pl-6', [
            div('uv-reveal relative', [
              heart('absolute -left-[33px] top-1 w-4'),
              caps('{{item.date}}', 'text-primary'),
              big('{{item.title}}', 'mt-2 text-[24px] font-medium text-ink'),
              txt('{{item.text}}', 'mt-2 text-ink/80'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base',
      children: [
        div('pb-14 pt-10', [
          marquee('Momen Kami ♥', 'bg-primary text-surface'),
          div('mt-8 grid grid-cols-2 gap-4 px-5', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden rounded-[18px] border-[4px] border-surface shadow-[6px_6px_0_rgb(var(--c-primary))] [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/3] [&:nth-child(even)]:rotate-[2deg]', [
              img('h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-surface px-6',
      children: [
        div('py-14', [
          big('Tanda kasih', 'uv-reveal text-[46px] text-primary'),
          txt('Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mt-3 max-w-[320px] text-ink/80'),
          div('mt-8 grid gap-5', [{
            ...div('uv-reveal rounded-[22px] bg-base px-6 py-7 shadow-[6px_6px_0_rgb(var(--c-primary))]', [
              caps('{{item.bank}}', 'text-muted'),
              big('{{item.number}}', 'mt-2 text-[30px] font-medium tracking-[0.04em] text-primary'),
              txt('a.n. {{item.holder}}', 'mt-1 text-ink'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btn })]),
            ]),
            repeat: 'gifts',
          }]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-6 py-14',
      children: [
        big('Konfirmasi kehadiran', 'uv-reveal text-[44px] text-primary'),
        txt('Mohon konfirmasi kehadiran Anda melalui formulir berikut.', 'uv-reveal uv-d1 mt-3 max-w-[300px] text-ink/80'),
        div('uv-reveal mt-8 rounded-[22px] bg-surface px-5 py-6', [comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-primary/40 bg-transparent px-1 py-2 font-body text-[15px] text-ink outline-none focus:border-primary',
          button_class: `mt-3 w-full ${btn} disabled:opacity-60`,
          label_class: 'grid gap-1 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-primary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 py-14',
      children: [
        big('Doa & ucapan', 'uv-reveal text-[44px] text-primary'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: 'border-b border-primary/20 py-3',
          name_class: 'font-heading text-[18px] font-medium uppercase text-primary',
          text_class: 'mt-1 font-body text-[14px] leading-relaxed text-ink/85',
        })]),
      ],
    },
    // ---------- Penutup ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-primary text-center text-surface',
      children: [
        div('relative px-6 pb-12 pt-14', [
          heart('pointer-events-none absolute -left-20 top-24 w-[240px] -rotate-[12deg] opacity-25 [filter:brightness(1.6)]'),
          big('Sampai jumpa di hari bahagia!', 'uv-reveal relative text-[44px]'),
          txt('{{closing_text}}', 'uv-reveal uv-d1 relative mx-auto mt-4 max-w-[320px] text-surface/85'),
          script('{{couple_names}}', 'uv-reveal uv-d2 relative mt-6 text-[52px]'),
          txt('{{groom_parents}}', 'uv-reveal relative mx-auto mt-4 max-w-[300px] text-[13px] text-surface/75', { if: 'groom_parents' }),
          txt('{{bride_parents}}', 'uv-reveal relative mx-auto mt-1 max-w-[300px] text-[13px] text-surface/75', { if: 'bride_parents' }),
          caps('{{closing_greeting}}', 'uv-reveal relative mt-6 text-surface/80'),
        ]),
        marquee('Terima Kasih ♥', 'bg-surface text-primary'),
      ],
    },
  ],
}
