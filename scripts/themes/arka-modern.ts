import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/arka-modern'
/** Label bernomor gaya editorial: "02 — Mempelai" */
const label = (no: string, text: string, heading: string) => [
  div('flex items-center gap-3', [
    el('span', 'font-heading text-sm text-accent', no),
    div('h-px flex-1 bg-primary/20'),
    el('span', 'text-[10px] font-bold uppercase tracking-[0.3em] text-muted', text),
  ]),
  el('h2', 'mt-4 font-heading text-[40px] leading-[0.95] text-primary', heading),
]

export const meta = {
  code: 'MOD-001',
  slug: 'arka-modern',
  name: 'Arka Modern',
  category: 'modern',
  description: 'Modern editorial dengan bentuk geometris berani, tipografi besar, dan palet teal gelap, mustard, serta koral. Segar untuk pasangan kekinian.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#16302b',
    secondary_color: '#e7b54a',
    accent_color: '#d8674a',
    background_color: '#f2eee7',
    surface_color: '#ffffff',
    text_color: '#1f2523',
    muted_color: '#6b6f6a',
    font_heading: 'DM Serif Display',
    font_body: 'DM Sans',
    font_script: 'Italiana',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    shapes: `${A}/shapes.svg`,
    squiggle: `${A}/squiggle.svg`,
    grain: `${A}/grain.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col justify-between overflow-hidden bg-base px-7 pb-10 pt-10',
      bg: '{{asset.grain}}',
      children: [
        div('relative flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-primary', [
          el('span', '', 'Wedding'),
          el('span', 'text-accent', 'Invitation'),
        ]),
        img('relative mx-auto mt-6 w-[88%]', '{{asset.shapes}}'),
        div('relative mt-6', [
          p('font-script text-2xl text-muted', 'we are getting married'),
          el('h1', 'mt-1 font-heading text-[54px] leading-[0.92] text-primary', '{{couple_names}}'),
          div('mt-4 inline-flex rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary', '{{event_date}}'),
        ]),
        div('relative mt-6 flex items-end justify-between gap-4 border-t border-primary/15 pt-5', [
          div('', [
            p('text-[10px] font-bold uppercase tracking-[0.25em] text-muted', 'Kepada'),
            comp('guest_name', 'font-heading text-xl text-primary', { fallback: 'Tamu Undangan' }),
          ]),
          comp('open_button', 'shrink-0 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white', { label: 'Buka →' }),
        ]),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-primary px-7 py-20 text-white',
      children: [
        div('absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary'),
        div('absolute -bottom-20 -left-10 h-48 w-72 rounded-t-full bg-accent'),
        p('relative font-arabic text-2xl text-white/90', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-10 text-[10px] font-bold uppercase tracking-[0.35em] text-secondary', 'Save the date'),
        el('h2', 'relative mt-3 font-heading text-[46px] leading-[0.95]', '{{couple_names}}'),
        div('relative mt-8 grid grid-cols-3 gap-2', [
          div('rounded-2xl bg-white/10 p-3', [
            p('text-[10px] uppercase tracking-widest text-white/60', 'Hari'),
            p('font-heading text-xl', '{{event_day}}'),
          ]),
          div('rounded-2xl bg-secondary p-3 text-primary', [
            p('text-[10px] uppercase tracking-widest text-primary/70', 'Tanggal'),
            p('font-heading text-3xl leading-none', '{{event_date_num}}'),
          ]),
          div('rounded-2xl bg-white/10 p-3', [
            p('text-[10px] uppercase tracking-widest text-white/60', '{{event_year}}'),
            p('font-heading text-xl', '{{event_month}}'),
          ]),
        ]),
        p('relative mt-4 text-xs text-white/70', '{{event_hijri}}', { if: 'event_hijri' }),
      ],
    },
    {
      type: 'quote',
      class: 'bg-base px-7 py-16',
      children: [
        img('h-4 w-28', '{{asset.squiggle}}'),
        p('mt-6 text-right font-arabic text-xl leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-4 font-heading text-[22px] leading-snug text-primary', '"{{quote_text}}"'),
        p('mt-3 text-xs font-bold uppercase tracking-[0.25em] text-accent', '— {{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'bg-surface px-7 py-16',
      children: [
        ...label('01', 'Mempelai', 'Dua insan, satu tujuan.'),
        p('mt-3 font-bold text-primary', '{{greeting}}'),
        p('mt-1 text-muted', '{{opening_text}}'),
        div('mt-8 grid gap-4', [
          div('overflow-hidden rounded-[28px] bg-base', [
            div('relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary', [
              img('h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
              el('span', 'font-heading text-7xl text-primary', '{{groom_nickname}}', { if: '!groom_photo' }),
            ]),
            div('p-5', [
              p('text-[10px] font-bold uppercase tracking-[0.3em] text-accent', 'The Groom'),
              el('h3', 'mt-1 font-heading text-2xl text-primary', '{{groom_name}}'),
              p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
              el('a', 'mt-3 inline-flex rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary', 'Instagram ↗', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
            ]),
          ]),
          div('overflow-hidden rounded-[28px] bg-base', [
            div('relative grid aspect-[4/3] place-items-center overflow-hidden bg-accent', [
              img('h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
              el('span', 'font-heading text-7xl text-white', '{{bride_nickname}}', { if: '!bride_photo' }),
            ]),
            div('p-5', [
              p('text-[10px] font-bold uppercase tracking-[0.3em] text-accent', 'The Bride'),
              el('h3', 'mt-1 font-heading text-2xl text-primary', '{{bride_name}}'),
              p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
              el('a', 'mt-3 inline-flex rounded-full border border-primary px-4 py-1.5 text-xs font-bold text-primary', 'Instagram ↗', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
            ]),
          ]),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'bg-base px-7 py-16',
      bg: '{{asset.grain}}',
      children: [
        ...label('02', 'Acara', 'Kapan & di mana.'),
        div('mt-8 grid gap-4', [
          el('article', 'rounded-[28px] bg-surface p-6 shadow-[0_1px_0_rgba(22,48,43,0.08)]', [
            div('flex items-start justify-between gap-3', [
              el('h3', 'font-heading text-[28px] leading-none text-primary', '{{item.name}}'),
              el('span', 'rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary', '{{item.time}}'),
            ]),
            p('mt-4 font-bold text-ink', '{{item.date}}'),
            div('my-4 h-px bg-primary/10'),
            p('font-bold text-primary', '{{item.venue}}'),
            p('text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', 'mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white', { href: '{{item.map_url}}', label: 'Buka Maps ↗' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('mt-8 rounded-[28px] bg-primary p-5', [
          p('mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary', 'Menuju hari H'),
          comp('countdown', '', { item_class: 'rounded-2xl bg-white/10 py-3', number_class: 'block font-heading text-3xl text-white', label_class: 'text-[10px] uppercase tracking-widest text-white/60' }),
          div('mt-4', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex w-full justify-center rounded-full bg-secondary py-3 text-xs font-bold uppercase tracking-widest text-primary' })]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'bg-surface px-7',
      children: [
        div('py-16', [
          ...label('03', 'Cerita', 'Bagaimana semuanya dimulai.'),
          div('mt-8 grid gap-3', [
            div('grid grid-cols-[auto_1fr] gap-4 rounded-[24px] bg-base p-5', [
              div('grid h-11 w-11 place-items-center rounded-full bg-primary font-heading text-lg text-secondary', '{{index}}'),
              div('', [
                p('text-[10px] font-bold uppercase tracking-[0.25em] text-accent', '{{item.date}}'),
                el('h3', 'font-heading text-xl text-primary', '{{item.title}}'),
                p('mt-1 text-[13px] text-muted', '{{item.text}}'),
              ]),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-surface px-4',
      children: [
        div('py-14', [
          div('px-3', label('04', 'Galeri', 'Potret kami.')),
          div('mt-8 grid grid-cols-2 gap-2', [
            img('aspect-[4/5] w-full rounded-[22px] object-cover', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-base px-7 py-16',
      bg: '{{asset.grain}}',
      children: [
        ...label('05', 'RSVP', 'Kamu datang, kan?'),
        div('mt-8 rounded-[28px] bg-surface p-5', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-2xl border border-primary/15 bg-base px-4 py-3 text-base text-ink outline-none focus:border-accent',
            label_class: 'text-[11px] font-bold uppercase tracking-widest text-muted',
            button_class: 'w-full rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-2xl text-primary', 'Ucapan & doa'),
        comp('wishes', '', { item_class: 'rounded-2xl bg-surface p-4', name_class: 'font-bold text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-7',
      children: [
        div('py-16', [
          ...label('06', 'Hadiah', 'Amplop digital.'),
          p('mt-3 text-muted', 'Doa restu sudah lebih dari cukup. Namun jika ingin berbagi tanda kasih:'),
          div('mt-6 grid gap-3', [
            div('relative overflow-hidden rounded-[28px] bg-primary p-6 text-white', [
              div('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-secondary'),
              div('absolute -bottom-10 right-10 h-20 w-20 rounded-full bg-accent'),
              p('relative text-[10px] font-bold uppercase tracking-[0.3em] text-white/70', '{{item.bank}}'),
              p('relative mt-6 font-heading text-[26px] tracking-wide', '{{item.number}}'),
              p('relative text-[13px] text-white/70', '{{item.holder}}'),
              comp('copy_button', 'relative mt-4', { value: '{{item.number}}', label: 'Salin', button_class: 'rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-secondary px-7 pb-28 pt-16',
      children: [
        div('absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent'),
        div('absolute -bottom-10 left-6 h-36 w-24 rounded-t-full bg-primary'),
        p('relative text-primary/80', '{{closing_text}}'),
        p('relative mt-4 font-bold text-primary', '{{closing_greeting}}'),
        p('relative mt-10 font-script text-2xl text-primary/70', 'with love,'),
        el('h2', 'relative font-heading text-[48px] leading-[0.95] text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
