import type { ThemeDefinition } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/sakinah-sage'
const title = (eyebrow: string, heading: string) => [
  p('text-[10.5px] font-semibold uppercase tracking-[0.32em] text-accent', eyebrow),
  el('h2', 'mt-1 font-heading text-[28px] leading-tight text-primary', heading),
  img('mx-auto my-4 h-4 w-40 opacity-80', '{{asset.divider}}'),
]

export const meta = {
  code: 'SYR-001',
  slug: 'sakinah-sage',
  name: 'Sakinah Sage',
  category: 'syari',
  description: 'Syar\'i modern dengan ilustrasi mempelai muslim faceless, lampion, dan siluet masjid. Palet krem, sage, dan terakota.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#2f4a3a',
    secondary_color: '#7fa07f',
    accent_color: '#d9825b',
    background_color: '#fbf7f0',
    surface_color: '#ffffff',
    text_color: '#273329',
    muted_color: '#6e7a70',
    font_heading: 'Marcellus',
    font_body: 'Plus Jakarta Sans',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    couple: `${A}/couple.svg`,
    groom: `${A}/groom.svg`,
    bride: `${A}/bride.svg`,
    lanterns: `${A}/lanterns.svg`,
    crescent: `${A}/crescent.svg`,
    skyline: `${A}/skyline.svg`,
    pattern: `${A}/pattern.svg`,
    corner: `${A}/corner.svg`,
    star: `${A}/star.svg`,
    divider: `${A}/divider.svg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-[#e2ecdf] px-6 pb-24 pt-12 text-center',
      bg: '{{asset.pattern}}',
      children: [
        img('pointer-events-none absolute left-2 top-0 w-36', '{{asset.lanterns}}'),
        img('pointer-events-none absolute right-7 top-8 w-9', '{{asset.crescent}}'),
        p('relative text-[10.5px] font-semibold uppercase tracking-[0.32em] text-accent', 'Walimatul \'Urs'),
        div('relative mx-auto mt-4 aspect-[3/4] w-52 overflow-hidden rounded-b-2xl rounded-t-full border-[1.5px] border-accent bg-gradient-to-b from-white to-[#fbe3d2] shadow-[0_0_0_6px_#fff,0_18px_40px_rgba(47,74,58,0.15)]', [
          img('absolute left-1/2 top-[14%] w-[70%] -translate-x-1/2 opacity-60', '{{asset.star}}'),
          img('absolute bottom-3 left-1/2 w-[88%] -translate-x-1/2', '{{asset.couple}}', 'Ilustrasi kedua mempelai'),
        ]),
        el('h1', 'relative mt-5 font-script text-[52px] leading-none text-primary', '{{couple_names}}'),
        div('relative mx-auto mt-5 w-full max-w-[300px] rounded-2xl border border-accent/40 bg-white/80 px-4 py-3', [
          p('text-[11px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'font-heading text-xl text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        comp('open_button', 'relative mt-6 inline-flex rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(217,130,91,0.35)]', { label: 'Buka Undangan' }),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom', '{{asset.skyline}}'),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbe3d2] to-base px-8 py-24 text-center',
      children: [
        img('absolute left-3 top-3 w-16', '{{asset.corner}}'),
        img('absolute right-3 top-3 w-16 -scale-x-100', '{{asset.corner}}'),
        div('absolute inset-x-7 bottom-16 top-16 rounded-b-3xl rounded-t-full border-[1.5px] border-accent/35'),
        p('relative font-arabic text-[26px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p('relative mt-6 text-[10.5px] font-semibold uppercase tracking-[0.32em] text-accent', 'The Wedding of'),
        el('h2', 'relative mt-2 font-script text-[58px] leading-none text-primary', '{{couple_names}}'),
        div('relative mt-6 flex items-center justify-center gap-4', [
          div('grid min-w-[76px]', [
            el('small', 'text-[11px] uppercase tracking-[0.15em] text-muted', 'Hari'),
            el('b', 'font-heading text-lg font-normal text-primary', '{{event_day}}'),
          ]),
          div('grid h-[72px] w-[72px] place-items-center rounded-full bg-accent shadow-[0_0_0_4px_#fbf7f0,0_0_0_5.5px_#d9825b]', [
            el('b', 'font-heading text-[32px] font-normal text-white', '{{event_date_num}}'),
          ]),
          div('grid min-w-[76px]', [
            el('small', 'text-[11px] uppercase tracking-[0.15em] text-muted', '{{event_month}}'),
            el('b', 'font-heading text-lg font-normal text-primary', '{{event_year}}'),
          ]),
        ]),
        p('relative mt-4 text-xs font-medium tracking-wide text-secondary', '{{event_hijri}}', { if: 'event_hijri' }),
      ],
    },
    {
      type: 'quote',
      class: 'px-5 py-12',
      children: [
        div('relative overflow-hidden rounded-[26px] bg-[#e4ede1] px-6 pb-8 pt-10 text-center', [
          img('absolute -right-10 -top-10 w-36 opacity-60', '{{asset.star}}'),
          p('relative font-arabic text-[21px] leading-loose text-primary', '{{quote_arabic}}'),
          p('relative mt-3 text-[13px] italic text-muted', '"{{quote_text}}"'),
          p('relative mt-3 text-xs font-semibold tracking-wider text-accent', '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'px-6 py-14 text-center',
      children: [
        p('font-heading text-xl text-primary', '{{greeting}}'),
        p('mt-3 text-muted', '{{opening_text}}'),
        div('mt-8', [
          div('relative mx-auto h-60 w-44 overflow-hidden rounded-b-2xl rounded-t-full border-[1.5px] border-secondary bg-[#e4ede1] shadow-[0_0_0_6px_#fbf7f0,0_0_0_7px_rgba(127,160,127,0.5)]', [
            img('absolute inset-0 h-full w-full object-cover', '{{groom_photo}}', 'Foto mempelai pria', { if: 'groom_photo' }),
            img('absolute bottom-[-6px] left-1/2 h-[92%] -translate-x-1/2', '{{asset.groom}}', 'Ilustrasi mempelai pria', { if: '!groom_photo' }),
          ]),
          p('mt-4 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-accent', 'Mempelai Pria'),
          el('h3', 'font-heading text-2xl text-primary', '{{groom_name}}'),
          p('mt-1 text-[13px] text-muted', '{{groom_parents}}'),
          el('a', 'mt-2 inline-block rounded-full border border-secondary px-4 py-1 text-xs text-primary', 'Instagram', { attrs: { href: '{{groom_instagram}}' }, if: 'groom_instagram' }),
        ]),
        div('my-8 flex items-center justify-center gap-4', [
          el('span', 'h-px w-14 bg-accent/40'),
          el('span', 'font-script text-5xl leading-none text-accent', '&'),
          el('span', 'h-px w-14 bg-accent/40'),
        ]),
        div('', [
          div('relative mx-auto h-60 w-44 overflow-hidden rounded-b-2xl rounded-t-full border-[1.5px] border-accent bg-[#fbe3d2] shadow-[0_0_0_6px_#fbf7f0,0_0_0_7px_rgba(217,130,91,0.35)]', [
            img('absolute inset-0 h-full w-full object-cover', '{{bride_photo}}', 'Foto mempelai wanita', { if: 'bride_photo' }),
            img('absolute bottom-[-6px] left-1/2 h-[92%] -translate-x-1/2', '{{asset.bride}}', 'Ilustrasi mempelai wanita', { if: '!bride_photo' }),
          ]),
          p('mt-4 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-accent', 'Mempelai Wanita'),
          el('h3', 'font-heading text-2xl text-primary', '{{bride_name}}'),
          p('mt-1 text-[13px] text-muted', '{{bride_parents}}'),
          el('a', 'mt-2 inline-block rounded-full border border-secondary px-4 py-1 text-xs text-primary', 'Instagram', { attrs: { href: '{{bride_instagram}}' }, if: 'bride_instagram' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'px-6',
      children: [
        div('py-12 text-center', [
          ...title('Perjalanan', 'Menjemput Ridha-Nya'),
          el('ol', 'relative ml-3 border-l-[1.5px] border-secondary/60 pl-6 text-left', [
            el('li', 'relative mb-4 rounded-2xl bg-surface p-4 shadow-[0_6px_18px_rgba(47,74,58,0.06)]', [
              el('span', 'absolute -left-[31px] top-5 h-3 w-3 rotate-45 bg-accent shadow-[0_0_0_4px_#fbf7f0]'),
              el('time', 'text-[11px] font-semibold uppercase tracking-wider text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-lg text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-[#fbe3d2] px-5 py-14 text-center',
      children: [
        img('pointer-events-none absolute right-2 top-0 w-24 opacity-90', '{{asset.lanterns}}'),
        p('relative text-[10.5px] font-semibold uppercase tracking-[0.32em] text-accent', 'Menuju Hari Bahagia'),
        el('h2', 'relative mt-1 font-heading text-[28px] text-primary', 'Insya Allah'),
        p('relative mb-6 mt-1 text-sm text-muted', '{{event_date}}'),
        comp('countdown', 'relative', { item_class: 'rounded-2xl bg-white py-3 shadow-[0_6px_16px_rgba(217,130,91,0.12)]', number_class: 'block font-heading text-3xl font-normal text-accent', label_class: 'text-[10.5px] uppercase tracking-widest text-muted' }),
        div('relative mt-6', [
          comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: 'inline-flex rounded-full border-[1.5px] border-secondary bg-white px-6 py-2.5 text-sm font-semibold text-primary' }),
        ]),
      ],
    },
    {
      type: 'event',
      class: 'px-5 py-14 text-center',
      children: [
        ...title('Save the Date', 'Waktu & Tempat'),
        el('article', 'mt-5 rounded-b-[22px] rounded-t-[120px] bg-surface px-5 pb-6 pt-8 shadow-[0_10px_26px_rgba(47,74,58,0.08)]', [
          div('relative mx-auto grid h-24 place-items-center', [
            img('absolute h-24 w-24 opacity-40', '{{asset.star}}'),
            el('h3', 'relative max-w-[160px] font-heading text-[22px] leading-tight text-primary', '{{item.name}}'),
          ]),
          div('mt-3 grid gap-1 text-[13.5px]', [
            p('font-semibold text-primary', '{{item.date}}'),
            p('text-accent', '{{item.time}}'),
            p('mt-2 font-semibold text-primary', '{{item.venue}}'),
            p('text-[12.5px] text-muted', '{{item.address}}'),
          ]),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white', { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
      ],
    },
    {
      type: 'gallery',
      class: 'px-5',
      children: [
        div('py-12 text-center', [
          ...title('Galeri', 'Momen Bahagia'),
          div('grid grid-cols-2 gap-2', [
            el('figure', 'overflow-hidden rounded-2xl bg-[#e4ede1] first:col-span-2', [
              img('aspect-square h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'px-5 py-12 text-center',
      children: [
        ...title('RSVP', 'Konfirmasi Kehadiran'),
        div('rounded-3xl bg-surface p-5 shadow-[0_10px_26px_rgba(47,74,58,0.07)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl bg-base px-3.5 py-2.5 text-base text-ink outline-none ring-1 ring-transparent focus:ring-secondary',
            button_class: 'w-full rounded-full bg-primary py-3 font-semibold text-white disabled:opacity-60',
            label_class: 'grid gap-1.5 text-left text-[12.5px] font-semibold text-primary',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'px-5 pb-12 text-center',
      children: [
        el('h3', 'mb-4 font-heading text-xl text-primary', 'Doa & Ucapan'),
        comp('wishes', '', { item_class: 'rounded-2xl bg-surface p-4 shadow-[0_6px_18px_rgba(47,74,58,0.06)]' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-5',
      children: [
        div('py-12 text-center', [
          ...title('Tanda Kasih', 'Amplop Digital'),
          p('mb-5 text-muted', 'Doa restu Anda sudah lebih dari cukup. Namun apabila ingin memberikan tanda kasih, dapat melalui:'),
          div('grid gap-4', [
            div('relative overflow-hidden rounded-[20px] bg-gradient-to-br from-secondary to-[#5f8666] p-5 text-left text-white shadow-[0_12px_26px_rgba(95,134,102,0.28)] even:from-[#e89a76] even:to-accent', [
              img('absolute -bottom-8 -right-8 w-32 opacity-40 invert', '{{asset.star}}'),
              p('text-xs font-semibold uppercase tracking-widest opacity-90', '{{item.bank}}'),
              p('mt-2 font-heading text-[26px] tracking-wider', '{{item.number}}'),
              p('text-[13px] opacity-90', 'a.n. {{item.holder}}'),
              comp('copy_button', 'relative mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-white px-5 py-2 text-xs font-bold text-primary' }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-gradient-to-b from-[#dfeadb] to-base px-6 pb-36 pt-20 text-center',
      bg: '{{asset.pattern}}',
      children: [
        img('pointer-events-none absolute right-7 top-6 w-9', '{{asset.crescent}}'),
        p('relative text-muted', '{{closing_text}}'),
        p('relative mt-3 text-muted', 'Jazakumullahu khairan.'),
        p('relative mt-4 font-heading text-lg text-primary', '{{closing_greeting}}'),
        img('relative mx-auto mb-4 mt-6 w-44', '{{asset.couple}}', 'Ilustrasi kedua mempelai'),
        p('relative text-[10.5px] font-semibold uppercase tracking-[0.32em] text-accent', 'Kami yang berbahagia'),
        el('h2', 'relative mt-2 font-script text-5xl text-primary', '{{couple_names}}'),
        p('relative mt-2 text-xs text-muted', 'Beserta keluarga besar kedua mempelai'),
        img('pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-bottom', '{{asset.skyline}}'),
      ],
    },
  ],
}
