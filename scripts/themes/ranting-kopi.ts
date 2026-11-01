import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Ranting Kopi — editorial hangat bernuansa cokelat espresso, krem taupe, dan putih kertas dengan siluet
 * ranting & bunga liar kering. Judul huruf tegak rapat (condensed) dipadu huruf sambung, foto polaroid,
 * pita bersudut menurun, kartu bergerigi seperti perangko yang dimiringkan, catatan kertas berklip dan
 * segel lilin berinisial, serta foto penuh di penutup.
 * Warna turunan dari globals (bg-primary, text-surface, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/ranting-kopi'

const caps = (t: string, cls = '') => p(`font-body text-[12px] font-semibold uppercase tracking-[0.3em] ${cls}`, t)
/** Judul huruf tegak rapat (Oswald) — ciri utama referensi. */
const bold = (t: string, cls = 'text-primary') => el('h2', `font-heading text-[40px] font-medium uppercase leading-[0.95] tracking-[0.02em] ${cls}`, t)
const script = (t: string, cls = 'text-primary') => p(`font-script text-[40px] leading-tight ${cls}`, t)
/** Siluet ranting kering (asli tumbuh dari kiri bawah). */
const twig = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.ranting}}')
const btnDark = 'inline-flex items-center justify-center bg-primary px-7 py-3 font-heading text-[14px] uppercase tracking-[0.25em] text-surface'
const btnLight = 'inline-flex items-center justify-center border border-surface/70 px-7 py-3 font-heading text-[14px] uppercase tracking-[0.25em] text-surface'
const photoTone = 'sepia-[.18] saturate-[.9]'
const paper = 'bg-base [background-image:radial-gradient(ellipse_at_20%_10%,rgba(255,255,255,0.45),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(120,95,80,0.10),transparent_60%)]'

/** Kartu cokelat bergerigi seperti perangko; lubang gerigi memakai warna latar section (holes). */
function stamp(children: ThemeNode[], cls: string, holes: 'base' | 'surface' = 'base'): ThemeNode {
  return div(`relative bg-primary p-[7px] [background-image:radial-gradient(circle,rgb(var(--c-${holes}))_3.6px,transparent_4px)] [background-position:-6.5px_-6.5px] [background-size:13px_13px] shadow-[0_18px_30px_-18px_rgba(40,25,20,0.7)] ${cls}`, [
    div('relative bg-primary px-6 py-8 text-center text-surface', children),
  ])
}
/** Bingkai polaroid putih. */
const polaroid = (photo: ThemeNode, caption: ThemeNode | null, cls: string) =>
  div(`bg-surface p-3 shadow-[0_16px_28px_-16px_rgba(40,25,20,0.65)] ${cls}`, caption ? [photo, caption] : [photo])
/** Huruf pertama nama panggilan saja (sisa teks berukuran 0) untuk monogram segel. */
const initial = (who: 'groom' | 'bride', size: number) =>
  el('span', `inline-block text-[0px] leading-none first-letter:text-[${size}px]`, `{{${who}_nickname}}`)

