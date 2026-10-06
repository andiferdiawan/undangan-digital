import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Mocca Gypsophila — elegan hangat bernuansa cokelat mocha & krem dengan rangkaian bunga baby's breath
 * (gypsophila) putih. Sampul berupa amplop mocha bertutup segitiga dan segel monogram; isi bergantian
 * blok krem dan mocha, monogram inisial "A | B", strip kalender hari H, ikon garis tipis.
 * Semua warna turunan dari globals (bg-primary, text-surface, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/mocca-gypsophila'

const kicker = (t: string, cls = 'text-accent') => p(`font-body text-[12px] font-semibold uppercase tracking-[0.35em] ${cls}`, t)
const scriptHeading = (t: string, cls = 'text-primary') => el('h2', `mt-1 font-script text-[48px] leading-tight ${cls}`, t)
/** Huruf pertama nama panggilan saja (sisa teks berukuran 0) untuk monogram. */
const initial = (who: 'groom' | 'bride', size: number) =>
  el('span', `inline-block text-[0px] leading-none first-letter:text-[${size}px]`, `{{${who}_nickname}}`)
const monogram = (size: number, cls = '') => div(`flex items-center justify-center gap-4 font-heading text-primary ${cls}`, [
  initial('groom', size),
  el('span', 'w-px self-stretch bg-primary/45'),
  initial('bride', size),
])
/** Rangkaian bunga sudut. Asli tumbuh dari kiri bawah; posisi lain dibalik/diputar lewat kelas. */
const spray = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.bunga}}')
const btnSolid = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-body text-[13px] font-semibold uppercase tracking-[0.25em] text-surface shadow-[0_12px_24px_-14px_rgba(70,50,42,0.8)]'
const btnOutlineLight = 'inline-flex items-center justify-center rounded-full border border-surface/60 px-6 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-surface'
const photoTone = 'sepia-[.12]'

