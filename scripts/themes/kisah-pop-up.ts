import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kisah Pop-Up — buku cerita pop-up klasik & romantis. Warna: merah anggur (sampul kulit), kertas gading,
 * emas; aset: gedung acara  * emas; aset: gedung acara, sepasang cincin, siluet mempelai (album). Konsep 3D: sepasang cincin, plus foto mempelai dari data undangan. Konsep 3D:
 * - sampul (otomatis saat dimuat, uv-play): buku bersampul kulit terbuka sendiri, bingkai foto mempelai
 *   pria & wanita dan cincin berdiri dari halaman yang mendatar, lalu kamera perlahan zoom-in
 * - pembuka (scroll): Bab I, kartu nama berdiri, kamera mendekat, lalu lembar halaman dibalik 3D ke Bab II
 * - tengah: setiap bab adalah halaman buku yang terbalik 3D saat selesai dibaca (uv-leaf)
 * - galeri: album yang halamannya terbalik satu per satu (uv-flip-book)
 * - penutup: pop-up melipat kembali, sampul menutup — "Tamat"
 */
const WINE = '#5a1f24'
const GOLD = '#b8914f'
const PAPER = '#f4ecdb'
const INK = '#3a2a24'
const DESK = '#2b1d1a'
const A = '/theme-assets/kisah-pop-up'

const T = 'var(--uv-t,1)'
const S = 'var(--uv-s,1)'
/** Progres 0..1 dari variabel waktu/scroll v, mulai di `from` dengan kecepatan `speed`. */
const ramp = (v: string, from: number, speed: number) => `clamp(0,(${v}_-_${from})*${speed},1)`
/** Versi halus (smoothstep) dari ramp. */
const sm = (r: string) => `calc(${r}*${r}*(3_-_2*${r}))`

