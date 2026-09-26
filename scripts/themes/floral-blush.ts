import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/floral-blush'
const heading = (eyebrow: string, text: string) => [
  p('font-script text-3xl text-accent', eyebrow),
  el('h2', 'font-heading text-[30px] leading-tight text-primary', text),
]

export const meta = {
  code: 'FLR-001',
  slug: 'floral-blush',
  name: 'Floral Blush',
  category: 'floral',
  description: 'Romantis dan lembut dengan rangkaian bunga blush pink dan daun sage. Cocok untuk akad maupun resepsi.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#7a3e48',
    secondary_color: '#8fa98a',
    accent_color: '#e88f8b',
    background_color: '#fff8f6',
    surface_color: '#ffffff',
    text_color: '#4a3336',
    muted_color: '#8c7275',
    font_heading: 'Playfair Display',
    font_body: 'Quicksand',
    font_script: 'Parisienne',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    floral: `${A}/floral.svg`,
    petals: `${A}/petals.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-base px-8 text-center',
      bg: '{{asset.petals}}',
      children: [
        img('absolute -left-6 -top-6 w-48 rotate-180', '{{asset.floral}}'),
        img('absolute -bottom-6 -right-6 w-52', '{{asset.floral}}'),
        p('relative font-script text-3xl text-accent', 'The Wedding of'),
        el('h1', 'relative mt-2 font-heading text-[46px] leading-[1.05] text-primary', '{{couple_names}}'),
        p('relative mt-3 text-sm tracking-widest text-muted', '{{event_date}}'),
        div('relative mt-8 rounded-full bg-surface/80 px-6 py-3 shadow-[0_8px_30px_rgba(232,143,139,0.18)]', [
          p('text-[11px] text-muted', 'Kepada Yth.'),
          comp('guest_name', 'font-heading text-lg text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(232,143,139,0.4)]', { label: 'Buka Undangan' }),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 py-24 text-center',
      bg: '{{asset.petals}}',
      children: [
        img('absolute -right-8 -top-8 w-44 rotate-180', '{{asset.floral}}'),
        img('absolute -bottom-8 -left-8 w-44', '{{asset.floral}}'),
        p('relative font-arabic text-2xl text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        div('relative mt-8 rounded-t-full border border-accent/40 bg-surface/70 px-8 pb-10 pt-16', [
          p('font-script text-3xl text-accent', 'Save the Date'),
          el('h2', 'mt-2 font-heading text-5xl leading-none text-primary', '{{couple_names}}'),
          p('mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-muted', '{{event_date}}'),
          p('mt-1 text-xs text-secondary', '{{event_hijri}}', { if: 'event_hijri' }),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'bg-surface px-8 py-14 text-center',
      children: [
        p('font-arabic text-xl leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-3 text-[13px] italic text-muted', '"{{quote_text}}"'),
        p('mt-2 text-xs font-semibold text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden px-6 py-16 text-center',
      children: [
        img('absolute -right-10 top-10 w-32 opacity-60', '{{asset.floral}}'),
        p('font-heading text-lg italic text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div('relative mt-10 rounded-[32px] bg-surface p-6 shadow-[0_12px_30px_rgba(232,143,139,0.15)]', [
          div('mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full border-4 border-[#fbe3e1] bg-[#fbe3e1]', [
            img('h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            el('span', 'font-script text-6xl text-accent', '{{groom_nickname}}', { if: '!groom_photo' }),
          ]),
          el('h3', 'mt-4 font-heading text-2xl text-primary', '{{groom_name}}'),
          p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-semibold text-accent', '@ Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        p('my-5 font-script text-5xl text-accent', '&'),
        div('relative rounded-[32px] bg-surface p-6 shadow-[0_12px_30px_rgba(232,143,139,0.15)]', [
          div('mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full border-4 border-[#fbe3e1] bg-[#fbe3e1]', [
            img('h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            el('span', 'font-script text-6xl text-accent', '{{bride_nickname}}', { if: '!bride_photo' }),
          ]),
          el('h3', 'mt-4 font-heading text-2xl text-primary', '{{bride_name}}'),
          p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-semibold text-accent', '@ Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'bg-[#fbe3e1]/60 px-6 py-16 text-center',
      children: [
        ...heading('Insya Allah', 'Acara Pernikahan'),
        el('article', 'mt-6 rounded-[28px] bg-surface p-6 shadow-[0_10px_24px_rgba(122,62,72,0.08)]', [
          el('h3', 'font-script text-4xl text-accent', '{{item.name}}'),
          div('mx-auto my-3 h-px w-16 bg-accent/40'),
          p('font-semibold text-primary', '{{item.date}}'),
          p('text-sm text-muted', '{{item.time}}'),
          p('mt-3 font-semibold text-primary', '{{item.venue}}'),
          p('text-[13px] text-muted', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white', { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
        div('mt-10', [
          comp('countdown', '', { item_class: 'rounded-2xl bg-surface py-3', number_class: 'block font-heading text-3xl text-primary', label_class: 'text-[10px] uppercase tracking-widest text-muted' }),
        ]),
        div('mt-5', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          ...heading('Our Story', 'Kisah Cinta'),
          div('mt-6 grid gap-4', [
            div('rounded-3xl bg-surface p-5 text-left shadow-[0_8px_20px_rgba(232,143,139,0.12)]', [
              p('text-xs font-semibold uppercase tracking-widest text-secondary', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-xl text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'px-4',
      children: [
        div('py-14 text-center', [
          ...heading('Moments', 'Galeri'),
          div('mt-6 columns-2 gap-2', [
            img('mb-2 w-full rounded-2xl object-cover', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'px-6 py-14 text-center',
      children: [
        ...heading('RSVP', 'Konfirmasi Kehadiran'),
        div('mt-6 rounded-[28px] bg-surface p-5 shadow-[0_10px_24px_rgba(122,62,72,0.08)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-2xl bg-base px-4 py-2.5 text-[16px] text-ink outline-none focus:ring-2 focus:ring-accent/40',
            button_class: 'w-full rounded-full bg-accent py-3 font-semibold text-white disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-xl text-primary', 'Ucapan & Doa'),
        comp('wishes', '', { item_class: 'rounded-2xl bg-surface p-4 shadow-sm' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      children: [
        div('py-14 text-center', [
          ...heading('Wedding Gift', 'Amplop Digital'),
          div('mt-6 grid gap-3', [
            div('rounded-3xl border border-accent/30 bg-surface p-5', [
              p('text-xs font-bold uppercase tracking-widest text-accent', '{{item.bank}}'),
              p('mt-1 font-heading text-2xl text-primary', '{{item.number}}'),
              p('text-[13px] text-muted', 'a.n. {{item.holder}}'),
              comp('copy_button', 'mt-3', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-accent px-5 py-2 text-xs font-bold text-white' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-8 pb-28 pt-20 text-center',
      bg: '{{asset.petals}}',
      children: [
        img('absolute -bottom-8 -left-8 w-44', '{{asset.floral}}'),
        img('absolute -right-8 -top-8 w-40 rotate-180', '{{asset.floral}}'),
        p('relative text-muted', '{{closing_text}}'),
        p('relative mt-4 font-heading italic text-primary', '{{closing_greeting}}'),
        p('relative mt-8 font-script text-3xl text-accent', 'With love,'),
        el('h2', 'relative font-heading text-4xl text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
