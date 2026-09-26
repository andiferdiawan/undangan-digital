import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/doodle-cinta'
const INK = '#8b1414'
const BLUSH = '#f3c6c6'

/** Judul gaya spidol dengan garis bawah coretan yang tergambar */
const title = (heading: string, sub?: string) => [
  el('h2', `uv-reveal-pop font-heading text-[40px] leading-none text-primary [text-shadow:2px_2px_0_${BLUSH}]`, heading),
  img('uv-reveal uv-d1 mx-auto mt-1 h-4 w-40', '{{asset.underline}}'),
  ...(sub ? [p('uv-reveal uv-d2 mx-auto mt-2 max-w-[300px] font-body text-[18px] leading-snug text-muted', sub)] : []),
]
const sparkle = (pos: string, size = 'w-8') => div(`pointer-events-none absolute ${pos} ${size}`, [img('uv-wiggle w-full', '{{asset.sparkle}}')])
const heart = (cls = 'w-12') => div(`mx-auto ${cls}`, [img('animate-heart-beat animate-count-infinite w-full', '{{asset.heart}}', 'Hati')])
const inkBtn = `inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 font-body text-[19px] text-white shadow-[3px_3px_0_${BLUSH}]`

/** Foto dalam bingkai pita bergelombang (oval) */
function ribbonPhoto(who: 'groom' | 'bride'): ThemeNode {
  return div('relative mx-auto aspect-[150/210] w-48', [
    div(`absolute left-[8%] top-[14.5%] h-[80%] w-[84%] overflow-hidden rounded-[50%] bg-[${BLUSH}]`, [
      img('uv-reveal-mask absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'bride' ? 'Foto mempelai wanita' : 'Foto mempelai pria', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-5xl text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    img('pointer-events-none absolute inset-0 h-full w-full', '{{asset.ribbon}}'),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal-pop text-center', [
    ribbonPhoto(who),
    el('h3', 'mt-4 font-heading text-[30px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[19px] leading-snug text-ink', `{{${who}_parents}}`),
    el('a', 'mt-2 inline-flex items-center gap-1 font-body text-[17px] text-primary underline', '◎ Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

/** Ilustrasi pasangan memegang bingkai foto di depan wajah */
function couple(): ThemeNode {
  const framePhoto = (who: 'groom' | 'bride', pos: string) => div(`absolute ${pos} overflow-hidden bg-white`, [
    img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, '', { if: `${who}_photo` }),
    div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-[22px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
  ])
  return div('uv-float relative mx-auto aspect-[300/360] w-[270px]', [
    img('absolute inset-0 h-full w-full', '{{asset.couple}}', 'Ilustrasi mempelai memegang bingkai foto'),
    framePhoto('groom', 'left-[18.7%] top-[12.4%] h-[17.8%] w-[29.3%] -rotate-4'),
    framePhoto('bride', 'left-[55.3%] top-[17.2%] h-[16.7%] w-[26%] rotate-4'),
  ])
}

export const meta = {
  code: 'MOD-002',
  slug: 'doodle-cinta',
  name: 'Doodle Cinta',
  category: 'modern',
  description: 'Gen Z, simpel, lucu, dan manis: ilustrasi coretan tangan warna merah marun, pasangan memegang bingkai foto, strip kalender dengan tanggal H dilingkari, benang merah janji kelingking, bingkai pita, polaroid miring, dan banyak animasi memantul serta bergoyang.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: '#b3202a',
    accent_color: BLUSH,
    background_color: '#f6f1ee',
    surface_color: '#fffdfb',
    text_color: '#4a1c1c',
    muted_color: '#8a5a5a',
    font_heading: 'Caveat Brush',
    font_body: 'Caveat',
    font_script: 'Gochi Hand',
  },
  root_class: 'text-[18px] leading-snug',
  assets: {
    couple: `${A}/couple.svg`,
    ribbon: `${A}/ribbon.svg`,
    thread: `${A}/thread.svg`,
    circle: `${A}/circle.svg`,
    sparkle: `${A}/sparkle.svg`,
    rays: `${A}/rays.svg`,
    ring: `${A}/ring.svg`,
    heart: `${A}/heart.svg`,
    underline: `${A}/underline.svg`,
  },
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-3.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/rustic-senja/slide-1.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-base px-6 pb-12 pt-16 text-center',
      children: [
        sparkle('left-6 top-24', 'w-9'),
        sparkle('right-5 top-10', 'w-7'),
        div('relative', [
          img('uv-reveal-pop absolute -left-6 -top-5 w-9', '{{asset.ring}}'),
          el('h1', `uv-reveal-pop font-heading text-[46px] uppercase leading-[0.95] text-primary [text-shadow:3px_3px_0_${BLUSH}]`, 'Finally We\'re Getting Married!'),
          p('uv-reveal uv-d1 mt-2 font-script text-[20px] text-secondary', '{{event_date}}'),
        ]),
        img('uv-reveal-pop uv-d2 mx-auto mt-4 h-10 w-44', '{{asset.rays}}'),
        div('uv-reveal-pop uv-d2 -mt-1', [couple()]),
        p('uv-reveal uv-d3 mt-3 font-script text-[22px] text-secondary', 'Dear,'),
        comp('guest_name', 'uv-reveal uv-d3 block font-heading text-[30px] leading-tight text-primary', { fallback: 'Mr / Mrs / Guest' }),
        p('uv-reveal uv-d4 mx-auto mt-1 max-w-[280px] font-body text-[17px] text-muted', 'Dengan penuh cinta, kami mengundangmu ke hari bahagia kami.'),
        div('uv-reveal-pop uv-d5 mt-5', [div('uv-wiggle', [comp('open_button', inkBtn, { label: '✉ Buka Undangan' })])]),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-base px-5 py-20 text-center',
      children: [
        sparkle('left-5 top-16', 'w-8'),
        sparkle('bottom-24 right-6', 'w-10'),
        p('uv-reveal font-arabic text-[22px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        // Strip kalender miring, tanggal H dilingkari
        div('uv-reveal-flip uv-d1 relative mt-8', [
          div('-mx-8 -rotate-6 border-y-2 border-primary py-4', [
            div('flex items-end justify-around px-6 font-heading text-primary', [
              p('text-[34px] opacity-60', '{{event_day_minus_two}}'),
              p('text-[38px] opacity-80', '{{event_day_minus_one}}'),
              div('relative px-3', [
                img('pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]', '{{asset.circle}}'),
                p('relative text-[46px] leading-none', '{{event_date_num}}'),
                p('absolute -bottom-6 left-1/2 w-max -translate-x-1/2 font-script text-[16px] text-secondary', 'D-day'),
              ]),
              p('text-[38px] opacity-80', '{{event_day_plus_one}}'),
              p('text-[34px] opacity-60', '{{event_day_plus_two}}'),
            ]),
          ]),
        ]),
        p('uv-reveal uv-d2 mt-8 font-script text-[18px] text-secondary', '{{event_month}} {{event_year}}'),
        el('h2', `uv-reveal-pop uv-d2 mt-3 font-heading text-[38px] leading-none text-primary [text-shadow:2px_2px_0_${BLUSH}]`, 'Counting Down To Forever'),
        div('uv-reveal-pop uv-d3 relative mt-5', [
          comp('countdown', '', {
            item_class: 'py-1',
            number_class: 'block font-heading text-[46px] leading-none text-primary',
            label_class: 'font-body text-[17px] text-muted',
          }),
        ]),
        div('uv-reveal uv-d4 mt-6', [comp('calendar_button', '', { label: '▦ Save The Date', button_class: `${inkBtn} w-full` })]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-surface px-6 pb-4 pt-16 text-center',
      children: [
        div('relative mx-auto w-max', [
          img('pointer-events-none absolute -left-8 -top-5 w-9 -rotate-12', '{{asset.rays}}'),
          p('uv-reveal-pop font-heading text-[30px] text-primary', '#{{bride_nickname}}Dipinang{{groom_nickname}}'),
          sparkle('-right-8 -top-3', 'w-7'),
        ]),
        p('uv-reveal uv-d1 mt-5 font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
        p('uv-reveal uv-d2 mt-3 font-body text-[19px] leading-snug text-ink', '{{quote_text}}'),
        p('uv-reveal uv-d3 mt-2 font-body text-[18px] text-secondary', '{{quote_source}}'),
        img('uv-reveal uv-d3 -mx-6 mt-6 w-[calc(100%+48px)] max-w-none', '{{asset.thread}}', 'Janji kelingking dengan benang merah'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
      children: [
        ...title('Bride & Groom', 'Dua hati, satu playlist, dan nol kesepakatan soal mau makan apa.'),
        p('uv-reveal mt-6 font-script text-[19px] text-secondary', '{{greeting}}'),
        p('uv-reveal uv-d1 mx-auto mt-1 max-w-[320px] font-body text-[18px] text-ink/80', '{{opening_text}}'),
        div('mt-10 grid gap-8', [
          person('groom'),
          heart('w-14'),
          person('bride'),
        ]),
        sparkle('left-4 top-[40%]', 'w-8'),
        sparkle('right-4 top-[70%]', 'w-7'),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden bg-surface px-6 py-16 text-center',
      children: [
        ...title('Save The Date', 'Catat tanggalnya ya, jangan sampai kelewat!'),
        div('mt-8 grid gap-6', [
          el('article', `uv-reveal-flip relative rounded-2xl border-2 border-dashed border-primary bg-base p-6 shadow-[5px_5px_0_${BLUSH}]`, [
            img('absolute -right-3 -top-4 w-10 rotate-12', '{{asset.ring}}'),
            el('h3', 'font-heading text-[34px] leading-none text-primary', '{{item.name}}'),
            img('mx-auto mt-1 h-3 w-28', '{{asset.underline}}'),
            p('mt-3 font-heading text-[22px] text-primary', '{{item.date}}'),
            p('font-body text-[19px] text-secondary', '{{item.time}}'),
            p('mt-3 font-heading text-[22px] text-ink', '{{item.venue}}'),
            p('font-body text-[18px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-4 ${inkBtn}`, { href: '{{item.map_url}}', label: '⌖ Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'bg-base px-6',
      children: [
        div('py-16 text-center', [
          ...title('Our Little Story'),
          div('mt-8 grid gap-6 text-left', [
            div('uv-reveal-left relative pl-10', [
              div('absolute left-0 top-0 w-7', [img('w-full', '{{asset.heart}}')]),
              p('font-script text-[17px] text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-[26px] leading-tight text-primary', '{{item.title}}'),
              p('font-body text-[18px] text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-surface px-5',
      children: [
        div('py-16 text-center', [
          ...title('Captured Moments', 'Senyum-senyum sendiri lihatnya.'),
          div('mt-8 grid grid-cols-2 gap-x-3 gap-y-5', [
            // Polaroid miring bergantian
            div('group uv-reveal-pop', [
              div(`bg-white p-2 pb-8 shadow-[0_8px_18px_rgba(139,20,20,0.15)] group-odd:-rotate-3 group-even:rotate-3`, [
                img('aspect-square w-full object-cover', '{{item.url}}', '{{item.caption}}'),
                p('mt-1 font-body text-[15px] text-muted', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-16 text-center',
      children: [
        ...title('Kamu Datang, Kan?', 'Konfirmasi dulu yuk, biar kursimu aman.'),
        div(`uv-reveal-flip mt-8 rounded-2xl border-2 border-primary bg-surface p-5 text-left shadow-[5px_5px_0_${BLUSH}]`, [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-lg border-2 border-primary/30 bg-base px-3 py-2 font-body text-[19px] text-ink outline-none focus:border-primary',
            button_class: `w-full rounded-md bg-primary py-2.5 font-body text-[20px] text-white shadow-[3px_3px_0_${BLUSH}] disabled:opacity-60`,
            label_class: 'font-heading text-[18px] text-primary',
          }),
        ]),
        el('h3', 'uv-reveal mb-4 mt-12 font-heading text-[30px] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: 'rounded-xl border-2 border-dashed border-primary/40 bg-surface p-3', name_class: 'font-heading text-[20px] text-primary', text_class: 'font-body text-[18px] text-ink/80' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-6',
      children: [
        div('py-16 text-center', [
          ...title('Wedding Gift', 'Doa restumu sudah lebih dari cukup. Tapi kalau mau kirim kado, bisa lewat sini:'),
          div('mt-8 grid gap-6', [
            div('uv-reveal-pop', [
              div(`uv-tilt relative rounded-2xl border-2 border-primary bg-base p-5 text-left shadow-[5px_5px_0_${BLUSH}]`, [
                img('uv-depth-2 absolute -right-2 -top-4 w-10', '{{asset.heart}}'),
                p('uv-depth-1 font-heading text-[22px] text-primary', '{{item.bank}}'),
                p('uv-depth-2 mt-2 font-heading text-[30px] tracking-wider text-ink', '{{item.number}}'),
                p('uv-depth-1 font-body text-[18px] text-muted', 'a.n. {{item.holder}}'),
                div('uv-depth-2 mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-md border-2 border-primary px-4 py-1 font-body text-[18px] text-primary` })]),
              ]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-6 pb-20 pt-16 text-center',
      children: [
        sparkle('left-6 top-10', 'w-8'),
        sparkle('right-6 top-40', 'w-7'),
        el('h2', `uv-reveal-pop font-heading text-[44px] leading-none text-primary [text-shadow:3px_3px_0_${BLUSH}]`, 'See You There!'),
        div('uv-reveal-pop uv-d1 mt-4', [couple()]),
        p('uv-reveal uv-d2 mx-auto mt-4 max-w-[320px] font-body text-[19px] text-ink/85', '{{closing_text}}'),
        p('uv-reveal uv-d3 mt-3 font-script text-[18px] text-secondary', '{{closing_greeting}}'),
        div('uv-reveal-pop uv-d4 mt-6', [heart('w-10')]),
        p('uv-reveal uv-d4 mt-2 font-heading text-[34px] text-primary', '{{couple_names}}'),
        p('uv-reveal uv-d5 font-body text-[18px] text-secondary', '#{{bride_nickname}}Dipinang{{groom_nickname}}'),
      ],
    },
  ],
}
