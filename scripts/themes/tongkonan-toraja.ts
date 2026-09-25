import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/tongkonan-toraja'
const title = (eyebrow: string, heading: string, dark = false) => [
  p(`relative text-[10.5px] font-bold uppercase tracking-[0.36em] ${dark ? 'text-accent' : 'text-secondary'}`, eyebrow),
  el('h2', `relative mt-1 font-heading text-[24px] uppercase tracking-[0.08em] ${dark ? 'text-[#f5ecd8]' : 'text-primary'}`, heading),
  img('relative mx-auto my-4 h-6 w-48', '{{asset.divider}}'),
]
/** Pita ukiran pa'ssura' selebar section */
const ukiran = (pos: string) => img(`pointer-events-none absolute inset-x-0 ${pos} h-9 w-full object-cover`, '{{asset.ukiran}}')
const card = 'rounded-2xl border-t-4 border-secondary bg-surface p-6 shadow-[0_12px_30px_rgba(29,21,18,0.12)]'
/** Atap tongkonan (bentuk perahu) di atas kartu */
const roof = img('relative z-1 mx-auto -mb-1 w-[92%]', '{{asset.atap}}')

export const meta = {
  code: 'ADT-003',
  slug: 'tongkonan-toraja',
  name: 'Tongkonan Toraja',
  category: 'adat',
  description: 'Adat Toraja bernuansa islami: rumah tongkonan beratap perahu, ukiran pa\'barre allo, warna merah-hitam-kuning-putih, serta mempelai berhijab dengan kandaure.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#1d1512',
    secondary_color: '#a8321f',
    accent_color: '#e0a93a',
    background_color: '#f5ecd8',
    surface_color: '#fffaf0',
    text_color: '#2a1f1a',
    muted_color: '#7a6555',
    font_heading: 'Cinzel',
    font_body: 'Lato',
    font_script: 'Allura',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    couple: `${A}/couple.svg`,
    tongkonan: `${A}/tongkonan.svg`,
    ukiran: `${A}/ukiran.svg`,
    passura: `${A}/passura.svg`,
    barre: `${A}/barre.svg`,
    atap: `${A}/atap.svg`,
    divider: `${A}/divider.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-16 text-center',
      bg: '{{asset.passura}}',
      children: [
        div('absolute inset-0 bg-gradient-to-b from-[#1d1512]/75 via-[#1d1512]/85 to-[#1d1512]/95'),
        ukiran('top-0'),
        p('relative text-[10.5px] font-bold uppercase tracking-[0.38em] text-accent', 'Rampanan Kapa\''),
        div('relative mx-auto mt-4 w-64', [
          // Atap perahu tongkonan menaungi ilustrasi
          img('relative z-1 mx-auto -mb-2 w-[112%] max-w-none -translate-x-[5%]', '{{asset.atap}}'),
          div('relative mx-3 overflow-hidden rounded-b-2xl border-2 border-t-0 border-accent bg-gradient-to-b from-[#fffaf0] to-[#f0dcb4] px-4 pt-4', [
            img('pointer-events-none absolute left-1/2 top-2 w-44 -translate-x-1/2 opacity-15', '{{asset.barre}}'),
            img('relative mx-auto w-[88%]', '{{asset.couple}}', 'Ilustrasi mempelai berbusana adat Toraja'),
          ]),
        ]),
        el('h1', 'relative mt-5 font-script text-[56px] leading-none text-[#f5ecd8]', '{{couple_names}}'),
        p('relative mt-2 font-heading text-xs tracking-[0.2em] text-accent', '{{event_date}}'),
        div('relative mx-auto mt-5 w-full max-w-[290px] rounded-xl border border-accent/60 bg-[#fffaf0] px-4 py-3', [
          p('text-[11px] text-muted', 'Tabe\', Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'font-heading text-base text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-secondary px-8 py-3 font-heading text-xs font-bold tracking-[0.2em] text-[#f5ecd8] shadow-[0_0_0_2px_#e0a93a]', { label: 'BUKA UNDANGAN' }),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom opacity-60', '{{asset.tongkonan}}'),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 pb-36 pt-24 text-center',
      children: [
        ukiran('top-0'),
        img('pointer-events-none absolute left-1/2 top-1/2 w-[130%] max-w-none -translate-x-1/2 -translate-y-[60%] opacity-[0.07]', '{{asset.barre}}'),
        p('relative font-arabic text-[26px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-8 text-[10.5px] font-bold uppercase tracking-[0.36em] text-secondary', 'The Wedding of'),
        el('h2', 'relative mt-2 font-script text-[58px] leading-none text-primary', '{{couple_names}}'),
        img('relative mx-auto my-5 h-6 w-48', '{{asset.divider}}'),
        div('relative flex items-stretch gap-2', [
          div('grid w-24 place-items-center rounded-xl bg-primary py-3 text-[#f5ecd8]', [
            el('small', 'text-[10px] uppercase tracking-widest text-accent', 'Hari'),
            el('b', 'font-heading text-sm', '{{event_day}}'),
          ]),
          div('grid w-24 place-items-center rounded-xl bg-secondary py-3 text-[#f5ecd8]', [
            el('small', 'text-[10px] uppercase tracking-widest text-accent', 'Tanggal'),
            el('b', 'font-heading text-3xl leading-none', '{{event_date_num}}'),
          ]),
          div('grid w-24 place-items-center rounded-xl bg-primary py-3 text-[#f5ecd8]', [
            el('small', 'text-[10px] uppercase tracking-widest text-accent', '{{event_year}}'),
            el('b', 'font-heading text-sm', '{{event_month}}'),
          ]),
        ]),
        p('relative mt-4 text-xs text-muted', '{{event_hijri}}', { if: 'event_hijri' }),
        img('pointer-events-none absolute bottom-0 left-0 h-28 w-full object-cover object-bottom', '{{asset.tongkonan}}'),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden px-8 py-16 text-center',
      bg: '{{asset.passura}}',
      children: [
        div('absolute inset-0 bg-primary/80'),
        p('relative font-arabic text-xl leading-loose text-[#f5ecd8]', '{{quote_arabic}}'),
        p('relative mt-4 text-[13px] italic text-[#e9dcc3]', '"{{quote_text}}"'),
        p('relative mt-3 font-heading text-xs tracking-widest text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'px-6 py-16 text-center',
      children: [
        p('font-heading text-sm tracking-wide text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div('mt-10', [
          roof,
          div(card, [
            div('relative mx-auto grid h-40 w-40 place-items-center', [
              img('absolute inset-0 h-full w-full', '{{asset.barre}}'),
              div('relative grid h-[104px] w-[104px] place-items-center overflow-hidden rounded-full bg-[#fffaf0]', [
                img('h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
                el('span', 'font-script text-5xl text-secondary', '{{groom_nickname}}', { if: '!groom_photo' }),
              ]),
            ]),
            el('h3', 'mt-5 font-heading text-lg text-primary', '{{groom_name}}'),
            p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
            el('a', 'mt-2 inline-block text-xs font-bold text-secondary', '@ Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
          ]),
        ]),
        p('my-5 font-script text-5xl text-secondary', '&'),
        div('', [
          roof,
          div(card, [
            div('relative mx-auto grid h-40 w-40 place-items-center', [
              img('absolute inset-0 h-full w-full', '{{asset.barre}}'),
              div('relative grid h-[104px] w-[104px] place-items-center overflow-hidden rounded-full bg-[#fffaf0]', [
                img('h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
                el('span', 'font-script text-5xl text-secondary', '{{bride_nickname}}', { if: '!bride_photo' }),
              ]),
            ]),
            el('h3', 'mt-5 font-heading text-lg text-primary', '{{bride_name}}'),
            p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
            el('a', 'mt-2 inline-block text-xs font-bold text-secondary', '@ Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
          ]),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden px-6 pb-16 pt-24 text-center',
      bg: '{{asset.passura}}',
      children: [
        div('absolute inset-0 bg-primary/85'),
        ukiran('top-0'),
        ...title('Insya Allah', 'Waktu & Tempat', true),
        el('article', 'relative mt-4 overflow-hidden rounded-2xl bg-surface text-center shadow-[0_12px_30px_rgba(0,0,0,0.3)]', [
          div('bg-secondary px-5 py-3', [el('h3', 'font-heading text-lg tracking-wide text-[#f5ecd8]', '{{item.name}}')]),
          div('px-5 pb-6 pt-4', [
            p('font-bold text-primary', '{{item.date}}'),
            p('text-sm text-secondary', '{{item.time}}'),
            img('mx-auto my-3 h-5 w-32', '{{asset.divider}}'),
            p('font-heading text-sm text-primary', '{{item.venue}}'),
            p('text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', 'mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-bold tracking-widest text-accent', { href: '{{item.map_url}}', label: 'PETUNJUK LOKASI' }, { if: 'item.map_url' }),
          ]),
        ], { repeat: 'events' }),
        div('relative mt-10', [
          comp('countdown', '', { item_class: 'rounded-xl border border-accent/50 bg-[#2a1f1a] py-3', number_class: 'block font-heading text-3xl text-accent', label_class: 'text-[10px] uppercase tracking-widest text-[#e9dcc3]' }),
        ]),
        div('relative mt-5', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          ...title('Kisah Kami', 'Perjalanan Cinta'),
          div('mt-2 grid gap-4 text-left', [
            div('grid grid-cols-[auto_1fr] gap-4', [
              img('mt-1 h-9 w-9', '{{asset.barre}}'),
              div('rounded-xl border-l-4 border-accent bg-surface p-4', [
                p('text-[11px] font-bold uppercase tracking-widest text-secondary', '{{item.date}}'),
                el('h3', 'font-heading text-base text-primary', '{{item.title}}'),
                p('mt-1 text-[13px] text-muted', '{{item.text}}'),
              ]),
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
          ...title('Galeri', 'Momen Bahagia'),
          div('grid grid-cols-2 gap-2', [
            img('aspect-square w-full rounded-lg border-4 border-primary object-cover shadow-[0_0_0_2px_#e0a93a]', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-[#ecdfc3] px-6 pb-16 pt-24 text-center',
      children: [
        ukiran('top-0'),
        ...title('Konfirmasi', 'Kehadiran'),
        div(card, [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-lg border border-primary/20 bg-base px-4 py-2.5 text-base text-ink outline-none focus:border-secondary',
            button_class: 'w-full rounded-full bg-secondary py-3 font-heading text-xs font-bold tracking-[0.2em] text-[#f5ecd8] disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-base tracking-wide text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: 'rounded-xl border-l-4 border-secondary bg-surface p-4' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          ...title('Tanda Kasih', 'Amplop Digital'),
          p('text-[13px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:'),
          div('mt-6 grid gap-3', [
            div('relative overflow-hidden rounded-2xl p-6 text-[#f5ecd8]', [
              div('absolute inset-0 bg-primary'),
              img('pointer-events-none absolute -right-10 -top-10 w-36 opacity-30', '{{asset.barre}}'),
              p('relative font-heading text-xs tracking-widest text-accent', '{{item.bank}}'),
              p('relative mt-2 font-heading text-2xl', '{{item.number}}'),
              p('relative text-[13px] text-[#e9dcc3]', 'a.n. {{item.holder}}'),
              comp('copy_button', 'relative mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-accent px-5 py-2 text-xs font-bold text-primary' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden px-8 pb-36 pt-24 text-center',
      bg: '{{asset.passura}}',
      children: [
        div('absolute inset-0 bg-primary/85'),
        ukiran('top-0'),
        p('relative text-[#e9dcc3]', '{{closing_text}}'),
        p('relative mt-4 font-heading text-sm text-accent', '{{closing_greeting}}'),
        img('relative mx-auto my-6 h-6 w-48', '{{asset.divider}}'),
        p('relative text-[10.5px] font-bold uppercase tracking-[0.36em] text-accent', 'Kami yang berbahagia'),
        el('h2', 'relative mt-2 font-script text-5xl text-[#f5ecd8]', '{{couple_names}}'),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom opacity-60', '{{asset.tongkonan}}'),
      ],
    },
  ],
}
