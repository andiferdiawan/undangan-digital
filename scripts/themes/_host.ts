import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kerangka tema acara kantor & acara umum: berpusat pada penyelenggara (host_*),
 * judul acara (event_title) dan susunan acara (repeat story: jam, agenda, keterangan).
 * Susunan acara memakai garis yang tergambar mengikuti scroll (uv-scroll-line).
 */
export interface HostOpts {
  kind: 'office' | 'general'
  dir: string
  ink: string // teks & garis
  main: string // warna utama (tombol, garis waktu)
  accent: string // aksen
  pale: string // latar lembut
  deep: string // latar gelap (cover & acara)
  dark: boolean // cover gelap (korporat/islami) atau terang (seminar/seru)
  playful: boolean // gaya kartu stiker (bayangan tegas, miring) vs rapi
  wavy: boolean // garis susunan acara meliuk (aset alur) vs lurus
  eyebrow: string // label kecil di sampul
  fonts: Pick<ThemeDefinition['globals'], 'font_heading' | 'font_body' | 'font_script'>
  radius: string
  texts: { rundown: string, host: string, gallery: string, rsvp: string, closing: string }
  demo: NonNullable<ThemeDefinition['demo']>
}

export function hostDefinition(o: HostOpts): ThemeDefinition {
  const A = o.dir
  const card = o.playful
    ? `relative ${o.radius} border-2 border-[${o.ink}] bg-surface p-5 shadow-[5px_5px_0_${o.ink}]`
    : `relative ${o.radius} border border-[${o.main}]/25 bg-surface p-5 shadow-[0_18px_40px_-26px_${o.ink}]`
  const btn = o.playful
    ? `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[${o.ink}] bg-[${o.main}] px-7 py-3 font-heading text-[15px] font-bold text-white shadow-[4px_4px_0_${o.ink}]`
    : `inline-flex items-center justify-center gap-2 rounded-full bg-[${o.main}] px-7 py-3 font-heading text-[14px] font-semibold tracking-wide ${o.dark ? `text-[${o.deep}]` : 'text-white'} shadow-[0_12px_26px_-12px_${o.main}]`
  const light = (on: boolean, a: string, b: string) => (on ? a : b)
  const title = (eyebrow: string, heading: string, onDark = false): ThemeNode[] => [
    p(`uv-reveal font-heading text-[12px] font-semibold uppercase tracking-[0.25em] ${onDark ? `text-[${o.accent}]` : 'text-accent'}`, eyebrow),
    el('h2', `uv-reveal-pop uv-d1 mt-1 font-heading text-[28px] font-bold leading-tight ${onDark ? 'text-white' : 'text-primary'}`, heading),
    img('uv-reveal uv-d2 mx-auto mt-2 h-5 w-48', '{{asset.garis}}'),
  ]
  const floaty = (asset: string, pos: string, anim = 'uv-float') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])

  /** Logo penyelenggara dalam bingkai; tanpa logo → lambang tema */
  const logo = (size: string): ThemeNode =>
    div(`uv-tilt relative mx-auto aspect-square ${size}`, [
      div(`uv-depth-1 absolute inset-[14%] grid place-items-center overflow-hidden rounded-full bg-white p-[12%] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)]`, [
        img('h-full w-full object-contain', '{{host_logo}}', 'Logo {{host_name}}', { if: 'host_logo' }),
        img('absolute inset-0 h-full w-full', '{{asset.lambang}}', '', { if: '!host_logo' }),
      ]),
      img(`uv-depth-2 pointer-events-none absolute inset-0 h-full w-full ${o.playful ? 'animate-spin animate-duration-[30s]' : ''}`, '{{asset.bingkai}}'),
    ])

  /** Susunan acara: garis tergambar mengikuti scroll + penanda di ujungnya */
  const rundown: ThemeNode = div('relative mt-8 text-left', [
    div(`uv-scroll-line pointer-events-none absolute bottom-2 left-0 top-2 w-12 ${o.wavy ? '[--uv-amp:30] [--uv-waves:2]' : '[--uv-amp:0]'}`, [
      o.wavy
        ? img('absolute inset-0 h-full w-full opacity-25', '{{asset.alur}}')
        : div(`absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[${o.main}]/20`),
      o.wavy
        ? img('uv-scroll-draw absolute inset-0 h-full w-full', '{{asset.alur}}')
        : div(`uv-scroll-draw absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-[${o.main}]`),
      div('uv-scroll-follow w-7', [img('uv-wiggle w-full', '{{asset.hias_a}}', '')]),
    ]),
    div('relative grid gap-4 pl-14', [
      div(`uv-reveal-right relative ${card} py-4`, [
        div(`absolute -left-[42px] top-5 h-4 w-4 rounded-full border-[3px] border-[${o.main}] bg-[${o.pale}]`),
        el('span', `inline-block rounded-full bg-[${o.main}] px-3 py-0.5 font-heading text-[12px] font-bold ${o.dark && !o.playful ? `text-[${o.deep}]` : 'text-white'}`, '{{item.date}}'),
        el('h3', 'mt-1.5 font-heading text-[17px] font-bold leading-snug text-primary', '{{item.title}}'),
        p('text-[13px] text-muted', '{{item.text}}'),
      ], { repeat: 'story' }),
    ]),
  ])

  return {
    version: 1,
    kind: o.kind,
    globals: {
      primary_color: o.ink,
      secondary_color: o.main,
      accent_color: o.accent,
      background_color: o.pale,
      surface_color: '#ffffff',
      text_color: o.ink,
      muted_color: '#667085',
      ...o.fonts,
    },
    root_class: 'text-[14.5px] leading-relaxed',
    assets: {
      utama: `${A}/utama.svg`,
      gantung: `${A}/gantung.svg`,
      hias_a: `${A}/hias_a.svg`,
      hias_b: `${A}/hias_b.svg`,
      pola: `${A}/pola.svg`,
      garis: `${A}/garis.svg`,
      lambang: `${A}/lambang.svg`,
      bingkai: `${A}/bingkai.svg`,
      ...(o.wavy ? { alur: `${A}/alur.svg` } : {}),
    },
    demo: o.demo,
    sections: [
      {
        type: 'cover',
        class: `relative flex flex-col items-center justify-center overflow-hidden ${light(o.dark, `bg-[${o.deep}] text-white`, `bg-[${o.pale}]`)} px-6 pb-10 pt-2 text-center`,
        bg: '{{asset.pola}}',
        children: [
          div('pointer-events-none relative -mx-6 w-[calc(100%+3rem)]', [img('w-full', '{{asset.gantung}}', '')]),
          floaty('hias_a', 'left-6 top-40 w-6', 'uv-wiggle'),
          floaty('hias_b', 'right-6 top-56 w-7', 'uv-float3d'),
          p(`uv-reveal relative mt-2 font-heading text-[12px] font-semibold uppercase tracking-[0.3em] ${light(o.dark, `text-[${o.accent}]`, 'text-accent')}`, o.eyebrow),
          div('uv-reveal-pop uv-d1 relative mt-4 w-full', [logo('w-32')]),
          el('h1', `uv-reveal-pop uv-d2 relative mx-auto mt-4 max-w-[330px] font-heading text-[30px] font-bold leading-[1.15] ${light(o.dark, 'text-white', 'text-primary')}`, '{{event_title}}'),
          p(`uv-reveal uv-d3 relative mx-auto mt-2 max-w-[300px] font-script text-[22px] leading-snug ${light(o.dark, `text-[${o.accent}]`, 'text-accent')}`, '{{event_tagline}}', { if: 'event_tagline' }),
          p(`uv-reveal uv-d3 relative mt-3 text-[13px] font-semibold ${light(o.dark, 'text-white/75', 'text-muted')}`, '{{host_name}}'),
          div(`uv-reveal-pop uv-d3 relative mx-auto mt-4 inline-flex rounded-full ${light(o.dark, 'bg-white/10', `bg-white ${o.playful ? `border-2 border-[${o.ink}]` : ''}`)} px-4 py-1.5 text-[13px] font-bold`, '{{event_date}}'),
          div(`uv-reveal uv-d4 relative mx-auto mt-5 w-full max-w-[290px] ${light(o.dark, `rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm`, card)} py-3`, [
            p(`text-[12px] ${light(o.dark, 'text-white/70', 'text-muted')}`, 'Kepada Yth. Bapak/Ibu/Saudara/i'),
            comp('guest_name', `mt-0.5 block font-heading text-[19px] font-bold ${light(o.dark, `text-[${o.accent}]`, 'text-primary')}`, { fallback: 'Tamu Undangan' }),
          ]),
          div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', btn, { label: '✉ Buka Undangan' })]),
        ],
      },
      {
        type: 'hero',
        class: 'relative overflow-hidden bg-base px-6 pb-14 pt-16 text-center',
        children: [
          floaty('hias_b', 'right-5 top-8 w-6', 'uv-float'),
          p('uv-reveal font-arabic text-[24px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
          p('uv-reveal uv-d1 mt-3 font-script text-[21px] text-accent', '{{greeting}}'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] text-[13.5px] text-ink/80', '{{opening_text}}'),
          el('h2', 'uv-reveal-pop uv-d2 mx-auto mt-4 max-w-[330px] font-heading text-[26px] font-bold leading-tight text-primary', '{{event_title}}'),
          p('uv-reveal uv-d3 mt-1 text-[13px] italic text-muted', '"{{event_tagline}}"', { if: 'event_tagline' }),
          div('uv-reveal-zoom uv-d3 mx-auto mt-8 w-full max-w-[300px]', [img('w-full', '{{asset.utama}}', '')]),
        ],
      },
      {
        type: 'quote',
        class: `relative overflow-hidden bg-[${o.pale}] px-7 py-14 text-center`,
        children: [
          img('uv-reveal mx-auto h-5 w-48', '{{asset.garis}}'),
          p('uv-reveal uv-d1 mt-5 font-arabic text-[21px] leading-loose text-primary', '{{quote_arabic}}'),
          p('uv-reveal uv-d2 mt-3 text-[13.5px] italic text-ink/80', '{{quote_text}}'),
          p('uv-reveal uv-d3 mt-2 font-heading text-[13px] font-semibold text-accent', '{{quote_source}}'),
        ],
      },
      {
        type: 'profile',
        class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
        children: [
          ...title('Penyelenggara', o.texts.host),
          div(`uv-reveal-flip uv-d2 mx-auto mt-7 max-w-[330px] ${card} text-center`, [
            div('mx-auto w-24', [logo('w-24')]),
            p('mt-3 font-heading text-[19px] font-bold leading-snug text-primary', '{{host_name}}'),
            p('mt-1 text-[13px] text-muted', '{{event_tagline}}', { if: 'event_tagline' }),
            div(`mt-4 rounded-2xl bg-[${o.pale}] px-4 py-3`, [
              p('text-[11px] font-semibold uppercase tracking-wider text-muted', 'Narahubung'),
              p('mt-0.5 font-heading text-[16px] font-bold text-primary', '{{contact_name}}'),
              p('text-[13px] text-ink/80', '{{contact_phone}}'),
              comp('map_button', `mt-3 ${btn} px-5 py-2 text-[13px]`, { href: '{{contact_link}}', label: '💬 Hubungi via WhatsApp' }, { if: 'contact_link' }),
            ], { if: 'contact_name' }),
          ]),
        ],
      },
      {
        type: 'event',
        class: `relative overflow-hidden bg-[${o.deep}] px-6 py-16 text-center text-white`,
        bg: '{{asset.pola}}',
        children: [
          floaty('hias_a', 'left-6 top-10 w-6', 'uv-wiggle'),
          ...title('Waktu & Tempat', 'Catat Tanggalnya', true),
          div('uv-reveal-pop uv-d2 relative mt-6', [
            comp('countdown', '', {
              item_class: `${o.radius} bg-white/15 py-2.5 backdrop-blur-sm`,
              number_class: 'block font-heading text-[26px] font-bold leading-none text-white',
              label_class: 'text-[10.5px] font-semibold uppercase tracking-wider text-white/80',
            }),
          ]),
          div('relative mt-7 grid gap-5', [
            el('article', `uv-reveal-flip ${card} text-center text-ink`, [
              el('span', `inline-block rounded-full bg-[${o.pale}] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary`, '{{item.day}}'),
              el('h3', 'mt-2 font-heading text-[23px] font-bold leading-tight text-primary', '{{item.name}}'),
              p('mt-1 font-bold', '{{item.date}}'),
              p('text-[13px] font-semibold text-accent', '{{item.time}}'),
              p('mt-3 font-heading text-[17px] font-bold text-primary', '{{item.venue}}'),
              p('text-[12.5px] text-muted', '{{item.address}}'),
              comp('map_button', `mt-4 ${btn}`, { href: '{{item.map_url}}', label: '📍 Lihat Lokasi' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
          div('uv-reveal relative mt-6', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: `inline-flex rounded-full border-2 border-white/70 px-6 py-2.5 font-heading text-[14px] font-semibold text-white` })]),
        ],
      },
      {
        type: 'story',
        class: 'relative overflow-hidden bg-base px-6',
        children: [
          div('py-16 text-center', [
            ...title('Rundown', o.texts.rundown),
            rundown,
          ], { if: 'story' }),
        ],
      },
      {
        type: 'gallery',
        class: `bg-[${o.pale}] px-5`,
        children: [
          div('py-16 text-center', [
            ...title('Galeri', o.texts.gallery),
            div('mt-7 grid grid-cols-2 gap-3', [
              div('group uv-reveal-pop', [
                div(o.playful
                  ? `border-2 border-[${o.ink}] bg-white p-2 pb-6 shadow-[4px_4px_0_${o.ink}] group-odd:-rotate-3 group-even:rotate-2`
                  : `${o.radius} overflow-hidden bg-white p-1.5 shadow-[0_14px_30px_-20px_${o.ink}]`, [
                  img(`aspect-[4/5] w-full object-cover ${o.playful ? '' : 'rounded-xl'}`, '{{item.url}}', '{{item.caption}}'),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ], { if: 'gallery' }),
        ],
      },
      {
        type: 'rsvp',
        class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
        children: [
          ...title('Konfirmasi Kehadiran', o.texts.rsvp),
          div(`uv-reveal-flip mt-7 ${card} text-left`, [
            comp('rsvp_form', '', {
              input_class: `w-full rounded-xl border-2 border-[${o.main}]/30 bg-[${o.pale}] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-[${o.main}]`,
              button_class: `w-full rounded-full bg-[${o.main}] py-3 font-heading text-[15px] font-bold ${o.dark && !o.playful ? `text-[${o.deep}]` : 'text-white'} disabled:opacity-60`,
              label_class: 'font-heading text-[14px] font-bold text-primary',
            }),
          ]),
          el('h3', 'uv-reveal mb-4 mt-10 font-heading text-[20px] font-bold text-primary', 'Ucapan & Doa'),
          comp('wishes', 'text-left', { item_class: `${o.radius} border border-[${o.main}]/25 bg-surface p-4`, name_class: 'font-heading font-bold text-primary' }),
        ],
      },
      {
        type: 'gift',
        class: `bg-[${o.pale}] px-6 py-16 text-center`,
        children: [
          div('uv-reveal-pop mx-auto w-16', [img('uv-float3d w-full', '{{asset.hias_a}}', '')]),
          ...title('Dukung Kegiatan', '{{donation_title}}'),
          p('uv-reveal mx-auto mt-3 max-w-[320px] text-[13.5px] text-muted', '{{donation_text}}'),
          div(`uv-reveal-pop uv-d1 mx-auto mt-5 inline-flex flex-col rounded-2xl ${o.playful ? `border-2 border-[${o.ink}]` : ''} bg-white px-5 py-2.5 shadow-[0_10px_24px_-18px_${o.ink}]`, [
            p('text-[11px] font-semibold uppercase tracking-wider text-muted', 'Target Dana'),
            p('font-heading text-[20px] font-bold text-primary', '{{donation_target}}'),
          ], { if: 'donation_target' }),
          div(`uv-reveal-flip uv-d2 mx-auto mt-6 w-full max-w-[260px] ${card} p-4`, [
            p('font-heading text-[13px] font-bold uppercase tracking-wider text-accent', 'Scan QRIS'),
            img('mx-auto mt-2 aspect-square w-full rounded-xl object-contain', '{{donation_qris}}', 'QRIS donasi'),
          ], { if: 'donation_qris' }),
          div('mt-6 grid gap-5', [
            div('uv-reveal-pop', [
              div(`uv-tilt ${card} text-left`, [
                p('uv-depth-1 font-heading text-[13px] font-bold uppercase tracking-wider text-accent', '{{item.bank}}'),
                p('uv-depth-2 mt-2 font-heading text-[23px] font-bold tracking-wider text-primary', '{{item.number}}'),
                p('uv-depth-1 text-[13px] text-muted', 'a.n. {{item.holder}}'),
                div('uv-depth-2 mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border-2 border-[${o.main}] px-4 py-1.5 font-heading text-[13px] font-bold text-primary` })]),
              ]),
            ], { repeat: 'gifts' }),
          ], { if: 'gifts' }),
          p('uv-reveal mt-6 text-[12.5px] italic text-muted', 'Jazakumullahu khairan atas kepedulian Anda.'),
        ],
      },
      {
        type: 'closing',
        class: `relative overflow-hidden ${light(o.dark, `bg-[${o.deep}] text-white`, `bg-[${o.pale}]`)} px-6 pb-20 pt-6 text-center`,
        bg: '{{asset.pola}}',
        children: [
          div('pointer-events-none relative -mx-6 w-[calc(100%+3rem)]', [img('w-full', '{{asset.gantung}}', '')]),
          div('uv-reveal-pop relative mx-auto mt-4 w-full max-w-[280px]', [img('w-full', '{{asset.utama}}', '')]),
          p(`uv-reveal uv-d1 relative mx-auto mt-6 max-w-[320px] text-[13.5px] ${light(o.dark, 'text-white/85', 'text-ink/80')}`, '{{closing_text}}'),
          p(`uv-reveal uv-d2 relative mt-3 font-script text-[24px] ${light(o.dark, `text-[${o.accent}]`, 'text-accent')}`, o.texts.closing),
          p(`uv-reveal uv-d3 relative mt-1 text-[13px] ${light(o.dark, 'text-white/70', 'text-muted')}`, '{{closing_greeting}}'),
          p(`uv-reveal uv-d4 relative mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] ${light(o.dark, 'text-white/60', 'text-muted')}`, 'Hormat kami'),
          p(`uv-reveal-pop uv-d5 relative mt-1 font-heading text-[19px] font-bold ${light(o.dark, 'text-white', 'text-primary')}`, '{{host_name}}'),
        ],
      },
    ],
  }
}
