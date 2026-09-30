import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kotak Rahasia — pengalaman "unboxing" 3D yang misterius & eksklusif: kotak perhiasan berlapis pernis hitam
 * dengan list emas dan segel lilin, dibuat murni dari CSS (aset hanya cincin berlian). Alur:
 * 1. sampul: kotak tertutup berputar pelan memamerkan ukiran nama pasangan — "Ketuk untuk Membuka"
 * 2. setelah diketuk (uv-play): segel lilin patah, tutup kotak terangkat 3D, cahaya & partikel memancar
 * 3. sepasang cincin melayang keluar dari kotak, teks tanggal, waktu & lokasi mengorbit di sekelilingnya
 * 4. geser ke atas (scroll): kotak & cincin mengecil ke sudut, baki beludru berisi pesan personal naik
 *    dari dasar kotak, disusul form RSVP
 * Penutup: cincin kembali masuk, tutup menutup dan segel lilin terpasang lagi.
 */
const BG = '#0b0a10'
const LACQ = '#17151f'
const GOLD = '#d4b26a'
const CHAMP = '#f3e6c4'
const VELVET = '#6d1433'
const WAX = '#8e1b2c'
const A = '/theme-assets/kotak-rahasia'

const T = 'var(--uv-t,1)'
const S = 'var(--uv-s,1)'
const ramp = (v: string, from: number, speed: number) => `clamp(0,(${v}_-_${from})*${speed},1)`
const sm = (r: string) => `calc(${r}*${r}*(3_-_2*${r}))`

const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-5 text-center'
const glowBg = `bg-[${BG}] [background-image:radial-gradient(ellipse_at_50%_45%,rgba(212,178,106,0.16),transparent_62%)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full border border-[${GOLD}] bg-[${GOLD}] px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-[${BG}] shadow-[0_10px_30px_-10px_rgba(212,178,106,0.6)]`
/** Baki beludru: kartu gelap berbingkai emas dengan kilau beludru di atas. */
const tray = `rounded-[18px] border border-[${GOLD}]/45 bg-[#14121a] [background-image:radial-gradient(ellipse_at_50%_0%,rgba(109,20,51,0.55),transparent_60%)] px-6 pb-8 pt-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(243,230,196,0.12)]`
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.45em] text-[${GOLD}]`, t)
const heading = (t: string) => el('h2', `mt-2 font-heading text-[34px] font-medium leading-[1.1] text-[${CHAMP}]`, t)
const rule = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-px w-12 bg-gradient-to-r from-transparent to-[${GOLD}]`), div(`h-1.5 w-1.5 rotate-45 bg-[${GOLD}]`), div(`h-px w-12 bg-gradient-to-l from-transparent to-[${GOLD}]`),
])

// ---------- Kotak perhiasan 3D (170 × 96 × 170, tutup 26) ----------
const face = `absolute border border-[${GOLD}]/55 bg-[${LACQ}] [background-image:linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%,rgba(0,0,0,0.3))]`
const engrave = (cls: string, t: string) => p(`font-script text-[${GOLD}] [text-shadow:0_1px_0_rgba(0,0,0,0.8)] ${cls}`, t)
const trim = div(`absolute inset-[5px] border border-[${GOLD}]/35`)

/**
 * Segel lilin di sisi depan. `crack` 0..1 = segel patah jadi dua & jatuh, `show` 0..1 = segel (kembali) terpasang.
 */
