import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/royal-noir'
const title = (eyebrow: string, heading: string) => [
  p('font-script text-[34px] leading-none text-accent', eyebrow),
  el('h2', 'mt-2 font-heading text-[22px] uppercase tracking-[0.18em] text-primary', heading),
  img('mx-auto my-5 h-5 w-48', '{{asset.divider}}'),
]
const corners = [
  img('pointer-events-none absolute left-3 top-3 w-20', '{{asset.corner}}'),
  img('pointer-events-none absolute right-3 top-3 w-20 -scale-x-100', '{{asset.corner}}'),
  img('pointer-events-none absolute bottom-3 left-3 w-20 -scale-y-100', '{{asset.corner}}'),
  img('pointer-events-none absolute bottom-3 right-3 w-20 -scale-100', '{{asset.corner}}'),
]
const panel = 'border border-primary/40 bg-surface/80 p-6 shadow-[0_0_0_4px_rgba(21,34,29,1),0_0_0_5px_rgba(217,188,122,0.35)]'

export const meta = {
  code: 'LUX-001',
  slug: 'royal-noir',
  name: 'Royal Noir',
  category: 'elegan',
  description: 'Mewah bergaya art deco: latar hijau zamrud gelap, bingkai dan garis emas, tipografi Cinzel. Kesan eksklusif untuk resepsi malam.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#d9bc7a',
    secondary_color: '#8fb3a2',
    accent_color: '#e6cf98',
    background_color: '#0e1714',
    surface_color: '#15221d',
    text_color: '#efe7d6',
    muted_color: '#a9a08c',
    font_heading: 'Cinzel',
    font_body: 'Cormorant Garamond',
    font_script: 'Pinyon Script',
  },
  root_class: 'text-[16px] leading-relaxed',
  assets: {
    frame: `${A}/frame.svg`,
    corner: `${A}/corner.svg`,
    divider: `${A}/divider.svg`,
    fan: `${A}/fan.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-base px-8 py-16 text-center',
      bg: '{{asset.fan}}',
      children: [
        div('absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,188,122,0.14),transparent_65%)]'),
        div('relative w-full max-w-[300px] px-8 pb-16 pt-24', [
          img('pointer-events-none absolute inset-0 h-full w-full', '{{asset.frame}}'),
          p('relative text-[11px] uppercase tracking-[0.45em] text-muted', 'The Wedding of'),
          el('h1', 'relative mt-4 font-script text-[54px] leading-[1.05] text-primary', '{{couple_names}}'),
          div('relative mx-auto my-4 h-px w-24 bg-primary/60'),
          p('relative font-heading text-[13px] tracking-[0.25em] text-accent', '{{event_date}}'),
          div('relative mt-8', [
            p('text-[12px] italic text-muted', 'Kepada Yth.'),
            comp('guest_name', 'font-heading text-[16px] tracking-wider text-ink', { fallback: 'Tamu Undangan' }),
          ]),
          comp('open_button', 'relative mt-7 inline-flex border border-primary bg-primary/10 px-8 py-3 font-heading text-[11px] uppercase tracking-[0.3em] text-primary', { label: 'Buka Undangan' }),
        ]),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-base px-10 py-24 text-center',
      bg: '{{asset.fan}}',
      children: [
        ...corners,
        p('relative font-arabic text-[26px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-8 text-[11px] uppercase tracking-[0.45em] text-muted', 'Save the Date'),
        el('h2', 'relative mt-3 font-script text-[60px] leading-none text-primary', '{{couple_names}}'),
        img('relative mx-auto my-6 h-5 w-48', '{{asset.divider}}'),
        div('relative grid grid-cols-3 items-center border-y border-primary/40 py-4', [
          p('font-heading text-sm uppercase tracking-[0.2em] text-accent', '{{event_day}}'),
          p('border-x border-primary/40 font-heading text-4xl text-primary', '{{event_date_num}}'),
          p('font-heading text-sm uppercase tracking-[0.2em] text-accent', '{{event_month}} {{event_year}}'),
        ]),
        p('relative mt-4 italic text-muted', '{{event_hijri}}', { if: 'event_hijri' }),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-surface px-10 py-16 text-center',
      children: [
        p('font-arabic text-xl leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-4 text-[15px] italic text-ink/85', '"{{quote_text}}"'),
        p('mt-3 font-heading text-xs tracking-[0.25em] text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-7 py-20 text-center',
      bg: '{{asset.fan}}',
      children: [
        p('font-heading text-sm uppercase tracking-[0.2em] text-primary', '{{greeting}}'),
        p('mt-4 italic text-muted', '{{opening_text}}'),
        div(`relative mt-10 ${panel}`, [
          div('mx-auto grid h-44 w-36 place-items-center overflow-hidden rounded-t-full border border-primary/60 bg-[#1c2c26] p-1', [
            img('h-full w-full rounded-t-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            el('span', 'font-script text-6xl text-primary', '{{groom_nickname}}', { if: '!groom_photo' }),
          ]),
          el('h3', 'mt-5 font-heading text-xl tracking-wide text-primary', '{{groom_name}}'),
          p('mt-1 italic text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block font-heading text-[11px] tracking-[0.2em] text-accent', 'INSTAGRAM', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        p('my-6 font-script text-6xl text-primary', '&'),
        div(`relative ${panel}`, [
          div('mx-auto grid h-44 w-36 place-items-center overflow-hidden rounded-t-full border border-primary/60 bg-[#1c2c26] p-1', [
            img('h-full w-full rounded-t-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            el('span', 'font-script text-6xl text-primary', '{{bride_nickname}}', { if: '!bride_photo' }),
          ]),
          el('h3', 'mt-5 font-heading text-xl tracking-wide text-primary', '{{bride_name}}'),
          p('mt-1 italic text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block font-heading text-[11px] tracking-[0.2em] text-accent', 'INSTAGRAM', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'relative bg-surface px-7 py-20 text-center',
      children: [
        ...title('Insya Allah', 'Rangkaian Acara'),
        el('article', 'relative mt-4 border border-primary/50 px-6 py-8', [
          div('absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border border-primary bg-surface'),
          el('h3', 'font-heading text-lg uppercase tracking-[0.2em] text-primary', '{{item.name}}'),
          p('mt-3 text-lg text-ink', '{{item.date}}'),
          p('font-heading text-sm tracking-widest text-accent', '{{item.time}}'),
          div('mx-auto my-4 h-px w-16 bg-primary/50'),
          p('font-heading text-sm tracking-wide text-primary', '{{item.venue}}'),
          p('mt-1 italic text-muted', '{{item.address}}'),
          comp('map_button', 'mt-6 inline-flex border border-primary px-6 py-2.5 font-heading text-[11px] uppercase tracking-[0.25em] text-primary', { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
        div('mt-12', [
          comp('countdown', '', { item_class: 'border border-primary/40 py-3', number_class: 'block font-heading text-3xl text-primary', label_class: 'font-heading text-[9px] uppercase tracking-[0.25em] text-muted' }),
        ]),
        div('mt-6', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: 'inline-flex bg-primary px-6 py-3 font-heading text-[11px] uppercase tracking-[0.25em] text-[#0e1714]' })]),
      ],
    },
    {
      type: 'story',
      class: 'bg-base px-7',
      bg: '{{asset.fan}}',
      children: [
        div('py-20 text-center', [
          ...title('Our Journey', 'Kisah Cinta'),
          div('grid gap-8', [
            div('', [
              p('font-heading text-[11px] uppercase tracking-[0.3em] text-accent', '{{item.date}}'),
              el('h3', 'mt-1 font-script text-4xl text-primary', '{{item.title}}'),
              p('mt-2 italic text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-surface px-5',
      children: [
        div('py-20 text-center', [
          ...title('Moments', 'Galeri'),
          div('grid grid-cols-2 gap-3', [
            div('border border-primary/40 p-1.5', [
              img('aspect-[3/4] w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 py-20 text-center',
      bg: '{{asset.fan}}',
      children: [
        ...title('Kehadiran', 'RSVP'),
        div(`relative text-left ${panel}`, [
          comp('rsvp_form', '', {
            input_class: 'w-full border border-primary/40 bg-base px-4 py-3 text-[16px] text-ink outline-none focus:border-primary',
            label_class: 'font-heading text-[11px] uppercase tracking-[0.2em] text-muted',
            button_class: 'w-full bg-primary py-3 font-heading text-[12px] uppercase tracking-[0.25em] text-[#0e1714] disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-5 mt-12 font-heading text-sm uppercase tracking-[0.25em] text-primary', 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: 'border-l-2 border-primary bg-surface/80 p-4', name_class: 'font-heading text-sm tracking-wide text-primary', text_class: 'italic text-ink/85' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-7',
      children: [
        div('py-20 text-center', [
          ...title('Wedding Gift', 'Tanda Kasih'),
          p('italic text-muted', 'Kehadiran dan doa Anda adalah hadiah terindah bagi kami.'),
          div('mt-8 grid gap-4', [
            div('relative overflow-hidden border border-primary/60 bg-gradient-to-br from-[#1e3029] to-[#0e1714] p-6', [
              div('absolute -right-10 -top-10 h-28 w-28 rounded-full border border-primary/30'),
              p('relative font-heading text-xs uppercase tracking-[0.3em] text-accent', '{{item.bank}}'),
              p('relative mt-3 font-heading text-2xl tracking-[0.12em] text-primary', '{{item.number}}'),
              p('relative italic text-muted', 'a.n. {{item.holder}}'),
              comp('copy_button', 'relative mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'border border-primary px-5 py-2 font-heading text-[10px] uppercase tracking-[0.25em] text-primary' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-10 pb-28 pt-24 text-center',
      bg: '{{asset.fan}}',
      children: [
        ...corners,
        p('relative italic text-ink/85', '{{closing_text}}'),
        p('relative mt-5 font-heading text-sm tracking-[0.15em] text-primary', '{{closing_greeting}}'),
        img('relative mx-auto my-8 h-5 w-48', '{{asset.divider}}'),
        p('relative text-[11px] uppercase tracking-[0.45em] text-muted', 'Kami yang berbahagia'),
        el('h2', 'relative mt-3 font-script text-6xl text-primary', '{{couple_names}}'),
      ],
    },
  ],
}
