import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Buku Nikah — modern Gen Z terinspirasi buku & kartu nikah Indonesia: merah (suami), hijau (istri), emas.
 * Sengaja TIDAK memakai Lambang Negara maupun nama instansi; lambangnya orisinal (dua cincin dalam untaian
 * daun). Aset: lambang & chip kartu. Alur 3D mengikuti scroll:
 * - pembuka: dua buku nikah datang dari kejauhan, sampulnya terbuka ke atas memperlihatkan data suami &
 *   istri, lalu keduanya menyatu menjadi satu Kartu Nikah yang berputar 3D ke sisi belakang
 * - tengah: halaman "data" berkop merah/hijau dengan pas foto, datang dari kejauhan (uv-z)
 * - galeri: kartu foto yang mengembang seperti kipas (uv-ring sebagai fallback grid)
 * - penutup: stempel "SAH!" dihentakkan ke kartu nikah
 */
const RED = '#8c1c24'
const GREEN = '#1f4a3c'
const GOLD = '#d4ac5a'
const IVORY = '#fbf6ec'
const A = '/theme-assets/buku-nikah'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-5 text-center'
// Kertas berpola guilloche halus & sampul kulit — murni CSS
const paper = `bg-[${IVORY}] [background-image:repeating-radial-gradient(circle_at_50%_120%,rgba(31,74,60,0.07)_0_1px,transparent_1px_7px)]`
const leather = (c: string) => `bg-[${c}] [background-image:linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%),repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0_2px,transparent_2px_5px)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${RED}] px-7 py-3 font-body text-[13px] font-medium uppercase tracking-[0.2em] text-[${IVORY}] shadow-[0_12px_26px_-12px_rgba(140,28,36,0.8)]`
const kicker = (t: string, cls = '') => p(`font-body text-[11px] font-medium uppercase tracking-[0.35em] text-[${GOLD}] ${cls}`, t)
const heading = (t: string, light = false) => el('h2', `mt-2 font-heading text-[32px] leading-[1.1] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)
const emblem = (cls: string) => img(cls, '{{asset.lambang}}', '')
/** Pita dua warna merah-hijau dengan titik emas di tengah. */
const duo = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-[3px] w-12 rounded-full bg-[${RED}]`), div(`h-2 w-2 rounded-full bg-[${GOLD}]`), div(`h-[3px] w-12 rounded-full bg-[${GREEN}]`),
])

/** Buku nikah 3D: sampul kulit berengsel di atas; open 0..1 = sampul terbuka ke atas. */
function booklet(color: string, who: string, open: string, inner: ThemeNode[]): ThemeNode {
  return div('relative h-[196px] w-[140px] [transform-style:preserve-3d]', [
    div(`absolute inset-0 flex flex-col items-center justify-center rounded-[6px] ${paper} px-3 text-center shadow-[0_20px_40px_-22px_rgba(0,0,0,0.6)] ring-1 ring-[${GOLD}]/40`, inner),
    div(`absolute inset-0 [transform-style:preserve-3d] [transform-origin:top] [transform:rotateX(calc(${open}_*_-168deg))]`, [
      div(`absolute inset-0 flex flex-col items-center justify-between rounded-[6px] ${leather(color)} px-3 py-4 [backface-visibility:hidden] shadow-[0_22px_40px_-20px_rgba(0,0,0,0.7)]`, [
        p(`font-body text-[8px] font-semibold uppercase tracking-[0.32em] text-[${GOLD}]`, 'Buku Nikah'),
        emblem('w-[74px]'),
        p(`font-heading text-[13px] uppercase tracking-[0.22em] text-[${GOLD}]`, who),
      ]),
      div(`absolute inset-0 rounded-[6px] bg-[${color}] brightness-90 [transform:rotateX(180deg)] [backface-visibility:hidden]`),
    ]),
  ])
}