const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-4 text-center'
// Kulit sampul: kilap lembut + serat halus, murni CSS
const leather = `bg-[${WINE}] [background-image:radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.16),transparent_58%),repeating-radial-gradient(circle_at_40%_40%,rgba(0,0,0,0.08)_0_1px,transparent_1px_3px)]`
const deskBg = `bg-[${DESK}] [background-image:radial-gradient(ellipse_at_50%_40%,rgba(184,145,79,0.18),transparent_65%)]`
// Kertas: bayangan lipatan di sisi punggung buku
const paperR = `bg-[${PAPER}] [background-image:linear-gradient(90deg,rgba(58,42,36,0.22),transparent_18%)]`
const paperL = `bg-[${PAPER}] [background-image:linear-gradient(270deg,rgba(58,42,36,0.22),transparent_18%)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full border border-[${GOLD}] bg-[${WINE}] px-7 py-3 font-body text-[13px] uppercase tracking-[0.25em] text-[${PAPER}] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)]`
const card = `rounded-[4px] border border-[${GOLD}]/60 bg-white/55 px-7 pb-8 pt-7 outline outline-1 outline-offset-[-7px] outline-[${GOLD}]/35 shadow-[0_18px_40px_-30px_rgba(58,42,36,0.6)]`
const kicker = (t: string, cls = '') => p(`font-body text-[12px] uppercase tracking-[0.4em] text-[${GOLD}] ${cls}`, t)
const heading = (t: string) => el('h2', 'mt-2 font-heading text-[34px] italic leading-[1.1] text-primary', t)
/** Hiasan pemisah: garis emas dengan belah ketupat. */
const flourish = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-px w-12 bg-[${GOLD}]`), div(`h-1.5 w-1.5 rotate-45 bg-[${GOLD}]`), div(`h-2.5 w-2.5 rotate-45 border border-[${GOLD}]`), div(`h-1.5 w-1.5 rotate-45 bg-[${GOLD}]`), div(`h-px w-12 bg-[${GOLD}]`),
])

/**
 * Elemen pop-up: berbaring di halaman lalu berdiri (rotateX berengsel di tepi bawah).
 * `pos` = posisi & ukuran di halaman kanan (150×200), `up` = ekspresi 0..1 (0 datar, 1 berdiri).
 */
function pop(pos: string, up: string, content: ThemeNode): ThemeNode {
  return div(`absolute ${pos} [transform-origin:50%_100%] [transform-style:preserve-3d] [transform:rotateX(calc(${up}*-84deg))]`, [content])
}
const art = (asset: string, alt: string) =>
  img('block h-full w-full [backface-visibility:hidden] drop-shadow-[0_2px_1px_rgba(58,42,36,0.35)]', `{{asset.${asset}}}`, alt)

/** Isi sampul depan (kulit, bingkai emas timbul). */
function coverFace(title: string): ThemeNode[] {
  return [
    div(`absolute inset-[9px] rounded-[3px] border border-[${GOLD}]/80 outline outline-1 outline-offset-[3px] outline-[${GOLD}]/40`),
    div('absolute inset-0 flex flex-col items-center justify-center px-5', [
      img('w-10 opacity-90', '{{asset.cincin}}'),
      p(`mt-2 font-script text-[30px] leading-none text-[${GOLD}] [text-shadow:0_1px_0_rgba(0,0,0,0.5)]`, title),
      div(`mx-auto my-2 h-px w-16 bg-[${GOLD}]/70`),
      p(`font-heading text-[10px] uppercase tracking-[0.3em] text-[${PAPER}]/85`, '{{groom_nickname}} & {{bride_nickname}}'),
    ]),
  ]
}

/**
 * Buku pop-up (halaman terbuka 300×200). `open` 0..1 sampul terbuka, `tilt` sudut kemiringan meja,
 * `pops` elemen di halaman kanan, `left` isi halaman kiri (bagian dalam sampul), `title` judul sampul.
 */
function book(open: string, tilt: string, pops: ThemeNode[], left: ThemeNode[], title: string, vars = ''): ThemeNode {
  return div(`relative h-[200px] w-[300px] shrink-0 [transform-style:preserve-3d] [transform:translateX(calc((1_-_${open})*-75px))_rotateX(${tilt})] ${vars}`, [
    // papan belakang & bayangan di meja
    div(`absolute -bottom-[6px] -right-[6px] -top-[6px] left-1/2 rounded-r-[6px] ${leather} shadow-[0_36px_40px_-14px_rgba(0,0,0,0.75)] [transform:translateZ(-4px)]`),
    // tebal kertas di tepi kanan
    div(`absolute -right-[3px] inset-y-[2px] w-[3px] [background-image:repeating-linear-gradient(90deg,#d9caa9_0_1px,${PAPER}_1px_2px)] [transform:translateZ(-2px)]`),
    div(`absolute inset-y-0 left-1/2 w-1/2 rounded-r-[3px] ${paperR} [transform-style:preserve-3d]`, pops),
    // sampul depan: berengsel di punggung buku, sisi dalamnya menjadi halaman kiri
    div(`absolute -bottom-[6px] -top-[6px] left-1/2 w-[156px] [transform-origin:0_50%] [transform-style:preserve-3d] [transform:translateZ(3px)_rotateY(calc(${open}*-180deg))]`, [
      div(`absolute inset-0 rounded-r-[6px] ${leather} shadow-[inset_4px_0_6px_rgba(0,0,0,0.35)] [backface-visibility:hidden]`, coverFace(title)),
      div(`absolute inset-0 rounded-l-[6px] ${leather} [backface-visibility:hidden] [transform:rotateY(180deg)]`, [
        div(`absolute bottom-[6px] left-[6px] right-0 top-[6px] flex flex-col items-center justify-center rounded-l-[2px] px-4 ${paperL}`, left),
      ]),
    ]),
  ])
}

/**
 * Bingkai foto mempelai berbentuk lengkung (foto dari data undangan, atau nama panggilan bila belum ada foto).
 * `turn` = sudut putar ke arah pasangannya saat bingkai berdiri, agar terasa 3D.
 */
