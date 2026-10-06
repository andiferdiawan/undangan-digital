import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Lengkung Mawar — romantis merah anggur & krem dengan panel berbentuk lengkung (arch) dan rangkaian mawar
 * dusty pink, krem, dan marun. Foto pasangan penuh yang memudar ke krem, panel lengkung anggur berisi sapaan
 * & kalender sebulan, hitung mundur "Kami akan mengucap SAH dalam…", kartu acara berbentuk lengkung,
 * dan formulir konfirmasi bergaris bawah.
 */
const A = '/theme-assets/lengkung-mawar'

const ARCH = 'rounded-t-[999px] bg-primary text-surface shadow-[0_30px_50px_-30px_rgba(60,10,14,0.8)]'
const btnLight = 'inline-flex items-center justify-center gap-2 rounded-full bg-surface px-7 py-3 font-heading text-[12px] uppercase tracking-[0.18em] text-primary shadow-[0_10px_20px_-12px_rgba(0,0,0,0.6)]'
const btnOutlineLight = 'inline-flex items-center justify-center gap-2 rounded-full border border-surface/60 px-6 py-2.5 font-heading text-[11px] uppercase tracking-[0.18em] text-surface'
const btnWine = 'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-heading text-[12px] uppercase tracking-[0.18em] text-surface shadow-[0_10px_20px_-12px_rgba(60,10,14,0.8)]'
const script = (t: string, cls = '') => p(`font-script leading-none ${cls}`, t)
const caps = (t: string, cls = '') => p(`font-heading text-[14px] uppercase tracking-[0.16em] ${cls}`, t)
const divider = (light = false) => div(`mx-auto my-6 flex items-center justify-center gap-2 ${light ? 'text-surface/50' : 'text-primary/40'}`, [
  div('h-px w-14 bg-current'), div('h-1.5 w-1.5 rotate-45 bg-current'), div('h-px w-14 bg-current'),
])
const bouquet = (cls: string) => img(`pointer-events-none relative mx-auto w-full max-w-[330px] select-none ${cls}`, '{{asset.rangkaian}}', 'Rangkaian mawar')
const photoTone = 'saturate-[.92]'
/** Foto penuh (slider Foto Sampul → galeri) yang memudar ke warna latar di bagian bawah. */
const fadePhoto = (h: number) => div(`relative h-[${h}px] overflow-hidden bg-secondary/30`, [
  div('absolute inset-0 grid place-items-center pb-16', [script('{{couple_names}}', 'text-[44px] text-primary')]),
  comp('photo_slider', '', { interval: '5000', image_class: photoTone, dots: 'false' }),
  div('pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgb(var(--c-base)))]'),
])

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal', [
    div('relative mx-auto w-[220px]', [
      div('relative aspect-[3/4] overflow-hidden rounded-t-full bg-secondary/25 outline outline-1 outline-offset-[6px] outline-primary/35', [
        img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div('absolute inset-0 grid place-items-center', [img('w-20', '{{asset.mawar}}')], { if: `!${who}_photo` }),
      ]),
      img(`pointer-events-none absolute -bottom-5 w-20 ${who === 'groom' ? '-left-6' : '-right-6'}`, '{{asset.mawar}}'),
    ]),
    script(`{{${who}_nickname}}`, 'mt-8 text-[46px] text-primary'),
    caps(`{{${who}_name}}`, 'mt-2 text-[14px] text-ink'),
    p('mx-auto mt-2 max-w-[280px] font-body text-[17px] italic leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-heading text-[11px] uppercase tracking-[0.15em] text-primary underline underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'FLR-003',
  slug: 'lengkung-mawar',
  name: 'Lengkung Mawar',
  category: 'floral',
  description: 'Romantis merah anggur dan krem dengan panel berbentuk lengkung dan rangkaian mawar dusty pink, krem, dan marun. Foto penuh yang memudar, kalender sebulan, hitung mundur "Kami akan mengucap SAH", kartu acara lengkung, dan formulir bergaris bawah.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#7a1b21',
    secondary_color: '#c48b84',
    accent_color: '#d9b0a3',
    background_color: '#f7f2ea',
    surface_color: '#fffcf7',
    text_color: '#3f2a26',
    muted_color: '#86706a',
    font_heading: 'Prata',
    font_body: 'Cormorant Garamond',
    font_script: 'Ephesis',
  },
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    rangkaian: `${A}/rangkaian-mawar.svg`,
    mawar: `${A}/mawar-tunggal.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: foto memudar + panel lengkung ----------
    {
      type: 'cover',
      class: 'relative flex flex-col overflow-hidden bg-base text-center',
      children: [
        fadePhoto(280),
        div(`uv-reveal relative mx-4 -mt-20 flex flex-1 flex-col items-center px-8 pt-14 ${ARCH}`, [
          caps('The Wedding of', 'text-[11px] tracking-[0.3em] text-surface/80'),
          el('h1', 'uv-reveal-zoom uv-d1 mt-2 font-script text-[50px] leading-[1.05] text-surface', '{{groom_nickname}} & {{bride_nickname}}'),
          caps('{{event_date}}', 'mt-2 text-[11px] tracking-[0.2em] text-surface/85'),
          divider(true),
          p('font-body text-[16px] italic text-surface/80', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[19px] leading-snug text-surface', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d3 mt-6', [comp('open_button', btnLight, { label: 'Buka Undangan →' })]),
          bouquet('mt-auto pt-6'),
        ]),
      ],
    },
    // ---------- Sapaan + kalender dalam panel lengkung ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base pb-6 text-center',
      children: [
        fadePhoto(470),
        div(`relative mx-4 -mt-32 px-7 pt-20 ${ARCH}`, [
          script('Teruntuk', 'uv-reveal text-[54px] text-surface'),
          caps('Keluarga & Sahabat Terkasih!', 'uv-reveal uv-d1 mt-2 text-[14px] text-surface'),
          p('uv-reveal uv-d2 mx-auto mt-5 max-w-[290px] font-body text-[18px] leading-snug text-surface/90', 'Ada satu hari yang akan menjadi sangat istimewa bagi kami. Dengan penuh sukacita, kami mengundang Anda untuk hadir dan berbagi kebahagiaan di hari pernikahan kami.'),
          p('uv-reveal uv-d3 mt-4 font-heading text-[11px] tracking-[0.2em] text-surface/60', '#{{groom_nickname}}{{bride_nickname}}'),
          divider(true),
          script('Hari Bahagia', 'uv-reveal text-[48px] text-surface'),
          caps('{{event_month}} | {{event_year}}', 'uv-reveal mt-3 text-[12px] tracking-[0.25em] text-surface/80'),
          div('uv-reveal mx-auto mt-6 max-w-[300px]', [comp('month_calendar', '', {
            head_class: 'pb-1 font-heading text-[10px] uppercase text-surface/60',
            day_class: 'font-body text-[17px] text-surface/90',
            active_class: 'font-body text-[17px] font-bold text-primary',
            marker: 'heart',
            marker_class: 'text-surface',
          })]),
          bouquet('uv-reveal -mb-8 mt-6'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-12 pt-10 text-center',
      children: [
        p('uv-reveal font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        caps('{{quote_source}}', 'uv-reveal uv-d2 mt-4 text-[11px] tracking-[0.25em] text-primary'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-7 pb-20 pt-6 text-center',
      children: [
        script('Mempelai', 'uv-reveal text-[54px] text-primary'),
        caps('Dengan Penuh Syukur', 'uv-reveal uv-d1 mt-2 text-[13px] text-ink'),
        p('uv-reveal uv-d2 mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', '{{opening_text}}'),
        div('mt-12 grid gap-10', [
          person('groom'),
          script('&', 'uv-reveal text-[60px] text-primary/70'),
          person('bride'),
        ]),
      ],
    },
    // ---------- Hitung mundur dalam panel lengkung ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-base px-4 pb-14 pt-6 text-center',
      children: [
        div(`relative px-6 pt-24 ${ARCH}`, [
          script('Kami', 'uv-reveal text-[60px] text-surface'),
          caps('akan mengucap “sah” dalam…', 'uv-reveal uv-d1 mt-2 text-[14px] text-surface'),
          div('uv-reveal uv-d2 mx-auto mt-7 max-w-[300px]', [comp('countdown', '', {
            item_class: 'py-1 text-center',
            number_class: 'block font-heading text-[32px] leading-none text-surface',
            label_class: 'mt-1.5 block font-body text-[13px] italic text-surface/70',
          })]),
          div('mt-7', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnOutlineLight })]),
          bouquet('uv-reveal -mb-6 mt-6'),
        ]),
      ],
    },
    // ---------- Acara: kartu lengkung ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-4 text-center',
      children: [
        script('Waktu & Tempat', 'uv-reveal text-[50px] text-primary'),
        caps('Rangkaian Acara', 'uv-reveal uv-d1 mt-2 text-[13px] text-ink'),
        div('mt-14 grid gap-14', [
          el('article', 'uv-reveal relative mx-auto w-full max-w-[320px] rounded-t-[999px] border border-primary/30 bg-surface px-7 pb-9 pt-20 shadow-[0_24px_40px_-30px_rgba(60,10,14,0.6)]', [
            img('pointer-events-none absolute left-1/2 -top-9 w-20 -ml-10', '{{asset.mawar}}'),
            caps('{{item.name}}', 'text-[16px] text-primary'),
            divider(),
            p('font-body text-[19px] text-ink', '{{item.date}}'),
            p('font-body text-[17px] italic text-muted', '{{item.time}}'),
            caps('{{item.venue}}', 'mt-5 text-[13px] text-ink'),
            p('mx-auto mt-1 max-w-[260px] font-body text-[16px] leading-snug text-muted', '{{item.address}}'),
            div('mt-6', [comp('map_button', btnWine, { href: '{{item.map_url}}', label: 'Lihat Lokasi →' }, { if: 'item.map_url' })]),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('pb-16 pt-2 text-center', [
          script('Kisah Kami', 'uv-reveal text-[50px] text-primary'),
          div('mx-auto mt-8 grid max-w-[320px] gap-8', [
            div('uv-reveal', [
              caps('{{item.date}}', 'text-[11px] tracking-[0.25em] text-primary'),
              p('mt-1 font-script text-[36px] leading-tight text-ink', '{{item.title}}'),
              p('mt-1 font-body text-[17px] italic leading-snug text-muted', '{{item.text}}'),
              div('mx-auto mt-6 h-px w-16 bg-primary/30'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-5 text-center',
      children: [
        div('pb-16 pt-2', [
          script('Momen Kami', 'uv-reveal text-[50px] text-primary'),
          div('mt-8 grid grid-cols-2 gap-3', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden rounded-t-full bg-secondary/25 [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:mx-auto [&:nth-child(3n+1)]:w-[78%]', [
              img(`h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('pb-16 pt-2', [
          script('Tanda Kasih', 'uv-reveal text-[50px] text-primary'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', 'Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-5', [
            div(`uv-reveal mx-auto w-full max-w-[320px] rounded-t-[140px] px-6 pb-8 pt-14 ${ARCH.replace('rounded-t-[999px] ', '')}`, [
              caps('{{item.bank}}', 'text-[11px] tracking-[0.25em] text-surface/75'),
              p('mt-2 font-heading text-[26px] tracking-wider text-surface', '{{item.number}}'),
              p('font-body text-[17px] italic text-surface/80', 'a.n. {{item.holder}}'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnLight })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Konfirmasi: formulir bergaris bawah ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-2 text-center',
      children: [
        script('Konfirmasi', 'uv-reveal text-[52px] text-primary'),
        caps('Kehadiran Anda', 'uv-reveal uv-d1 mt-2 text-[13px] text-ink'),
        p('uv-reveal uv-d2 mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', 'Mohon kesediaan Anda untuk mengonfirmasi kehadiran melalui formulir berikut.'),
        div('uv-reveal mt-8 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-primary/40 bg-transparent px-1 py-2 font-body text-[18px] text-ink outline-none focus:border-primary',
          button_class: `mt-2 w-full ${btnWine} disabled:opacity-60`,
          label_class: 'grid gap-1 font-heading text-[11px] uppercase tracking-[0.14em] text-primary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-2 text-center',
      children: [
        script('Doa & Ucapan', 'uv-reveal text-[48px] text-primary'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: 'border-b border-primary/15 py-3',
          name_class: 'font-heading text-[14px] text-primary',
          text_class: 'mt-1 font-body text-[17px] leading-snug text-ink/80',
        })]),
      ],
    },
    // ---------- Penutup: panel lengkung berfoto + mawar ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-4 pb-16 pt-4 text-center',
      children: [
        div(`relative px-7 pb-0 pt-10 ${ARCH}`, [
          div('relative mx-auto aspect-[4/5] w-[240px] overflow-hidden rounded-t-full bg-surface/15 ring-1 ring-surface/40 ring-offset-4 ring-offset-primary', [
            div('absolute inset-0 grid place-items-center', [img('w-20', '{{asset.mawar}}')]),
            comp('photo_slider', '', { interval: '4500', image_class: photoTone, dots: 'false' }),
          ]),
          script('Terima Kasih', 'uv-reveal mt-8 text-[54px] text-surface'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[290px] font-body text-[17px] italic leading-snug text-surface/85', '{{closing_text}}'),
          caps('{{couple_names}}', 'uv-reveal uv-d2 mt-5 text-[14px] tracking-[0.25em] text-surface'),
          bouquet('uv-reveal -mb-6 mt-5'),
        ]),
        p('uv-reveal mt-8 font-heading text-[11px] uppercase tracking-[0.18em] text-muted', '{{closing_greeting}}'),
      ],
    },
  ],
}
