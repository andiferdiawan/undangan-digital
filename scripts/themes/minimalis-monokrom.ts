import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/minimalis-monokrom'
const heading = (text: string) => [
  el('h2', 'font-heading text-[34px] font-light italic leading-tight text-primary', text),
  img('mx-auto my-5 h-3 w-32', '{{asset.line}}'),
]

export const meta = {
  code: 'MIN-001',
  slug: 'minimalis-monokrom',
  name: 'Minimalis Monokrom',
  category: 'minimalis',
  description: 'Minimalis elegan hitam-putih dengan tipografi serif. Latar cover bisa diganti foto prewedding.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#1f1c1a',
    secondary_color: '#8a7f73',
    accent_color: '#b49a7a',
    background_color: '#f7f5f2',
    surface_color: '#ffffff',
    text_color: '#2b2724',
    muted_color: '#7a736c',
    font_heading: 'Cormorant Garamond',
    font_body: 'Inter',
    font_script: 'Pinyon Script',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    hero_image: `${A}/hero.svg`,
    line: `${A}/line.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-end bg-primary bg-cover bg-center px-8 pb-20 text-center text-white',
      bg: '{{hero_image}}',
      children: [
        div('absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75'),
        p('relative text-[11px] uppercase tracking-[0.4em] text-white/80', 'The Wedding of'),
        el('h1', 'relative mt-3 font-heading text-[44px] font-light leading-none', '{{groom_nickname}}'),
        p('relative my-1 font-script text-3xl text-accent', 'and'),
        el('h1', 'relative font-heading text-[44px] font-light leading-none', '{{bride_nickname}}'),
        p('relative mt-5 text-xs tracking-[0.3em] text-white/80', '{{event_date}}'),
        div('relative mt-8 w-full border-t border-white/25 pt-5', [
          p('text-[11px] text-white/70', 'Kepada Yth.'),
          comp('guest_name', 'font-heading text-2xl', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 rounded-none border border-white px-10 py-3 text-xs uppercase tracking-[0.3em] text-white', { label: 'Buka Undangan' }),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-end bg-primary bg-cover bg-center px-8 pb-16 text-center text-white',
      bg: '{{hero_image}}',
      children: [
        div('absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70'),
        p('relative font-arabic text-2xl', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        el('h2', 'relative mt-6 font-heading text-[52px] font-light leading-[0.95]', '{{couple_names}}'),
        p('relative mt-5 text-[11px] uppercase tracking-[0.35em] text-white/85', '{{event_date}}'),
      ],
    },
    {
      type: 'quote',
      class: 'px-10 py-16 text-center',
      children: [
        p('font-arabic text-xl leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-4 font-heading text-lg italic leading-snug text-muted', '"{{quote_text}}"'),
        p('mt-3 text-[11px] uppercase tracking-[0.3em] text-secondary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'bg-surface px-8 py-16 text-center',
      children: [
        p('text-[11px] uppercase tracking-[0.3em] text-secondary', '{{greeting}}'),
        p('mt-4 text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-12', [
          div('', [
            div('mx-auto grid aspect-[4/5] w-48 place-items-center overflow-hidden bg-base', [
              img('h-full w-full object-cover grayscale', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
              el('span', 'font-heading text-7xl font-light text-secondary', '{{groom_nickname}}', { if: '!groom_photo' }),
            ]),
            el('h3', 'mt-5 font-heading text-[28px] leading-tight text-primary', '{{groom_name}}'),
            p('mt-2 text-[13px] text-muted', '{{groom_parents}}'),
            el('a', 'mt-3 inline-block border-b border-secondary text-xs uppercase tracking-widest text-secondary', 'Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
          ]),
          p('font-script text-5xl text-accent', '&'),
          div('', [
            div('mx-auto grid aspect-[4/5] w-48 place-items-center overflow-hidden bg-base', [
              img('h-full w-full object-cover grayscale', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
              el('span', 'font-heading text-7xl font-light text-secondary', '{{bride_nickname}}', { if: '!bride_photo' }),
            ]),
            el('h3', 'mt-5 font-heading text-[28px] leading-tight text-primary', '{{bride_name}}'),
            p('mt-2 text-[13px] text-muted', '{{bride_parents}}'),
            el('a', 'mt-3 inline-block border-b border-secondary text-xs uppercase tracking-widest text-secondary', 'Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
          ]),
        ]),
      ],
    },
    {
      type: 'countdown',
      class: 'bg-primary px-6 py-16 text-center text-white',
      children: [
        p('text-[11px] uppercase tracking-[0.35em] text-white/70', 'Counting Down'),
        el('h2', 'mb-8 mt-2 font-heading text-4xl font-light italic', '{{event_date}}'),
        comp('countdown', '', { item_class: 'border border-white/20 py-4', number_class: 'block font-heading text-4xl font-light', label_class: 'text-[10px] uppercase tracking-[0.25em] text-white/60' }),
        div('mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: 'inline-flex border border-white px-8 py-3 text-xs uppercase tracking-[0.3em]' })]),
      ],
    },
    {
      type: 'event',
      class: 'px-6 py-16 text-center',
      children: [
        ...heading('Rangkaian Acara'),
        el('article', 'border-b border-secondary/30 py-8 last:border-0', [
          el('h3', 'font-heading text-3xl text-primary', '{{item.name}}'),
          p('mt-3 text-xs uppercase tracking-[0.25em] text-secondary', '{{item.date}}'),
          p('mt-1 text-sm text-primary', '{{item.time}}'),
          p('mt-4 font-semibold text-primary', '{{item.venue}}'),
          p('mt-1 text-[13px] text-muted', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex bg-primary px-8 py-3 text-xs uppercase tracking-[0.25em] text-white', { href: '{{item.map_url}}', label: 'Buka Peta' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
      ],
    },
    {
      type: 'story',
      class: 'bg-surface px-8',
      children: [
        div('py-16 text-center', [
          ...heading('Kisah Kami'),
          div('mb-8 last:mb-0', [
            p('text-[11px] uppercase tracking-[0.3em] text-secondary', '{{item.date}}'),
            el('h3', 'mt-1 font-heading text-2xl italic text-primary', '{{item.title}}'),
            p('mt-2 text-[13px] text-muted', '{{item.text}}'),
          ], { repeat: 'story' }),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: '',
      children: [
        div('py-16', [
          div('px-6 text-center', heading('Galeri')),
          div('grid grid-cols-2 gap-1', [
            img('aspect-[3/4] h-full w-full object-cover grayscale transition hover:grayscale-0 first:col-span-2 first:aspect-[4/3]', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-surface px-6 py-16 text-center',
      children: [
        ...heading('Konfirmasi Kehadiran'),
        comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-secondary/40 bg-transparent px-0 py-2.5 text-base text-ink outline-none focus:border-primary',
          button_class: 'w-full bg-primary py-3.5 text-xs uppercase tracking-[0.3em] text-white disabled:opacity-60',
          label_class: 'grid gap-1 text-left text-[11px] uppercase tracking-[0.2em] text-secondary',
        }),
      ],
    },
    {
      type: 'wishes',
      class: 'px-6 py-14 text-center',
      children: [
        el('h3', 'mb-5 font-heading text-2xl italic text-primary', 'Doa & Ucapan'),
        comp('wishes', '', { item_class: 'border-b border-secondary/20 py-3', name_class: 'text-sm font-semibold text-primary', text_class: 'mt-1 font-heading text-lg italic text-muted' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      children: [
        div('py-14 text-center', [
          ...heading('Tanda Kasih'),
          div('mb-4 border border-secondary/30 bg-surface p-6', [
            p('text-[11px] uppercase tracking-[0.3em] text-secondary', '{{item.bank}}'),
            p('mt-2 font-heading text-3xl tracking-wider text-primary', '{{item.number}}'),
            p('text-[13px] text-muted', 'a.n. {{item.holder}}'),
            comp('copy_button', 'mt-4', { value: '{{item.number}}', label: 'Salin', button_class: 'border border-primary px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-primary' }),
          ], { repeat: 'gifts' }),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative bg-primary bg-cover bg-center px-8 py-24 text-center text-white',
      bg: '{{hero_image}}',
      children: [
        div('absolute inset-0 bg-black/60'),
        p('relative text-white/85', '{{closing_text}}'),
        p('relative mt-5 text-[11px] uppercase tracking-[0.3em] text-white/70', '{{closing_greeting}}'),
        el('h2', 'relative mt-8 font-heading text-5xl font-light italic', '{{couple_names}}'),
      ],
    },
  ],
}
