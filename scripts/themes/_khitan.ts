import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kerangka tema khitanan (walimatul khitan). Dipakai tema ceria & klasik.
 * Placeholder anak: child_*, child_age; orang tua: father_name / mother_name / parents_names.
 */
export interface KhitanOpts {
  dir: string
  ink: string
  main: string
  pale: string
  gold: string
  deep: string
  arch: boolean // true = bingkai lengkung mihrab (klasik), false = bingkai bergerigi bulat (ceria)
  fonts: Pick<ThemeDefinition['globals'], 'font_heading' | 'font_body' | 'font_script'>
  radius: string // kelas radius kartu
  demo: NonNullable<ThemeDefinition['demo']>
}

export function khitanDefinition(o: KhitanOpts): ThemeDefinition {
  const A = o.dir
  const card = `relative ${o.radius} border-2 border-[${o.main}] bg-surface p-5 shadow-[0_8px_0_${o.main}]`
  const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-heading text-[15px] font-semibold text-white shadow-[0_6px_0_${o.gold}]`
  const title = (eyebrow: string, heading: string, light = false): ThemeNode[] => [
    p(`uv-reveal font-heading text-[12px] font-semibold uppercase tracking-[0.25em] ${light ? `text-[${o.gold}]` : 'text-accent'}`, eyebrow),
    el('h2', `uv-reveal-pop uv-d1 mt-1 font-heading text-[29px] font-semibold leading-tight ${light ? 'text-white' : 'text-primary'}`, heading),
    img('uv-reveal uv-d2 mx-auto mt-2 h-5 w-48', '{{asset.garis}}'),
  ]
  const floaty = (asset: string, pos: string, anim = 'uv-float') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])

  /** Foto anak dalam bingkai (mihrab / bergerigi); tanpa foto → ilustrasi anak berpeci */
  const photoFrame = (size: string): ThemeNode => {
    const clip = o.arch ? 'absolute inset-x-[10%] bottom-[4%] top-[8%] overflow-hidden rounded-t-[999px] rounded-b-md' : 'absolute inset-[9%] overflow-hidden rounded-full'
    return div(`uv-tilt relative mx-auto ${o.arch ? 'aspect-[200/260]' : 'aspect-square'} ${size}`, [
      div(`uv-depth-1 ${clip} bg-[${o.pale}]`, [
        img('uv-reveal-mask absolute inset-0 h-full w-full object-cover object-top', '{{child_photo}}', 'Foto anak', { if: 'child_photo' }),
        div('absolute inset-0 grid place-items-end justify-center', [img('w-[82%]', '{{asset.anak}}', 'Ilustrasi anak berpeci')], { if: '!child_photo' }),
      ]),
      img(`uv-depth-2 pointer-events-none absolute inset-0 h-full w-full ${o.arch ? '' : 'animate-spin animate-duration-[40s]'}`, '{{asset.bingkai}}'),
    ])
  }

  const fact = (label: string, value: string, delay: string): ThemeNode =>
    div(`uv-reveal-pop ${delay} ${o.radius} bg-[${o.pale}] px-3 py-3 text-center`, [
      p('text-[11px] font-semibold uppercase tracking-wider text-muted', label),
      p('mt-0.5 font-heading text-[16px] font-semibold leading-tight text-primary', value),
    ])

  return {
    version: 1,
    kind: 'khitan',
    globals: {
      primary_color: o.ink,
      secondary_color: o.main,
      accent_color: o.gold,
      background_color: o.pale,
      surface_color: '#ffffff',
      text_color: o.ink,
      muted_color: '#6f7d77',
      ...o.fonts,
    },
    root_class: 'text-[14.5px] leading-relaxed',
    assets: {
      anak: `${A}/anak.svg`,
      masjid: `${A}/masjid.svg`,
      lentera: `${A}/lentera.svg`,
      bingkai: `${A}/bingkai.svg`,
      bintang: `${A}/bintang.svg`,
      bulan: `${A}/bulan.svg`,
      garis: `${A}/garis.svg`,
    },
    demo: o.demo,
    sections: [
      {
        type: 'cover',
        class: `flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[${o.pale}] via-white to-[${o.pale}] px-6 pb-12 pt-4 text-center`,
        children: [
          div('pointer-events-none relative mx-auto w-56', [img('w-full', '{{asset.lentera}}', '')]),
          floaty('bintang', 'left-6 top-40 w-7', 'uv-wiggle'),
          floaty('bulan', 'right-6 top-32 w-8'),
          floaty('bintang', 'bottom-28 right-8 w-5', 'uv-wiggle'),
          p('uv-reveal relative -mt-2 font-heading text-[12px] font-semibold uppercase tracking-[0.25em] text-accent', 'Walimatul Khitan'),
          div('uv-reveal-pop uv-d1 relative mt-4 w-full', [photoFrame('w-48')]),
          el('h1', 'uv-reveal-pop uv-d2 relative mt-4 font-script text-[50px] leading-none text-primary', '{{child_nickname}}'),
          p('uv-reveal uv-d3 relative mt-2 text-[13px] font-semibold text-muted', '{{event_date}}'),
          div(`uv-reveal uv-d4 relative mx-auto mt-5 w-full max-w-[290px] ${card} py-3 shadow-[0_6px_0_${o.main}]`, [
            p('text-[12px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
            comp('guest_name', 'mt-0.5 block font-heading text-[19px] font-semibold text-primary', { fallback: 'Tamu Undangan' }),
          ]),
          div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', btn, { label: '✉ Buka Undangan' })]),
        ],
      },
      {
        type: 'hero',
        class: 'relative overflow-hidden bg-base px-6 pb-16 pt-20 text-center',
        children: [
          floaty('bulan', 'left-5 top-10 w-8'),
          floaty('bintang', 'right-6 top-16 w-6', 'uv-wiggle'),
          p('uv-reveal font-arabic text-[24px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
          p('uv-reveal uv-d1 mx-auto mt-4 max-w-[320px] text-[13.5px] text-ink/80', '{{opening_text}}'),
          el('h2', 'uv-reveal-pop uv-d2 mt-3 font-heading text-[29px] font-semibold leading-tight text-primary', '{{child_name}}'),
          p('uv-reveal uv-d3 mt-2 text-[13px] text-muted', '{{child_order}} dari pasangan'),
          p('uv-reveal uv-d3 font-heading text-[16px] font-semibold text-primary', '{{parents_names}}'),
          div('mt-7 grid grid-cols-2 gap-2.5', [
            fact('Usia', '{{child_age}}', 'uv-d1'),
            fact('Tanggal Lahir', '{{child_birth}}', 'uv-d2'),
          ]),
          div('uv-reveal-pop uv-d3 mx-auto mt-8 w-40', [img('uv-float w-full', '{{asset.anak}}', '')]),
        ],
      },
      {
        type: 'quote',
        class: `relative overflow-hidden bg-[${o.pale}] px-7 py-16 text-center`,
        children: [
          div('uv-reveal-pop mx-auto w-52', [img('w-full', '{{asset.masjid}}', 'Ilustrasi masjid')]),
          p('uv-reveal uv-d1 mt-6 font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
          p('uv-reveal uv-d2 mt-3 text-[13.5px] italic text-ink/80', '{{quote_text}}'),
          p('uv-reveal uv-d3 mt-2 font-heading text-[13px] font-semibold text-accent', '{{quote_source}}'),
        ],
      },
      {
        type: 'profile',
        class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
        children: [
          ...title('Dengan penuh syukur', 'Kami yang Mengundang'),
          p('uv-reveal mt-5 font-script text-[22px] text-accent', '{{greeting}}'),
          div('mt-7 grid grid-cols-2 gap-3', [
            div(`uv-reveal-left ${card} px-3`, [
              p('font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-accent', 'Ayah'),
              p('mt-1 font-heading text-[16px] font-semibold leading-snug text-primary', '{{father_name}}'),
            ]),
            div(`uv-reveal-right ${card} px-3`, [
              p('font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-accent', 'Ibu'),
              p('mt-1 font-heading text-[16px] font-semibold leading-snug text-primary', '{{mother_name}}'),
            ]),
          ]),
          p('uv-reveal mx-auto mt-7 max-w-[300px] text-[13px] text-muted', 'Mohon doa agar ananda {{child_nickname}} menjadi anak yang shalih, sehat, cerdas, dan berbakti kepada orang tua.'),
        ],
      },
      {
        type: 'event',
        class: `relative overflow-hidden bg-[${o.deep}] px-6 py-16 text-center text-white`,
        children: [
          floaty('bintang', 'left-6 top-10 w-6', 'uv-wiggle'),
          floaty('bulan', 'right-7 top-20 w-7'),
          ...title('Save the Date', 'Walimatul Khitan', true),
          div('uv-reveal-pop uv-d2 mt-6', [
            comp('countdown', '', {
              item_class: `${o.radius} bg-white/15 py-2.5 backdrop-blur-sm`,
              number_class: 'block font-heading text-[26px] font-semibold leading-none text-white',
              label_class: 'text-[10.5px] font-semibold uppercase tracking-wider text-white/80',
            }),
          ]),
          div('mt-7 grid gap-5', [
            el('article', `uv-reveal-flip ${card} text-center text-ink`, [
              el('span', `inline-block rounded-full bg-[${o.pale}] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary`, '{{item.day}}'),
              el('h3', 'mt-2 font-heading text-[24px] font-semibold leading-tight text-primary', '{{item.name}}'),
              p('mt-1 font-bold', '{{item.date}}'),
              p('text-[13px] font-semibold text-accent', '{{item.time}}'),
              p('mt-3 font-heading text-[17px] font-semibold text-primary', '{{item.venue}}'),
              p('text-[12.5px] text-muted', '{{item.address}}'),
              comp('map_button', `mt-4 ${btn}`, { href: '{{item.map_url}}', label: '📍 Lihat Lokasi' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
          div('uv-reveal mt-6', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: 'inline-flex rounded-full border-2 border-white/70 px-6 py-2.5 font-heading text-[14px] font-semibold text-white' })]),
        ],
      },
      {
        type: 'gallery',
        class: 'bg-base px-5',
        children: [
          div('py-16 text-center', [
            ...title('Galeri', 'Momen Jagoan Kecil'),
            div('mt-7 grid grid-cols-2 gap-3', [
              div('group uv-reveal-pop', [
                div(`${o.arch ? 'rounded-t-[999px] rounded-b-2xl' : 'rounded-[24px]'} bg-white p-2 shadow-[0_6px_0_${o.main}] group-odd:-rotate-2 group-even:rotate-2`, [
                  img(`aspect-[4/5] w-full object-cover ${o.arch ? 'rounded-t-[999px] rounded-b-xl' : 'rounded-[18px]'}`, '{{item.url}}', '{{item.caption}}'),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ], { if: 'gallery' }),
        ],
      },
      {
        type: 'rsvp',
        class: `bg-[${o.pale}] px-6 py-16 text-center`,
        children: [
          ...title('Kehadiran & Doa', 'Doakan Ananda, Yuk'),
          div(`uv-reveal-flip mt-7 ${card} text-left`, [
            comp('rsvp_form', '', {
              input_class: `w-full rounded-2xl border-2 border-[${o.main}] bg-[${o.pale}] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-primary`,
              button_class: `w-full rounded-full bg-primary py-3 font-heading text-[15px] font-semibold text-white shadow-[0_5px_0_${o.gold}] disabled:opacity-60`,
              label_class: 'font-heading text-[14px] font-semibold text-primary',
            }),
          ]),
          el('h3', 'uv-reveal mb-4 mt-10 font-heading text-[20px] font-semibold text-primary', 'Doa untuk Ananda'),
          comp('wishes', 'text-left', { item_class: `${o.radius} border-2 border-[${o.main}]/60 bg-surface p-4`, name_class: 'font-heading font-semibold text-primary' }),
        ],
      },
      {
        type: 'gift',
        class: 'bg-base px-6',
        children: [
          div('py-16 text-center', [
            ...title('Tanda Kasih', 'Kado untuk Ananda'),
            p('uv-reveal mt-3 text-[13.5px] text-muted', 'Doa terbaik Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
            div('mt-6 grid gap-5', [
              div('uv-reveal-pop', [
                div(`uv-tilt ${card} text-left`, [
                  p('uv-depth-1 font-heading text-[13px] font-semibold uppercase tracking-wider text-accent', '{{item.bank}}'),
                  p('uv-depth-2 mt-2 font-heading text-[24px] font-semibold tracking-wider text-primary', '{{item.number}}'),
                  p('uv-depth-1 text-[13px] text-muted', 'a.n. {{item.holder}}'),
                  div('uv-depth-2 mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full border-2 border-primary px-4 py-1.5 font-heading text-[13px] font-semibold text-primary' })]),
                ]),
              ], { repeat: 'gifts' }),
            ]),
          ], { if: 'gifts' }),
        ],
      },
      {
        type: 'closing',
        class: `relative overflow-hidden bg-gradient-to-b from-[${o.pale}] to-white px-6 pb-20 pt-12 text-center`,
        children: [
          div('pointer-events-none relative mx-auto w-52', [img('w-full', '{{asset.lentera}}', '')]),
          div('uv-reveal-pop mx-auto mt-2 w-56', [img('w-full', '{{asset.masjid}}', '')]),
          p('uv-reveal uv-d1 mx-auto mt-5 max-w-[320px] text-[13.5px] text-ink/80', '{{closing_text}}'),
          p('uv-reveal uv-d2 mt-3 font-script text-[24px] text-accent', 'Jazakumullahu khairan'),
          p('uv-reveal uv-d3 mt-1 text-[13px] text-muted', '{{closing_greeting}}'),
          p('uv-reveal uv-d4 mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted', 'Kami yang berbahagia'),
          p('uv-reveal-pop uv-d4 mt-1 font-heading text-[18px] font-semibold text-primary', '{{parents_names}}'),
          p('uv-reveal uv-d5 font-script text-[30px] text-accent', '& {{child_nickname}}'),
        ],
      },
    ],
  }
}