function photoFrame(who: 'groom' | 'bride', up: string, turn: number): ThemeNode {
  return div(`h-full w-full [transform-origin:50%_100%] [transform:rotateY(calc(${up}*${turn}deg))] [backface-visibility:hidden]`, [
    div(`relative h-full w-full rounded-t-full border-2 border-[${GOLD}] bg-[${PAPER}] p-[3px] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.55)]`, [
      div('relative h-full w-full overflow-hidden rounded-t-full', [
        img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div(`absolute inset-0 grid place-items-center bg-[${WINE}]/10`, [el('span', 'font-script text-[18px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
      ]),
      div(`absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-[${GOLD}] bg-[${PAPER}]`),
    ]),
  ])
}

/** Elemen pop-up utama: bingkai foto mempelai pria & wanita yang saling menghadap, cincin di depan. */
const trio = (a: string, b: string, c: string) => [
  pop('left-[10px] top-[46px] h-[94px] w-[62px]', a, photoFrame('groom', a, 16)),
  pop('left-[78px] top-[46px] h-[94px] w-[62px]', b, photoFrame('bride', b, -16)),
  pop('left-[48px] top-[150px] h-[40px] w-[54px]', c, art('cincin', 'Sepasang cincin')),
]

/** Halaman bab (section tengah): kertas buku yang terbalik 3D saat selesai dibaca. */
const page = (z: number) =>
  `uv-leaf relative z-[${z}] mx-2.5 mt-3 rounded-r-[10px] ${paperR} px-7 pb-24 pt-16 text-center shadow-[3px_0_0_#e6dac2,6px_0_0_#d6c6a4,0_24px_40px_-24px_rgba(0,0,0,0.8)]`
const runningHead = p('mb-10 font-body text-[12px] italic tracking-[0.08em] text-muted', 'Kisah {{groom_nickname}} & {{bride_nickname}}')
const folio = (n: string) => p('absolute inset-x-0 bottom-8 font-body text-[13px] italic text-muted', `— ${n} —`)

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${card} text-center`, [
    div(`relative mx-auto h-44 w-36 overflow-hidden rounded-t-full border-2 border-[${GOLD}] bg-[${WINE}]/10 outline outline-1 outline-offset-4 outline-[${GOLD}]/50`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[44px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-6 font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, who === 'groom' ? 'Sang Pangeran' : 'Sang Putri'),
    el('h3', 'mt-1 font-heading text-[23px] italic leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[15px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[14px] text-[${WINE}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// ---------- Sampul: diputar otomatis (uv-play, --uv-t 0..1) ----------
const C_OPEN = sm(ramp(T, 0.12, 3))
const C_TEXT = ramp(T, 0.62, 3.2)
const C_ZOOM = sm(ramp(T, 0.56, 2.3))

// ---------- Pembuka (scroll): kartu berdiri, kamera mendekat, lembar dibalik ----------
const H_FOLD = ramp(S, 0.62, 6)
const H_TURN = sm(ramp(S, 0.7, 3.6))

// ---------- Penutup (scroll): pop-up melipat, sampul menutup ----------
const E_FOLD = ramp(S, 0.06, 4)
const E_OPEN = `calc(1_-_${sm(ramp(S, 0.3, 2.6))})`
const E_END = ramp(S, 0.72, 4)

// Album galeri: urutan halaman lewat nth-child
const PAGES = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${6 - i}]`).join(' ')

export const meta = {
  code: 'LUX-005',
  slug: 'kisah-pop-up',
  name: 'Kisah Pop-Up',
  category: 'elegan',
  description: 'Buku cerita pop-up klasik dan romantis bersampul kulit: buku terbuka sendiri saat undangan dimuat, bingkai foto kedua mempelai dan cincin berdiri dari halaman seperti buku pop-up 3D sementara kamera perlahan mendekat, lalu setiap bab berganti dengan lembar halaman yang dibalik 3D hingga buku kembali tertutup di akhir cerita.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: WINE,
    secondary_color: GOLD,
    accent_color: GOLD,
    background_color: PAPER,
    surface_color: PAPER,
    text_color: INK,
    muted_color: '#86705f',
    font_heading: 'Playfair Display',
    font_body: 'EB Garamond',
    font_script: 'Pinyon Script',
  },
  root_class: `text-[16px] leading-relaxed ${deskBg}`,
  assets: { gedung: `${A}/gedung.svg`, cincin: `${A}/cincin.svg` },
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg', '/theme-assets/lontara-bugis/bride.jpg', '/theme-assets/lontara-bugis/groom.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    // ---------- Sampul: buku terbuka otomatis, pop-up berdiri, kamera zoom-in ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden ${deskBg} px-5 text-center`,
      children: [
        div(`uv-play relative flex w-full flex-col items-center [--uv-dur:7.5s] [--o:${C_OPEN}]`, [
          p(`font-body text-[12px] uppercase tracking-[0.4em] text-[${GOLD}] [opacity:${ramp(T, 0, 5)}]`, 'Sebuah Kisah Cinta'),
          div(`relative mt-2 flex h-[330px] w-full items-center justify-center [perspective:1000px] [opacity:${ramp(T, 0, 6)}] [--z:${C_ZOOM}]`, [
            div('flex items-center justify-center [transform-style:preserve-3d] [transform:translate3d(0,calc(var(--z)*18px),0)_scale(calc(0.95_+_var(--z)*0.1))]', [
              book('var(--o)', 'calc(24deg_+_var(--o)*38deg)', trio(sm(ramp(T, 0.34, 4)), sm(ramp(T, 0.42, 4)), sm(ramp(T, 0.5, 4.5))), [
                p(`font-body text-[8px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Pada suatu hari'),
                p('mt-1.5 font-script text-[24px] leading-[1.1] text-primary', '{{groom_nickname}}'),
                p(`font-heading text-[10px] italic text-[${GOLD}]`, '&'),
                p('font-script text-[24px] leading-[1.1] text-primary', '{{bride_nickname}}'),
                p('mt-1.5 font-body text-[8px] italic text-muted', 'dipertemukan untuk selamanya'),
              ], 'Kisah Kita'),
            ]),
          ]),
          div(`relative -mt-2 [opacity:${C_TEXT}] [transform:translateY(calc((1_-_${C_TEXT})*16px))]`, [
            el('h1', 'font-script text-[46px] leading-[1.1] text-[#f4ecdb]', '{{groom_nickname}} & {{bride_nickname}}'),
            p(`mt-1 font-body text-[13px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{event_date}}'),
            p(`mt-6 font-body text-[14px] italic text-[${PAPER}]/75`, 'Kepada Yth. Bapak/Ibu/Saudara/i'),
            comp('guest_name', `mt-1 block font-heading text-[20px] italic text-[${PAPER}]`, { fallback: 'Tamu Undangan' }),
            div('mt-7', [comp('open_button', btn, { label: 'Buka Undangan' })]),
          ]),
        ]),
      ],
    },
    // ---------- Pembuka: Bab I, kartu nama berdiri, kamera mendekat, lembar dibalik ke Bab II ----------
    {
      type: 'hero',
      class: `uv-scene relative z-[20] h-[calc(var(--uv-vh,100svh)_*_3.2)] ${deskBg}`,
      children: [
        div(stage, [
          div(`pointer-events-none absolute inset-x-0 top-[8%] [opacity:calc(1_-_${ramp(S, 0.2, 5)})]`, [kicker('Bab I'), p(`mt-2 font-heading text-[24px] italic text-[${PAPER}]`, 'Sebuah Awal')]),
          div(`relative flex h-[340px] w-full items-center justify-center [perspective:1000px] [--z:calc(${sm(ramp(S, 0.18, 2.8))}_-_${sm(ramp(S, 0.56, 5))})]`, [
            div('flex items-center justify-center [transform-style:preserve-3d] [transform:translate3d(0,calc(var(--z)*24px),0)_scale(calc(1_+_var(--z)*0.12))]', [
              div(`relative h-[200px] w-[300px] shrink-0 [transform-style:preserve-3d] [transform:rotateX(60deg)] [--k:${H_FOLD}] [--f:${H_TURN}]`, [
                div(`absolute -inset-[6px] rounded-[6px] ${leather} shadow-[0_36px_40px_-14px_rgba(0,0,0,0.75)] [transform:translateZ(-4px)]`),
                // halaman kiri: Bab I
                div(`absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center rounded-l-[3px] px-4 ${paperL}`, [
                  p(`font-body text-[8px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Bab I'),
                  p('mt-1 font-heading text-[13px] italic text-primary', 'Sebuah Awal'),
                  div(`mx-auto my-2 h-px w-10 bg-[${GOLD}]`),
                  p('font-body text-[8.5px] italic leading-snug text-ink/80', 'Di antara ribuan halaman takdir, dua nama akhirnya ditulis pada halaman yang sama.'),
                ]),
                // halaman kanan di bawah lembar: Bab II
                div(`absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center rounded-r-[3px] px-4 ${paperR}`, [
                  p(`font-body text-[8px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Bab II'),
                  p('mt-1 font-heading text-[13px] italic text-primary', 'Ayat Cinta'),
                  div(`mx-auto my-2 h-px w-10 bg-[${GOLD}]`),
                  img('mx-auto w-8', '{{asset.cincin}}'),
                ]),
                // lembar yang dibalik (berengsel di punggung buku)
                div('absolute inset-y-0 right-0 w-1/2 [transform-origin:0_50%] [transform-style:preserve-3d] [transform:translateZ(1px)_rotateY(calc(var(--f)*-180deg))]', [
                  div(`absolute inset-0 rounded-r-[3px] ${paperR} [backface-visibility:hidden]`),
                  div(`absolute inset-0 flex flex-col items-center justify-center rounded-l-[3px] px-4 ${paperL} [backface-visibility:hidden] [transform:rotateY(180deg)]`, [
                    p('font-script text-[20px] leading-tight text-primary', 'dan kisah pun dimulai…'),
                  ]),
                  pop('left-[14px] top-[68px] h-[84px] w-[122px]', `calc(${sm(ramp(S, 0.08, 4))}*(1_-_var(--k)))`,
                    div(`flex h-full w-full flex-col items-center justify-center rounded-[3px] border border-[${GOLD}] bg-[${PAPER}] px-2 shadow-[0_4px_8px_-4px_rgba(0,0,0,0.5)] outline outline-1 outline-offset-[-4px] outline-[${GOLD}]/50 [backface-visibility:hidden]`, [
                      p(`font-body text-[6.5px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'The Wedding Of'),
                      p('mt-0.5 font-script text-[17px] leading-[1.05] text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
                      p('mt-1 font-body text-[7px] uppercase tracking-[0.18em] text-ink', '{{event_date}}'),
                    ])),
                  pop('left-[48px] top-[156px] h-[36px] w-[48px]', `calc(${sm(ramp(S, 0.14, 4))}*(1_-_var(--k)))`, art('cincin', 'Sepasang cincin')),
                ]),
              ]),
            ]),
          ]),
          p(`pointer-events-none absolute inset-x-0 bottom-7 font-body text-[12px] uppercase tracking-[0.35em] text-[${PAPER}]/60 [opacity:calc(1_-_${S}*6)]`, 'Scroll untuk membuka halaman'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: page(19),
      children: [
        runningHead,
        kicker('Bab II'),
        heading('Ayat Cinta'),
        flourish('mt-5'),
        div('uv-z mt-10', [
          p('font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
          p('mt-6 font-body text-[18px] italic leading-relaxed text-ink/85', '“{{quote_text}}”'),
          p(`mt-4 font-body text-[12px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
        ]),
        folio('ii'),
      ],
    },
    {
      type: 'profile',
      class: page(18),
      children: [
        runningHead,
        div('uv-z', [kicker('Bab III'), heading('Sang Tokoh Utama'), flourish('mt-5')]),
        p(`uv-z mx-auto mt-6 max-w-[310px] text-left font-body text-[16px] italic text-ink/85 first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-[46px] first-letter:not-italic first-letter:leading-[0.9] first-letter:text-[${WINE}]`, '{{opening_text}}'),
        div('mt-12 grid gap-12', [person('groom'), person('bride')]),
        folio('iii'),
      ],
    },
    {
      type: 'event',
      class: page(17),
      children: [
        runningHead,
        div('uv-z', [kicker('Bab IV'), heading('Hari yang Dinanti'), flourish('mt-5')]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `rounded-t-full border border-[${GOLD}]/70 bg-white/50 pb-3 pt-5 text-center`,
          number_class: 'block font-heading text-[26px] italic leading-none text-primary',
          label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${GOLD}]`,
        })]),
        div('mt-12 grid gap-10', [
          el('article', `uv-z ${card} text-center`, [
            img('mx-auto mb-3 w-24', '{{asset.gedung}}'),
            p(`font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[24px] italic leading-tight text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[17px] text-ink', '{{item.date}}'),
            p('font-body text-[15px] italic text-muted', '{{item.time}}'),
            flourish('my-5'),
            p('font-heading text-[17px] text-primary', '{{item.venue}}'),
            p('font-body text-[15px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[13px] uppercase tracking-[0.2em] text-primary` })]),
        folio('iv'),
      ],
    },
    {
      type: 'story',
      class: 'relative z-[16]',
      children: [
        div(page(16), [
          runningHead,
          div('uv-z', [kicker('Bab V'), heading('Lembar Demi Lembar'), flourish('mt-5')]),
          div('mt-12 grid gap-12', [
            div('uv-z text-center', [
              p(`font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[21px] italic leading-tight text-primary', '{{item.title}}'),
              p('mx-auto mt-2 max-w-[300px] font-body text-[16px] italic text-ink/80', '{{item.text}}'),
              div(`mx-auto mt-6 h-1.5 w-1.5 rotate-45 bg-[${GOLD}]`),
            ], { repeat: 'story' }),
          ]),
          folio('v'),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: album yang halamannya dibalik ----------
    {
      type: 'gallery',
      class: `uv-scene relative z-[15] h-[calc(var(--uv-vh,100svh)_*_2.6)] ${deskBg}`,
      children: [
        div(stage, [
          div('absolute inset-x-0 top-[8%]', [kicker('Album Kenangan'), p(`mt-2 font-heading text-[30px] italic text-[${PAPER}]`, 'Ilustrasi Kisah Kami')]),
          div('uv-flip-book relative mt-20 h-[330px] w-[250px]', [
            div(`uv-flip-page absolute inset-0 ${PAGES}`, [
              div(`h-full w-full rounded-r-[6px] ${paperR} p-4 shadow-[3px_0_0_#e6dac2,0_20px_40px_-20px_rgba(0,0,0,0.7)] [backface-visibility:hidden] [transform-origin:left_center] [transform:perspective(1200px)_rotateY(calc(clamp(0,${S}*7_-_var(--i,0)*1.05,1)*-180deg))]`, [
                div(`relative h-full w-full border border-[${GOLD}]/60 p-2`, [
                  img('h-full w-full object-cover sepia-[.2]', '{{item.url}}', '{{item.caption}}'),
                  div(`absolute left-0 top-0 h-5 w-5 bg-[linear-gradient(135deg,${GOLD}_50%,transparent_50%)]`),
                  div(`absolute bottom-0 right-0 h-5 w-5 bg-[linear-gradient(-45deg,${GOLD}_50%,transparent_50%)]`),
                ]),
              ]),
            ], { repeat: 'gallery' }),
            div(`uv-flip-end absolute inset-0 z-0 grid place-items-center rounded-r-[6px] ${paperR} p-6`, [
              div('', [
                img('mx-auto w-14', '{{asset.cincin}}'),
                p('mt-3 font-script text-[32px] leading-tight text-primary', 'bersambung…'),
                flourish('mt-3'),
              ]),
            ]),
          ]),
          p(`absolute inset-x-0 bottom-[7%] font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, 'Scroll untuk membalik halaman'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: page(14),
      children: [
        runningHead,
        div('uv-z', [kicker('Bab VI'), heading('Tulis Namamu di Kisah Ini'), flourish('mt-5')]),
        div(`uv-z mt-10 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[3px] border border-[${GOLD}]/60 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${WINE}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[12px] uppercase tracking-[0.2em] text-[${GOLD}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-14 font-heading text-[22px] italic text-primary', 'Catatan di Pinggir Halaman'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/40 py-4`, name_class: 'font-heading text-[16px] italic text-primary' }),
        folio('vi'),
      ],
    },
    {
      type: 'gift',
      class: 'relative z-[13]',
      children: [
        div(page(13), [
          runningHead,
          div('uv-z', [kicker('Bab VII'), heading('Tanda Kasih'), flourish('mt-5')]),
          p('uv-z mx-auto mt-5 max-w-[300px] font-body text-[16px] italic text-ink/80', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} text-center`, [
              p(`font-body text-[12px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[23px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[15px] italic text-muted', 'a.n. {{item.holder}}'),
              flourish('my-5'),
              comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}] px-5 py-2 font-body text-[12px] uppercase tracking-[0.2em] text-primary` }),
            ], { repeat: 'gifts' }),
          ]),
          folio('vii'),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: pop-up melipat, sampul menutup — Tamat ----------
    {
      type: 'closing',
      class: `uv-scene relative z-[12] mt-3 h-[calc(var(--uv-vh,100svh)_*_2.6)] ${deskBg}`,
      children: [
        div(stage, [
          p(`max-w-[300px] font-body text-[16px] italic text-[${PAPER}]/80 [opacity:calc(1_-_${ramp(S, 0.2, 5)})]`, '{{closing_text}}'),
          div(`relative my-2 flex h-[330px] w-full shrink-0 items-center justify-center [perspective:1000px] [--o:${E_OPEN}]`, [
            div(`flex items-center justify-center [transform-style:preserve-3d] [transform:scale(calc(0.92_+_var(--o)*0.04))]`, [
              book('var(--o)', 'calc(24deg_+_var(--o)*38deg)', trio(`calc(1_-_${E_FOLD})`, `calc(1_-_${E_FOLD})`, `calc(1_-_${E_FOLD})`), [
                p('font-script text-[26px] leading-tight text-primary', 'dan mereka hidup bahagia selamanya'),
              ], 'Tamat'),
            ]),
          ]),
          div(`[opacity:${E_END}] [transform:translateY(calc((1_-_${E_END})*16px))]`, [
            p(`font-body text-[15px] italic text-[${PAPER}]/80`, '{{closing_greeting}}'),
            p(`mt-1 font-script text-[40px] text-[${PAPER}]`, '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