function seal(crack: string, show = '1'): ThemeNode {
  const disc = `h-[34px] w-[34px] rounded-full bg-[${WAX}] shadow-[inset_0_0_0_3px_#a8283a,inset_0_0_0_5px_#6f1020,0_2px_5px_rgba(0,0,0,0.6)] grid place-items-center`
  const mark = el('span', `font-script text-[17px] leading-none text-[${GOLD}]`, '&')
  return div(`absolute left-1/2 top-0 -ml-[17px] -mt-[17px] h-[34px] w-[34px] [--c:${crack}] [--sh:${show}] [transform:translateZ(2px)_scale(calc(1.7_-_var(--sh)*0.7))] [opacity:var(--sh)]`, [
    div('absolute inset-y-0 left-0 w-[17px] overflow-hidden [transform:translate(calc(var(--c)*-16px),calc(var(--c)*34px))_rotate(calc(var(--c)*-45deg))] [opacity:calc(1_-_var(--c))]', [div(disc, [mark])]),
    div('absolute inset-y-0 right-0 w-[17px] overflow-hidden [transform:translate(calc(var(--c)*16px),calc(var(--c)*34px))_rotate(calc(var(--c)*45deg))] [opacity:calc(1_-_var(--c))]', [div(`${disc} -ml-[17px]`, [mark])]),
  ])
}

/** Kotak perhiasan. `lid` 0..1 = tutup terangkat, `sealNode` segel di depan. */
function jewelBox(lid: string, sealNode: ThemeNode): ThemeNode {
  return div('relative h-[96px] w-[170px] [transform-style:preserve-3d]', [
    // badan kotak
    div(`${face} inset-0 [transform:translateZ(85px)]`, [
      trim,
      div('absolute inset-0 flex flex-col items-center justify-center pt-3', [
        engrave('text-[19px] leading-none', '{{groom_nickname}} & {{bride_nickname}}'),
        p(`mt-1.5 font-body text-[6.5px] uppercase tracking-[0.35em] text-[${GOLD}]/80`, '{{event_date}}'),
      ]),
      sealNode,
    ]),
    div(`${face} inset-0 [transform:rotateY(180deg)_translateZ(85px)]`, [trim, div('absolute inset-0 grid place-items-center', [engrave('text-[26px]', '&')])]),
    div(`${face} inset-0 [transform:rotateY(90deg)_translateZ(85px)]`, [trim, div('absolute inset-0 grid place-items-center', [engrave('text-[20px]', '{{bride_nickname}}')])]),
    div(`${face} inset-0 [transform:rotateY(-90deg)_translateZ(85px)]`, [trim, div('absolute inset-0 grid place-items-center', [engrave('text-[20px]', '{{groom_nickname}}')])]),
    div(`${face} left-0 top-[-37px] h-[170px] w-[170px] [transform:rotateX(-90deg)_translateZ(48px)]`),
    // lantai beludru di dalam kotak
    div(`absolute left-[4px] top-[-33px] h-[162px] w-[162px] bg-[${VELVET}] [background-image:radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.18),transparent_60%)] [transform:rotateX(-90deg)_translateZ(40px)]`),
    // tutup: berengsel di tepi belakang atas
    div(`absolute left-0 top-[-26px] h-[26px] w-[170px] [transform-style:preserve-3d] [transform-origin:50%_100%_-85px] [transform:rotateX(calc(${lid}*108deg))]`, [
      div(`${face} inset-0 [transform:translateZ(85px)]`),
      div(`${face} inset-0 [transform:rotateY(180deg)_translateZ(85px)]`),
      div(`${face} inset-0 [transform:rotateY(90deg)_translateZ(85px)]`),
      div(`${face} inset-0 [transform:rotateY(-90deg)_translateZ(85px)]`),
      div(`${face} left-0 top-[-72px] h-[170px] w-[170px] [transform:rotateX(90deg)_translateZ(13px)]`, [
        div(`absolute inset-[10px] rounded-full border border-[${GOLD}]/60`),
        div(`absolute inset-[18px] rounded-full border border-[${GOLD}]/30`),
        div('absolute inset-0 grid place-items-center', [engrave('text-[40px]', '&')]),
      ]),
      // sisi dalam tutup: satin
      div(`absolute left-[4px] top-[-68px] h-[162px] w-[162px] bg-[#7d1d3d] [background-image:linear-gradient(160deg,rgba(255,255,255,0.22),transparent_55%)] [transform:rotateX(-90deg)_translateZ(12px)]`),
    ]),
  ])
}

