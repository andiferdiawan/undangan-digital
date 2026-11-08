import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kembang Biru — biru cornflower di atas kertas krem: nama huruf kapital serif, foto bertepi kertas sobek,
 * monogram inisial besar menimpa foto, baris tanggal bergaris (BULAN | 18 | TAHUN), susunan acara di dalam
 * bingkai lengkung bermonogram, judul huruf sambung biru, dan bunga liar bergaris biru (cornflower & aster).
 * Warna turunan dari globals (bg-primary, text-primary, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/kembang-biru'

/** Tepi kertas sobek (atas & bawah bergerigi acak tetapi tetap/deterministik) lewat clip-path. */
function torn(seed: number, top = true, bottom = true): string {
  let s = seed
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const n = 13
  const pts: string[] = []
  for (let i = 0; i <= n; i++) pts.push(`${Math.round((i / n) * 100)}%_${top ? (rnd() * 3.2).toFixed(1) : '0'}%`)
  for (let i = n; i >= 0; i--) pts.push(`${Math.round((i / n) * 100)}%_${bottom ? (100 - rnd() * 3.2).toFixed(1) : '100'}%`)
  return `[clip-path:polygon(${pts.join(',')})]`
}

const caps = (t: string, cls = '') => p(`font-body text-[13px] font-semibold uppercase tracking-[0.3em] ${cls}`, t)
const script = (t: string, cls = '') => el('h2', `font-script text-[46px] leading-tight text-primary ${cls}`, t)
/** Bunga liar garis biru (asli tegak, tumbuh dari bawah tengah). */
const flower = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.bunga}}')
/** Huruf pertama nama panggilan saja (sisa teks berukuran 0) untuk monogram. */
const initial = (who: 'groom' | 'bride', size: number, cls = '') =>
  el('span', `inline-block text-[0px] leading-none first-letter:text-[${size}px] ${cls}`, `{{${who}_nickname}}`)
/** Monogram dua inisial yang saling menimpa (gaya "OR"). */
const monogram = (size: number, cls = 'text-primary') => div(`flex items-start justify-center font-heading italic ${cls}`, [
  initial('groom', size),
  initial('bride', size, `-ml-[${Math.round(size * 0.2)}px] mt-[${Math.round(size * 0.18)}px]`),
])
const btnBlue = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-body text-[13px] font-semibold uppercase tracking-[0.25em] text-surface shadow-[0_12px_24px_-14px_rgba(30,60,120,0.8)]'
const btnLine = 'inline-flex items-center justify-center rounded-full border border-primary px-6 py-2.5 font-body text-[13px] font-semibold uppercase tracking-[0.25em] text-primary'

/** Foto bertepi kertas sobek dengan bingkai kertas putih tipis. */
function tornPhoto(inner: ThemeNode, seed: number, cls: string, aspect = 'aspect-[4/5]'): ThemeNode {
  return div(`relative bg-surface p-[6px] shadow-[0_14px_26px_-18px_rgba(30,60,120,0.6)] ${torn(seed)} ${cls}`, [
    div(`relative ${aspect} overflow-hidden bg-secondary ${torn(seed + 7)}`, [inner]),
  ])
}