/** Isi halaman buku: label data & nama panggilan. */
function bookPage(color: string, label: string, who: 'groom' | 'bride'): ThemeNode[] {
  return [
    p(`font-body text-[7.5px] font-semibold uppercase tracking-[0.28em] text-[${color}]`, label),
    p('mt-2 font-script text-[30px] leading-none text-ink', `{{${who}_nickname}}`),
    div(`mx-auto my-2 h-px w-16 bg-[${GOLD}]`),
    p('font-body text-[8px] leading-snug text-muted', `{{${who}_parents}}`),
  ]
}

/** Kartu Nikah 3D: depan dua warna, belakang berisi nama; stamp 0..1 = stempel SAH menghentak. */
function kartu(flip: string, stamp: string, status: string): ThemeNode {
  return div(`relative h-[188px] w-[298px] [transform-style:preserve-3d] [transform:rotateY(${flip})]`, [
    // depan
    div(`absolute inset-0 overflow-hidden rounded-[16px] bg-[linear-gradient(118deg,${RED}_0_50%,${GREEN}_50%_100%)] [backface-visibility:hidden] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.65)]`, [
      div('absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)]'),
      p(`absolute inset-x-0 top-4 font-body text-[10px] font-semibold uppercase tracking-[0.38em] text-[${GOLD}]`, 'Kartu Nikah'),
      img('absolute left-6 top-[68px] w-11', '{{asset.chip}}', ''),
      emblem('absolute right-6 top-[40px] w-[92px]'),
      div('absolute bottom-4 left-6 text-left', [
        p(`font-heading text-[19px] leading-none text-[${GOLD}]`, '{{groom_nickname}} & {{bride_nickname}}'),
        p(`mt-1 font-body text-[8px] uppercase tracking-[0.3em] text-[${IVORY}]/70`, 'Berlaku seumur hidup'),
      ]),
    ]),
    // belakang
    div(`absolute inset-0 flex flex-col items-center justify-center rounded-[16px] ${paper} px-6 text-center ring-1 ring-[${GOLD}]/60 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.5)]`, [
      div(`absolute inset-x-0 top-0 h-2 rounded-t-[16px] bg-[linear-gradient(90deg,${RED}_0_50%,${GREEN}_50%_100%)]`),
      p(`font-body text-[8px] font-semibold uppercase tracking-[0.3em] text-[${GOLD}]`, 'Dengan ini menyatakan'),
      p('mt-1.5 font-script text-[34px] leading-none text-ink', '{{groom_nickname}} & {{bride_nickname}}'),
      p('mt-2 font-body text-[9px] uppercase tracking-[0.25em] text-ink', '{{event_date}}'),
      p(`mt-2 rounded-full bg-[${GREEN}]/10 px-3 py-1 font-body text-[9px] font-medium text-[${GREEN}]`, status),
      div(`absolute bottom-3 right-4 grid h-[62px] w-[62px] place-items-center rounded-full border-[3px] border-double border-[${RED}] font-heading text-[17px] text-[${RED}] [opacity:${stamp}] [transform:rotate(-14deg)_scale(calc(2.6_-_${stamp}_*_1.6))]`, 'SAH!'),
    ]),
  ])
}

