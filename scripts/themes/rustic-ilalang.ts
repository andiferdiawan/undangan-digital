import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/rustic-ilalang'
const title = (eyebrow: string, heading: string) => [
  p('font-script text-[38px] leading-none text-accent', eyebrow),
  el('h2', 'mt-1 font-heading text-[24px] uppercase tracking-[0.12em] text-primary', heading),
  img('mx-auto my-4 h-6 w-44', '{{asset.twine}}'),
]
/** Kartu kertas dengan tepi putus-putus seperti jahitan */
const paper = 'rounded-[6px] border border-[#d9c6a5] bg-surface p-6 shadow-[0_6px_18px_rgba(90,62,43,0.10)] outline-dashed outline-1 outline-offset-[-8px] outline-[#cdb792]'

export const meta = {
  code: 'RST-001',
  slug: 'rustic-ilalang',
  name: 'Rustic Ilalang',
  category: 'rustic',
  description: 'Rustic hangat dengan tekstur kertas kraft, rangkaian pampas dan daun eucalyptus, lampu tumblr, serta tali goni. Cocok untuk pesta taman atau outdoor.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#5a3e2b',
    secondary_color: '#7f8f5a',
    accent_color: '#b9804a',
    background_color: '#f1e7d6',
    surface_color: '#fbf6ec',
    text_color: '#43352a',
    muted_color: '#8a7867',
    font_heading: 'Lora',
    font_body: 'Josefin Sans',
    font_script: 'Sacramento',
  },
  root_class: 'text-[14.5px] leading-relaxed',
  assets: {
    pampas: `${A}/pampas.svg`,
    kraft: `${A}/kraft.svg`,
    lights: `${A}/lights.svg`,
    twine: `${A}/twine.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden px-8 pb-24 pt-20 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        img('pointer-events-none absolute -bottom-2 -left-4 w-56', '{{asset.pampas}}'),
        img('pointer-events-none absolute -bottom-2 -right-4 w-48 -scale-x-100 opacity-90', '{{asset.pampas}}'),
        p('relative font-heading text-xs uppercase tracking-[0.4em] text-muted', 'The Wedding of'),
        el('h1', 'relative mt-3 font-script text-[70px] leading-[0.9] text-primary', '{{couple_names}}'),
        img('relative mx-auto my-3 h-6 w-44', '{{asset.twine}}'),
        p('relative font-heading text-sm italic text-accent', '{{event_date}}'),
        div('relative mt-8 rounded-[4px] bg-surface/90 px-6 py-3 shadow-[0_6px_18px_rgba(90,62,43,0.12)]', [
          p('text-[11px] uppercase tracking-[0.2em] text-muted', 'Kepada Yth.'),
          comp('guest_name', 'font-heading text-lg text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#fbf6ec] shadow-[0_8px_20px_rgba(90,62,43,0.3)]', { label: 'Buka Undangan' }),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 pb-40 pt-24 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        img('pointer-events-none absolute -bottom-2 left-1/2 w-64 -translate-x-[70%]', '{{asset.pampas}}'),
        img('pointer-events-none absolute -bottom-2 left-1/2 w-56 -translate-x-[20%] -scale-x-100', '{{asset.pampas}}'),
        p('relative font-arabic text-[24px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-8 font-script text-4xl text-accent', 'Save the Date'),
        el('h2', 'relative mt-1 font-heading text-[40px] leading-tight text-primary', '{{couple_names}}'),
        div('relative mt-6 flex items-center gap-4 font-heading text-primary', [
          p('w-20 border-y border-primary/40 py-1 text-xs uppercase tracking-[0.2em]', '{{event_day}}'),
          p('text-5xl leading-none', '{{event_date_num}}'),
          p('w-20 border-y border-primary/40 py-1 text-xs uppercase tracking-[0.2em]', '{{event_month}}'),
        ]),
        p('relative mt-2 font-heading text-lg tracking-[0.3em] text-accent', '{{event_year}}'),
        p('relative mt-2 text-xs text-secondary', '{{event_hijri}}', { if: 'event_hijri' }),
      ],
    },
    {
      type: 'quote',
      class: 'bg-primary px-8 py-16 text-center text-[#f1e7d6]',
      children: [
        p('font-arabic text-xl leading-loose', '{{quote_arabic}}'),
        p('mt-4 font-heading text-[14px] italic text-[#eadcc4]', '"{{quote_text}}"'),
        p('mt-3 text-xs uppercase tracking-[0.25em] text-[#d9b98c]', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden px-6 py-16 text-center',
      bg: '{{asset.kraft}}',
      children: [
        p('font-heading text-lg italic text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div(`relative mt-10 ${paper}`, [
          div('mx-auto grid h-44 w-36 place-items-center overflow-hidden rounded-[999px] border-[6px] border-[#fbf6ec] bg-[#e4d3b6] shadow-[0_0_0_1px_#cdb792]', [
            img('h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            el('span', 'font-script text-6xl text-primary', '{{groom_nickname}}', { if: '!groom_photo' }),
          ]),
          el('h3', 'mt-4 font-heading text-2xl text-primary', '{{groom_name}}'),
          p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent', 'Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        p('my-4 font-script text-6xl text-accent', '&'),
        div(`relative ${paper}`, [
          div('mx-auto grid h-44 w-36 place-items-center overflow-hidden rounded-[999px] border-[6px] border-[#fbf6ec] bg-[#e4d3b6] shadow-[0_0_0_1px_#cdb792]', [
            img('h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            el('span', 'font-script text-6xl text-primary', '{{bride_nickname}}', { if: '!bride_photo' }),
          ]),
          el('h3', 'mt-4 font-heading text-2xl text-primary', '{{bride_name}}'),
          p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent', 'Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden bg-[#e7d9c1] px-6 py-16 text-center',
      children: [
        ...title('Insya Allah', 'Hari Bahagia'),
        el('article', `mt-4 ${paper}`, [
          el('h3', 'font-script text-5xl leading-none text-accent', '{{item.name}}'),
          p('mt-3 font-heading font-bold text-primary', '{{item.date}}'),
          p('text-sm text-muted', '{{item.time}}'),
          img('mx-auto my-3 h-5 w-28 opacity-80', '{{asset.twine}}'),
          p('font-heading font-bold text-primary', '{{item.venue}}'),
          p('text-[13px] text-muted', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-secondary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white', { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
        div('mt-10', [
          comp('countdown', '', { item_class: 'rounded-[6px] border border-[#cdb792] bg-surface py-3', number_class: 'block font-heading text-3xl text-primary', label_class: 'text-[10px] uppercase tracking-widest text-muted' }),
        ]),
        div('mt-5', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full border-2 border-primary px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      bg: '{{asset.kraft}}',
      children: [
        div('py-16 text-center', [
          ...title('Our Story', 'Kisah Kami'),
          div('mt-4 grid gap-5', [
            div(`relative text-left ${paper}`, [
              div('absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 bg-[#d9c6a5]/80'),
              p('text-xs font-bold uppercase tracking-[0.25em] text-secondary', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-xl text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] text-muted', '{{item.text}}'),
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
        div('py-14 text-center', [
          ...title('Moments', 'Galeri'),
          div('mt-4 grid grid-cols-2 gap-4', [
            div('rotate-[-1.5deg] bg-surface p-2 pb-6 shadow-[0_6px_16px_rgba(90,62,43,0.15)]', [
              img('aspect-square w-full object-cover', '{{item.url}}', '{{item.caption}}'),
              p('mt-2 font-script text-xl text-primary', '{{item.caption}}', { if: 'item.caption' }),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-[#e7d9c1] px-6 py-16 text-center',
      children: [
        ...title('RSVP', 'Konfirmasi Kehadiran'),
        div(`mt-4 text-left ${paper}`, [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-[4px] border border-[#cdb792] bg-[#fffdf8] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-accent',
            button_class: 'w-full rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#fbf6ec] disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-xl text-primary', 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: 'rounded-[6px] border border-[#d9c6a5] bg-surface p-4' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      bg: '{{asset.kraft}}',
      children: [
        div('py-16 text-center', [
          ...title('Wedding Gift', 'Amplop Digital'),
          div('mt-4 grid gap-3', [
            div(paper, [
              p('text-xs font-bold uppercase tracking-[0.25em] text-secondary', '{{item.bank}}'),
              p('mt-1 font-heading text-2xl text-primary', '{{item.number}}'),
              p('text-[13px] text-muted', 'a.n. {{item.holder}}'),
              comp('copy_button', 'mt-3', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-widest text-white' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden px-8 pb-48 pt-20 text-center',
      bg: '{{asset.kraft}}',
      children: [
        img('pointer-events-none absolute inset-x-0 top-0 w-full', '{{asset.lights}}'),
        img('pointer-events-none absolute -bottom-2 -left-4 w-56', '{{asset.pampas}}'),
        img('pointer-events-none absolute -bottom-2 -right-4 w-48 -scale-x-100 opacity-90', '{{asset.pampas}}'),
        p('relative text-muted', '{{closing_text}}'),
        p('relative mt-4 font-heading italic text-primary', '{{closing_greeting}}'),
        p('relative mt-8 font-script text-4xl text-accent', 'Terima kasih'),
        el('h2', 'relative font-heading text-3xl text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