/** Panggung 3D kotak: perspektif + sudut pandang. `pose` = transform tambahan (mis. rotateY). */
const boxStage = (pose: string, inner: ThemeNode, cls = '') =>
  div(`relative flex h-[220px] w-full items-center justify-center [perspective:900px] ${cls}`, [
    div(`[transform-style:preserve-3d] [transform:rotateX(-24deg)_${pose}]`, [inner]),
  ])

/** Partikel cahaya yang memancar dari dalam kotak (x = posisi, delay = urutan). */
function sparks(base: number): ThemeNode[] {
  const pts: [number, number, number][] = [[-40, 0, 150], [-18, 0.05, 190], [8, 0.02, 170], [30, 0.08, 200], [48, 0.04, 140], [-55, 0.1, 120], [0, 0.12, 220], [22, 0.15, 160]]
  return pts.map(([x, d, h]) => {
    const r = ramp(T, base + d, 2.6)
    return div(`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[${CHAMP}] shadow-[0_0_8px_2px_rgba(243,230,196,0.8)] [transform:translate(${x}px,calc(${r}*-${h}px))] [opacity:calc(${r}*(1_-_${r})*4)]`)
  })
}

// Tanda-tanda waktu sampul/pembuka
const H_CRACK = sm(ramp(T, 0.04, 6))
const H_LID = sm(ramp(T, 0.14, 3.2))
const H_GLOW = ramp(T, 0.22, 3)
const H_UP = sm(ramp(T, 0.36, 2.8))
const H_TXT = ramp(T, 0.62, 3.2)
// Geser ke atas: kotak mengecil ke sudut, baki pesan naik
const H_MIN = sm(ramp(S, 0.28, 2.2))
const H_PANEL = sm(ramp(S, 0.42, 2.4))

// Penutup: cincin turun, tutup menutup, segel terpasang lagi
const E_DOWN = `calc(1_-_${sm(ramp(S, 0.04, 3.2))})`
const E_LID = `calc(1_-_${sm(ramp(S, 0.3, 3))})`
const E_SEAL = ramp(S, 0.6, 5)
const E_END = ramp(S, 0.7, 4)

/** Label informasi yang mengorbit cincin. */
const ORBIT = ['{{couple_names}}', '{{event_date}}', '{{event_time}}', '{{event_venue}}']

