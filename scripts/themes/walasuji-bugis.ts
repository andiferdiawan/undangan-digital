import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/walasuji-bugis'
const title = (eyebrow: string, heading: string, light = false) => [
  p(`text-[10.5px] font-bold uppercase tracking-[0.34em] ${light ? 'text-[#e9cf8f]' : 'text-accent'}`, eyebrow),
  el('h2', `mt-1 font-heading text-[28px] leading-tight ${light ? 'text-[#fbf3e4]' : 'text-primary'}`, heading),
  img('mx-auto my-4 h-5 w-44', '{{asset.divider}}'),
]
/** Pita walasuji (anyaman bambu belah ketupat) selebar section */
const walasuji = (pos: string) => img(`pointer-events-none absolute inset-x-0 ${pos} h-7 w-full object-cover`, '{{asset.walasuji}}')
const card = 'rounded-[22px] border border-accent/40 bg-surface p-6 shadow-[0_12px_30px_rgba(92,21,32,0.10)]'

export const meta = {
  code: 'ADT-001',
  slug: 'walasuji-bugis',
  name: 'Walasuji Bugis',
  category: 'adat',
  description: 'Adat Bugis dengan anyaman walasuji, motif lipa\' sabbe, siluet rumah panggung bertimpa laja, dan ilustrasi mempelai berbaju bodo. Palet merah marun, emas, dan hijau.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#7a1f2b',
    secondary_color: '#1f5a45',
    accent_color: '#b8862f',
    background_color: '#fbf3e4',
    surface_color: '#ffffff',
    text_color: '#3b1f1f',
    muted_color: '#7d645a',
    font_heading: 'Prata',
    font_body: 'Nunito',
    font_script: 'Alex Brush',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    couple: `${A}/couple.svg`,
    rumah: `${A}/rumah.svg`,
    sabbe: `${A}/sabbe.svg`,
    walasuji: `${A}/walasuji.svg`,
    divider: `${A}/divider.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-14 text-center',
      bg: '{{asset.sabbe}}',
      children: [
        div('absolute inset-0 bg-gradient-to-b from-[#5c1520]/90 via-[#6e1b27]/85 to-[#3d0e15]/95'),
        walasuji('top-0'),
        p('relative text-[10.5px] font-bold uppercase tracking-[0.36em] text-[#e9cf8f]', 'Mappabotting'),
        div('relative mx-auto mt-4 w-56 rounded-t-[120px] border-2 border-[#e0b25e] bg-[#fbf3e4] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]', [
          div('relative aspect-[3/4] overflow-hidden rounded-t-[112px] bg-gradient-to-b from-[#fff8ec] to-[#f3dcb0]', [
            img('absolute bottom-2 left-1/2 w-[92%] -translate-x-1/2', '{{asset.couple}}', 'Ilustrasi mempelai berbusana adat Bugis'),
          ]),
        ]),
        el('h1', 'relative mt-5 font-script text-[54px] leading-none text-[#f6e3b4]', '{{couple_names}}'),
        p('relative mt-2 text-xs tracking-[0.2em] text-[#e9cf8f]', '{{event_date}}'),
        div('relative mx-auto mt-5 w-full max-w-[290px] rounded-2xl border border-[#e0b25e]/60 bg-[#fbf3e4]/95 px-4 py-3', [
          p('text-[11px] text-muted', 'Tabe\', Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'font-heading text-lg text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-[#e0b25e] px-8 py-3 text-sm font-bold text-[#5c1520] shadow-[0_10px_24px_rgba(224,178,94,0.35)]', { label: 'Buka Undangan' }),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom opacity-70 [filter:brightness(0.55)]', '{{asset.rumah}}'),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 pb-32 pt-24 text-center',
      children: [
        walasuji('top-0'),
        div('absolute inset-x-6 bottom-28 top-14 rounded-t-[160px] border border-accent/40'),
        p('relative font-arabic text-[26px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-6 text-[10.5px] font-bold uppercase tracking-[0.34em] text-accent', 'Tudang Botting'),
        el('h2', 'relative mt-2 font-script text-[58px] leading-none text-primary', '{{couple_names}}'),
        img('relative mx-auto my-5 h-5 w-44', '{{asset.divider}}'),
        div('relative flex items-center justify-center gap-4', [
          div('grid min-w-[74px]', [
            el('small', 'text-[11px] uppercase tracking-[0.15em] text-muted', 'Hari'),
            el('b', 'font-heading text-lg font-normal text-primary', '{{event_day}}'),
          ]),
          div('grid h-[74px] w-[74px] rotate-45 place-items-center border-2 border-accent bg-primary shadow-[0_0_0_4px_#fbf3e4,0_0_0_6px_#b8862f]', [
            el('b', '-rotate-45 font-heading text-[30px] font-normal text-[#f6e3b4]', '{{event_date_num}}'),
          ]),
          div('grid min-w-[74px]', [
            el('small', 'text-[11px] uppercase tracking-[0.15em] text-muted', '{{event_month}}'),
            el('b', 'font-heading text-lg font-normal text-primary', '{{event_year}}'),
          ]),
        ]),
        p('relative mt-5 text-xs text-secondary', '{{event_hijri}}', { if: 'event_hijri' }),
        img('pointer-events-none absolute bottom-0 left-0 h-28 w-full object-cover object-bottom opacity-90', '{{asset.rumah}}'),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden px-8 py-16 text-center',
      bg: '{{asset.sabbe}}',
      children: [
        div('absolute inset-0 bg-[#5c1520]/90'),
        p('relative font-arabic text-xl leading-loose text-[#f6e3b4]', '{{quote_arabic}}'),
        p('relative mt-4 text-[13px] italic text-[#f3e3d3]', '"{{quote_text}}"'),
        p('relative mt-3 text-xs font-bold tracking-widest text-[#e0b25e]', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative px-6 py-16 text-center',
      children: [
        p('font-heading text-lg text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div(`mt-10 ${card}`, [
          div('mx-auto grid h-40 w-40 rotate-45 place-items-center overflow-hidden rounded-[28px] border-4 border-[#f3dcb0] bg-[#f3dcb0] shadow-[0_0_0_2px_#b8862f]', [
            img('h-full w-full -rotate-45 scale-[1.42] object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            el('span', '-rotate-45 font-script text-6xl text-primary', '{{groom_nickname}}', { if: '!groom_photo' }),
          ]),
          el('h3', 'mt-8 font-heading text-2xl text-primary', '{{groom_name}}'),
          p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-bold text-accent', '@ Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        p('my-5 font-script text-5xl text-accent', '&'),
        div(card, [
          div('mx-auto grid h-40 w-40 rotate-45 place-items-center overflow-hidden rounded-[28px] border-4 border-[#f3dcb0] bg-[#f3dcb0] shadow-[0_0_0_2px_#b8862f]', [
            img('h-full w-full -rotate-45 scale-[1.42] object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            el('span', '-rotate-45 font-script text-6xl text-primary', '{{bride_nickname}}', { if: '!bride_photo' }),
          ]),
          el('h3', 'mt-8 font-heading text-2xl text-primary', '{{bride_name}}'),
          p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block text-xs font-bold text-accent', '@ Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden bg-[#f3e4c8] px-6 pb-16 pt-20 text-center',
      children: [
        walasuji('top-0'),
        ...title('Mappabotting', 'Waktu & Tempat'),
        el('article', `mt-6 ${card}`, [
          p('text-[10px] font-bold uppercase tracking-[0.3em] text-secondary', 'Acara'),
          el('h3', 'mt-1 font-heading text-2xl text-primary', '{{item.name}}'),
          img('mx-auto my-3 h-4 w-32', '{{asset.divider}}'),
          p('font-bold text-primary', '{{item.date}}'),
          p('text-sm text-accent', '{{item.time}}'),
          p('mt-3 font-bold text-ink', '{{item.venue}}'),
          p('text-[13px] text-muted', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white', { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
        div('mt-10', [
          comp('countdown', '', { item_class: 'rounded-xl border border-accent/40 bg-surface py-3', number_class: 'block font-heading text-3xl text-primary', label_class: 'text-[10px] uppercase tracking-widest text-muted' }),
        ]),
        div('mt-5', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          ...title('Kisah Kami', 'Perjalanan Cinta'),
          div('relative mt-4 grid gap-5 border-l-2 border-dashed border-accent/50 pl-6 text-left', [
            div('relative', [
              div('absolute -left-[33px] top-1 h-4 w-4 rotate-45 border-2 border-accent bg-primary'),
              p('text-xs font-bold uppercase tracking-widest text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-xl text-primary', '{{item.title}}'),
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
          ...title('Galeri', 'Momen Bahagia'),
          div('mt-4 grid grid-cols-2 gap-2', [
            img('aspect-square w-full rounded-xl border-2 border-[#f3dcb0] object-cover', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-[#f3e4c8] px-6 pb-16 pt-20 text-center',
      children: [
        walasuji('top-0'),
        ...title('Konfirmasi', 'Kehadiran'),
        div(`mt-4 ${card}`, [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-accent/40 bg-base px-4 py-2.5 text-base text-ink outline-none focus:border-primary',
            button_class: 'w-full rounded-full bg-primary py-3 font-bold text-[#f6e3b4] disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-xl text-primary', 'Doa & Ucapan'),
        comp('wishes', '', { item_class: 'rounded-xl border border-accent/30 bg-surface p-4 text-left' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      children: [
        div('py-14 text-center', [
          ...title('Tanda Kasih', 'Amplop Digital'),
          p('text-[13px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-6 grid gap-3', [
            div('relative overflow-hidden rounded-[20px] p-5 text-[#fbf3e4]', [
              div('absolute inset-0 bg-gradient-to-br from-primary to-[#4a0f18]'),
              div('absolute -right-6 -top-6 h-20 w-20 rotate-45 border-4 border-[#e0b25e]/40'),
              p('relative text-xs font-bold uppercase tracking-widest text-[#e9cf8f]', '{{item.bank}}'),
              p('relative mt-1 font-heading text-2xl', '{{item.number}}'),
              p('relative text-[13px] text-[#f3e3d3]', 'a.n. {{item.holder}}'),
              comp('copy_button', 'relative mt-3', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-[#e0b25e] px-5 py-2 text-xs font-bold text-[#5c1520]' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden px-8 pb-36 pt-20 text-center',
      bg: '{{asset.sabbe}}',
      children: [
        div('absolute inset-0 bg-gradient-to-b from-[#5c1520]/92 to-[#3d0e15]/95'),
        walasuji('top-0'),
        p('relative text-[#f3e3d3]', '{{closing_text}}'),
        p('relative mt-4 font-heading text-[#f6e3b4]', '{{closing_greeting}}'),
        img('relative mx-auto my-6 h-5 w-44', '{{asset.divider}}'),
        p('relative text-[10.5px] font-bold uppercase tracking-[0.34em] text-[#e9cf8f]', 'Kami yang berbahagia'),
        el('h2', 'relative mt-2 font-script text-5xl text-[#f6e3b4]', '{{couple_names}}'),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom opacity-60 [filter:brightness(0.5)]', '{{asset.rumah}}'),
      ],
    },
  ],
}
