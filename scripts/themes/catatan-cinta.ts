import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Catatan Cinta — editorial ala Gen-Z: kertas abu-krem, merah ceri, foto hitam-putih, teks mesin ketik
 * (Courier Prime) dan coretan spidol merah (Mr Dafoe + aset SVG). Ciri khas:
 * tulisan "I Love You"/"Sah!" berulang di balik foto, amplop merah dengan surat menyembul di sampul,
 * kalender tiga hari (H-1, hari H, H+1) dengan tanggal dilingkari coretan, kotak coretan, catatan bernomor,
 * tombol bergaya neo-brutalist (bayangan pekat bergeser), dan penutup "WITH Love".
 */
const A = '/theme-assets/catatan-cinta'

// ---------- Gaya ----------
const GRAIN = 'bg-[radial-gradient(rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[length:4px_4px]'
const BW = 'grayscale contrast-[1.05]'
const btn = 'inline-flex items-center justify-center gap-2 border-2 border-ink bg-primary px-7 py-3 font-body text-[14px] font-bold lowercase text-surface shadow-[4px_4px_0_rgb(var(--c-ink))]'
const btnLight = 'inline-flex items-center justify-center gap-2 border-2 border-ink bg-surface px-6 py-2.5 font-body text-[13px] font-bold lowercase text-ink shadow-[4px_4px_0_rgb(var(--c-ink))]'
const caps = (t: string, cls = '') => el('h2', `font-heading text-[28px] uppercase leading-tight tracking-[0.12em] text-ink ${cls}`, t)
const scrawl = (t: string, cls = '') => p(`font-script leading-none text-primary ${cls}`, t)
const type = (t: string, cls = '') => p(`font-body text-[14px] leading-[1.65] text-ink ${cls}`, t)
const deco = (asset: string, cls: string) => img(`pointer-events-none absolute select-none ${cls}`, `{{asset.${asset}}}`)
/** Kotak coretan spidol yang membentang mengikuti ukuran wadahnya. */
const box = () => img('pointer-events-none absolute inset-0 h-full w-full select-none', '{{asset.kotak}}')
/** Tulisan tangan berulang di balik foto (I Love You / Sah!). */
function scrawlWall(word: string, size: number): ThemeNode {
  const line = Array.from({ length: 4 }, () => word).join(' ')
  return div('pointer-events-none absolute -inset-x-16 inset-y-0 grid -rotate-[8deg] content-center gap-1 overflow-hidden select-none', [0, 1, 2, 3, 4, 5].map(i =>
    p(`whitespace-nowrap font-script text-[${size}px] leading-[1.05] text-primary ${i % 2 ? '-ml-24' : 'ml-4'}`, line)))
}
/** Bingkai foto ala polaroid dengan slider (Foto Sampul → galeri), cadangan nama bila belum ada foto. */
const polaroid = (cls: string) => div(`relative bg-surface p-2.5 pb-11 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.55)] ${cls}`, [
  div('relative h-full w-full overflow-hidden bg-ink/10', [
    div('absolute inset-0 grid place-items-center px-4', [scrawl('{{couple_names}}', 'text-[34px]')]),
    comp('photo_slider', '', { interval: '4500', image_class: BW, dots: 'false' }),
  ]),
])