function person(who: 'groom' | 'bride'): ThemeNode {
  const flip = who === 'bride'
  return div('uv-reveal relative mt-10', [
    div('relative mx-auto w-[190px]', [
      div('relative aspect-[3/4] rounded-t-full border border-primary/30 p-2', [
        div('relative h-full w-full overflow-hidden rounded-t-full bg-secondary/25', [
          img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
          div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[52px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
        ]),
      ]),
      img(`pointer-events-none absolute -bottom-7 w-32 ${flip ? '-right-14 -scale-x-100' : '-left-14'}`, '{{asset.tangkai}}'),
    ]),
    p('mt-6 font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-accent', who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[26px] leading-tight text-primary', `{{${who}_name}}`),
    p('mx-auto mt-1 max-w-[280px] font-body text-[16px] italic text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-body text-[14px] text-primary underline decoration-primary/40 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'FLR-002',
  slug: 'mocca-gypsophila',
  name: 'Mocca Gypsophila',
  category: 'floral',
  description: 'Elegan hangat bernuansa cokelat mocha dan krem dengan rangkaian bunga baby\'s breath putih. Sampul amplop bersegel monogram, foto berbingkai mocha, strip kalender hari H, hitung mundur, dan ikon garis tipis.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#8b6b5d',
    secondary_color: '#c9b3a4',
    accent_color: '#a8875e',
    background_color: '#f6f0e9',
    surface_color: '#fffcf8',
    text_color: '#5a463d',
    muted_color: '#8f7a6e',
    font_heading: 'Playfair Display',
    font_body: 'Cormorant Garamond',
    font_script: 'Great Vibes',
  },
  // lining-nums: angka Cormorant setinggi huruf kapital (bawaannya angka gaya lama)
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    bunga: `${A}/gipsofila-sudut.svg`,
    tangkai: `${A}/gipsofila-tangkai.svg`,
    tunas: `${A}/ikon-tunas.svg`,
    cincin: `${A}/ikon-cincin.svg`,
    hadiah: `${A}/ikon-hadiah.svg`,
    kalender: `${A}/ikon-kalender.svg`,
    hati: `${A}/ikon-hati.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/bride-2.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/rustic-senja/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/decor-1.jpg', '/theme-assets/rustic-senja/bride.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: amplop mocha bertutup segitiga + segel monogram ----------
    {
      type: 'cover',
      class: 'relative flex flex-col overflow-hidden bg-base text-center',
      children: [
        div('relative bg-primary px-8 pt-14 text-surface', [
          p('uv-reveal font-body text-[12px] font-semibold uppercase tracking-[0.4em] text-surface/80', 'The Wedding of'),
          el('h1', 'uv-reveal-zoom uv-d1 mt-4 font-script text-[60px] leading-[1.1] text-surface', [
            el('span', 'block', '{{groom_nickname}}'),
            el('span', 'block text-[38px] leading-none text-surface/75', '&'),
            el('span', 'block', '{{bride_nickname}}'),
          ]),
        ]),
        // Badan amplop (sedikit lebih terang) dengan tutup segitiga berbayang
        div('relative bg-primary pb-9 pt-[184px]', [
          div('absolute inset-0 bg-white/[0.07]'),
          div('absolute inset-x-0 top-0 [filter:drop-shadow(0_12px_10px_rgba(60,40,32,0.38))]', [
            div('relative h-[132px] bg-primary [clip-path:polygon(0_0,100%_0,50%_100%)]', [
              div('absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(40,24,18,0.22))]'),
            ]),
          ]),
          div('uv-reveal-pop uv-d2 absolute left-1/2 top-[98px] grid h-[66px] w-[66px] -translate-x-1/2 place-items-center rounded-full bg-base shadow-[0_8px_16px_-6px_rgba(40,24,18,0.55)] ring-1 ring-accent/70 ring-offset-2 ring-offset-base', [
            monogram(21, 'gap-1.5'),
          ]),
          p('uv-reveal uv-d3 relative font-body text-[13px] font-semibold uppercase tracking-[0.3em] text-surface/90', '{{event_date}}'),
        ]),
        div('relative flex flex-1 flex-col items-center justify-center px-8 pb-12 pt-8', [
          spray('-left-10 -top-3 w-28 -scale-y-100'),
          spray('-bottom-2 -right-8 w-40 -scale-x-100'),
          p('uv-reveal uv-d4 relative font-body text-[15px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'relative mt-1 block font-heading text-[24px] leading-snug text-primary', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', btnSolid, { label: 'Buka Undangan' })]),
        ]),
      ],
    },
    // ---------- Pembuka: monogram + foto berbingkai mocha ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-7 pb-14 pt-16 text-center',
      children: [
        spray('-left-10 -top-8 w-44 -scale-y-100'),
        spray('-right-10 -top-8 w-44 rotate-180'),
        img('uv-reveal relative mx-auto w-12', '{{asset.tunas}}'),
        p('uv-reveal uv-d1 relative mt-5 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-muted', '{{greeting}}'),
        p('uv-reveal uv-d2 relative mx-auto mt-3 max-w-[290px] font-body text-[18px] italic leading-snug text-ink/85', 'Dengan penuh syukur, kami mengabarkan hari bahagia pernikahan kami'),
        monogram(60, 'uv-reveal-zoom uv-d3 relative mt-7 gap-5'),
        div('uv-reveal uv-d4 relative mx-auto mt-10 max-w-[330px]', [
          div('bg-primary px-3 pb-3 shadow-[0_24px_40px_-24px_rgba(70,50,42,0.75)]', [
            p('py-3 font-body text-[13px] font-semibold uppercase tracking-[0.35em] text-surface', 'Kami Menikah!'),
            div('relative aspect-[3/4] overflow-hidden bg-secondary/40', [
              // Cadangan bila belum ada foto sampul/galeri (slider tidak tampil)
              div('absolute inset-0 grid place-items-center bg-base/60 px-6', [el('span', 'font-script text-[44px] leading-tight text-primary', '{{couple_names}}')]),
              comp('photo_slider', '', { interval: '5000', image_class: photoTone }),
            ]),
          ]),
          img('pointer-events-none absolute -bottom-10 -right-12 w-40', '{{asset.tangkai}}'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-16 pt-8 text-center',
      children: [
        p('uv-reveal font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        p('uv-reveal uv-d2 mt-3 font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        spray('-right-10 -top-8 w-36 rotate-180 opacity-90'),
        div('uv-reveal relative', [kicker('Yang Berbahagia'), scriptHeading('Kedua Mempelai')]),
        p('uv-reveal uv-d1 relative mx-auto mt-3 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', '{{opening_text}}'),
        person('groom'),
        p('uv-reveal mt-8 font-script text-[56px] leading-none text-accent', '&'),
        person('bride'),
      ],
    },
    // ---------- Tanggal & hitung mundur (mocha) ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-primary px-7 pb-14 pt-16 text-center text-surface',
      children: [
        spray('-bottom-6 -right-10 w-40 -scale-x-100 opacity-90'),
        p('uv-reveal relative mx-auto max-w-[300px] font-body text-[18px] italic leading-snug text-surface/90', 'Dengan memohon rahmat Allah, kami akan melangsungkan pernikahan pada'),
        p('uv-reveal uv-d1 relative mt-8 font-body text-[13px] font-semibold uppercase tracking-[0.4em] text-surface/80', '{{event_month}}'),
        div('uv-reveal uv-d2 relative mx-auto mt-2 grid max-w-[320px] grid-cols-[1fr_auto_1fr] items-center gap-4', [
          p('border-y border-surface/40 py-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.25em]', '{{event_day}}'),
          p('font-heading text-[64px] leading-none', '{{event_date_num}}'),
          p('border-y border-surface/40 py-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.25em]', '{{event_year}}'),
        ]),
        p('uv-reveal relative mt-10 font-body text-[12px] font-semibold uppercase tracking-[0.4em] text-surface/80', 'Menghitung Hari'),
        div('uv-reveal relative mx-auto mt-3 max-w-[320px]', [comp('countdown', '', {
          item_class: 'relative py-1 text-center after:absolute after:-right-1.5 after:top-[5px] after:font-heading after:text-[24px] after:leading-none after:text-surface/45 after:content-[\':\'] [&:last-child]:after:content-none',
          number_class: 'block font-heading text-[34px] leading-none text-surface',
          label_class: 'mt-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-surface/75',
        })]),
        div('relative mt-9', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnOutlineLight })]),
      ],
    },
    // ---------- Hari bahagia: strip kalender + detail acara ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('relative bg-primary px-7 pb-14 text-surface', [
          div('mx-auto h-px w-16 bg-surface/40'),
          el('h2', 'uv-reveal mt-10 font-heading text-[22px] uppercase tracking-[0.35em]', 'Hari Bahagia'),
          p('uv-reveal uv-d1 mt-1 font-body text-[16px] italic text-surface/80', '{{event_month}} {{event_year}}'),
          div('uv-reveal uv-d2 mx-auto mt-6 grid max-w-[300px] grid-cols-5 items-center font-heading text-[19px]', [
            p('text-surface/40', '{{event_day_minus_two}}'),
            p('text-surface/70', '{{event_day_minus_one}}'),
            div('mx-auto grid h-12 w-12 place-items-center rounded-full border border-surface text-[22px] shadow-[0_0_0_4px_rgba(255,255,255,0.08)]', '{{event_date_num}}'),
            p('text-surface/70', '{{event_day_plus_one}}'),
            p('text-surface/40', '{{event_day_plus_two}}'),
          ]),
          p('uv-reveal uv-d3 mt-3 font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-surface/80', '{{event_day}}'),
        ]),
        div('relative px-7 pb-16 pt-12', [
          spray('-left-12 top-24 w-36 opacity-80'),
          spray('-bottom-4 -right-10 w-40 -scale-x-100'),
          div('relative grid gap-12', [
            el('article', 'uv-reveal relative [&:not(:first-child)]:border-t [&:not(:first-child)]:border-primary/15 [&:not(:first-child)]:pt-12', [
              img('mx-auto w-14', '{{asset.cincin}}'),
              el('h3', 'mt-2 font-script text-[46px] leading-tight text-primary', '{{item.name}}'),
              p('font-heading text-[19px] text-ink', '{{item.time}}'),
              p('mt-0.5 font-body text-[16px] italic text-muted', '{{item.date}}'),
              p('mt-4 font-body text-[14px] font-semibold uppercase tracking-[0.25em] text-primary', '{{item.venue}}'),
              p('mx-auto mt-1 max-w-[280px] font-body text-[16px] leading-snug text-muted', '{{item.address}}'),
              comp('map_button', `mt-5 ${btnSolid}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-surface px-7',
      children: [
        div('py-16 text-center', [
          div('uv-reveal', [kicker('Kisah Kami'), scriptHeading('Perjalanan Cinta')]),
          div('relative mt-10 grid gap-10', [
            div('absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-primary/20'),
            div('uv-reveal relative mx-auto max-w-[300px] bg-surface py-2', [
              p('font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-accent', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[22px] leading-tight text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[17px] italic leading-snug text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-5 text-center',
      children: [
        div('relative py-16', [
          spray('-left-12 -top-4 w-36 -scale-y-100 opacity-90'),
          div('uv-reveal relative', [kicker('Galeri'), scriptHeading('Momen Bahagia')]),
          div('relative mt-8 grid grid-cols-2 gap-3', [
            el('figure', `uv-reveal relative aspect-[3/4] overflow-hidden bg-secondary/30 shadow-[0_18px_30px_-22px_rgba(70,50,42,0.7)] [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/5]`, [
              img(`h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Tanda kasih & konfirmasi (mocha) ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-primary px-7 text-center text-surface',
      children: [
        div('relative py-16', [
          spray('-left-12 -top-6 w-36 -scale-y-100 opacity-90'),
          img('uv-reveal relative mx-auto w-12', '{{asset.hadiah}}'),
          el('h2', 'uv-reveal uv-d1 relative mt-3 font-script text-[48px] leading-tight', 'Tanda Kasih'),
          p('uv-reveal uv-d2 relative mx-auto mt-2 max-w-[300px] font-body text-[17px] italic leading-snug text-surface/85', 'Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('relative mt-8 grid gap-4', [
            div('uv-reveal rounded-[18px] border border-surface/35 bg-white/[0.04] px-5 py-6', [
              p('font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-surface/75', '{{item.bank}}'),
              p('mt-2 font-heading text-[26px] tracking-wider', '{{item.number}}'),
              p('font-body text-[16px] italic text-surface/80', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-surface px-5 py-2 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-primary' })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-primary px-7 pb-16 pt-2 text-center text-surface',
      children: [
        div('mx-auto h-px w-16 bg-surface/40'),
        img('uv-reveal relative mx-auto mt-12 w-12', '{{asset.kalender}}'),
        el('h2', 'uv-reveal uv-d1 relative mt-3 font-script text-[44px] leading-tight', 'Konfirmasi Kehadiran'),
        p('uv-reveal uv-d2 relative mx-auto mt-2 max-w-[300px] font-body text-[17px] italic leading-snug text-surface/85', 'Kehadiran Anda adalah kebahagiaan bagi kami. Mohon kabari kami melalui formulir berikut.'),
        div('uv-reveal relative mt-8 rounded-[22px] bg-surface p-6 text-left text-ink shadow-[0_24px_40px_-24px_rgba(30,18,12,0.6)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-primary/25 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btnSolid} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[13px] font-semibold uppercase tracking-[0.15em] text-muted',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-7 py-16 text-center',
      children: [
        img('uv-reveal mx-auto w-9', '{{asset.hati}}'),
        div('uv-reveal uv-d1 mt-3', [kicker('Ucapan & Doa'), scriptHeading('Doa Restu')]),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'rounded-[18px] bg-surface p-4 shadow-[0_10px_24px_-18px_rgba(70,50,42,0.55)]',
          name_class: 'font-heading text-[16px] text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-muted',
        })]),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-7 pb-20 pt-6 text-center',
      children: [
        p('uv-reveal font-body text-[12px] font-semibold uppercase tracking-[0.35em] text-muted', 'Kami menanti kehadiran Anda'),
        el('h2', 'uv-reveal-zoom uv-d1 mt-2 font-script text-[58px] leading-tight text-primary', 'Terima Kasih'),
        p('uv-reveal uv-d2 mx-auto mt-3 max-w-[300px] font-body text-[17px] italic leading-snug text-ink/80', '{{closing_text}}'),
        monogram(40, 'uv-reveal uv-d3 mt-8 gap-3'),
        div('uv-reveal relative mx-auto mt-8 max-w-[290px]', [
          div('relative aspect-[4/5] overflow-hidden rounded-t-full bg-secondary/30 shadow-[0_24px_40px_-26px_rgba(70,50,42,0.8)]', [
            div('absolute inset-0 grid place-items-center', [img('w-16 opacity-80', '{{asset.tunas}}')]),
            comp('photo_slider', '', { interval: '4500', image_class: photoTone, dots: 'false' }),
          ]),
          spray('-bottom-8 -left-14 w-40'),
          spray('-bottom-8 -right-14 w-40 -scale-x-100'),
        ]),
        p('uv-reveal mt-14 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-muted', '{{closing_greeting}}'),
        p('uv-reveal mt-2 font-script text-[38px] leading-tight text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