/** Halaman data mempelai: kop berwarna, pas foto, isian. */
function dataPage(who: 'groom' | 'bride'): ThemeNode {
  const color = who === 'groom' ? RED : GREEN
  const label = who === 'groom' ? 'Data Suami' : 'Data Istri'
  return div(`uv-z overflow-hidden rounded-[14px] ${paper} text-left shadow-[0_24px_50px_-30px_rgba(0,0,0,0.5)] ring-1 ring-[${GOLD}]/40`, [
    div(`flex items-center justify-between ${leather(color)} px-5 py-3`, [
      p(`font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-[${GOLD}]`, label),
      emblem('w-8'),
    ]),
    div('flex gap-4 p-5', [
      div(`relative h-[112px] w-[84px] shrink-0 overflow-hidden rounded-[6px] bg-[${color}] ring-2 ring-white shadow`, [
        img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Pas foto mempelai pria' : 'Pas foto mempelai wanita', { if: `${who}_photo` }),
        div(`absolute inset-0 grid place-items-center font-script text-[30px] text-[${IVORY}]`, `{{${who}_nickname}}`, { if: `!${who}_photo` }),
      ]),
      div('min-w-0', [
        p('font-body text-[9px] font-medium uppercase tracking-[0.25em] text-muted', 'Nama lengkap'),
        el('h3', 'font-heading text-[20px] leading-tight text-ink', `{{${who}_name}}`),
        p('mt-2 font-body text-[9px] font-medium uppercase tracking-[0.25em] text-muted', 'Orang tua'),
        p('font-body text-[13px] leading-snug text-ink/85', `{{${who}_parents}}`),
        el('a', `mt-2 inline-block font-body text-[12px] font-medium text-[${color}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
      ]),
    ]),
    p(`border-t border-dashed border-[${GOLD}]/50 px-5 py-2 font-body text-[10px] text-muted`, who === 'groom' ? 'Status: siap jadi imam ✓' : 'Status: siap jadi makmum ✓'),
  ])
}

// Adegan pembuka
const IN = ramp(0.02, 3.2) // buku datang dari kejauhan
const OPEN = ramp(0.24, 3.4) // sampul terbuka
const MERGE = ramp(0.54, 3.2) // buku menyatu & memudar
const CARD = ramp(0.6, 3) // kartu nikah muncul
const FLIP = ramp(0.76, 4.4) // kartu berputar ke belakang
// Adegan penutup
const ENTER = ramp(0.04, 3)
const STAMP = ramp(0.36, 3.2)
const END = ramp(0.62, 4)

// Kipas galeri: indeks tiap kartu (6 posisi) & tumpukan
const FAN = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${i + 1}]`).join(' ')

export const meta = {
  code: 'MOD-009',
  slug: 'buku-nikah',
  name: 'Buku Nikah',
  category: 'modern',
  description: 'Modern Gen Z terinspirasi buku & kartu nikah: merah untuk suami, hijau untuk istri, aksen emas. Efek 3D saat di-scroll: dua buku nikah terbuka lalu menyatu jadi kartu nikah yang berputar, galeri kartu foto mengembang seperti kipas, dan stempel SAH di akhir.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: RED,
    secondary_color: GREEN,
    accent_color: GOLD,
    background_color: IVORY,
    surface_color: '#ffffff',
    text_color: '#2b2420',
    muted_color: '#7a6f66',
    font_heading: 'DM Serif Display',
    font_body: 'Outfit',
    font_script: 'Ephesis',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { lambang: `${A}/lambang.svg`, chip: `${A}/chip.svg` },
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden ${paper} px-6 text-center`,
      children: [
        kicker('Undangan Pernikahan'),
        div('uv-reveal-zoom uv-d1 relative mt-6 flex justify-center gap-3 [perspective:900px]', [
          div('uv-float [transform:rotate(-8deg)]', [booklet(RED, 'Suami', '0', [])]),
          div('uv-float [animation-delay:-2s] [transform:rotate(8deg)]', [booklet(GREEN, 'Istri', '0', [])]),
        ]),
        el('h1', 'uv-reveal uv-d2 mt-8 font-heading text-[38px] leading-[1.05] text-ink', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-script text-[30px] text-[${GOLD}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        p('uv-reveal uv-d3 mt-3 font-body text-[12px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal uv-d4 relative mt-7', [
          p('font-body text-[13px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[22px] text-ink', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-7', [comp('open_button', btn, { label: 'Buka Buku Nikah' })]),
      ],
    },
    // ---------- Pembuka: dua buku nikah terbuka lalu menyatu jadi kartu nikah ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3)] ${paper}`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[9%] px-6 [opacity:calc(1_-_${OPEN}_*_1.4)]`, [kicker('Bab baru dimulai'), heading('Dua buku, satu cerita')]),
          div(`relative mt-24 flex gap-4 [perspective:1100px] [opacity:calc(1_-_${MERGE}_*_1.3)]`, [
            div(`[transform-style:preserve-3d] [transform:translateX(calc(${MERGE}_*_78px))_translateZ(calc((1_-_${IN})_*_-700px))_rotateY(calc((1_-_${IN})_*_35deg))_scale(calc(1_-_${MERGE}_*_0.35))]`, [
              booklet(RED, 'Suami', OPEN, bookPage(RED, 'Data Suami', 'groom')),
            ]),
            div(`[transform-style:preserve-3d] [transform:translateX(calc(${MERGE}_*_-78px))_translateZ(calc((1_-_${IN})_*_-700px))_rotateY(calc((1_-_${IN})_*_-35deg))_scale(calc(1_-_${MERGE}_*_0.35))]`, [
              booklet(GREEN, 'Istri', OPEN, bookPage(GREEN, 'Data Istri', 'bride')),
            ]),
          ]),
          div(`absolute inset-0 flex flex-col items-center justify-center [perspective:1000px] [opacity:${CARD}]`, [
            div(`[transform:translateY(calc((1_-_${CARD})_*_50px))_scale(calc(0.7_+_${CARD}_*_0.3))]`, [
              kartu(`calc(${FLIP}_*_180deg_+_(1_-_${CARD})_*_-30deg)`, '0', 'Status: menuju halal ⏳'),
            ]),
            p(`mt-8 font-body text-[13px] text-muted [opacity:${FLIP}]`, 'Bismillah, kami mengundang Anda di hari bahagia kami'),
          ]),
          p(`pointer-events-none absolute inset-x-0 bottom-8 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll pelan-pelan ya'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative ${leather(GREEN)} px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          emblem('mx-auto w-14 opacity-90'),
          p(`mt-6 font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          p(`mt-4 font-body text-[15px] font-light leading-relaxed text-[${IVORY}]/90`, '“{{quote_text}}”'),
          p(`mt-3 font-body text-[11px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: `relative ${paper} px-5 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Data Calon Pengantin'), heading('Kenalan dulu, yuk'), duo('mt-4')]),
        p('uv-z mx-auto mt-4 max-w-[310px] font-body text-[14px] text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-8', [dataPage('groom'), dataPage('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative ${leather(RED)} px-5 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Jadwal Hari Bahagia'), heading('Catat tanggalnya!', true)]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `rounded-[12px] bg-[${IVORY}]/10 py-3 text-center ring-1 ring-[${GOLD}]/40`,
          number_class: `block font-heading text-[30px] leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${GOLD}]`,
        })]),
        div('mt-10 grid gap-8', [
          el('article', `uv-z overflow-hidden rounded-[14px] ${paper} text-center shadow-[0_24px_50px_-26px_rgba(0,0,0,0.6)]`, [
            div(`bg-[linear-gradient(90deg,${RED}_0_50%,${GREEN}_50%_100%)] py-2`, [p(`font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-[${GOLD}]`, '{{item.day}}')]),
            div('px-6 pb-7 pt-5', [
              el('h3', 'font-heading text-[26px] leading-tight text-ink', '{{item.name}}'),
              p('mt-1 font-body text-[15px] text-ink', '{{item.date}}'),
              p('font-body text-[14px] text-muted', '{{item.time}}'),
              duo('my-4'),
              p('font-heading text-[18px] text-ink', '{{item.venue}}'),
              p('font-body text-[13px] text-muted', '{{item.address}}'),
              comp('map_button', `mt-5 ${btn}`, { href: '{{item.map_url}}', label: 'Buka Maps' }, { if: 'item.map_url' }),
            ]),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
      ],
    },
    {
      type: 'story',
      class: `relative ${paper} px-5`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Riwayat Hubungan'), heading('Dari kenal sampai sah'), duo('mt-4')]),
          div('mt-10 grid gap-5 text-left', [
            div(`uv-z flex gap-4 rounded-[14px] bg-white/70 p-5 ring-1 ring-[${GOLD}]/40`, [
              div(`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[${GREEN}] font-body text-[13px] text-[${IVORY}]`, '✓'),
              div('min-w-0', [
                p(`font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-[${RED}]`, '{{item.date}}'),
                el('h3', 'font-heading text-[19px] leading-tight text-ink', '{{item.title}}'),
                p('mt-1 font-body text-[14px] text-ink/80', '{{item.text}}'),
              ]),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: kartu foto mengembang seperti kipas ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] ${leather(GREEN)}`,
      children: [
        div(stage, [
          div('', [kicker('Galeri'), heading('Koleksi kartu kenangan', true)]),
          div('uv-ring relative mt-16 h-[184px] w-[132px]', [
            div(`uv-ring-item absolute inset-0 ${FAN} [transform-origin:50%_135%] [transform:rotate(calc((var(--i,0)_-_2.5)_*_${S}_*_10deg))_translateY(calc(${S}_*_-6px))]`, [
              div(`h-full w-full rounded-[12px] bg-[${IVORY}] p-1.5 shadow-[0_18px_34px_-14px_rgba(0,0,0,0.75)]`, [
                img('h-full w-full rounded-[9px] object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
          ]),
          p(`mt-24 font-body text-[11px] uppercase tracking-[0.35em] text-[${IVORY}]/60`, 'Scroll untuk membuka kipas'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative ${paper} px-5 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Jadi saksi bahagia kami?'), p('mt-2 font-body text-[13px] text-muted', 'Bukan formulir N1 kok, cukup isi ini ya.')]),
        div(`uv-z mt-8 rounded-[14px] bg-white/80 p-6 text-left ring-1 ring-[${GOLD}]/40`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[10px] border border-[${GOLD}]/50 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${RED}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] font-medium uppercase tracking-[0.2em] text-muted`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-12 font-heading text-[24px] text-ink', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/40 py-4`, name_class: 'font-heading text-[16px] text-ink' }),
      ],
    },
    {
      type: 'gift',
      class: `${leather(RED)} px-5`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true)]),
          p(`uv-z mx-auto mt-4 max-w-[300px] font-body text-[14px] text-[${IVORY}]/80`, 'Doa restu Anda sudah lebih dari cukup. Bila ingin memberi tanda kasih, bisa lewat:'),
          div('mt-10 grid gap-6', [
            div(`uv-z relative mx-auto h-[178px] w-full max-w-[300px] overflow-hidden rounded-[16px] bg-[linear-gradient(118deg,${GREEN}_0_55%,#163a2f_55%_100%)] p-5 text-left shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)]`, [
              img('w-10', '{{asset.chip}}', ''),
              p(`mt-3 font-body text-[10px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{item.bank}}'),
              p(`mt-1 font-heading text-[23px] tracking-wider text-[${IVORY}]`, '{{item.number}}'),
              p(`font-body text-[12px] text-[${IVORY}]/75`, 'a.n. {{item.holder}}'),
              div('absolute bottom-4 right-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin', button_class: `rounded-full bg-[${GOLD}] px-4 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-[${GREEN}]` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: stempel SAH! dihentakkan ke kartu nikah ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.2)] ${paper}`,
      children: [
        div(stage, [
          div('px-6', [p('font-body text-[14px] text-muted', '{{closing_text}}')]),
          div(`mt-8 [perspective:1000px] [opacity:${ENTER}]`, [
            div(`[transform:rotateX(calc((1_-_${ENTER})_*_50deg))_translateY(calc((1_-_${ENTER})_*_60px))]`, [
              kartu('180deg', STAMP, 'Status: resmi jadi kita ✓'),
            ]),
          ]),
          div(`mt-8 [opacity:${END}]`, [
            kicker('Terima kasih'),
            p('mt-2 font-body text-[13px] text-muted', '{{closing_greeting}}'),
            p('mt-1 font-script text-[40px] leading-tight text-ink', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