function person(who: 'groom' | 'bride', seed: number): ThemeNode {
  return div('uv-reveal relative text-center', [
    tornPhoto(div('absolute inset-0', [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center bg-secondary/60', [el('span', 'font-script text-[38px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]), seed, 'mx-auto w-full'),
    caps(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', 'mt-4 text-[11px] text-primary/70'),
    el('h3', 'mt-1 font-heading text-[19px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[15px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-1 inline-block font-body text-[14px] text-primary underline decoration-primary/40 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'FLR-004',
  slug: 'kembang-biru',
  name: 'Kembang Biru',
  category: 'floral',
  description: 'Biru cornflower di atas kertas krem: foto bertepi kertas sobek, monogram inisial besar, tanggal bergaris, susunan acara dalam bingkai lengkung, judul huruf sambung, dan bunga liar bergaris biru.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#2c5aa0',
    secondary_color: '#c9d8ee',
    accent_color: '#5b80bf',
    background_color: '#f5f0e5',
    surface_color: '#fbf8f1',
    text_color: '#233d6b',
    muted_color: '#5f7194',
    font_heading: 'Playfair Display',
    font_body: 'Cormorant Garamond',
    font_script: 'Great Vibes',
  },
  // lining-nums: angka Cormorant setinggi huruf kapital (bawaannya angka gaya lama)
  root_class: 'text-[17px] leading-relaxed text-ink [font-variant-numeric:lining-nums]',
  assets: {
    bunga: `${A}/bunga.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul: nama kapital di panel biru + foto sobek bermonogram + baris tanggal ----------
    {
      type: 'cover',
      class: 'relative flex flex-col overflow-hidden bg-base text-center',
      children: [
        div(`relative bg-primary px-6 pb-10 pt-9 ${torn(11, false, true)}`, [
          p('uv-reveal font-heading text-[28px] uppercase leading-tight tracking-[0.12em] text-surface', '{{groom_nickname}}'),
          p('uv-reveal uv-d1 font-script text-[30px] leading-none text-surface/90', '&'),
          p('uv-reveal uv-d1 font-heading text-[28px] uppercase leading-tight tracking-[0.12em] text-surface', '{{bride_nickname}}'),
        ]),
        div('uv-reveal-zoom uv-d2 relative mx-auto -mt-5 w-[84%] max-w-[330px]', [
          tornPhoto(div('absolute inset-0', [
            div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[40px] text-primary', '{{couple_names}}')]),
            comp('photo_slider', '', { interval: '4500', dots: 'false' }),
            div('absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(20,45,90,0.55))]'),
            div('absolute inset-x-0 bottom-3', [monogram(92, 'text-surface/95 [text-shadow:0_2px_14px_rgba(0,0,0,0.25)]')]),
          ]), 23, 'w-full'),
        ]),
        div('relative flex flex-1 flex-col items-center justify-center px-8 pb-10 pt-5', [
          div('uv-reveal uv-d3 grid w-full max-w-[280px] grid-cols-[1fr_auto_1fr] items-center gap-4 text-primary', [
            p('border-y border-primary/60 py-1 font-body text-[14px] font-semibold uppercase tracking-[0.25em]', '{{event_month}}'),
            p('font-heading text-[46px] leading-none', '{{event_date_num}}'),
            p('border-y border-primary/60 py-1 font-body text-[14px] font-semibold tracking-[0.25em]', '{{event_year}}'),
          ]),
          p('uv-reveal uv-d4 mt-4 font-body text-[15px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-[21px] leading-snug text-primary', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d5 mt-5', [comp('open_button', btnBlue, { label: 'Buka Undangan' })]),
        ]),
      ],
    },
    // ---------- Sapaan + susunan acara dalam bingkai lengkung ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-7 pb-14 pt-14 text-center',
      children: [
        flower('-right-8 top-24 w-20 rotate-12 opacity-80'),
        flower('-left-8 bottom-10 w-24 -rotate-12 opacity-80'),
        script('Bersama —', 'uv-reveal relative'),
        p('uv-reveal uv-d1 relative -mt-1 font-script text-[30px] leading-tight text-primary', 'di waktu terindah kami'),
        p('uv-reveal uv-d2 relative mx-auto mt-4 max-w-[290px] font-body text-[18px] leading-snug text-ink/85', 'Dengan penuh syukur, kami mengundang Anda untuk hadir dan mendoakan di hari bahagia pernikahan kami.'),
        div('uv-reveal relative mx-auto mt-10 max-w-[300px] rounded-t-full border border-primary/70 p-[6px]', [
          div('rounded-t-full border border-primary/30 px-6 pb-8 pt-12', [
            script('Susunan acara', 'text-[36px]'),
            monogram(54, 'mt-2 text-primary'),
            div('mt-5 grid gap-4 text-left', [
              div('border-b border-primary/20 pb-3 last:border-b-0', [
                p('font-heading text-[16px] leading-tight text-primary', '{{item.time}}'),
                p('mt-0.5 font-body text-[17px] font-semibold uppercase tracking-[0.12em] text-ink', '{{item.name}}'),
              ], { repeat: 'events' }),
            ]),
          ]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 text-center',
      children: [
        p('uv-reveal font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        caps('{{quote_source}}', 'uv-reveal uv-d2 mt-3 text-[12px] text-primary/70'),
      ],
    },
    // ---------- Keluarga & mempelai ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-16 text-center',
      children: [
        flower('-left-10 -top-2 w-16 -rotate-[20deg] opacity-80'),
        flower('-right-10 -top-2 w-16 rotate-[20deg] opacity-80'),
        script('Keluarga & sahabat', 'uv-reveal relative text-[36px]'),
        p('uv-reveal relative -mt-1 font-script text-[32px] leading-tight text-primary', 'terkasih!'),
        p('uv-reveal uv-d1 relative mx-auto mt-4 max-w-[300px] font-body text-[17px] leading-snug text-ink/85', '{{opening_text}}'),
        div('relative mt-10 grid grid-cols-2 gap-x-4', [person('groom', 31), person('bride', 47)]),
      ],
    },
    // ---------- Detail acara: pita biru sobek + kartu tempat ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div(`relative bg-primary px-7 pb-12 pt-12 text-surface ${torn(53)}`, [
          el('h2', 'uv-reveal font-script text-[54px] leading-none', 'Detail'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[280px] font-body text-[17px] italic leading-snug text-surface/85', 'Waktu dan tempat hari bahagia kami'),
        ]),
        div('relative grid gap-12 px-7 pb-16 pt-10', [
          flower('-right-8 bottom-6 w-24 rotate-12 opacity-80'),
          el('article', 'uv-reveal relative', [
            el('h3', 'font-script text-[42px] leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-heading text-[18px] text-primary', '{{item.time}}'),
            p('font-body text-[17px] italic text-muted', '{{item.date}}'),
            caps('{{item.venue}}', 'mt-4 text-[13px] tracking-[0.2em] text-primary'),
            p('mx-auto mt-1 max-w-[280px] font-body text-[17px] leading-snug text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${btnLine}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    // ---------- Hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-surface px-7 py-14 text-center',
      children: [
        script('Menuju hari bahagia', 'uv-reveal text-[40px]'),
        p('uv-reveal uv-d1 mt-1 font-body text-[16px] italic text-muted', '{{event_date}}'),
        div('uv-reveal mx-auto mt-7 max-w-[320px]', [comp('countdown', '', {
          item_class: 'mx-1 rounded-t-full border border-primary/50 bg-base px-1 pb-2 pt-4 text-center',
          number_class: 'block font-heading text-[30px] leading-none text-primary',
          label_class: 'mt-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-muted',
        })]),
        div('mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLine })]),
      ],
    },
    // ---------- Kisah cinta: foto sobek + cerita ----------
    {
      type: 'story',
      class: 'relative bg-base',
      children: [
        div('relative pb-16 text-center', [
          tornPhoto(div('absolute inset-0', [
            comp('photo_slider', '', { interval: '5000', dots: 'false' }),
            div('absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,rgba(20,45,90,0.7))]'),
            el('h2', 'absolute inset-x-0 bottom-6 font-script text-[44px] leading-tight text-surface', 'Kisah cinta kami'),
          ]), 61, 'mx-4', 'aspect-[4/3]'),
          div('relative mt-8 grid gap-8 px-8', [
            div('uv-reveal relative mx-auto max-w-[300px]', [
              caps('{{item.date}}', 'text-[12px] text-primary/70'),
              el('h3', 'mt-1 font-heading text-[21px] leading-tight text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[17px] leading-snug text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: grid 3 kolom ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-surface px-4 text-center',
      children: [
        div('relative py-16', [
          flower('-left-6 top-6 w-20 -rotate-12'),
          script('Galeri', 'uv-reveal relative text-[54px]'),
          p('uv-reveal uv-d1 relative font-body text-[16px] italic text-muted', 'Momen kecil yang kami syukuri'),
          div('relative mt-8 grid grid-cols-3 gap-2', [
            el('figure', 'uv-reveal relative aspect-square overflow-hidden bg-secondary ring-1 ring-primary/15 [&:nth-child(7n+1)]:col-span-2 [&:nth-child(7n+1)]:row-span-2 [&:nth-child(7n+1)]:aspect-auto', [
              img('absolute inset-0 h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Hadiah ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-7 text-center',
      children: [
        div('relative py-16', [
          flower('-right-6 top-4 w-20 rotate-12'),
          script('Hadiah', 'uv-reveal relative text-[52px]'),
          p('uv-reveal uv-d1 relative mx-auto mt-2 max-w-[300px] font-body text-[17px] leading-snug text-ink/85', 'Kehadiran Anda adalah hadiah terbaik bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('relative mt-8 grid gap-4', [
            div(`uv-reveal bg-surface px-5 py-7 shadow-[0_14px_26px_-20px_rgba(30,60,120,0.6)] ${torn(71)}`, [
              caps('{{item.bank}}', 'text-[12px] text-primary/70'),
              p('mt-2 font-heading text-[26px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[16px] italic text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnBlue })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- RSVP ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        script('Kami tunggu', 'uv-reveal text-[44px]'),
        p('uv-reveal -mt-1 font-script text-[32px] leading-tight text-primary', 'kehadiran Anda!'),
        p('uv-reveal uv-d1 mx-auto mt-4 max-w-[300px] font-body text-[17px] leading-snug text-ink/85', 'Mohon konfirmasi kehadiran agar kami dapat menyambut Anda dengan sebaik-baiknya.'),
        div('uv-reveal mt-8 rounded-[20px] border border-primary/25 bg-base p-6 text-left', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-primary/25 bg-surface px-4 py-3 font-body text-[17px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btnBlue} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[13px] font-semibold uppercase tracking-[0.15em] text-muted',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-7 pb-16 text-center',
      children: [
        script('Ucapan & doa', 'uv-reveal text-[42px]'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: 'rounded-[16px] border border-primary/20 bg-base p-4',
          name_class: 'font-heading text-[16px] text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-muted',
        })]),
      ],
    },
    // ---------- Penutup: foto sobek + pita biru ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('relative px-8 pb-8 pt-14', [
          flower('-left-6 top-6 w-20 -rotate-12'),
          flower('-right-6 top-6 w-20 rotate-12'),
          p('uv-reveal relative mx-auto max-w-[300px] font-body text-[17px] leading-snug text-ink/85', '{{closing_text}}'),
          script('Sampai jumpa', 'uv-reveal uv-d1 relative mt-5 text-[46px]'),
          p('uv-reveal uv-d1 relative -mt-1 font-script text-[30px] leading-tight text-primary', 'di hari bahagia kami!'),
        ]),
        tornPhoto(div('absolute inset-0', [comp('photo_slider', '', { interval: '5000', dots: 'false' })]), 83, 'uv-reveal mx-6', 'aspect-[4/3]'),
        div(`relative mt-8 bg-primary px-8 pb-12 pt-12 text-surface ${torn(97, true, false)}`, [
          caps('{{closing_greeting}}', 'text-[12px] text-surface/75'),
          monogram(64, 'mt-4 text-surface'),
          p('mt-3 font-heading text-[20px] uppercase tracking-[0.15em]', '{{couple_names}}'),
        ]),
      ],
    },
  ],
}