function person(who: 'groom' | 'bride'): ThemeNode {
  const tilt = who === 'groom' ? '-rotate-[3deg]' : 'rotate-[3deg] mt-8'
  return div('uv-reveal', [
    div(`relative mx-auto w-full bg-surface p-2 pb-9 shadow-[0_16px_26px_-16px_rgba(0,0,0,0.55)] ${tilt}`, [
      deco('klip', `-top-5 h-12 w-[18px] ${who === 'groom' ? 'left-5' : 'right-5'}`),
      div('relative aspect-[3/4] overflow-hidden bg-ink/10', [
        img(`absolute inset-0 h-full w-full object-cover object-top ${BW}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div('absolute inset-0 grid place-items-center', [img('w-14', '{{asset.hati}}')], { if: `!${who}_photo` }),
      ]),
      scrawl(`{{${who}_nickname}}`, 'absolute inset-x-0 bottom-1.5 text-center text-[30px]'),
    ]),
    p('mt-4 font-body text-[13px] font-bold leading-snug text-ink', `{{${who}_name}}`),
    p('mt-1 font-body text-[12px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-1 inline-block font-body text-[12px] font-bold text-primary underline underline-offset-4', '@instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Catatan kecil bernomor (seperti daftar "permintaan" di referensi)
const NOTES = [
  'Doa dan kehadiranmu adalah kado terbaik untuk kami.',
  'Datang tepat waktu ya, biar nggak ketinggalan momen sakralnya.',
  'Dress code: hitam, putih, atau merah. Biar fotonya makin kece!',
  'Jangan lupa foto bareng kami sebelum pulang, ya!',
]

export const meta = {
  code: 'MOD-011',
  slug: 'catatan-cinta',
  name: 'Catatan Cinta',
  category: 'modern',
  description: 'Editorial ala Gen-Z: kertas abu-krem, merah ceri, foto hitam-putih, teks mesin ketik, dan coretan spidol merah. Amplop merah bersurat di sampul, tulisan "I Love You" & "Sah!" di balik foto, kalender H-1/hari H/H+1 dengan tanggal dilingkari, catatan bernomor, dan penutup "WITH Love".',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#c81d25',
    secondary_color: '#1c1c1a',
    accent_color: '#c81d25',
    background_color: '#edeae5',
    surface_color: '#f9f7f3',
    text_color: '#1c1c1a',
    muted_color: '#67635d',
    font_heading: 'Josefin Sans',
    font_body: 'Courier Prime',
    font_script: 'Mr Dafoe',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    lingkaran: `${A}/lingkaran-coret.svg`,
    garis: `${A}/garis-coret.svg`,
    hati: `${A}/hati-coret.svg`,
    kotak: `${A}/kotak-coret.svg`,
    klip: `${A}/klip-perak.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride.jpg',
  },
  sections: [
    // ---------- Sampul: amplop merah, surat menyembul ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-base ${GRAIN} px-6 py-12 text-center`,
      children: [
        deco('hati', 'uv-wiggle right-6 top-10 w-14'),
        deco('garis', '-left-6 top-0 h-[300px] w-16 opacity-80'),
        p('uv-reveal relative font-body text-[13px] lowercase text-muted', 'psst... kamu diundang!'),
        el('h1', 'uv-reveal-zoom uv-d1 relative mt-2 font-script text-[58px] leading-[1.05] text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
        p('uv-reveal uv-d2 relative mt-2 font-heading text-[13px] uppercase tracking-[0.25em] text-ink', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 relative mx-auto mt-24 h-[170px] w-[280px] -rotate-[4deg]', [
          // tutup terbuka (di belakang surat), badan, surat, kantong depan
          div('absolute inset-x-0 -top-[86px] h-[88px] bg-[#a3161d] [clip-path:polygon(0_100%,100%_100%,50%_0)]'),
          div('absolute inset-0 bg-[#ad1820]'),
          div('absolute inset-x-5 -top-20 h-[170px] rotate-[3deg] bg-surface px-4 pt-4 text-left shadow-[0_6px_16px_-8px_rgba(0,0,0,0.45)]', [
            p('font-body text-[12px] leading-snug text-ink', 'Halo,'),
            comp('guest_name', 'block font-body text-[13px] font-bold leading-snug text-ink', { fallback: 'Tamu Undangan' }),
            p('mt-1 font-body text-[12px] leading-snug text-ink', 'kami ingin kamu jadi bagian dari hari bahagia kami.'),
          ]),
          div('absolute inset-0 bg-primary [clip-path:polygon(0_0,50%_48%,100%_0,100%_100%,0_100%)] shadow-[0_20px_30px_-16px_rgba(0,0,0,0.6)]', [
            div('absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),transparent_55%)]'),
            scrawl('{{couple_names}}', 'absolute inset-x-0 bottom-5 text-[30px] text-surface'),
          ]),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-10', [comp('open_button', btn, { label: 'buka undangan →' })]),
      ],
    },
    // ---------- Cinta itu... ----------
    {
      type: 'hero',
      class: `relative overflow-hidden bg-base ${GRAIN} px-6 pb-14 pt-14 text-center`,
      children: [
        caps('Cinta itu…', 'uv-reveal relative text-[30px]'),
        div('uv-reveal uv-d1 relative mt-6 h-[380px]', [
          scrawlWall('I Love You', 56),
          polaroid('uv-float mx-auto h-[350px] w-[250px] rotate-[3deg]'),
        ]),
        caps('…mimpi yang kita wujudkan bersama', 'uv-reveal relative mx-auto mt-8 max-w-[300px] text-[16px] tracking-[0.18em]'),
        deco('hati', 'uv-wiggle -right-1 bottom-8 w-12'),
        deco('garis', '-left-4 top-[460px] h-[260px] w-14 opacity-70'),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-base ${GRAIN} px-6 pb-14 text-center`,
      children: [
        div('uv-reveal relative mx-auto max-w-[340px] px-6 py-8', [
          box(),
          p('relative font-arabic text-[21px] leading-loose text-ink', '{{quote_arabic}}', { if: 'quote_arabic' }),
          type('“{{quote_text}}”', 'relative mt-2'),
          scrawl('{{quote_source}}', 'relative mt-3 text-[28px]'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: `relative overflow-hidden bg-base ${GRAIN} px-5 pb-16 pt-6 text-center`,
      children: [
        caps('Kenalan dulu', 'uv-reveal relative'),
        scrawl('the bride & groom', 'uv-reveal uv-d1 relative -mt-1 text-[38px]'),
        type('{{opening_text}}', 'uv-reveal uv-d2 relative mx-auto mt-4 max-w-[320px] text-[13px]'),
        div('relative mt-10 grid grid-cols-2 gap-5', [person('groom'), person('bride')]),
        deco('hati', 'uv-wiggle left-1/2 top-[300px] -ml-6 w-12'),
      ],
    },
    // ---------- Kalender H-1 / hari H / H+1 ----------
    {
      type: 'countdown',
      class: `relative overflow-hidden bg-base ${GRAIN} px-4 pb-16 pt-8 text-center`,
      children: [
        div('uv-reveal relative grid grid-cols-3 border-y-2 border-ink', [
          div('border-r-2 border-ink', [
            p('border-b-2 border-ink py-2 font-heading text-[13px] uppercase tracking-[0.15em] text-ink', 'H-1'),
            p('pt-2 font-body text-[11px] lowercase text-muted', '{{event_month}}'),
            p('pb-3 font-heading text-[72px] leading-none text-ink', '{{event_day_minus_one}}'),
          ]),
          div('relative border-r-2 border-ink', [
            p('border-b-2 border-ink py-2 font-heading text-[13px] uppercase tracking-[0.15em] text-ink', '{{event_day}}'),
            p('pt-2 font-body text-[11px] lowercase text-muted', '{{event_month}}'),
            p('pb-3 font-heading text-[72px] leading-none text-primary', '{{event_date_num}}'),
            deco('lingkaran', 'left-1/2 top-[38px] h-[122px] w-[150px] -ml-[75px]'),
          ]),
          div('', [
            p('border-b-2 border-ink py-2 font-heading text-[13px] uppercase tracking-[0.15em] text-ink', 'H+1'),
            p('pt-2 font-body text-[11px] lowercase text-muted', '{{event_month}}'),
            p('pb-3 font-heading text-[72px] leading-none text-ink', '{{event_day_plus_one}}'),
          ]),
        ]),
        scrawl('save our date!', 'uv-reveal uv-d1 relative mt-7 -rotate-[4deg] text-[46px]'),
        type('Hitung mundur menuju hari bahagia kami:', 'uv-reveal uv-d2 relative mt-5 text-[13px]'),
        div('uv-reveal uv-d2 relative mx-auto mt-4 max-w-[330px] px-2', [comp('countdown', '', {
          item_class: 'border-2 border-ink bg-surface py-2 shadow-[3px_3px_0_rgb(var(--c-ink))]',
          number_class: 'block font-heading text-[28px] leading-none text-ink',
          label_class: 'mt-1 block font-body text-[11px] lowercase text-muted',
        })]),
        div('relative mt-8', [comp('calendar_button', '', { label: 'simpan ke kalender', button_class: btnLight })]),
      ],
    },
    // ---------- Di mana & kapan + catatan kecil ----------
    {
      type: 'event',
      class: `relative overflow-hidden bg-base ${GRAIN} px-6 pb-16 pt-6 text-center`,
      children: [
        deco('garis', '-right-6 top-10 h-[420px] w-16 opacity-80'),
        caps('Di mana & kapan?', 'uv-reveal relative'),
        scrawl('see you there!', 'uv-reveal uv-d1 relative -mt-1 text-[38px]'),
        div('relative mt-8 grid gap-8', [
          el('article', 'uv-reveal relative mx-auto w-full max-w-[330px] px-6 pb-7 pt-6', [
            box(),
            scrawl('{{item.name}}', 'relative text-[40px]'),
            type('{{item.date}}', 'relative mt-3 font-bold'),
            type('pukul {{item.time}}', 'relative'),
            type('{{item.venue}}', 'relative mt-3 font-bold uppercase tracking-[0.05em]'),
            type('{{item.address}}', 'relative text-[13px] text-muted'),
            div('relative mt-5', [comp('map_button', btnLight, { href: '{{item.map_url}}', label: 'buka maps →' }, { if: 'item.map_url' })]),
          ], { repeat: 'events' }),
        ]),
        scrawl('catatan kecil', 'uv-reveal relative mt-14 text-[40px]'),
        div('relative mt-6 grid gap-6 text-left', NOTES.map((n, i) =>
          div(`uv-reveal relative w-[82%] px-5 pb-4 pt-5 ${i % 2 ? 'ml-auto rotate-[1.5deg]' : 'mr-auto -rotate-[1.5deg]'}`, [
            box(),
            div('absolute -left-2 -top-4 grid h-9 w-9 place-items-center rounded-full border-2 border-primary bg-base font-heading text-[16px] text-primary', String(i + 1)),
            type(n, 'relative text-[13px]'),
          ]),
        )),
      ],
    },
    {
      type: 'story',
      class: `relative bg-base ${GRAIN} px-6`,
      children: [
        div('pb-16 pt-2 text-center', [
          caps('Cerita kami', 'uv-reveal'),
          div('mx-auto mt-8 grid max-w-[330px] gap-7 text-left', [
            div('uv-reveal relative border-l-2 border-primary pl-5', [
              scrawl('{{item.date}}', 'text-[28px]'),
              p('mt-1 font-heading text-[16px] uppercase tracking-[0.1em] text-ink', '{{item.title}}'),
              type('{{item.text}}', 'mt-1 text-[13px]'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: "Sah!" di balik foto ----------
    {
      type: 'gallery',
      class: `relative overflow-hidden bg-base ${GRAIN} px-5 text-center`,
      children: [
        div('relative pb-16 pt-4', [
          div('uv-reveal relative h-[320px]', [
            scrawlWall('Sah! Sah!', 60),
            polaroid('mx-auto h-[300px] w-[230px] -rotate-[4deg]'),
          ]),
          div('relative mt-10 grid grid-cols-2 gap-x-4 gap-y-6', [
            el('figure', 'uv-reveal relative bg-surface p-2 pb-6 shadow-[0_14px_24px_-16px_rgba(0,0,0,0.55)] [&:nth-child(odd)]:-rotate-[2deg] [&:nth-child(even)]:mt-5 [&:nth-child(even)]:rotate-[2deg]', [
              img(`aspect-[4/5] w-full object-cover ${BW}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: `relative overflow-hidden bg-base ${GRAIN} px-6 text-center`,
      children: [
        div('pb-16 pt-2', [
          caps('Tanda kasih', 'uv-reveal'),
          type('Doa restumu sudah lebih dari cukup. Tapi kalau ingin memberi tanda kasih, bisa lewat sini:', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[310px] text-[13px]'),
          div('mt-8 grid gap-6', [
            div('uv-reveal mx-auto w-full max-w-[320px] border-2 border-ink bg-surface px-5 py-6 shadow-[6px_6px_0_rgb(var(--c-primary))]', [
              p('font-heading text-[12px] uppercase tracking-[0.2em] text-muted', '{{item.bank}}'),
              p('mt-1 font-heading text-[28px] tracking-wider text-ink', '{{item.number}}'),
              type('a.n. {{item.holder}}', 'text-[13px]'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'salin nomor', button_class: btn })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative overflow-hidden bg-base ${GRAIN} px-5 pb-16 pt-4 text-center`,
      children: [
        div('uv-reveal relative mx-auto max-w-[350px] bg-surface p-6 pt-9 text-left shadow-[0_22px_36px_-22px_rgba(0,0,0,0.6)]', [
          deco('klip', '-top-5 left-8 h-12 w-[18px]'),
          scrawl('konfirmasi yuk!', 'text-[40px]'),
          type('Biar kami bisa siapin tempat terbaik buat kamu, isi formulir ini ya.', 'mt-2 text-[13px]'),
          div('mt-5', [comp('rsvp_form', '', {
            input_class: 'w-full border-2 border-ink bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[12px] font-bold lowercase text-ink',
          })]),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: `relative overflow-hidden bg-base ${GRAIN} px-6 pb-14 pt-2 text-center`,
      children: [
        scrawl('doa & ucapan', 'uv-reveal relative text-[40px]'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: 'border-b-2 border-dashed border-ink/25 py-3',
          name_class: 'font-body text-[13px] font-bold text-ink',
          text_class: 'mt-1 font-body text-[13px] leading-relaxed text-ink/80',
        })]),
      ],
    },
    // ---------- Penutup: WITH Love ----------
    {
      type: 'closing',
      class: `relative overflow-hidden bg-base ${GRAIN} px-6 pb-16 pt-4 text-center`,
      children: [
        type('{{closing_text}}', 'uv-reveal relative mx-auto max-w-[320px] text-[13px]'),
        div('uv-reveal relative mx-auto mt-8 h-[410px] w-[330px]', [
          div('absolute left-0 top-0 h-[390px] w-[250px] overflow-hidden bg-ink/10', [
            div('absolute inset-0 grid place-items-center', [img('w-16', '{{asset.hati}}')]),
            comp('photo_slider', '', { interval: '5000', image_class: BW, dots: 'false' }),
          ]),
          div('absolute -bottom-4 right-0 text-right', [
            p('inline-block bg-base pl-3 pt-1 font-heading text-[62px] leading-none tracking-[0.05em] text-ink', 'WITH'),
            scrawl('Love', '-mt-5 mr-6 text-[78px]'),
          ]),
        ]),
        p('uv-reveal relative mt-16 font-heading text-[14px] uppercase tracking-[0.3em] text-ink', '{{couple_names}}'),
        type('{{closing_greeting}}', 'uv-reveal relative mt-2 text-[12px] text-muted'),
      ],
    },
  ],
}
