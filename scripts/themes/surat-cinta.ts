import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Surat Cinta — vintage premium dengan 3 warna saja (merah anggur, gading, emas antik) dan 2 aset
 * (segel lilin & ornamen). Konsep 3D mengikuti scroll:
 * - pembuka: amplop membuka (tutup berayun rotateX), surat naik keluar lalu mendekat ke layar
 * - tengah: kartu berbingkai ganda datang dari kejauhan (uv-z)
 * - galeri: album yang halamannya terbalik satu per satu (uv-flip-book)
 * - penutup: surat kembali masuk amplop, tutup menutup, segel lilin terpasang
 */
const WINE = '#6e1f2a'
const IVORY = '#f4ecdc'
const GOLD = '#b08d57'
const A = '/theme-assets/surat-cinta'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:900px]'
const frame = `rounded-[4px] border border-[${GOLD}]/70 bg-[${IVORY}] outline outline-1 outline-offset-[-9px] outline-[${GOLD}]/45 p-8 shadow-[0_24px_50px_-30px_rgba(78,21,32,0.55)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full border border-[${GOLD}] bg-[${WINE}] px-7 py-3 font-body text-[13px] uppercase tracking-[0.25em] text-[${IVORY}]`
const ornament = (cls = '') => img(`mx-auto h-6 w-52 ${cls}`, '{{asset.ornamen}}')
const kicker = (t: string, light = false) => p(`font-body text-[11px] uppercase tracking-[0.4em] ${light ? `text-[${GOLD}]` : `text-[${GOLD}]`}`, t)
const heading = (t: string, light = false) => el('h2', `mt-2 font-heading text-[38px] font-semibold italic leading-[1.05] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)

/**
 * Amplop 3D. f = tutup terbuka (0..1), t = surat naik (0..1), z = surat mendekat & amplop memudar (0..1),
 * seal = segel lilin tampak (0..1). Semua berupa ekspresi CSS.
 */
function envelope(o: { f: string, t: string, z: string, seal: string, letter: ThemeNode[] }): ThemeNode {
  const fade = `[opacity:calc(1_-_${o.z}_*_1.8)]`
  return div('relative mt-6 h-[180px] w-[280px] [transform-style:preserve-3d]', [
    // badan belakang
    div(`absolute inset-0 rounded-[3px] bg-[${WINE}] shadow-[0_30px_60px_-30px_rgba(78,21,32,0.8)] ${fade}`),
    // surat
    div(`absolute inset-x-4 top-2 h-[164px] rounded-[2px] border border-[${GOLD}]/60 bg-[${IVORY}] px-4 py-4 text-center shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)] [transform:translateY(calc(${o.t}_*_-128px))_translateZ(calc(1px_+_${o.z}_*_300px))]`, o.letter),
    // kantong depan (bentuk V)
    div(`absolute inset-0 rounded-[3px] bg-[linear-gradient(160deg,#7c2531,${WINE})] [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)] [transform:translateZ(3px)] ${fade}`),
    div(`absolute inset-0 [clip-path:polygon(0_0,50%_54%,100%_0,100%_100%,0_100%)] border-t border-[${GOLD}]/40 [transform:translateZ(3.2px)] ${fade}`),
    // tutup (berayun ke belakang saat membuka)
    div(`absolute inset-x-0 top-0 h-[112px] [transform-origin:top] bg-[linear-gradient(180deg,#5e1a24,${WINE})] [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(calc(${o.f}_*_-178deg))_translateZ(2px)] ${fade}`),
    // segel lilin di ujung tutup
    div(`absolute left-1/2 top-[84px] w-14 -ml-7 [transform:translateZ(5px)_scale(calc(0.6_+_0.4_*_${o.seal}))] [opacity:${o.seal}]`, [img('w-full', '{{asset.segel}}', 'Segel lilin')]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${frame} text-center`, [
    div(`relative mx-auto aspect-[4/5] w-40 overflow-hidden rounded-[50%] bg-[${WINE}]/10 ring-1 ring-[${GOLD}] ring-offset-4 ring-offset-[${IVORY}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top sepia-[.35]', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[46px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-5 font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[28px] font-semibold italic leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${GOLD}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Album: indeks halaman & tumpukan (halaman pertama di atas) lewat nth-child pada tiap halaman
const PAGES = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${6 - i}]`).join(' ')

export const meta = {
  code: 'LUX-003',
  slug: 'surat-cinta',
  name: 'Surat Cinta',
  category: 'elegan',
  description: 'Vintage premium dengan tiga warna (merah anggur, gading, emas antik) dan konsep 3D: saat di-scroll amplop bersegel lilin terbuka, surat naik lalu mendekat ke layar, kartu berbingkai emas datang dari kejauhan, album foto terbalik halaman demi halaman, dan di akhir surat kembali tersegel.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: WINE,
    secondary_color: GOLD,
    accent_color: GOLD,
    background_color: IVORY,
    surface_color: IVORY,
    text_color: WINE,
    muted_color: '#8a5a60',
    font_heading: 'Cormorant Garamond',
    font_body: 'EB Garamond',
    font_script: 'Pinyon Script',
  },
  root_class: 'text-[15.5px] leading-relaxed',
  assets: { segel: `${A}/segel.svg`, ornamen: `${A}/ornamen.svg` },
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#fbf6ec_0%,${IVORY}_60%,#e9dcc4_100%)] px-6 text-center`,
      children: [
        div(`pointer-events-none absolute inset-4 rounded-[4px] border border-[${GOLD}]/60`),
        div(`pointer-events-none absolute inset-6 rounded-[2px] border border-[${GOLD}]/30`),
        kicker('The Wedding Of'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-5 font-script text-[58px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[26px] italic text-[${GOLD}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        ornament('uv-reveal uv-d2 mt-4'),
        p('uv-reveal uv-d2 mt-3 font-body text-[14px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 mx-auto mt-7 w-20', [img('uv-float w-full', '{{asset.segel}}', 'Segel lilin')]),
        div('uv-reveal uv-d4 relative mt-6', [
          p('font-body text-[13px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[24px] font-semibold italic text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-7', [comp('open_button', btn, { label: 'Buka Surat' })]),
      ],
    },
    // ---------- Pembuka: amplop terbuka ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.8)] bg-[radial-gradient(circle_at_50%_45%,#fbf6ec_0%,${IVORY}_55%,#e9dcc4_100%)]`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[12%] [opacity:calc(1_-_${ramp(0.55, 3)})]`, [kicker('Sepucuk surat untukmu'), ornament('mt-3')]),
          envelope({
            f: ramp(0.04, 3.2),
            t: ramp(0.3, 3),
            z: ramp(0.64, 2.8),
            seal: `calc(1_-_${ramp(0.02, 5)})`,
            letter: [
              p(`font-body text-[8px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Bismillahirrahmanirrahim'),
              p('mt-1.5 font-body text-[8.5px] italic leading-snug text-muted', 'Dengan memohon rahmat Allah, kami mengundang Anda di hari bahagia kami'),
              p('mt-1.5 font-script text-[26px] leading-none text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
              img('mx-auto mt-1.5 h-3 w-24', '{{asset.ornamen}}'),
              p('mt-1 font-body text-[8.5px] uppercase tracking-[0.25em] text-primary', '{{event_date}}'),
            ],
          }),
          p(`pointer-events-none absolute inset-x-0 bottom-10 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk membuka'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${WINE}] px-6 py-24 text-center`,
      children: [
        div('uv-z', [
          ornament(),
          p(`mt-6 font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          p(`mt-4 font-heading text-[20px] italic leading-snug text-[${IVORY}]/90`, '“{{quote_text}}”'),
          p(`mt-3 font-body text-[12px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
          ornament('mt-6 rotate-180'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        div('uv-z', [kicker('Dengan Penuh Syukur'), heading('Kedua Mempelai'), ornament('mt-4')]),
        p('uv-z mx-auto mt-4 max-w-[300px] font-body text-[15px] italic text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-10', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${WINE}] px-6 py-20 text-center`,
      children: [
        div('uv-z', [kicker('Save The Date', true), heading('Waktu & Tempat', true), ornament('mt-4')]),
        div('uv-z mt-8', [comp('countdown', '', {
          item_class: `rounded-[3px] border border-[${GOLD}]/60 py-3 text-center`,
          number_class: `block font-heading text-[32px] font-semibold leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.25em] text-[${GOLD}]`,
        })]),
        div('mt-10 grid gap-10', [
          el('article', `uv-z ${frame} text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[30px] font-semibold italic leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-body text-[15px] text-ink', '{{item.date}}'),
            p('font-body text-[14px] italic text-muted', '{{item.time}}'),
            img('mx-auto my-4 h-5 w-40', '{{asset.ornamen}}'),
            p('font-heading text-[20px] font-semibold text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[13px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-6',
      children: [
        div('py-20 text-center', [
          div('uv-z', [kicker('Kisah Kami'), heading('Perjalanan Cinta'), ornament('mt-4')]),
          div('mt-10 grid gap-8', [
            div(`uv-z ${frame} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[25px] font-semibold italic leading-tight text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[15px] italic text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: album yang halamannya terbalik ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${WINE}]`,
      children: [
        div(stage, [
          div('absolute inset-x-0 top-[9%]', [kicker('Album Kenangan', true), heading('Momen Kami', true)]),
          div('uv-flip-book relative mt-20 h-[330px] w-[250px]', [
            div(`uv-flip-page absolute inset-0 ${PAGES}`, [
              div(`h-full w-full rounded-[3px] border border-[${GOLD}]/70 bg-[${IVORY}] p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden] [transform-origin:left_center] [transform:perspective(1200px)_rotateY(calc(clamp(0,${S}*7_-_var(--i,0)*1.05,1)*-180deg))]`, [
                img('h-full w-full rounded-[2px] object-cover sepia-[.3]', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
            div(`uv-flip-end absolute inset-0 z-0 grid place-items-center rounded-[3px] border border-[${GOLD}]/70 bg-[${IVORY}] p-6`, [
              div('', [
                img('mx-auto w-14', '{{asset.segel}}'),
                p('mt-4 font-script text-[34px] leading-tight text-primary', 'dan kisah kami berlanjut…'),
                ornament('mt-3'),
              ]),
            ]),
          ]),
          p(`absolute inset-x-0 bottom-[7%] font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, 'Scroll untuk membalik halaman'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Balas Surat Ini'), ornament('mt-4')]),
        div(`uv-z mt-8 ${frame} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[3px] border border-[${GOLD}]/60 bg-white/60 px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${WINE}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[12px] uppercase tracking-[0.2em] text-[${GOLD}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-12 font-heading text-[28px] font-semibold italic text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/40 py-4`, name_class: 'font-heading text-[18px] font-semibold italic text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${WINE}] px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [kicker('Tanda Kasih', true), heading('Amplop Digital', true), ornament('mt-4')]),
          p(`uv-z mx-auto mt-4 max-w-[300px] font-body text-[15px] italic text-[${IVORY}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-8', [
            div(`uv-z ${frame} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[30px] font-semibold tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] italic text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}] px-5 py-2 font-body text-[12px] uppercase tracking-[0.2em] text-primary` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: surat kembali tersegel ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[radial-gradient(circle_at_50%_45%,#fbf6ec_0%,${IVORY}_55%,#e9dcc4_100%)]`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[10%] px-8 [opacity:calc(1_-_${ramp(0.35, 3)})]`, [
            p('font-body text-[15px] italic text-muted', '{{closing_text}}'),
          ]),
          envelope({
            f: `calc(1_-_${ramp(0.42, 3)})`,
            t: `calc(1_-_${ramp(0.1, 3)})`,
            z: '0',
            seal: ramp(0.72, 4),
            letter: [
              p(`font-body text-[8px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Terima kasih'),
              p('mt-2 font-script text-[26px] leading-none text-primary', '{{couple_names}}'),
              img('mx-auto mt-2 h-3 w-24', '{{asset.ornamen}}'),
              p('mt-1.5 font-body text-[8.5px] italic text-muted', '{{closing_greeting}}'),
            ],
          }),
          div(`absolute inset-x-0 bottom-[11%] [opacity:${ramp(0.78, 4)}]`, [
            p('font-script text-[34px] text-primary', 'with love,'),
            p(`font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