function person(who: 'groom' | 'bride'): ThemeNode {
  const tilt = who === 'groom' ? '-rotate-2' : 'rotate-2'
  return div('uv-reveal relative mt-10', [
    polaroid(
      div('relative aspect-[4/5] overflow-hidden bg-secondary', [
        img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[48px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
      ]),
      p('pt-3 font-script text-[30px] leading-none text-primary', `{{${who}_nickname}}`),
      `mx-auto w-[220px] ${tilt}`,
    ),
    caps(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', 'mt-7 text-accent'),
    el('h3', 'mt-1 font-heading text-[26px] uppercase leading-tight tracking-wide text-primary', `{{${who}_name}}`),
    p('mx-auto mt-1 max-w-[280px] font-body text-[17px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-body text-[15px] text-primary underline decoration-primary/40 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'RST-004',
  slug: 'ranting-kopi',
  name: 'Ranting Kopi',
  category: 'rustic',
  description: 'Editorial hangat cokelat espresso dan krem dengan siluet ranting kering. Judul tegak rapat dipadu huruf sambung, foto polaroid, pita bersudut, kartu bergerigi seperti perangko, catatan berklip & segel lilin.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#4a3630',
    secondary_color: '#cfc4b5',
    accent_color: '#937b6b',
    background_color: '#e7dfd2',
    surface_color: '#f7f3ec',
    text_color: '#3a2c27',
    muted_color: '#7c6c62',
    font_heading: 'Oswald',
    font_body: 'Cormorant Garamond',
    font_script: 'Pinyon Script',
  },
  // lining-nums: angka Cormorant setinggi huruf kapital (bawaannya angka gaya lama)
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    ranting: `${A}/ranting.svg`,
    segel: `${A}/segel.svg`,
    klip: `${A}/klip.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/rustic-senja/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/rustic-senja/decor-1.jpg', '/theme-assets/rustic-senja/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: nama + polaroid besar + pita cokelat bersudut ----------
    {
      type: 'cover',
      class: `relative flex flex-col overflow-hidden ${paper} text-center`,
      children: [
        twig('-left-16 bottom-24 w-[230px] opacity-40'),
        twig('-right-20 -top-6 w-[230px] rotate-180 opacity-30'),
        div('relative px-6 pt-9', [
          p('uv-reveal font-heading text-[38px] font-medium uppercase leading-none tracking-[0.04em] text-primary', '{{groom_nickname}}'),
          p('uv-reveal uv-d1 -mt-1 font-script text-[36px] leading-tight text-primary', '& {{bride_nickname}}'),
        ]),
        // Foto polaroid besar mendominasi sampul
        div('uv-reveal-zoom uv-d2 relative mx-auto mt-3 w-[78%] max-w-[320px] -rotate-2', [
          polaroid(
            div('relative aspect-[4/5] overflow-hidden bg-secondary', [
              div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[40px] text-primary', '{{couple_names}}')]),
              comp('photo_slider', '', { interval: '4500', image_class: photoTone, dots: 'false' }),
            ]),
            p('pt-3 font-heading text-[22px] tracking-[0.15em] text-primary', '{{event_dd}} · {{event_mm}} · {{event_yy}}'),
            'pb-2',
          ),
        ]),
        div('relative mt-auto flex flex-col items-center bg-primary px-8 pb-12 pt-6 text-surface [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)]', [
          p('uv-reveal font-body text-[15px] italic text-surface/80', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-[19px] uppercase tracking-[0.08em] text-surface', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d3 mt-4', [comp('open_button', btnLight, { label: 'Buka Undangan' })]),
        ]),
      ],
    },
    // ---------- Save the date: kartu perangko miring ----------
    {
      type: 'hero',
      class: `relative overflow-hidden ${paper} px-7 pb-16 pt-14 text-center`,
      children: [
        twig('-right-16 bottom-0 w-[220px] -scale-x-100 opacity-35'),
        twig('-left-20 -top-10 w-[200px] rotate-180 -scale-x-100 opacity-25'),
        div('uv-reveal relative mx-auto max-w-[310px]', [
          div('absolute inset-0 translate-x-3 translate-y-3 rotate-3 bg-secondary'),
          stamp([
            script('{{greeting}}', 'text-[23px] leading-snug text-surface'),
            p('mx-auto mt-3 max-w-[240px] font-body text-[17px] leading-snug text-surface/85', 'Dengan penuh syukur, kami mengundang Anda untuk hadir dan mendoakan di hari bahagia pernikahan kami.'),
            p('mt-6 font-heading text-[46px] leading-none tracking-[0.08em]', '{{event_dd}} · {{event_mm}} · {{event_yy}}'),
            caps('{{event_day}}', 'mt-2 text-surface/75'),
            script('save the date', 'mt-3 text-[32px] text-surface/90'),
          ], '-rotate-3'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-surface px-8 py-16 text-center',
      children: [
        p('uv-reveal font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        caps('{{quote_source}}', 'uv-reveal uv-d2 mt-3 text-accent'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-7 pb-16 text-center',
      children: [
        div('uv-reveal', [bold('Kedua'), script('mempelai', '-mt-2')]),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', '{{opening_text}}'),
        person('groom'),
        p('uv-reveal mt-8 font-script text-[54px] leading-none text-accent', '&'),
        person('bride'),
      ],
    },
    // ---------- Waktu & tempat: kartu kertas ----------
    {
      type: 'event',
      class: `relative overflow-hidden ${paper} px-7 py-16 text-center`,
      children: [
        twig('-left-16 top-10 w-[200px] opacity-30'),
        div('uv-reveal relative', [bold('Waktu &'), script('tempat acara', '-mt-2')]),
        div('relative mt-10 grid gap-8', [
          el('article', 'uv-reveal relative bg-surface px-6 py-8 shadow-[0_16px_30px_-22px_rgba(40,25,20,0.6)]', [
            p('font-script text-[36px] leading-tight text-primary', '{{item.name}}'),
            div('mx-auto my-3 h-px w-14 bg-primary/30'),
            p('font-heading text-[22px] tracking-[0.06em] text-primary', '{{item.time}}'),
            p('font-body text-[16px] italic text-muted', '{{item.date}}'),
            caps('{{item.venue}}', 'mt-5 text-[13px] tracking-[0.2em] text-primary'),
            p('mx-auto mt-1 max-w-[260px] font-body text-[16px] leading-snug text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${btnDark}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    // ---------- Hitung mundur: pita cokelat ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-primary px-7 pb-16 pt-14 text-center text-surface',
      children: [
        twig('-right-24 -bottom-28 w-[190px] -scale-x-100 opacity-15 brightness-[2.2]'),
        caps('Menghitung hari', 'uv-reveal relative text-surface/75'),
        bold('Menuju hari H', 'uv-reveal uv-d1 relative mt-2 text-surface'),
        div('uv-reveal relative mx-auto mt-8 max-w-[320px]', [comp('countdown', '', {
          item_class: 'relative border-r border-surface/25 py-1 text-center last:border-r-0',
          number_class: 'block font-heading text-[40px] leading-none text-surface',
          label_class: 'mt-2 block font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-surface/70',
        })]),
        div('relative mt-9', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLight })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-surface px-7',
      children: [
        div('py-16 text-center', [
          div('uv-reveal', [bold('Kisah'), script('perjalanan kami', '-mt-2')]),
          div('relative mt-10 grid gap-10', [
            div('absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-primary/20'),
            div('uv-reveal relative mx-auto max-w-[300px] bg-surface py-2', [
              caps('{{item.date}}', 'text-accent'),
              el('h3', 'mt-1 font-heading text-[22px] uppercase leading-tight tracking-wide text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[17px] italic leading-snug text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: polaroid miring bergantian ----------
    {
      type: 'gallery',
      class: `relative overflow-hidden ${paper} px-6 text-center`,
      children: [
        div('relative py-16', [
          twig('-left-20 top-0 w-[200px] rotate-180 -scale-x-100 opacity-25'),
          div('uv-reveal relative', [bold('Momen'), script('bahagia kami', '-mt-2')]),
          div('relative mt-10 grid grid-cols-2 gap-x-4 gap-y-6', [
            el('figure', 'uv-reveal bg-surface p-2 pb-6 shadow-[0_14px_24px_-16px_rgba(40,25,20,0.65)] [&:nth-child(4n+1)]:-rotate-2 [&:nth-child(4n+2)]:mt-6 [&:nth-child(4n+2)]:rotate-2 [&:nth-child(4n+3)]:rotate-1 [&:nth-child(4n)]:mt-6 [&:nth-child(4n)]:-rotate-1', [
              img(`aspect-[4/5] w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Tanda kasih: catatan kertas berklip + segel lilin ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-primary px-7 text-center',
      children: [
        div('relative py-16', [
          twig('-left-16 -bottom-4 w-[200px] opacity-20 brightness-[2.2]'),
          div('uv-reveal relative mx-auto max-w-[310px] rotate-2 bg-surface px-6 pb-14 pt-9 shadow-[0_22px_40px_-20px_rgba(0,0,0,0.6)]', [
            img('absolute -top-5 right-8 w-6 rotate-6', '{{asset.klip}}'),
            script('Tanda kasih', 'text-[38px] text-primary'),
            p('mx-auto mt-2 max-w-[240px] font-body text-[16px] italic leading-snug text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
            div('mt-5 grid gap-5', [
              div('border-t border-dashed border-primary/30 pt-5', [
                caps('{{item.bank}}', 'text-accent'),
                p('mt-1 font-heading text-[24px] tracking-[0.08em] text-primary', '{{item.number}}'),
                p('font-body text-[16px] italic text-muted', 'a.n. {{item.holder}}'),
                div('mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnDark })]),
              ], { repeat: 'gifts' }),
            ]),
            div('absolute -bottom-9 left-1/2 grid h-[76px] w-[76px] -translate-x-1/2 place-items-center', [
              img('absolute inset-0 h-full w-full', '{{asset.segel}}'),
              div('relative flex items-center gap-0.5 font-script text-[#e7d6c8]', [initial('groom', 26), el('span', 'text-[16px]', '&'), initial('bride', 26)]),
            ]),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative overflow-hidden ${paper} px-7 py-16 text-center`,
      children: [
        twig('-right-16 top-6 w-[190px] rotate-180 opacity-25'),
        div('uv-reveal relative', [bold('Konfirmasi'), script('kehadiran', '-mt-2')]),
        p('uv-reveal uv-d1 relative mx-auto mt-3 max-w-[300px] font-body text-[17px] leading-snug text-muted', 'Mohon isi formulir berikut agar kami dapat menyambut Anda dengan sebaik-baiknya.'),
        div('uv-reveal relative mt-8 bg-surface p-6 text-left shadow-[0_16px_30px_-22px_rgba(40,25,20,0.6)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full border border-primary/25 bg-base/40 px-4 py-3 font-body text-[17px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btnDark} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-heading text-[13px] uppercase tracking-[0.15em] text-muted',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        div('uv-reveal', [bold('Ucapan'), script('& doa restu', '-mt-2')]),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'border-l-2 border-primary/40 bg-base/50 p-4',
          name_class: 'font-heading text-[16px] uppercase tracking-wide text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-muted',
        })]),
      ],
    },
    // ---------- Penutup: foto penuh + nama ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-primary text-center',
      children: [
        div('relative px-8 pb-10 pt-16 text-surface', [
          p('uv-reveal mx-auto max-w-[300px] font-body text-[17px] italic leading-snug text-surface/85', '{{closing_text}}'),
          caps('{{closing_greeting}}', 'uv-reveal uv-d1 mt-6 text-surface/70'),
        ]),
        div('relative h-[520px] overflow-hidden', [
          div('absolute inset-0 grid place-items-center bg-accent/40'),
          comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
          div('absolute inset-0 bg-[linear-gradient(180deg,rgba(74,54,48,1)_0%,rgba(74,54,48,0)_22%,rgba(40,28,24,0)_55%,rgba(40,28,24,0.85)_100%)]'),
          div('absolute inset-x-0 bottom-10 px-6 text-surface', [
            caps('Sampai jumpa di hari bahagia', 'uv-reveal text-[11px] text-surface/85'),
            p('uv-reveal uv-d1 mt-3 font-heading text-[40px] font-medium uppercase leading-none tracking-[0.04em]', '{{groom_nickname}}'),
            p('uv-reveal uv-d2 -mt-1 font-script text-[40px] leading-tight', '& {{bride_nickname}}'),
          ]),
        ]),
      ],
    },
  ],
}
