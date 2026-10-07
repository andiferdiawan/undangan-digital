import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Tinta Merah — luxury monokrom: kartu putih berlengkung (arch) di atas latar kain satin abu-krem,
 * foto hitam-putih, nama bertulisan tangan hitam, dan aksen tinta merah (Ephesis): tanggal, judul,
 * dan dinding tulisan "datang ya" berulang. Ciri khas: strip kalender tiga hari (H-1, hari H, H+1)
 * dengan tanggal dilingkari hati coretan pena merah yang "tergambar" saat masuk layar (uv-play),
 * kata-kata tinta merah di atas foto, dan tombol pil bergaris tipis.
 */
const A = '/theme-assets/tinta-merah'

// ---------- Gaya ----------
const LINEN = 'bg-[linear-gradient(118deg,#e4e0da,#f3f1ed_26%,#dedad3_45%,#f1eee9_66%,#e3dfd8)]'
const BW = 'grayscale contrast-[1.08] brightness-[.96]'
const SHADOW = 'shadow-[0_26px_44px_-30px_rgba(20,20,20,0.55)]'
const pill = 'inline-flex items-center justify-center rounded-full border border-ink/70 px-6 py-2 font-heading text-[11px] uppercase tracking-[0.28em] text-ink'
const pillDark = 'inline-flex items-center justify-center rounded-full bg-ink px-7 py-3 font-heading text-[12px] uppercase tracking-[0.28em] text-surface'
const caps = (t: string, cls = '') => p(`font-heading text-[12px] uppercase tracking-[0.3em] ${cls}`, t)
/** Tulisan tangan tinta merah */
const ink = (t: string, cls = '') => p(`font-script leading-[1.05] text-primary ${cls}`, t)
/** Tulisan tangan hitam */
const pen = (t: string, cls = '') => p(`font-script leading-[1.05] text-ink ${cls}`, t)
const body = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[17px] leading-snug text-ink/80 ${cls}`, t, opt)
const heart = (cls: string) => img(`pointer-events-none select-none ${cls}`, '{{asset.hati_kecil}}', '')
/** Kartu putih; bentuk lengkung (arch) diberikan lewat cls. */
const card = (cls: string, children: ThemeNode[]) => div(`relative mx-auto w-full max-w-[350px] overflow-hidden bg-surface ${SHADOW} ${cls}`, children)
/** Bingkai foto hitam-putih berpuncak lengkung, berisi slider Foto Sampul (cadangan: nama berdua). */
const archPhoto = (cls: string, interval = '4800') => div(`relative overflow-hidden rounded-t-[999px] bg-ink/10 ${cls}`, [
  div('absolute inset-0 grid place-items-center px-6', [pen('{{couple_names}}', 'text-center text-[34px] text-ink/40')]),
  comp('photo_slider', '', { interval, image_class: BW, dots: 'false' }),
])
/** Dinding tulisan tinta merah berulang di bawah kartu (baris bergeser bergantian, terpotong tepi kartu). */
function wall(word: string, cls: string): ThemeNode {
  const line = Array.from({ length: 5 }, () => word).join('  ')
  return div(`pointer-events-none relative overflow-hidden select-none ${cls}`, [
    div('absolute inset-x-0 top-0 grid gap-0', [0, 1, 2, 3].map(i =>
      p(`whitespace-nowrap font-script text-[34px] leading-[1.15] text-primary ${i % 2 ? '-ml-20' : '-ml-4'}`, line))),
    div('absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgb(var(--c-surface)),transparent)]'),
  ])
}
/** Satu kolom strip kalender: nama hari (kepala) + tanggal tipis besar. */
const dayCol = (weekday: string, num: string, cls = '', extra: ThemeNode[] = []) => div(`relative ${cls}`, [
  p('border-b border-ink/60 py-2 font-heading text-[10px] uppercase tracking-[0.18em] text-ink', weekday),
  p('relative z-[1] pt-3 font-body text-[60px] font-medium leading-none text-ink', num),
  ...extra,
])

function person(who: 'groom' | 'bride'): ThemeNode {
  return card('uv-reveal rounded-t-[175px] rounded-b-[28px] px-5 pb-8 pt-5 text-center', [
    div('relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-t-[999px] bg-ink/10', [
      img(`absolute inset-0 h-full w-full object-cover object-top ${BW}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [pen(`{{${who}_nickname}}`, 'text-[44px] text-ink/40')], { if: `!${who}_photo` }),
      ink(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', `absolute bottom-3 ${who === 'groom' ? 'left-4 -rotate-[6deg]' : 'right-5 rotate-[5deg]'} text-[30px] [text-shadow:0_0_6px_#fff,0_0_14px_rgba(255,255,255,0.8)]`),
    ]),
    pen(`{{${who}_nickname}}`, 'mt-5 text-[46px]'),
    caps(`{{${who}_name}}`, 'mt-2 text-[12px] leading-relaxed text-ink'),
    body(`{{${who}_parents}}`, 'mx-auto mt-3 max-w-[260px] text-[16px] italic', { if: `${who}_parents` }),
    el('a', `mt-4 ${pill}`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-009',
  slug: 'tinta-merah',
  name: 'Tinta Merah',
  category: 'elegan',
  description: 'Luxury monokrom: kartu putih berlengkung di atas kain satin, foto hitam-putih, nama bertulisan tangan, dan aksen tinta merah — kalender tiga hari dengan tanggal dilingkari hati coretan pena, dinding tulisan "datang ya", dan susunan acara bertulisan tangan.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#c41e2a',
    secondary_color: '#151515',
    accent_color: '#c41e2a',
    background_color: '#ebe8e3',
    surface_color: '#ffffff',
    text_color: '#151515',
    muted_color: '#6e6a66',
    font_heading: 'Josefin Sans',
    font_body: 'Cormorant Garamond',
    font_script: 'Ephesis',
  },
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    hati: `${A}/hati-tinta.svg`,
    hati_kecil: `${A}/hati-kecil.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/bride.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul: kartu lengkung, tanggal tinta merah, foto hitam-putih, nama tulisan tangan ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden ${LINEN} px-4 py-8 text-center`,
      children: [
        card('uv-reveal rounded-t-[175px] rounded-b-[28px] pt-12', [
          caps('Undangan Pernikahan', 'text-[11px] text-ink'),
          ink('{{event_date_num}} {{event_month}} {{event_year}}', 'mt-2 text-[34px]'),
          archPhoto('mx-4 mt-4 h-[300px]'),
          div('relative -mt-10 rounded-t-[40px] bg-surface px-6 pb-8 pt-6', [
            pen('{{groom_nickname}} & {{bride_nickname}}', 'text-[44px]'),
            heart('mx-auto mt-2 w-4'),
            body('Kepada Yth.', 'mt-4 text-[16px] italic text-muted'),
            comp('guest_name', 'mt-1 block font-heading text-[15px] uppercase leading-snug tracking-[0.14em] text-ink', { fallback: 'Tamu Undangan' }),
            div('mt-6', [comp('open_button', pillDark, { label: 'Buka Undangan' })]),
          ]),
        ]),
      ],
    },
    // ---------- Sapaan + strip kalender dengan hati coretan pena ----------
    {
      type: 'hero',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-6 text-center`,
      children: [
        card('rounded-[28px] pt-10', [
          pen('Teruntuk yang tersayang', 'uv-reveal px-6 text-[42px]'),
          body('{{opening_text}}', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[280px]'),
          p('uv-reveal uv-d2 mx-auto mt-5 max-w-[270px] font-heading text-[12px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-ink', 'Kami menantikan kehadiran Anda di hari pernikahan kami'),
          ink('{{event_month}}, {{event_year}}', 'uv-reveal mt-7 text-[40px]'),
          div('uv-reveal uv-d1 relative mx-5 mt-3 grid grid-cols-3 border-t border-ink/60', [
            dayCol('{{event_weekday_minus_one}}', '{{event_day_minus_one}}', 'border-r border-ink/60'),
            dayCol('{{event_day}}', '{{event_date_num}}', 'border-r border-ink/60', [
              // hati "tergambar" kiri → kanan saat strip masuk layar
              div('uv-play absolute left-1/2 top-[30px] h-[118px] w-[130px] -ml-[65px] [--uv-dur:1.6s]', [
                img('h-full w-full [clip-path:inset(0_calc((1_-_var(--uv-t))*100%)_0_0)]', '{{asset.hati}}', 'Hati'),
              ]),
            ]),
            dayCol('{{event_weekday_plus_one}}', '{{event_day_plus_one}}', ''),
          ]),
          caps('{{event_date}}', 'uv-reveal mt-12 text-[11px] text-muted'),
          wall('datang ya', 'mt-4 h-[150px]'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        card('rounded-[28px] px-7 py-10', [
          heart('uv-reveal mx-auto w-4'),
          p('uv-reveal uv-d1 mt-4 font-arabic text-[22px] leading-loose text-ink', '{{quote_arabic}}', { if: 'quote_arabic' }),
          body('“{{quote_text}}”', 'uv-reveal uv-d2 mt-3 text-[19px] italic'),
          ink('{{quote_source}}', 'uv-reveal uv-d3 mt-4 text-[30px]'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        caps('Kedua Mempelai', 'uv-reveal text-[12px] text-ink'),
        ink('dengan cinta', 'uv-reveal uv-d1 mt-1 text-[40px]'),
        div('mt-8 grid gap-8', [
          person('groom'),
          pen('&', 'uv-reveal text-[64px] text-primary'),
          person('bride'),
        ]),
      ],
    },
    // ---------- Hitung mundur ----------
    {
      type: 'countdown',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        card('rounded-[28px] px-6 pb-10 pt-10', [
          caps('Menuju hari bahagia', 'uv-reveal text-[11px] text-ink'),
          ink('{{event_day}}, {{event_date_num}} {{event_month}}', 'uv-reveal uv-d1 mt-2 text-[36px]'),
          div('uv-reveal uv-d2 mx-auto mt-7 max-w-[300px]', [comp('countdown', '', {
            item_class: 'border-r border-ink/25 py-1 text-center [&:last-child]:border-r-0',
            number_class: 'block font-body text-[46px] font-medium leading-none text-ink',
            label_class: 'mt-2 block font-heading text-[10px] uppercase tracking-[0.22em] text-muted',
          })]),
          div('mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: pill })]),
        ]),
      ],
    },
    // ---------- Acara: waktu, rute, foto dengan kata tinta merah, susunan acara ----------
    {
      type: 'event',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        card('rounded-t-[175px] rounded-b-[28px] pb-10 pt-12', [
          caps('Hari Bahagia', 'uv-reveal text-[11px] text-ink'),
          p('uv-reveal uv-d1 mt-2 font-heading text-[17px] uppercase tracking-[0.18em] text-ink', '{{event_date}}'),
          div('uv-reveal uv-d2 mt-4', [comp('map_button', pill, { href: '{{location_map}}', label: 'Rute Lokasi' }, { if: 'location_map' })]),
          div('relative mx-4 mt-6', [
            archPhoto('h-[260px]', '5600'),
            ink('cinta', 'absolute left-4 top-[40%] -rotate-[10deg] text-[44px] [text-shadow:0_0_6px_#fff,0_0_14px_rgba(255,255,255,0.8)]'),
            ink('selamanya', 'absolute bottom-3 left-1/2 -ml-[70px] -rotate-[5deg] text-[38px] [text-shadow:0_0_6px_#fff,0_0_14px_rgba(255,255,255,0.8)]'),
          ]),
          div('mt-8', [p(`uv-reveal ${pill}`, 'Susunan Acara')]),
          div('mt-8 grid gap-9 px-6', [
            el('article', 'uv-reveal', [
              ink('{{item.name}}', 'text-[40px]'),
              caps('{{item.time}}', 'mt-2 text-[12px] text-ink'),
              body('{{item.date}}', 'mt-1 text-[16px] italic text-muted'),
              p('mt-3 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-ink', '{{item.venue}}'),
              body('{{item.address}}', 'mx-auto mt-1 max-w-[260px] text-[15px]'),
              div('mt-4', [comp('map_button', pill, { href: '{{item.map_url}}', label: 'Lihat Peta' }, { if: 'item.map_url' })]),
              heart('mx-auto mt-7 w-3 opacity-70'),
            ], { repeat: 'events' }),
          ]),
        ]),
      ],
    },
    {
      type: 'story',
      class: `relative overflow-hidden ${LINEN} px-4`,
      children: [
        div('pb-14 pt-2', [
          card('rounded-[28px] px-7 py-10 text-center', [
            caps('Perjalanan Kami', 'uv-reveal text-[11px] text-ink'),
            ink('kisah cinta', 'uv-reveal uv-d1 mt-1 text-[40px]'),
            div('mt-8 grid gap-8', [
              div('uv-reveal', [
                caps('{{item.date}}', 'text-[11px] text-primary'),
                pen('{{item.title}}', 'mt-2 text-[34px]'),
                body('{{item.text}}', 'mt-2 text-[16px]'),
              ], { repeat: 'story' }),
            ]),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri hitam-putih berbingkai lengkung ----------
    {
      type: 'gallery',
      class: `relative overflow-hidden ${LINEN} px-4 text-center`,
      children: [
        div('pb-14 pt-2', [
          caps('Galeri', 'uv-reveal text-[12px] text-ink'),
          ink('momen kami', 'uv-reveal uv-d1 mt-1 text-[40px]'),
          div('mt-6 grid grid-cols-2 gap-3', [
            el('figure', `uv-reveal relative aspect-[3/4] overflow-hidden rounded-t-[999px] bg-surface p-1.5 ${SHADOW} [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/3] [&:nth-child(3n+1)]:rounded-t-[200px]`, [
              img(`h-full w-full rounded-t-[inherit] object-cover ${BW}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: `relative overflow-hidden ${LINEN} px-4 text-center`,
      children: [
        div('pb-14 pt-2', [
          caps('Tanda Kasih', 'uv-reveal text-[12px] text-ink'),
          ink('dengan tulus', 'uv-reveal uv-d1 mt-1 text-[40px]'),
          body('Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d2 mx-auto mt-3 max-w-[300px] text-[16px] italic'),
          div('mt-7 grid gap-5', [{
            ...card('uv-reveal rounded-[28px] px-7 py-9', [
              caps('{{item.bank}}', 'text-[11px] text-muted'),
              p('mt-3 font-heading text-[26px] tracking-[0.12em] text-ink', '{{item.number}}'),
              ink('a.n. {{item.holder}}', 'mt-2 text-[30px]'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: pill })]),
            ]),
            repeat: 'gifts',
          }]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        card('rounded-[28px] px-7 py-10', [
          caps('Konfirmasi Kehadiran', 'uv-reveal text-[11px] text-ink'),
          ink('kami menunggumu', 'uv-reveal uv-d1 mt-1 text-[38px]'),
          body('Mohon konfirmasi kehadiran Anda melalui formulir berikut.', 'uv-reveal uv-d2 mx-auto mt-2 max-w-[260px] text-[16px] italic'),
          div('uv-reveal mt-7 text-left', [comp('rsvp_form', '', {
            input_class: 'w-full border-0 border-b border-ink/30 bg-transparent px-1 py-2 font-body text-[18px] text-ink outline-none focus:border-primary',
            button_class: `mt-3 w-full ${pillDark} disabled:opacity-60`,
            label_class: 'grid gap-1 font-heading text-[11px] uppercase tracking-[0.18em] text-ink',
          })]),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: `relative overflow-hidden ${LINEN} px-4 pb-14 pt-2 text-center`,
      children: [
        card('rounded-[28px] px-7 py-10', [
          caps('Doa & Ucapan', 'uv-reveal text-[11px] text-ink'),
          ink('dari hati', 'uv-reveal uv-d1 mt-1 text-[38px]'),
          div('uv-reveal mt-6 text-left', [comp('wishes', '', {
            item_class: 'border-b border-ink/10 py-3',
            name_class: 'font-heading text-[13px] uppercase tracking-[0.14em] text-ink',
            text_class: 'mt-1 font-body text-[17px] leading-snug text-ink/80',
          })]),
        ]),
      ],
    },
    // ---------- Penutup: kartu lengkung, terima kasih, dinding tinta ----------
    {
      type: 'closing',
      class: `relative overflow-hidden ${LINEN} px-4 pb-10 pt-2 text-center`,
      children: [
        card('rounded-t-[175px] rounded-b-[28px] pt-12', [
          caps('Yang Berbahagia', 'uv-reveal text-[11px] text-ink'),
          body('{{groom_parents}}', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[270px] text-[16px] italic', { if: 'groom_parents' }),
          body('{{bride_parents}}', 'uv-reveal uv-d1 mx-auto mt-2 max-w-[270px] text-[16px] italic', { if: 'bride_parents' }),
          archPhoto('mx-4 mt-6 h-[260px]', '6200'),
          div('relative -mt-10 rounded-t-[40px] bg-surface px-6 pt-6', [
            ink('terima kasih', 'uv-reveal text-[46px]'),
            body('{{closing_text}}', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[280px] text-[16px]'),
            pen('{{couple_names}}', 'uv-reveal mt-5 text-[42px]'),
            heart('mx-auto mt-2 w-4'),
            caps('{{closing_greeting}}', 'uv-reveal mt-5 text-[10px] leading-relaxed text-muted'),
          ]),
          wall('sampai jumpa', 'mt-6 h-[120px]'),
        ]),
      ],
    },
  ],
}
