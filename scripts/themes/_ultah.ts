import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kerangka tema ulang tahun (syukuran milad). Dipakai tema anak (ceria) & dewasa (elegan).
 * Yang berulang tahun: child_*, age_number (angka usia besar); tuan rumah: parents_names (opsional).
 * Aset beranimasi di dalam SVG: balon bergoyang, lilin berkedip, konfeti jatuh, bendera berayun.
 */
export interface UltahOpts {
  dir: string
  ink: string // warna teks & garis
  main: string // warna kedua (bingkai kartu)
  pale: string // latar lembut
  gold: string // aksen
  deep: string // latar gelap (cover elegan & acara)
  elegant: boolean // true = milad dewasa (navy-emas, tanpa data orang tua)
  fonts: Pick<ThemeDefinition['globals'], 'font_heading' | 'font_body' | 'font_script'>
  radius: string
  demo: NonNullable<ThemeDefinition['demo']>
}

export function ultahDefinition(o: UltahOpts): ThemeDefinition {
  const A = o.dir
  const card = o.elegant
    ? `relative ${o.radius} border border-[${o.gold}]/60 bg-surface p-5 shadow-[0_18px_40px_-24px_${o.deep}]`
    : `relative ${o.radius} border-2 border-[${o.ink}] bg-surface p-5 shadow-[5px_5px_0_${o.main}]`
  const btn = o.elegant
    ? `inline-flex items-center justify-center gap-2 rounded-full bg-[${o.gold}] px-7 py-3 font-heading text-[14px] font-semibold tracking-wider text-[${o.deep}] shadow-[0_10px_24px_-12px_${o.gold}]`
    : `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[${o.ink}] bg-primary px-7 py-3 font-heading text-[15px] font-semibold text-white shadow-[4px_4px_0_${o.gold}]`
  const title = (eyebrow: string, heading: string, light = false): ThemeNode[] => [
    p(`uv-reveal font-heading text-[12px] font-semibold uppercase tracking-[0.25em] ${light ? `text-[${o.gold}]` : 'text-accent'}`, eyebrow),
    el('h2', `uv-reveal-pop uv-d1 mt-1 ${o.elegant ? 'font-script text-[40px] leading-none' : 'font-heading text-[29px] font-bold leading-tight'} ${light ? 'text-white' : 'text-primary'}`, heading),
    img('uv-reveal uv-d2 mx-auto mt-2 h-5 w-48', '{{asset.garis}}'),
  ]
  const floaty = (asset: string, pos: string, anim = 'uv-float') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])
  const confetti = (opacity: string) => div(`pointer-events-none absolute inset-0 ${opacity}`, [img('h-full w-full object-cover', '{{asset.konfeti}}')])

  /** Angka usia besar di dalam lencana */
  const ageBadge = (light: boolean): ThemeNode => o.elegant
    ? div('uv-reveal-zoom uv-d1 relative mx-auto mt-3 flex flex-col items-center', [
        p(`font-heading text-[11px] font-semibold uppercase tracking-[0.4em] ${light ? `text-[${o.gold}]` : 'text-accent'}`, 'Milad ke'),
        p(`font-heading text-[96px] font-semibold leading-[0.95] text-[${o.gold}] [text-shadow:0_8px_30px_rgba(201,162,77,0.35)]`, '{{age_number}}'),
      ])
    : div('uv-reveal-pop uv-d1 relative mx-auto mt-2 flex flex-col items-center', [
        p(`font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[${o.ink}]`, 'Ulang Tahun ke'),
        div('relative mt-1 grid h-28 w-28 place-items-center', [
          img('absolute inset-0 h-full w-full animate-spin animate-duration-[18s]', '{{asset.bintang}}'),
          p(`uv-float relative font-heading text-[54px] font-bold leading-none text-white [text-shadow:3px_3px_0_${o.ink}]`, '{{age_number}}'),
        ]),
      ])

  /** Foto dalam bingkai; tanpa foto → kue ulang tahun */
  const photoFrame = (size: string): ThemeNode =>
    div(`uv-tilt relative mx-auto aspect-square ${size}`, [
      div(`uv-depth-1 absolute inset-[8%] overflow-hidden rounded-full ${o.elegant ? `bg-[${o.deep}]` : `bg-[${o.pale}]`}`, [
        img('uv-reveal-mask absolute inset-0 h-full w-full object-cover object-center', '{{child_photo}}', 'Foto yang berulang tahun', { if: 'child_photo' }),
        div('absolute inset-0 grid place-items-center', [img('w-[78%]', '{{asset.kue}}', 'Kue ulang tahun')], { if: '!child_photo' }),
      ]),
      img(`uv-depth-2 pointer-events-none absolute inset-0 h-full w-full ${o.elegant ? '' : 'animate-spin animate-duration-[40s]'}`, '{{asset.bingkai}}'),
    ])

  const fact = (label: string, value: string, delay: string): ThemeNode =>
    div(`uv-reveal-pop ${delay} ${o.radius} ${o.elegant ? `border border-[${o.gold}]/50 bg-surface` : `border-2 border-[${o.ink}] bg-[${o.pale}]`} px-3 py-3 text-center`, [
      p('text-[11px] font-semibold uppercase tracking-wider text-muted', label),
      p('mt-0.5 font-heading text-[16px] font-semibold leading-tight text-primary', value),
    ])

  const coverLight = o.elegant
  return {
    version: 1,
    kind: 'birthday',
    globals: {
      primary_color: o.ink,
      secondary_color: o.main,
      accent_color: o.gold,
      background_color: o.pale,
      surface_color: '#ffffff',
      text_color: o.ink,
      muted_color: o.elegant ? '#6b6f7b' : '#8a6f8f',
      ...o.fonts,
    },
    root_class: 'text-[14.5px] leading-relaxed',
    assets: {
      balon: `${A}/balon.svg`,
      balon_satu: `${A}/balon_satu.svg`,
      kue: `${A}/kue.svg`,
      konfeti: `${A}/konfeti.svg`,
      bendera: `${A}/bendera.svg`,
      bingkai: `${A}/bingkai.svg`,
      bintang: `${A}/bintang.svg`,
      garis: `${A}/garis.svg`,
      hadiah: `${A}/hadiah.svg`,
    },
    demo: o.demo,
    sections: [
      {
        type: 'cover',
        class: `relative flex flex-col items-center justify-center overflow-hidden ${coverLight ? `bg-[${o.deep}] text-white` : `bg-gradient-to-b from-[${o.pale}] via-white to-[${o.pale}]`} px-6 pb-12 pt-3 text-center`,
        children: [
          confetti(coverLight ? 'opacity-70' : 'opacity-90'),
          div('pointer-events-none relative -mx-6 w-[calc(100%+3rem)]', [img('w-full', '{{asset.bendera}}', '')]),
          floaty('balon_satu', 'left-3 top-24 w-10', 'uv-float3d'),
          floaty('balon_satu', 'right-4 top-44 w-8', 'uv-float'),
          floaty('bintang', 'bottom-32 left-7 w-5', 'uv-wiggle'),
          p(`uv-reveal relative mt-3 font-heading text-[12px] font-semibold uppercase tracking-[0.3em] ${coverLight ? `text-[${o.gold}]` : 'text-accent'}`, 'Syukuran Ulang Tahun'),
          ageBadge(coverLight),
          div('uv-reveal-pop uv-d2 relative mt-2 w-full', [photoFrame(o.elegant ? 'w-44' : 'w-48')]),
          el('h1', `uv-reveal-pop uv-d3 relative mt-3 font-script text-[50px] leading-none ${coverLight ? 'text-white' : 'text-primary'}`, '{{child_nickname}}'),
          p(`uv-reveal uv-d3 relative mt-2 text-[13px] font-semibold ${coverLight ? 'text-white/75' : 'text-muted'}`, '{{event_date}}'),
          div(`uv-reveal uv-d4 relative mx-auto mt-5 w-full max-w-[290px] ${coverLight ? `rounded-2xl border border-[${o.gold}]/50 bg-white/5 p-4 backdrop-blur-sm` : card} py-3`, [
            p(`text-[12px] ${coverLight ? 'text-white/70' : 'text-muted'}`, 'Kepada Yth. Bapak/Ibu/Saudara/i'),
            comp('guest_name', `mt-0.5 block font-heading text-[19px] font-semibold ${coverLight ? `text-[${o.gold}]` : 'text-primary'}`, { fallback: 'Tamu Undangan' }),
          ]),
          div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', btn, { label: '🎁 Buka Undangan' })]),
        ],
      },
      {
        type: 'hero',
        class: 'relative overflow-hidden bg-base px-6 pb-16 pt-16 text-center',
        children: [
          floaty('balon_satu', 'left-4 top-8 w-9', 'uv-float3d'),
          floaty('bintang', 'right-6 top-14 w-6', 'uv-wiggle'),
          p('uv-reveal font-arabic text-[24px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
          p('uv-reveal uv-d1 mt-3 font-script text-[22px] text-accent', '{{greeting}}'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] text-[13.5px] text-ink/80', '{{opening_text}}'),
          el('h2', `uv-reveal-pop uv-d2 mt-4 font-heading text-[29px] ${o.elegant ? 'font-semibold' : 'font-bold'} leading-tight text-primary`, '{{child_name}}'),
          ...(o.elegant
            ? []
            : [div('', [
                p('uv-reveal uv-d3 mt-2 text-[13px] text-muted', '{{child_order}} dari pasangan'),
                p('uv-reveal uv-d3 font-heading text-[16px] font-semibold text-primary', '{{parents_names}}'),
              ], { if: 'parents_names' })]),
          div('uv-reveal-pop uv-d3 mx-auto mt-8 w-36', [img('w-full', '{{asset.balon}}', 'Balon')]),
        ],
      },
      {
        type: 'quote',
        class: `relative overflow-hidden bg-[${o.pale}] px-7 py-16 text-center`,
        children: [
          div('uv-reveal-pop mx-auto w-48', [img('w-full', '{{asset.kue}}', 'Kue ulang tahun')]),
          p('uv-reveal uv-d1 mt-6 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
          p('uv-reveal uv-d2 mt-3 text-[13.5px] italic text-ink/80', '{{quote_text}}'),
          p('uv-reveal uv-d3 mt-2 font-heading text-[13px] font-semibold text-accent', '{{quote_source}}'),
          p('uv-reveal uv-d4 mx-auto mt-6 max-w-[300px] text-[13px] text-muted', 'Bertambah usia, semoga bertambah pula keberkahan, ilmu, dan amal shalih.'),
        ],
      },
      {
        type: 'profile',
        class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
        children: [
          floaty('bintang', 'left-6 top-12 w-5', 'uv-wiggle'),
          ...title('Bertambah Usia', 'Tentang {{child_nickname}}'),
          div('mt-7 grid grid-cols-2 gap-2.5', [
            fact('Usia', '{{child_age}}', 'uv-d1'),
            fact('Tanggal Lahir', '{{child_birth}}', 'uv-d2'),
          ]),
          div(`uv-reveal-pop uv-d3 mx-auto mt-6 max-w-[320px] ${card}`, [
            p('font-script text-[24px] leading-tight text-accent', 'Doa kami'),
            p('mt-2 text-[13.5px] text-ink/80', o.elegant
              ? 'Semoga Allah memberkahi sisa usia {{child_nickname}}, melimpahkan kesehatan, rezeki yang halal, dan menjadikan setiap tahunnya lebih dekat kepada-Nya.'
              : 'Semoga {{child_nickname}} tumbuh menjadi anak yang shalih/shalihah, sehat, cerdas, ceria, dan berbakti kepada orang tua.'),
          ]),
        ],
      },
      {
        type: 'event',
        class: `relative overflow-hidden bg-[${o.deep}] px-6 py-16 text-center text-white`,
        children: [
          confetti('opacity-40'),
          floaty('balon_satu', 'right-5 top-10 w-8', 'uv-float3d'),
          ...title('Save the Date', o.elegant ? 'Syukuran Milad' : 'Ayo Datang!', true),
          div('uv-reveal-pop uv-d2 relative mt-6', [
            comp('countdown', '', {
              item_class: `${o.radius} bg-white/15 py-2.5 backdrop-blur-sm`,
              number_class: 'block font-heading text-[26px] font-semibold leading-none text-white',
              label_class: 'text-[10.5px] font-semibold uppercase tracking-wider text-white/80',
            }),
          ]),
          div('relative mt-7 grid gap-5', [
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
          div('uv-reveal relative mt-6', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: `inline-flex rounded-full border-2 border-[${o.gold}] px-6 py-2.5 font-heading text-[14px] font-semibold text-white` })]),
        ],
      },
      {
        type: 'gallery',
        class: 'bg-base px-5',
        children: [
          div('py-16 text-center', [
            ...title('Galeri', o.elegant ? 'Lembar Kenangan' : 'Momen Seru'),
            div('mt-7 grid grid-cols-2 gap-3', [
              div('group uv-reveal-pop', [
                div(o.elegant
                  ? `rounded-t-[999px] rounded-b-2xl border border-[${o.gold}]/60 bg-white p-1.5`
                  : `rounded-[22px] border-2 border-[${o.ink}] bg-white p-2 shadow-[4px_4px_0_${o.main}] group-odd:-rotate-2 group-even:rotate-2`, [
                  img(`aspect-[4/5] w-full object-cover ${o.elegant ? 'rounded-t-[999px] rounded-b-xl' : 'rounded-[16px]'}`, '{{item.url}}', '{{item.caption}}'),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ], { if: 'gallery' }),
        ],
      },
      {
        type: 'rsvp',
        class: `relative overflow-hidden bg-[${o.pale}] px-6 py-16 text-center`,
        children: [
          ...title('Kehadiran & Ucapan', o.elegant ? 'Kirim Doa Terbaik' : 'Kirim Ucapan, Yuk'),
          div(`uv-reveal-flip mt-7 ${card} text-left`, [
            comp('rsvp_form', '', {
              input_class: `w-full rounded-2xl border-2 border-[${o.main}] bg-[${o.pale}] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-primary`,
              button_class: `w-full rounded-full bg-primary py-3 font-heading text-[15px] font-semibold text-white shadow-[0_5px_0_${o.gold}] disabled:opacity-60`,
              label_class: 'font-heading text-[14px] font-semibold text-primary',
            }),
          ]),
          el('h3', 'uv-reveal mb-4 mt-10 font-heading text-[20px] font-semibold text-primary', 'Ucapan & Doa'),
          comp('wishes', 'text-left', { item_class: `${o.radius} border-2 border-[${o.main}]/60 bg-surface p-4`, name_class: 'font-heading font-semibold text-primary' }),
        ],
      },
      {
        type: 'gift',
        class: 'bg-base px-6',
        children: [
          div('py-16 text-center', [
            div('uv-reveal-pop mx-auto w-24', [img('uv-wiggle w-full', '{{asset.hadiah}}', 'Kado')]),
            ...title('Tanda Kasih', 'Kirim Kado'),
            p('uv-reveal mt-3 text-[13.5px] text-muted', 'Doa dan kehadiran Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
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
        class: `relative overflow-hidden ${o.elegant ? `bg-[${o.deep}] text-white` : `bg-gradient-to-b from-[${o.pale}] to-white`} px-6 pb-20 pt-10 text-center`,
        children: [
          confetti('opacity-60'),
          div('pointer-events-none relative -mx-6 w-[calc(100%+3rem)]', [img('w-full', '{{asset.bendera}}', '')]),
          div('uv-reveal-pop relative mx-auto mt-4 w-36', [img('w-full', '{{asset.balon}}', '')]),
          p(`uv-reveal uv-d1 relative mx-auto mt-5 max-w-[320px] text-[13.5px] ${o.elegant ? 'text-white/85' : 'text-ink/80'}`, '{{closing_text}}'),
          p('uv-reveal uv-d2 relative mt-3 font-script text-[26px] text-accent', 'Jazakumullahu khairan'),
          p(`uv-reveal uv-d3 relative mt-1 text-[13px] ${o.elegant ? 'text-white/70' : 'text-muted'}`, '{{closing_greeting}}'),
          p(`uv-reveal uv-d4 relative mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] ${o.elegant ? 'text-white/70' : 'text-muted'}`, 'Dengan penuh syukur'),
          ...(o.elegant
            ? []
            : [p('uv-reveal-pop uv-d4 relative mt-1 font-heading text-[18px] font-semibold text-primary', '{{parents_names}}', { if: 'parents_names' })]),
          p(`uv-reveal uv-d5 relative font-script text-[34px] ${o.elegant ? `text-[${o.gold}]` : 'text-accent'}`, '{{child_nickname}}'),
        ],
      },
    ],
  }
}
