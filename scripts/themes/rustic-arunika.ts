import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

// Memakai ulang aset & foto contoh yang sudah ada (tanpa file duplikat)
const R = '/theme-assets/rustic-ilalang'
const F = '/theme-assets/rustic-senja'

const title = (script: string, heading: string, light = false) => [
  p(`font-script text-[42px] leading-none ${light ? 'text-[#f1e3cc]' : 'text-accent'}`, script),
  el('h2', `mt-1 font-heading text-[22px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-[#fbf5ea]' : 'text-primary'}`, heading),
  img('mx-auto my-4 h-6 w-44', '{{asset.twine}}'),
]
/** Selotip kertas di atas polaroid */
const tape = (pos = 'left-1/2 -translate-x-1/2 -rotate-3') => div(`absolute -top-3 z-10 h-6 w-20 bg-[#e8d9bd]/90 shadow-sm ${pos}`)

function polaroid(who: 'groom' | 'bride'): ThemeNode {
  const tilt = who === 'groom' ? '-rotate-2' : 'rotate-2'
  return div('mt-10', [
    div(`relative mx-auto w-[78%] bg-surface p-3 pb-4 shadow-[0_14px_30px_rgba(74,55,38,0.22)] ${tilt}`, [
      tape(),
      div('relative grid aspect-[4/5] place-items-center overflow-hidden bg-[#e4d3b6]', [
        img('absolute inset-0 h-full w-full object-cover object-[35%_center]', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        el('span', 'font-script text-7xl text-primary', `{{${who}_nickname}}`, { if: `!${who}_photo` }),
      ]),
      p('mt-3 text-center font-script text-[34px] leading-none text-primary', `{{${who}_nickname}}`),
    ]),
    el('h3', 'mt-6 text-center font-heading text-[26px] font-semibold text-primary', `{{${who}_name}}`),
    p('mt-1 text-center text-[13.5px] text-muted', `{{${who}_parents}}`),
    div('mt-2 text-center', [
      el('a', 'inline-flex rounded-full border border-primary/40 px-4 py-1 text-xs font-bold text-primary', '@ Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
    ]),
  ])
}

export const meta = {
  code: 'RST-003',
  slug: 'rustic-arunika',
  name: 'Rustic Arunika',
  category: 'rustic',
  description: 'Rustic hangat berbasis foto: slider foto di dalam bingkai lengkung, kertas kraft, lampu tumblr, pampas, dan profil mempelai bergaya polaroid bertempel selotip.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#5c4632',
    secondary_color: '#7c8a5c',
    accent_color: '#b5834f',
    background_color: '#efe4d2',
    surface_color: '#fdf9f2',
    text_color: '#3f3127',
    muted_color: '#86735f',
    font_heading: 'Cormorant Garamond',
    font_body: 'Lato',
    font_script: 'Allura',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    kraft: `${R}/kraft.svg`,
    lights: `${R}/lights.svg`,
    pampas: `${R}/pampas.svg`,
    twine: `${R}/twine.svg`,
  },
  demo: {
    cover_photos: [`${F}/slide-1.jpg`, `${F}/slide-3.jpg`, `${F}/slide-2.jpg`],
    gallery: [`${F}/decor-1.jpg`, `${F}/slide-1.jpg`, `${F}/rings.jpg`, `${F}/slide-3.jpg`, `${F}/bride-2.jpg`, `${F}/decor-2.jpg`],
    groom_photo: `${F}/slide-2.jpg`,
    bride_photo: `${F}/bride.jpg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-14 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        p('relative text-[11px] font-bold uppercase tracking-[0.4em] text-muted', 'The Wedding of'),
        div('relative mx-auto mt-4 w-[64%]', [
          div('relative aspect-[3/4] overflow-hidden rounded-t-full border-[6px] border-surface bg-[#dccbac] shadow-[0_16px_36px_rgba(74,55,38,0.28)]', [
            comp('photo_slider', '', { dots: 'false', interval: '4500' }),
          ]),
          img('pointer-events-none absolute -bottom-6 -left-12 w-32', '{{asset.pampas}}'),
          img('pointer-events-none absolute -bottom-6 -right-12 w-28 -scale-x-100', '{{asset.pampas}}'),
        ]),
        el('h1', 'relative mt-7 font-script text-[58px] leading-[0.95] text-primary', '{{couple_names}}'),
        p('relative mt-2 font-heading text-[16px] italic text-accent', '{{event_date}}'),
        div('relative mt-5 w-full max-w-[280px] border-y border-dashed border-primary/30 py-3', [
          p('text-[11px] uppercase tracking-[0.2em] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[22px] font-semibold text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-surface shadow-[0_10px_22px_rgba(92,70,50,0.35)]', { label: 'Buka Undangan' }),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 pb-20 pt-24 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        p('relative font-arabic text-[24px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        div('relative mt-8 w-[72%] rotate-2 bg-surface p-3 pb-10 shadow-[0_14px_30px_rgba(74,55,38,0.25)]', [
          tape(),
          div('relative aspect-square overflow-hidden bg-[#dccbac]', [comp('photo_slider', '', { interval: '5000' })]),
          p('absolute bottom-2 left-0 right-0 font-script text-2xl text-primary', 'Save the Date'),
        ]),
        div('relative mt-10 flex items-center gap-4 font-heading text-primary', [
          p('w-24 border-y border-primary/40 py-1 text-sm font-semibold uppercase tracking-[0.2em]', '{{event_day}}'),
          p('text-[64px] font-semibold leading-none', '{{event_date_num}}'),
          p('w-24 border-y border-primary/40 py-1 text-sm font-semibold uppercase tracking-[0.2em]', '{{event_month}}'),
        ]),
        p('relative mt-2 font-heading text-xl font-semibold tracking-[0.4em] text-accent', '{{event_year}}'),
        div('relative mt-6 w-full', [
          comp('countdown', '', { item_class: 'rounded-md border border-dashed border-primary/40 bg-surface/70 py-2', number_class: 'block font-heading text-3xl font-semibold text-primary', label_class: 'text-[10px] uppercase tracking-widest text-muted' }),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'bg-primary px-8 py-16 text-center text-[#f6ecdb]',
      children: [
        p('font-arabic text-xl leading-loose', '{{quote_arabic}}'),
        p('mt-4 font-heading text-[17px] italic text-[#eadcc4]', '"{{quote_text}}"'),
        p('mt-3 text-xs font-bold uppercase tracking-[0.25em] text-[#d8b88d]', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative px-6 py-16',
      bg: '{{asset.kraft}}',
      children: [
        p('text-center font-script text-[40px] leading-tight text-primary', '{{greeting}}'),
        p('mx-auto mt-3 max-w-[320px] text-center text-[13.5px] text-muted', '{{opening_text}}'),
        polaroid('groom'),
        p('mt-10 text-center font-script text-6xl text-accent', '&'),
        polaroid('bride'),
      ],
    },
    {
      type: 'event',
      class: 'bg-[#e4d6bf] px-6 py-16 text-center',
      children: [
        ...title('Insya Allah', 'Hari Bahagia'),
        el('article', 'relative mt-4 rounded-xl bg-gradient-to-br from-[#6e553d] to-[#4f3b2a] p-6 text-[#f6ecdb] shadow-[0_14px_30px_rgba(74,55,38,0.3)] outline-dashed outline-1 outline-offset-[-10px] outline-[#d8b88d]/60', [
          el('h3', 'font-script text-5xl leading-none text-[#f1dcb8]', '{{item.name}}'),
          p('mt-4 font-heading text-lg font-semibold', '{{item.date}}'),
          p('text-sm text-[#e5d3b6]', '{{item.time}}'),
          div('mx-auto my-4 h-px w-16 bg-[#d8b88d]/60'),
          p('font-heading text-lg font-semibold', '{{item.venue}}'),
          p('text-[13px] text-[#e5d3b6]', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-[#f1dcb8] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary', { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
        div('mt-8', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full border-2 border-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      bg: '{{asset.kraft}}',
      children: [
        div('py-16 text-center', [
          ...title('Our Story', 'Kisah Kami'),
          div('grid gap-6', [
            div('relative bg-surface p-5 text-left shadow-[0_8px_18px_rgba(74,55,38,0.12)] odd:-rotate-1 even:rotate-1', [
              tape('left-6 -rotate-6'),
              p('text-xs font-bold uppercase tracking-[0.25em] text-secondary', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-2xl font-semibold text-primary', '{{item.title}}'),
              p('mt-1 text-[13.5px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'px-5',
      bg: '{{asset.kraft}}',
      children: [
        div('py-16 text-center', [
          ...title('Moments', 'Galeri'),
          div('grid grid-cols-2 gap-4', [
            div('bg-surface p-2 pb-5 shadow-[0_8px_18px_rgba(74,55,38,0.18)] odd:-rotate-2 even:rotate-2', [
              img('aspect-[4/5] w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-[#e4d6bf] px-6 py-16 text-center',
      children: [
        ...title('RSVP', 'Konfirmasi Kehadiran'),
        div('relative bg-surface p-5 text-left shadow-[0_10px_24px_rgba(74,55,38,0.14)]', [
          tape(),
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-md border border-[#cdb792] bg-[#fffdf8] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-accent',
            button_class: 'w-full rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-[0.2em] text-surface disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-2xl font-semibold text-primary', 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: 'rounded-md border border-dashed border-primary/30 bg-surface p-4' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      bg: '{{asset.kraft}}',
      children: [
        div('py-16 text-center', [
          ...title('Wedding Gift', 'Amplop Digital'),
          p('text-[13.5px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:'),
          div('mt-6 grid gap-4', [
            div('relative bg-surface p-6 shadow-[0_10px_22px_rgba(74,55,38,0.14)]', [
              tape(),
              p('text-xs font-bold uppercase tracking-[0.25em] text-secondary', '{{item.bank}}'),
              p('mt-2 font-heading text-[28px] font-semibold text-primary', '{{item.number}}'),
              p('text-[13px] text-muted', 'a.n. {{item.holder}}'),
              comp('copy_button', 'mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-widest text-white' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative flex flex-col items-center overflow-hidden px-8 pb-20 pt-20 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        div('relative w-[56%]', [
          div('aspect-[3/4] overflow-hidden rounded-t-full border-[6px] border-surface bg-[#dccbac] shadow-[0_14px_30px_rgba(74,55,38,0.25)]', [
            comp('photo_slider', '', { dots: 'false', interval: '5500' }),
          ]),
          img('pointer-events-none absolute -bottom-6 -left-10 w-28', '{{asset.pampas}}'),
          img('pointer-events-none absolute -bottom-6 -right-10 w-24 -scale-x-100', '{{asset.pampas}}'),
        ]),
        p('relative mt-8 text-[13.5px] text-muted', '{{closing_text}}'),
        p('relative mt-3 font-heading text-lg italic text-primary', '{{closing_greeting}}'),
        p('relative mt-6 font-script text-[44px] leading-none text-accent', 'Terima kasih'),
        el('h2', 'relative mt-1 font-heading text-[30px] font-semibold text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
