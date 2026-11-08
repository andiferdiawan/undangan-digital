import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Satu Hati — modern minimal hitam, gading, dan taupe: sampul foto gelap penuh dengan pemutar musik mini,
 * monogram tipis "A / M" berpotongan garis miring, nama huruf kapital & tanggal angka; isi bernuansa gading
 * dengan judul sans tipis, kalender sebulan berpenanda hati, deret tiga foto, susunan acara berikon garis
 * dengan jam besar, dan tombol pil hitam.
 * Warna turunan dari globals (bg-primary, text-primary, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/satu-hati'

const thin = (t: string, cls = '') => el('h2', `font-heading text-[26px] font-light uppercase tracking-[0.18em] text-primary ${cls}`, t)
const small = (t: string, cls = '') => p(`font-body text-[15px] leading-relaxed text-muted ${cls}`, t)
const line = (cls = '') => div(`mx-auto h-px w-12 bg-primary/30 ${cls}`)
/** Huruf pertama nama panggilan (sisa teks berukuran 0). */
const initial = (who: 'groom' | 'bride', size: number) =>
  el('span', `inline-block text-[0px] font-extralight leading-none first-letter:text-[${size}px]`, `{{${who}_nickname}}`)
/** Monogram tipis dua inisial dipisah garis miring (gaya "A / M"). */
const monogram = (size: number, cls = '') => div(`relative flex items-center justify-center gap-[${Math.round(size * 0.45)}px] font-heading ${cls}`, [
  el('span', `inline-block -translate-y-[${Math.round(size * 0.3)}px]`, [initial('groom', size)]),
  el('span', `absolute left-1/2 top-1/2 h-[${Math.round(size * 1.5)}px] w-px -translate-x-1/2 -translate-y-1/2 rotate-[14deg] bg-current opacity-70`),
  el('span', `inline-block translate-y-[${Math.round(size * 0.35)}px]`, [initial('bride', size)]),
])
const pill = 'inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-heading text-[12px] uppercase tracking-[0.25em] text-surface'
const pillLine = 'inline-flex items-center justify-center rounded-full border border-primary/60 px-7 py-2.5 font-heading text-[12px] uppercase tracking-[0.25em] text-primary'
const photoTone = 'saturate-[.85]'

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal text-center', [
    div('relative mx-auto aspect-[3/4] w-full overflow-hidden bg-secondary', [
      img(`absolute inset-0 h-full w-full object-cover object-top grayscale-[.2] ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-[40px] font-extralight uppercase text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p('mt-4 font-heading text-[11px] uppercase tracking-[0.25em] text-muted', who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[16px] uppercase leading-snug tracking-[0.08em] text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
  ])
}

export const meta = {
  code: 'MOD-014',
  slug: 'satu-hati',
  name: 'Satu Hati',
  category: 'modern',
  description: 'Modern minimal hitam, gading & taupe: sampul foto gelap dengan pemutar musik mini dan monogram tipis bergaris miring, kalender berpenanda hati, deret tiga foto, susunan acara berikon garis, dan tombol pil hitam.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#22201d',
    secondary_color: '#ddd4c8',
    accent_color: '#8b7d6b',
    background_color: '#f3efe8',
    surface_color: '#fbf9f5',
    text_color: '#2b2724',
    muted_color: '#7a7168',
    font_heading: 'Josefin Sans',
    font_body: 'Raleway',
    font_script: 'Allura',
  },
  root_class: 'text-[16px] leading-relaxed text-ink',
  assets: {
    cincin: `${A}/cincin.svg`,
    hadiah: `${A}/hadiah.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-3.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-3.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: foto gelap penuh + pemutar mini + monogram bergaris miring ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center overflow-hidden bg-primary text-center text-surface',
      children: [
        comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
        div('absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,14,0.55)_0%,rgba(18,16,14,0.15)_30%,rgba(18,16,14,0.25)_55%,rgba(14,12,10,0.88)_100%)]'),
        div('relative mt-12 w-[210px]', [comp('music_player', '', {
          label: 'tekan hati untuk memutar',
          item_class: 'flex flex-col items-center gap-2 text-center',
          button_class: 'grid h-11 w-11 place-items-center rounded-full border border-surface/70 text-surface backdrop-blur-[2px]',
          text_class: 'hidden',
          label_class: 'font-heading text-[10px] uppercase tracking-[0.3em] text-surface/80',
          bar_class: 'h-px w-full bg-surface/30',
          fill_class: 'h-full bg-surface',
        })]),
        div('relative mt-auto w-full px-8 pb-12', [
          monogram(96, 'uv-reveal-zoom text-surface'),
          p('uv-reveal uv-d1 mt-12 font-heading text-[22px] font-light uppercase tracking-[0.2em]', '{{groom_nickname}} & {{bride_nickname}}'),
          p('uv-reveal uv-d2 mt-2 font-heading text-[20px] font-light tracking-[0.2em]', '{{event_dd}}.{{event_mm}}.{{event_year}}'),
          p('uv-reveal uv-d3 mt-6 font-body text-[13px] text-surface/70', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-[17px] uppercase tracking-[0.12em] text-surface', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d4 mt-6', [comp('open_button', 'inline-flex items-center justify-center rounded-full border border-surface/70 px-8 py-3 font-heading text-[12px] uppercase tracking-[0.25em] text-surface backdrop-blur-[2px]', { label: 'Buka Undangan' })]),
        ]),
      ],
    },
    // ---------- Sapaan + kalender berpenanda hati ----------
    {
      type: 'hero',
      class: 'relative bg-base px-8 pb-14 pt-16 text-center',
      children: [
        thin('Tamu terkasih!', 'uv-reveal'),
        small('{{greeting}}', 'uv-reveal uv-d1 mt-4'),
        small('Kami dengan bahagia mengundang Anda untuk hadir dan berbagi momen paling penting dalam hidup kami — hari pernikahan kami.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[300px]'),
        line('uv-reveal mt-8'),
        p('uv-reveal mt-8 font-heading text-[24px] font-light tracking-[0.12em] text-primary', '{{event_month}} {{event_year}}'),
        div('uv-reveal mx-auto mt-5 max-w-[300px]', [comp('month_calendar', '', {
          head_class: 'pb-2 font-heading text-[11px] uppercase tracking-wider text-muted',
          day_class: 'font-body text-[15px] text-ink/80',
          active_class: 'font-body text-[15px] font-semibold text-surface',
          marker: 'heart',
          marker_class: 'text-primary/80',
        })]),
      ],
    },
    // ---------- Deret tiga foto (galeri) ----------
    {
      type: 'gallery',
      class: 'relative bg-base text-center',
      children: [
        div('pb-14', [
          div('grid grid-cols-3 gap-[3px]', [
            el('figure', 'uv-reveal relative aspect-[3/5] overflow-hidden bg-secondary', [
              img(`absolute inset-0 h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 text-center',
      children: [
        p('uv-reveal font-arabic text-[21px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[15px] italic leading-relaxed text-ink/80', '“{{quote_text}}”'),
        p('uv-reveal uv-d2 mt-3 font-heading text-[11px] uppercase tracking-[0.25em] text-muted', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-surface px-6 py-16 text-center',
      children: [
        thin('Kedua mempelai', 'uv-reveal'),
        small('{{opening_text}}', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
        div('mt-10 grid grid-cols-2 gap-4', [person('groom'), person('bride')]),
      ],
    },
    // ---------- Susunan acara: ikon garis + jam besar ----------
    {
      type: 'event',
      class: 'relative bg-base px-7 py-16 text-center',
      children: [
        thin('Susunan acara', 'uv-reveal'),
        div('mx-auto mt-10 grid max-w-[330px] gap-8 text-left', [
          el('article', 'uv-reveal grid grid-cols-[64px_1fr] items-start gap-5 border-b border-primary/10 pb-8 last:border-b-0', [
            img('w-14 opacity-90', '{{asset.cincin}}'),
            div('', [
              p('font-heading text-[26px] font-light leading-none tracking-[0.06em] text-primary', '{{item.time}}'),
              p('mt-2 font-heading text-[14px] uppercase tracking-[0.15em] text-primary', '{{item.name}}'),
              small('{{item.date}}', 'text-[14px]'),
              p('mt-3 font-heading text-[12px] uppercase tracking-[0.2em] text-muted', '{{item.venue}}'),
              small('{{item.address}}', 'text-[14px] leading-snug'),
              comp('map_button', `mt-4 ${pill} !px-6 !py-2.5`, { href: '{{item.map_url}}', label: 'Lihat di peta' }, { if: 'item.map_url' }),
            ]),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'countdown',
      class: 'relative bg-surface px-7 py-14 text-center',
      children: [
        thin('Menuju hari H', 'uv-reveal'),
        div('uv-reveal mx-auto mt-8 max-w-[320px]', [comp('countdown', '', {
          item_class: 'relative border-r border-primary/15 py-1 text-center last:border-r-0',
          number_class: 'block font-heading text-[34px] font-light leading-none text-primary',
          label_class: 'mt-2 block font-heading text-[10px] uppercase tracking-[0.2em] text-muted',
        })]),
        div('mt-8', [comp('calendar_button', '', { label: 'Simpan tanggal', button_class: pillLine })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('py-16 text-center', [
          thin('Kisah kami', 'uv-reveal'),
          div('relative mt-10 grid gap-9', [
            div('uv-reveal mx-auto max-w-[300px]', [
              p('font-heading text-[11px] uppercase tracking-[0.25em] text-muted', '{{item.date}}'),
              p('mt-1 font-heading text-[18px] uppercase tracking-[0.1em] text-primary', '{{item.title}}'),
              small('{{item.text}}', 'mt-2'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Detail & hadiah ----------
    {
      type: 'gift',
      class: 'relative bg-surface px-7 text-center',
      children: [
        div('py-16', [
          thin('Detail', 'uv-reveal'),
          small('Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
          img('uv-reveal mx-auto mt-6 w-12', '{{asset.hadiah}}'),
          div('mt-6 grid gap-4', [
            div('uv-reveal border border-primary/15 bg-base px-5 py-6', [
              p('font-heading text-[11px] uppercase tracking-[0.25em] text-muted', '{{item.bank}}'),
              p('mt-2 font-heading text-[24px] font-light tracking-[0.12em] text-primary', '{{item.number}}'),
              small('a.n. {{item.holder}}', 'text-[14px]'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin nomor', button_class: pill })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Formulir konfirmasi ----------
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 py-16 text-center',
      children: [
        thin('Konfirmasi', 'uv-reveal'),
        small('Mohon isi formulir berikut agar kami dapat menyambut Anda dengan sebaik-baiknya.', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
        div('uv-reveal mt-8 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full rounded-full border border-primary/25 bg-surface px-5 py-3 font-body text-[15px] text-ink outline-none focus:border-primary',
          button_class: `w-full ${pill} disabled:opacity-60`,
          label_class: 'grid gap-1.5 font-body text-[13px] text-muted',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative bg-base px-7 pb-16 text-center',
      children: [
        thin('Ucapan & doa', 'uv-reveal'),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'border-b border-primary/10 bg-transparent px-1 py-4 text-left',
          name_class: 'font-heading text-[13px] uppercase tracking-[0.12em] text-primary',
          text_class: 'mt-1 font-body text-[15px] leading-relaxed text-muted',
        })]),
      ],
    },
    // ---------- Penutup: foto + monogram ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-primary text-center text-surface',
      children: [
        div('relative h-[640px] overflow-hidden', [
          comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
          div('absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,14,0.15)_0%,rgba(18,16,14,0.2)_35%,rgba(14,12,10,0.92)_78%)]'),
          div('absolute inset-x-0 bottom-10 px-8', [
            p('uv-reveal mx-auto max-w-[300px] font-body text-[14px] leading-relaxed text-surface/85', '{{closing_text}}'),
            monogram(64, 'uv-reveal uv-d1 mt-8 text-surface'),
            p('uv-reveal uv-d2 mt-9 font-heading text-[16px] font-light uppercase tracking-[0.2em]', '{{couple_names}}'),
            p('uv-reveal uv-d2 mt-1 font-heading text-[11px] uppercase tracking-[0.25em] text-surface/70', '{{closing_greeting}}'),
          ]),
        ]),
      ],
    },
  ],
}