// Galeri: sudut tiap foto (6 posisi)
const RING = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--a:${i * 60}deg]`).join(' ')

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${tray} text-center`, [
    div(`relative mx-auto h-48 w-36 overflow-hidden rounded-[50%] border-2 border-[${GOLD}] outline outline-1 outline-offset-4 outline-[${GOLD}]/40 bg-[${VELVET}]/40`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', `font-script text-[40px] text-[${GOLD}]`, `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-6 font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', `mt-1 font-heading text-[24px] font-medium leading-tight text-[${CHAMP}]`, `{{${who}_name}}`),
    p(`mt-1 font-body text-[13px] text-[${CHAMP}]/65`, `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${GOLD}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-006',
  slug: 'kotak-rahasia',
  name: 'Kotak Rahasia',
  category: 'elegan',
  description: 'Pengalaman membuka hadiah yang misterius dan eksklusif: kotak perhiasan 3D berukir nama pasangan berputar pelan, diketuk untuk membuka, segel lilin patah dan tutupnya terangkat memancarkan cahaya, lalu sepasang cincin melayang keluar dikelilingi tanggal dan lokasi yang mengorbit. Geser ke atas, kotak mengecil dan baki beludru berisi pesan serta RSVP naik dari dasarnya.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: GOLD,
    secondary_color: VELVET,
    accent_color: GOLD,
    background_color: BG,
    surface_color: '#14121a',
    text_color: CHAMP,
    muted_color: '#a79f8f',
    font_heading: 'Cormorant Garamond',
    font_body: 'Lato',
    font_script: 'Great Vibes',
  },
  root_class: `text-[15px] leading-relaxed text-[${CHAMP}] ${glowBg}`,
  assets: { cincin: `${A}/cincin.svg` },
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg', '/theme-assets/lontara-bugis/bride.jpg', '/theme-assets/lontara-bugis/groom.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    // ---------- 1. Kotak tertutup berputar, ketuk untuk membuka ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden ${glowBg} px-6 text-center`,
      children: [
        kicker('Sebuah Hadiah Untukmu'),
        div('mt-14', [boxStage('', div('uv-spin3d [transform-style:preserve-3d]', [jewelBox('0', seal('0'))]))]),
        div(`mx-auto -mt-2 h-4 w-44 rounded-[50%] bg-black/60 blur-md`),
        el('h1', `mt-10 font-heading text-[30px] font-medium leading-tight text-[${CHAMP}]`, '{{groom_nickname}} & {{bride_nickname}}'),
        rule('mt-4'),
        p(`mt-5 font-body text-[13px] text-[${CHAMP}]/60`, 'Kepada Yth. Bapak/Ibu/Saudara/i'),
        comp('guest_name', `mt-1 block font-heading text-[21px] italic text-[${CHAMP}]`, { fallback: 'Tamu Undangan' }),
        // seluruh layar bisa diketuk
        comp('open_button', `absolute inset-0 z-10 flex items-end justify-center pb-[9%] font-body text-[11px] uppercase tracking-[0.4em] text-[${GOLD}]`, { label: '✦ Ketuk untuk Membuka ✦' }),
      ],
    },
    // ---------- 2–4. Membuka kotak, cincin & info mengorbit, geser ke atas ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.8)] ${glowBg}`,
      children: [
        div(stage, [
          div(`uv-play absolute inset-0 [--uv-dur:8s] [--m:${H_MIN}] [--up:${H_UP}]`, [
            // kelompok kotak + cincin: mengecil ke sudut kanan atas saat digeser
            div(`absolute inset-0 [transform:translate(calc(var(--m)*118px),calc(var(--m)*var(--uv-vh,100svh)*-0.36))_scale(calc(1_-_var(--m)*0.66))]`, [
              div(`absolute inset-x-0 top-[50%] [--lid:${H_LID}] [--g:${H_GLOW}]`, [
                // cahaya dari dalam kotak
                div(`absolute left-[calc(50%_-_150px)] top-[-150px] h-[260px] w-[300px] rounded-[50%] [background-image:radial-gradient(ellipse_at_50%_70%,rgba(255,240,200,0.75),rgba(212,178,106,0.25)_40%,transparent_70%)] [opacity:var(--g)] [transform:scale(calc(0.4_+_var(--g)*0.6))]`),
                boxStage('rotateY(-26deg)', jewelBox('var(--lid)', seal(H_CRACK))),
                div('absolute inset-x-0 top-[40px]', sparks(0.24)),
              ]),
              // cincin melayang keluar
              div('absolute left-1/2 top-[50%] h-[112px] w-[150px] -ml-[75px] [opacity:var(--up)] [transform:translateY(calc(var(--up)*-200px_+_20px))_scale(calc(0.4_+_var(--up)*0.6))]', [
                img('uv-float h-full w-full drop-shadow-[0_0_18px_rgba(243,230,196,0.55)]', '{{asset.cincin}}', 'Sepasang cincin'),
              ]),
              // info yang mengorbit cincin
              div(`absolute inset-x-0 top-[calc(50%_-_92px)] h-[40px] [perspective:800px] [opacity:${H_TXT}]`, [
                div('[transform-style:preserve-3d] [transform:rotateX(-14deg)]', [
                  div('uv-spin3d relative mx-auto h-[40px] w-[220px] [transform-style:preserve-3d]', ORBIT.map((t, i) =>
                    p(`absolute inset-0 truncate font-body text-[12px] uppercase tracking-[0.22em] text-[${CHAMP}] [backface-visibility:hidden] [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_0_14px_rgba(212,178,106,0.7)] [transform:rotateY(${i * 90}deg)_translateZ(150px)]`, t))),
                ]),
              ]),
            ]),
            p(`pointer-events-none absolute inset-x-0 top-[9%] font-heading text-[26px] italic text-[${CHAMP}] [opacity:calc(${H_TXT}_-_var(--m)*2)]`, 'Untuk Selamanya'),
            p(`pointer-events-none absolute inset-x-0 bottom-7 font-body text-[11px] uppercase tracking-[0.4em] text-[${GOLD}] [opacity:calc(${H_TXT}_-_var(--m)*3)]`, '↑ Geser ke atas'),
            // baki beludru naik dari dasar kotak
            div(`absolute inset-x-5 bottom-8 [opacity:${H_PANEL}] [transform:translateY(calc((1_-_${H_PANEL})*120%))]`, [
              div(`${tray} text-center`, [
                kicker('Pesan untukmu'),
                p(`mt-3 font-heading text-[19px] italic leading-snug text-[${CHAMP}]`, '{{opening_text}}'),
                rule('mt-5'),
                p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Konfirmasi kehadiran di bawah ↓'),
              ]),
            ]),
          ]),
        ]),
      ],
    },
    {
      type: 'rsvp',
      class: `relative px-5 pb-20 pt-6 text-center`,
      children: [
        div(`uv-z ${tray} text-left`, [
          div('text-center', [kicker('RSVP'), heading('Konfirmasi Kehadiran'), rule('mt-4')]),
          div('mt-6', [comp('rsvp_form', '', {
            input_class: `w-full rounded-[10px] border border-[${GOLD}]/40 bg-[${BG}] px-4 py-3 font-body text-[16px] text-[${CHAMP}] outline-none focus:border-[${GOLD}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${GOLD}]`,
          })]),
        ]),
        el('h3', `uv-z mb-4 mt-14 font-heading text-[24px] italic text-[${CHAMP}]`, 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/25 py-4`, name_class: `font-heading text-[17px] text-[${GOLD}]`, text_class: `text-[${CHAMP}]/80` }),
      ],
    },
    {
      type: 'quote',
      class: 'relative px-7 py-20 text-center',
      children: [
        div('uv-z', [
          img('mx-auto w-16 opacity-80', '{{asset.cincin}}'),
          p(`mt-6 font-arabic text-[22px] leading-loose text-[${CHAMP}]`, '{{quote_arabic}}'),
          p(`mt-5 font-heading text-[19px] italic leading-relaxed text-[${CHAMP}]/85`, '“{{quote_text}}”'),
          p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative px-6 py-16 text-center',
      children: [
        div('uv-z', [kicker('Mempelai'), heading('Dua Permata, Satu Ikatan'), rule('mt-4')]),
        div('mt-10 grid gap-10', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: 'relative px-6 py-16 text-center',
      children: [
        div('uv-z', [kicker('Waktu & Tempat'), heading('Hari Istimewa'), rule('mt-4')]),
        div('uv-z mt-8', [comp('countdown', '', {
          item_class: `rounded-[12px] border border-[${GOLD}]/45 bg-[#14121a] pb-3 pt-4 text-center shadow-[inset_0_1px_0_rgba(243,230,196,0.12)]`,
          number_class: `block font-heading text-[28px] leading-none text-[${GOLD}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${CHAMP}]/60`,
        })]),
        div('mt-10 grid gap-8', [
          el('article', `uv-z ${tray} text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.day}}'),
            el('h3', `mt-1 font-heading text-[26px] font-medium leading-tight text-[${CHAMP}]`, '{{item.name}}'),
            p(`mt-2 font-body text-[15px] text-[${CHAMP}]`, '{{item.date}}'),
            p(`font-body text-[14px] text-[${CHAMP}]/65`, '{{item.time}}'),
            rule('my-5'),
            p(`font-heading text-[18px] text-[${CHAMP}]`, '{{item.venue}}'),
            p(`font-body text-[13px] text-[${CHAMP}]/65`, '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-8', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${GOLD}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative px-6',
      children: [
        div('py-16 text-center', [
          div('uv-z', [kicker('Kisah Kami'), heading('Perjalanan Cinta'), rule('mt-4')]),
          div('mt-10 grid gap-6', [
            div(`uv-z ${tray} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.date}}'),
              el('h3', `mt-1 font-heading text-[22px] font-medium leading-tight text-[${CHAMP}]`, '{{item.title}}'),
              p(`mt-2 font-body text-[14px] text-[${CHAMP}]/75`, '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: etalase foto yang berputar ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] ${glowBg}`,
      children: [
        div(stage, [
          div('', [kicker('Galeri'), heading('Koleksi Kenangan')]),
          div('mt-14 [perspective:900px]', [
            div(`uv-ring relative h-[210px] w-[150px] [transform-style:preserve-3d] [transform:rotateX(-8deg)_rotateY(calc(${S}_*_-330deg))]`, [
              div(`uv-ring-item absolute inset-0 [backface-visibility:hidden] ${RING} [transform:rotateY(var(--a,0deg))_translateZ(185px)]`, [
                div(`h-full w-full rounded-[12px] border border-[${GOLD}] bg-[#14121a] p-1.5 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.9),0_0_20px_-6px_rgba(212,178,106,0.5)]`, [
                  img('h-full w-full rounded-[8px] object-cover', '{{item.url}}', '{{item.caption}}'),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ]),
          p(`mt-[84px] font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]/70`, 'Scroll untuk memutar'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: 'px-6',
      children: [
        div('py-16 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital'), rule('mt-4')]),
          p(`uv-z mx-auto mt-4 max-w-[300px] font-body text-[14px] text-[${CHAMP}]/70`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-6', [
            div(`uv-z ${tray} text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.bank}}'),
              p(`mt-2 font-heading text-[26px] tracking-wider text-[${CHAMP}]`, '{{item.number}}'),
              p(`font-body text-[13px] text-[${CHAMP}]/65`, 'a.n. {{item.holder}}'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}] px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-[${GOLD}]` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: cincin kembali masuk, tutup menutup, segel terpasang ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] ${glowBg}`,
      children: [
        div(stage, [
          p(`max-w-[300px] font-body text-[14px] text-[${CHAMP}]/70 [opacity:calc(1_-_${ramp(S, 0.25, 5)})]`, '{{closing_text}}'),
          div(`relative mt-6 h-[330px] w-full [--dn:${E_DOWN}]`, [
            div('absolute inset-x-0 top-[110px]', [boxStage('rotateY(-26deg)', jewelBox(E_LID, seal('0', E_SEAL)))]),
            div('absolute left-1/2 top-[50px] h-[112px] w-[150px] -ml-[75px] [opacity:var(--dn)] [transform:translateY(calc(var(--dn)*-110px_+_90px))_scale(calc(0.35_+_var(--dn)*0.65))]', [
              img('h-full w-full drop-shadow-[0_0_18px_rgba(243,230,196,0.55)]', '{{asset.cincin}}', 'Sepasang cincin'),
            ]),
          ]),
          div(`[opacity:${E_END}] [transform:translateY(calc((1_-_${E_END})*16px))]`, [
            p(`font-body text-[14px] text-[${CHAMP}]/70`, '{{closing_greeting}}'),
            p(`mt-1 font-script text-[42px] text-[${GOLD}]`, '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
