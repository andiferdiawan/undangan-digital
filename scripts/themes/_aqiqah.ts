import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kerangka tema aqiqah (dipakai tema putra & putri dengan palet/ornamen berbeda).
 * Placeholder anak: child_*, orang tua: father_name / mother_name / parents_names.
 */
export interface AqiqahOpts {
  dir: string
  ink: string // warna teks utama & garis ilustrasi
  main: string // warna utama lembut (biru / pink)
  pale: string // latar
  gold: string
  deep: string // latar section gelap (acara)
  eyebrow: string // mis. "Tasyakuran Aqiqah Putra"
  welcome: string // mis. "Alhamdulillah, telah lahir putra kami"
  demo: NonNullable<ThemeDefinition['demo']>
}

export function aqiqahDefinition(o: AqiqahOpts): ThemeDefinition {
  const A = o.dir
  const card = `relative rounded-[28px] border-2 border-[${o.main}] bg-surface p-5 shadow-[0_10px_0_${o.main}]`
  const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-heading text-[15px] font-semibold text-white shadow-[0_6px_0_${o.main}]`
  const title = (eyebrow: string, heading: string, light = false): ThemeNode[] => [
    p(`uv-reveal font-heading text-[12px] font-semibold uppercase tracking-[0.25em] ${light ? 'text-white/80' : 'text-secondary'}`, eyebrow),
    el('h2', `uv-reveal-pop uv-d1 mt-1 font-heading text-[30px] font-semibold leading-tight ${light ? 'text-white' : 'text-primary'}`, heading),
    img('uv-reveal uv-d2 mx-auto mt-2 h-5 w-48', '{{asset.garis}}'),
  ]
  const floaty = (asset: string, pos: string, anim = 'uv-float') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])

  /** Foto bayi dalam bingkai bergerigi; tanpa foto → ilustrasi bayi tidur */
  const babyFrame = (size: string): ThemeNode => div(`uv-tilt relative mx-auto aspect-square ${size}`, [
    div(`uv-depth-1 absolute inset-[9%] overflow-hidden rounded-full bg-[${o.pale}]`, [
      img('uv-reveal-mask absolute inset-0 h-full w-full object-cover', '{{child_photo}}', 'Foto buah hati', { if: 'child_photo' }),
      div('absolute inset-0 grid place-items-center', [img('w-[88%]', '{{asset.bayi}}', 'Ilustrasi bayi tidur')], { if: '!child_photo' }),
    ]),
    img('pointer-events-none absolute inset-0 h-full w-full animate-spin animate-duration-[40s]', '{{asset.bingkai}}'),
  ])

  const birthFact = (label: string, value: string, delay: string): ThemeNode =>
    div(`uv-reveal-pop ${delay} rounded-2xl bg-[${o.pale}] px-3 py-3 text-center`, [
      p('text-[11px] font-semibold uppercase tracking-wider text-muted', label),
      p('mt-0.5 font-heading text-[16px] font-semibold leading-tight text-primary', value),
    ])

  return {
    version: 1,
    kind: 'aqiqah',
    globals: {
      primary_color: o.ink,
      secondary_color: o.main,
      accent_color: o.gold,
      background_color: o.pale,
      surface_color: '#ffffff',
      text_color: o.ink,
      muted_color: '#7b7f95',
      font_heading: 'Fredoka',
      font_body: 'Quicksand',
      font_script: 'Dancing Script',
    },
    root_class: 'text-[14.5px] leading-relaxed',
    assets: {
      bayi: `${A}/bayi.svg`,
      kambing: `${A}/kambing.svg`,
      mobile: `${A}/mobile.svg`,
      bingkai: `${A}/bingkai.svg`,
      hias_kecil: `${A}/ornamen1.svg`,
      hias_besar: `${A}/ornamen2.svg`,
      garis: `${A}/garis.svg`,
    },
    demo: o.demo,
    sections: [
      {
        type: 'cover',
        class: `flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[${o.pale}] via-white to-[${o.pale}] px-6 pb-12 pt-6 text-center`,
        children: [
          div('pointer-events-none relative mx-auto w-52', [img('w-full', '{{asset.mobile}}', '')]),
          floaty('hias_besar', 'left-3 top-36 w-16'),
          floaty('hias_besar', '-right-2 top-64 w-12', 'uv-float uv-d2'),
          floaty('hias_kecil', 'bottom-28 left-7 w-7', 'uv-wiggle'),
          floaty('hias_kecil', 'right-8 top-28 w-5', 'uv-wiggle'),
          p('uv-reveal relative mt-1 font-heading text-[12px] font-semibold uppercase tracking-[0.25em] text-secondary', o.eyebrow),
          div('uv-reveal-pop uv-d1 relative mt-4 w-full', [babyFrame('w-48')]),
          el('h1', 'uv-reveal-pop uv-d2 relative mt-4 font-script text-[52px] leading-none text-primary', '{{child_nickname}}'),
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
          floaty('hias_besar', '-left-4 top-8 w-20'),
          floaty('hias_kecil', 'right-6 top-14 w-6', 'uv-wiggle'),
          p('uv-reveal font-arabic text-[26px] text-primary', 'بَارَكَ اللّٰهُ'),
          p('uv-reveal uv-d1 mt-1 font-script text-[22px] text-secondary', 'Tabarakallah'),
          p('uv-reveal uv-d2 mt-4 text-[13.5px] text-ink/80', o.welcome),
          el('h2', 'uv-reveal-pop uv-d3 mt-2 font-heading text-[30px] font-semibold leading-tight text-primary', '{{child_name}}'),
          p('uv-reveal uv-d4 mt-2 text-[13px] text-muted', '{{child_order}} dari pasangan'),
          p('uv-reveal uv-d4 font-heading text-[16px] font-semibold text-primary', '{{parents_names}}'),
          div(`uv-reveal-flip uv-d5 mt-7 ${card}`, [
            p('font-heading text-[13px] font-semibold uppercase tracking-[0.2em] text-secondary', 'Detail Kelahiran'),
            div('mt-3 grid grid-cols-2 gap-2.5', [
              birthFact('Lahir', '{{child_birth}}', 'uv-d1'),
              birthFact('Pukul', '{{child_birth_time}}', 'uv-d2'),
              birthFact('Berat', '{{child_weight}}', 'uv-d3'),
              birthFact('Panjang', '{{child_length}}', 'uv-d4'),
            ]),
          ]),
        ],
      },
      {
        type: 'quote',
        class: `relative overflow-hidden bg-[${o.pale}] px-7 py-16 text-center`,
        children: [
          div('uv-reveal-pop mx-auto w-36', [img('w-full', '{{asset.kambing}}', 'Ilustrasi kambing aqiqah')]),
          p('uv-reveal uv-d1 mt-5 font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
          p('uv-reveal uv-d2 mt-3 text-[13.5px] italic text-ink/80', '"{{quote_text}}"'),
          p('uv-reveal uv-d3 mt-2 font-heading text-[13px] font-semibold text-secondary', '{{quote_source}}'),
        ],
      },
      {
        type: 'profile',
        class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
        children: [
          ...title('Dengan penuh syukur', 'Keluarga Kecil Kami'),
          p('uv-reveal mt-5 font-script text-[22px] text-secondary', '{{greeting}}'),
          p('uv-reveal uv-d1 mx-auto mt-2 max-w-[320px] text-[13.5px] text-ink/80', '{{opening_text}}'),
          div('mt-8 grid grid-cols-2 gap-3', [
            div(`uv-reveal-left ${card} px-3`, [
              p('font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary', 'Ayah'),
              p('mt-1 font-heading text-[16px] font-semibold leading-snug text-primary', '{{father_name}}'),
            ]),
            div(`uv-reveal-right ${card} px-3`, [
              p('font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary', 'Ibu'),
              p('mt-1 font-heading text-[16px] font-semibold leading-snug text-primary', '{{mother_name}}'),
            ]),
          ]),
          div('uv-reveal-pop mx-auto mt-8 w-44', [img('uv-float w-full', '{{asset.bayi}}', '')]),
          p('uv-reveal mt-2 font-heading text-[18px] font-semibold text-primary', '{{child_nickname}}'),
          p('uv-reveal text-[12.5px] text-muted', '{{child_gender}} · {{child_birth}}'),
        ],
      },
      {
        type: 'event',
        class: `relative overflow-hidden bg-[${o.deep}] px-6 py-16 text-center text-white`,
        children: [
          floaty('hias_kecil', 'left-6 top-10 w-6', 'uv-wiggle'),
          floaty('hias_kecil', 'right-8 top-24 w-4', 'uv-wiggle'),
          ...title('Save the Date', 'Tasyakuran Aqiqah', true),
          div('uv-reveal-pop uv-d2 mt-6', [
            comp('countdown', '', {
              item_class: 'rounded-2xl bg-white/15 py-2.5 backdrop-blur-sm',
              number_class: 'block font-heading text-[26px] font-semibold leading-none text-white',
              label_class: 'text-[10.5px] font-semibold uppercase tracking-wider text-white/80',
            }),
          ]),
          div('mt-7 grid gap-5', [
            el('article', `uv-reveal-flip ${card} text-center text-ink`, [
              el('span', `inline-block rounded-full bg-[${o.pale}] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary`, '{{item.day}}'),
              el('h3', 'mt-2 font-heading text-[24px] font-semibold leading-tight text-primary', '{{item.name}}'),
              p('mt-1 font-bold', '{{item.date}}'),
              p('text-[13px] font-semibold text-secondary', '{{item.time}}'),
              p('mt-3 font-heading text-[17px] font-semibold text-primary', '{{item.venue}}'),
              p('text-[12.5px] text-muted', '{{item.address}}'),
              comp('map_button', `mt-4 ${btn}`, { href: '{{item.map_url}}', label: '📍 Lihat Lokasi' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
          div('uv-reveal mt-6', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: `inline-flex rounded-full border-2 border-white/70 px-6 py-2.5 font-heading text-[14px] font-semibold text-white` })]),
        ],
      },
      {
        type: 'gallery',
        class: 'bg-base px-5',
        children: [
          div('py-16 text-center', [
            ...title('Momen Pertama', 'Galeri Si Kecil'),
            div('mt-7 grid grid-cols-2 gap-3', [
              div('group uv-reveal-pop', [
                div(`rounded-[24px] bg-white p-2 shadow-[0_6px_0_${o.main}] group-odd:-rotate-2 group-even:rotate-2`, [
                  img('aspect-square w-full rounded-[18px] object-cover', '{{item.url}}', '{{item.caption}}'),
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
          ...title('Kehadiran & Doa', 'Doakan Si Kecil, Yuk'),
          div(`uv-reveal-flip mt-7 ${card} text-left`, [
            comp('rsvp_form', '', {
              input_class: `w-full rounded-2xl border-2 border-[${o.main}] bg-[${o.pale}] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-primary`,
              button_class: `w-full rounded-full bg-primary py-3 font-heading text-[15px] font-semibold text-white shadow-[0_5px_0_${o.main}] disabled:opacity-60`,
              label_class: 'font-heading text-[14px] font-semibold text-primary',
            }),
          ]),
          el('h3', 'uv-reveal mb-4 mt-10 font-heading text-[20px] font-semibold text-primary', 'Doa untuk Si Kecil'),
          comp('wishes', 'text-left', { item_class: `rounded-2xl border-2 border-[${o.main}]/60 bg-surface p-4`, name_class: 'font-heading font-semibold text-primary' }),
        ],
      },
      {
        type: 'gift',
        class: 'bg-base px-6',
        children: [
          div('py-16 text-center', [
            ...title('Tanda Kasih', 'Kado untuk Si Kecil'),
            p('uv-reveal mt-3 text-[13.5px] text-muted', 'Doa terbaik Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
            div('mt-6 grid gap-5', [
              div('uv-reveal-pop', [
                div(`uv-tilt ${card} text-left`, [
                  p('uv-depth-1 font-heading text-[13px] font-semibold uppercase tracking-wider text-secondary', '{{item.bank}}'),
                  p('uv-depth-2 mt-2 font-heading text-[24px] font-semibold tracking-wider text-primary', '{{item.number}}'),
                  p('uv-depth-1 text-[13px] text-muted', 'a.n. {{item.holder}}'),
                  div('uv-depth-2 mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border-2 border-primary px-4 py-1.5 font-heading text-[13px] font-semibold text-primary` })]),
                ]),
              ], { repeat: 'gifts' }),
            ]),
          ], { if: 'gifts' }),
        ],
      },
      {
        type: 'closing',
        class: `relative overflow-hidden bg-gradient-to-b from-[${o.pale}] to-white px-6 pb-20 pt-16 text-center`,
        children: [
          floaty('hias_besar', 'left-2 top-8 w-16'),
          floaty('hias_kecil', 'right-8 top-16 w-6', 'uv-wiggle'),
          div('uv-reveal-pop mx-auto w-48', [img('uv-float w-full', '{{asset.bayi}}', '')]),
          p('uv-reveal uv-d1 mx-auto mt-5 max-w-[320px] text-[13.5px] text-ink/80', '{{closing_text}}'),
          p('uv-reveal uv-d2 mt-3 font-script text-[22px] text-secondary', 'Jazakumullahu khairan'),
          p('uv-reveal uv-d3 mt-1 text-[13px] text-muted', '{{closing_greeting}}'),
          p('uv-reveal uv-d4 mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted', 'Kami yang berbahagia'),
          p('uv-reveal-pop uv-d4 mt-1 font-heading text-[18px] font-semibold text-primary', '{{parents_names}}'),
          p('uv-reveal uv-d5 font-script text-[30px] text-secondary', '& {{child_nickname}}'),
        ],
      },
    ],
  }
}
