import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/pinisi-losari'
const title = (eyebrow: string, heading: string, dark = false) => [
  p(`text-[10.5px] font-semibold uppercase tracking-[0.34em] ${dark ? 'text-[#e3b964]' : 'text-secondary'}`, eyebrow),
  el('h2', `mt-1 font-heading text-[26px] leading-tight ${dark ? 'text-white' : 'text-primary'}`, heading),
  img('mx-auto my-4 h-5 w-44', '{{asset.divider}}'),
]
const sky = 'bg-gradient-to-b from-[#141c36] via-[#3b3a6b] to-[#f08a5d]'
const card = 'rounded-3xl bg-surface p-6 shadow-[0_14px_34px_rgba(26,37,71,0.12)]'

export const meta = {
  code: 'ADT-002',
  slug: 'pinisi-losari',
  name: 'Pinisi Losari',
  category: 'adat',
  description: 'Adat Makassar bernuansa islami: senja Pantai Losari, Masjid Terapung, kapal pinisi, serta mempelai berbaju bodo dan passapu\'. Palet biru malam, ungu, dan emas.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#1a2547',
    secondary_color: '#7e3673',
    accent_color: '#c9973f',
    background_color: '#fbf5ea',
    surface_color: '#ffffff',
    text_color: '#232a3f',
    muted_color: '#6d6f80',
    font_heading: 'Libre Baskerville',
    font_body: 'Poppins',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[13.5px] leading-relaxed',
  assets: {
    couple: `${A}/couple.svg`,
    losari: `${A}/losari.svg`,
    ombak: `${A}/ombak.svg`,
    divider: `${A}/divider.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: `flex flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-12 text-center ${sky}`,
      children: [
        div('absolute left-8 top-10 h-1 w-1 rounded-full bg-white/80'),
        div('absolute right-12 top-20 h-1.5 w-1.5 rounded-full bg-white/70'),
        div('absolute left-20 top-32 h-1 w-1 rounded-full bg-white/60'),
        div('absolute right-24 top-8 h-1 w-1 rounded-full bg-white/60'),
        p('relative text-[10.5px] font-semibold uppercase tracking-[0.38em] text-[#e3b964]', 'Pa\'buntingang'),
        div('relative mx-auto mt-5 h-60 w-60 overflow-hidden rounded-full bg-gradient-to-b from-[#fbf5ea] to-[#f6dcc0] shadow-[0_0_0_6px_#c9973f,0_0_0_10px_rgba(251,245,234,0.25),0_20px_40px_rgba(0,0,0,0.35)]', [
          div('absolute inset-3 rounded-full border border-dashed border-accent/60'),
          img('absolute bottom-3 left-1/2 w-[58%] -translate-x-1/2', '{{asset.couple}}', 'Ilustrasi mempelai berbusana adat Makassar'),
        ]),
        el('h1', 'relative mt-6 font-script text-[54px] leading-none text-white', '{{couple_names}}'),
        p('relative mt-2 text-xs tracking-[0.2em] text-[#fde3c8]', '{{event_date}}'),
        div('relative mx-auto mt-5 w-full max-w-[290px] rounded-2xl bg-white/90 px-4 py-3 backdrop-blur', [
          p('text-[11px] text-muted', 'Tabe\', Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'font-heading text-lg text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-[#e3b964] shadow-[0_0_0_2px_#c9973f,0_10px_24px_rgba(20,28,54,0.4)]', { label: 'Buka Undangan' }),
        img('pointer-events-none absolute bottom-0 left-0 h-28 w-full object-cover object-bottom', '{{asset.losari}}'),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-primary px-8 pb-36 pt-20 text-center text-white',
      bg: '{{asset.ombak}}',
      children: [
        p('relative font-arabic text-[26px] text-[#e3b964]', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-8 text-[10.5px] font-semibold uppercase tracking-[0.34em] text-[#e3b964]', 'Appabattu Nikka'),
        el('h2', 'relative mt-2 font-script text-[58px] leading-none', '{{couple_names}}'),
        img('relative mx-auto my-5 h-5 w-44', '{{asset.divider}}'),
        div('relative w-full max-w-[280px] overflow-hidden rounded-2xl bg-white/10 ring-1 ring-[#c9973f]/60', [
          div('grid grid-cols-3 divide-x divide-[#c9973f]/40 py-4', [
            div('', [p('text-[10px] uppercase tracking-widest text-white/60', 'Hari'), p('font-heading text-[16px]', '{{event_day}}')]),
            div('', [p('text-[10px] uppercase tracking-widest text-white/60', 'Tanggal'), p('font-heading text-3xl leading-none text-[#e3b964]', '{{event_date_num}}')]),
            div('', [p('text-[10px] uppercase tracking-widest text-white/60', '{{event_year}}'), p('font-heading text-[16px]', '{{event_month}}')]),
          ]),
        ]),
        p('relative mt-4 text-xs text-white/70', '{{event_hijri}}', { if: 'event_hijri' }),
        img('pointer-events-none absolute bottom-0 left-0 h-28 w-full object-cover object-bottom [filter:brightness(1.6)_saturate(0.6)] opacity-40', '{{asset.losari}}'),
      ],
    },
    {
      type: 'quote',
      class: 'bg-base px-8 py-16 text-center',
      children: [
        p('font-arabic text-xl leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-4 text-[13px] italic text-muted', '"{{quote_text}}"'),
        p('mt-3 text-xs font-semibold tracking-widest text-secondary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'bg-[#f3eadb] px-6 py-16 text-center',
      children: [
        p('font-heading text-[16px] text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div(`mt-10 ${card}`, [
          div('mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-primary shadow-[0_0_0_4px_#fff,0_0_0_6px_#c9973f]', [
            img('h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            el('span', 'font-script text-6xl text-[#e3b964]', '{{groom_nickname}}', { if: '!groom_photo' }),
          ]),
          el('h3', 'mt-5 font-heading text-xl text-primary', '{{groom_name}}'),
          p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-semibold text-secondary', '@ Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        p('my-5 font-script text-5xl text-accent', '&'),
        div(card, [
          div('mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-secondary shadow-[0_0_0_4px_#fff,0_0_0_6px_#c9973f]', [
            img('h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            el('span', 'font-script text-6xl text-[#f3d38a]', '{{bride_nickname}}', { if: '!bride_photo' }),
          ]),
          el('h3', 'mt-5 font-heading text-xl text-primary', '{{bride_name}}'),
          p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-semibold text-secondary', '@ Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'relative bg-primary px-6 py-16 text-center',
      bg: '{{asset.ombak}}',
      children: [
        ...title('Insya Allah', 'Waktu & Tempat', true),
        // Kartu acara bergaya tiket kapal
        el('article', 'relative mt-4 overflow-hidden rounded-3xl bg-surface text-left', [
          div('flex items-center justify-between bg-secondary px-5 py-3 text-white', [
            el('h3', 'font-heading text-lg', '{{item.name}}'),
            el('span', 'rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold', '{{item.time}}'),
          ]),
          div('relative border-b-2 border-dashed border-primary/15 px-5 py-4', [
            div('absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-primary'),
            div('absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-primary'),
            p('text-[10px] font-semibold uppercase tracking-widest text-muted', 'Tanggal'),
            p('font-heading text-[16px] text-primary', '{{item.date}}'),
          ]),
          div('px-5 pb-5 pt-4', [
            p('text-[10px] font-semibold uppercase tracking-widest text-muted', 'Tempat'),
            p('font-semibold text-primary', '{{item.venue}}'),
            p('text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', 'mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-[#e3b964]', { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ]),
        ], { repeat: 'events' }),
        div('mt-10', [
          comp('countdown', '', { item_class: 'rounded-2xl bg-white/10 py-3 ring-1 ring-[#c9973f]/50', number_class: 'block font-heading text-3xl text-[#e3b964]', label_class: 'text-[10px] uppercase tracking-widest text-white/60' }),
        ]),
        div('mt-5', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full bg-[#e3b964] px-6 py-2.5 text-sm font-semibold text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          ...title('Kisah Kami', 'Berlayar Bersama'),
          div('mt-2 grid gap-3 text-left', [
            div(`relative pl-14 ${card}`, [
              div('absolute left-5 top-6 grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-white', '{{index}}'),
              p('text-[11px] font-semibold uppercase tracking-widest text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-lg text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-[#f3eadb] px-4',
      children: [
        div('py-14 text-center', [
          ...title('Galeri', 'Momen Bahagia'),
          div('grid grid-cols-2 gap-2', [
            img('aspect-[3/4] w-full rounded-t-full object-cover ring-2 ring-accent/50', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'px-6 py-16 text-center',
      children: [
        ...title('Konfirmasi', 'Kehadiran'),
        div(card, [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-primary/15 bg-base px-4 py-2.5 text-[16px] text-ink outline-none focus:border-secondary',
            button_class: 'w-full rounded-full bg-secondary py-3 font-semibold text-white disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-lg text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: 'rounded-2xl bg-surface p-4 shadow-sm' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-[#f3eadb] px-6',
      children: [
        div('py-16 text-center', [
          ...title('Tanda Kasih', 'Amplop Digital'),
          p('text-[13px] text-muted', 'Doa restu Anda adalah karunia terindah. Bila ingin memberi tanda kasih:'),
          div('mt-6 grid gap-3', [
            div(`relative overflow-hidden p-6 text-white rounded-3xl ${sky}`, [
              div('absolute -right-4 top-4 h-16 w-16 rounded-full bg-[#f6b26b]/70'),
              p('relative text-xs font-semibold uppercase tracking-widest text-[#e3b964]', '{{item.bank}}'),
              p('relative mt-2 font-heading text-2xl', '{{item.number}}'),
              p('relative text-[13px] text-white/80', 'a.n. {{item.holder}}'),
              comp('copy_button', 'relative mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-white px-5 py-2 text-xs font-semibold text-primary' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: `relative overflow-hidden px-8 pb-40 pt-20 text-center text-white ${sky}`,
      children: [
        p('relative text-white/85', '{{closing_text}}'),
        p('relative mt-4 font-heading text-[#fde3c8]', '{{closing_greeting}}'),
        img('relative mx-auto my-6 h-5 w-44', '{{asset.divider}}'),
        p('relative text-[10.5px] font-semibold uppercase tracking-[0.34em] text-[#e3b964]', 'Kami yang berbahagia'),
        el('h2', 'relative mt-2 font-script text-5xl', '{{couple_names}}'),
        img('pointer-events-none absolute bottom-0 left-0 h-28 w-full object-cover object-bottom', '{{asset.losari}}'),
      ],
    },
  ],
}
