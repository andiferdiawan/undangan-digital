import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Tongkonan Rindu — adat Toraja yang lapang & elegan, 3 warna saja (gading, hitam arang, merah Toraja) dan
 * 2 aset (rumah tongkonan beratap perahu & ukiran pa'barre allo). Konsep 3D mengikuti scroll:
 * - pembuka: tongkonan datang dari kejauhan sambil berputar pelan (rotateY); setelah cukup dekat rumah turun
 *   keluar layar, matahari pa'barre allo terbit dari balik atap sambil berputar 3D dan kartu undangan muncul
 * - tengah: kartu datang dari kejauhan (uv-z), pita segitiga ukiran pa'ssura' sebagai aksen
 * - galeri: lembar foto tersingkap ke atas satu per satu (uv-flip-book)
 * - penutup: tongkonan naik kembali ke layar dan matahari terbenam di balik atapnya
 */
const IVORY = '#f8f3ea'
const CHAR = '#2b2522'
const RED = '#a3322a'
const A = '/theme-assets/tongkonan-rindu'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:900px]'
const card = `rounded-[3px] border border-[${RED}]/60 bg-white/75 px-7 pb-8 pt-7 shadow-[0_24px_50px_-34px_rgba(43,37,34,0.5)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${CHAR}] px-7 py-3 font-body text-[12px] uppercase tracking-[0.28em] text-[${IVORY}]`
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.4em] text-[${RED}]`, t)
const heading = (t: string, light = false) => el('h2', `mt-3 font-heading text-[26px] leading-[1.2] tracking-[0.06em] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)
/** Garis pemisah: benang emas dengan belah ketupat kecil. */
const divider = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-px w-14 bg-[${RED}]`), div(`h-2 w-2 rotate-45 border border-[${RED}]`), div(`h-px w-14 bg-[${RED}]`),
])
/** Pita segitiga ukiran pa'ssura' Toraja — murni CSS. */
const sabbe = (cls = '') => div(`mx-auto h-[7px] w-36 [background-image:conic-gradient(from_135deg_at_50%_0,${RED}_90deg,transparent_0)] [background-size:9px_7px] ${cls}`)

/** Kartu undangan berbingkai emas. */
function letter(inner: ThemeNode[], cls = ''): ThemeNode {
  return div(`flex h-[196px] w-[210px] flex-col items-center justify-center rounded-[3px] border border-[${RED}]/70 bg-[${IVORY}] px-5 py-5 text-center shadow-[0_10px_26px_-12px_rgba(0,0,0,0.3)] outline outline-1 outline-offset-[-7px] outline-[${RED}]/40 ${cls}`, inner)
}

/**
 * Lembah & tongkonan 3D. near = 0..1 rumah dari kejauhan, turn = sudut putar rumah, lift = 0..1 rumah turun
 * keluar layar, sunY/spin = posisi & putaran matahari pa'barre allo, sunOp = kemunculan matahari.
 * `front` diletakkan di bawah matahari (mis. kartu undangan). Semua berupa ekspresi CSS.
 */
function valley(o: { near: string, turn: string, lift: string, sunY: string, spin: string, sunOp: string, front?: ThemeNode }): ThemeNode {
  return div('relative h-[320px] w-[320px] shrink-0 [perspective:700px]', [
    ...(o.front ? [o.front] : []),
    // matahari pa'barre allo (di balik atap)
    div(`absolute left-1/2 top-[70px] -ml-[36px] w-[72px] [opacity:${o.sunOp}] [transform:translateY(${o.sunY})_rotateY(${o.spin})]`, [
      img('block w-full', '{{asset.barre}}', "Ukiran pa'barre allo"),
    ]),
    // tanah & rumah — turun bersama saat kamera "naik"
    div(`absolute inset-0 [transform:translateY(calc(${o.lift}_*_480px))]`, [
      div(`absolute inset-x-[-40px] bottom-[40px] h-px bg-[${RED}]`),
      div('absolute inset-x-0 bottom-[40px] flex justify-center', [
        div(`w-[280px] [transform-origin:50%_100%] [transform:scale(calc(0.25_+_${o.near}_*_0.75))_rotateY(${o.turn})]`, [
          img('block w-full', '{{asset.tongkonan}}', 'Rumah adat tongkonan'),
        ]),
      ]),
    ]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${card} text-center`, [
    div(`relative mx-auto h-44 w-36 overflow-hidden rounded-t-full border border-[${RED}] bg-[${CHAR}]/10 outline outline-1 outline-offset-4 outline-[${RED}]/50`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[44px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    sabbe('mt-6'),
    p(`mt-5 font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[21px] leading-tight tracking-[0.04em] text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${RED}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Adegan pembuka: rumah mendekat, lalu turun keluar layar; matahari terbit & kartu undangan muncul
const NEAR = ramp(0.02, 2.4)
const LIFT = ramp(0.46, 2.6)
const LETTER = ramp(0.62, 3.2)
// Adegan penutup: rumah naik kembali, matahari terbenam di balik atap
const RISE = ramp(0.06, 2.2)

// Lembar galeri: indeks & tumpukan (lembar pertama di atas) lewat nth-child pada tiap lembar
const PAGES = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${6 - i}]`).join(' ')

export const meta = {
  code: 'ADT-007',
  slug: 'tongkonan-rindu',
  name: 'Tongkonan Rindu',
  category: 'adat',
  description: 'Adat Toraja yang lapang dan elegan, tiga warna (gading, hitam arang, merah Toraja) dengan efek 3D saat di-scroll: rumah tongkonan datang dari kejauhan, matahari ukiran pa\'barre allo terbit sambil berputar, foto tersingkap satu per satu, dan tongkonan kembali di akhir.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: CHAR,
    secondary_color: RED,
    accent_color: RED,
    background_color: IVORY,
    surface_color: IVORY,
    text_color: '#2b2522',
    muted_color: '#7a6a62',
    font_heading: 'Cinzel',
    font_body: 'Lora',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { tongkonan: `${A}/tongkonan.svg`, barre: `${A}/barre-allo.svg` },
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[${IVORY}] px-8 text-center`,
      children: [
        div(`pointer-events-none absolute inset-5 rounded-t-[999px] border border-[${RED}]/45`),
        kicker('Undangan Pernikahan'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-6 font-script text-[56px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[18px] text-[${RED}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        divider('uv-reveal uv-d2 mt-5'),
        p('uv-reveal uv-d2 mt-4 font-body text-[13px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 relative mx-auto mt-8 w-44 pt-3', [img('absolute left-1/2 top-0 w-11 -translate-x-1/2 motion-safe:animate-spin motion-safe:[animation-duration:24s]', '{{asset.barre}}', ''), img('relative block w-full', '{{asset.tongkonan}}', 'Rumah adat tongkonan')]),
        div('uv-reveal uv-d4 relative mt-7', [
          p('font-body text-[13px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[19px] tracking-[0.04em] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-8', [comp('open_button', btn, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Pembuka: tongkonan mendekat, matahari terbit, kartu undangan muncul ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[11%] [opacity:calc(1_-_${ramp(0.4, 3)})]`, [kicker('Kabar bahagia dari tongkonan'), divider('mt-4')]),
          valley({
            near: NEAR,
            turn: `calc((1_-_${NEAR})_*_-40deg)`,
            lift: LIFT,
            sunY: `calc(${LIFT}_*_-60px)`,
            spin: `calc(${LIFT}_*_360deg)`,
            sunOp: NEAR,
            front: div(`absolute inset-0 flex items-center justify-center [opacity:${LETTER}] [transform:translateY(calc((1_-_${LETTER})_*_36px))_scale(calc(0.9_+_${LETTER}_*_0.1))]`, [
              letter([
                p(`font-body text-[7.5px] uppercase tracking-[0.28em] text-[${RED}]`, 'The Wedding Of'),
                p('mt-2 font-script text-[28px] leading-[1.1] text-primary', '{{groom_nickname}}'),
                p(`font-heading text-[11px] leading-none text-[${RED}]`, '&'),
                p('font-script text-[28px] leading-[1.1] text-primary', '{{bride_nickname}}'),
                sabbe('mt-2.5 !w-20'),
                p('mt-2.5 font-body text-[8px] uppercase tracking-[0.22em] text-primary', '{{event_date}}'),
              ], 'scale-[1.25] pt-10'),
            ]),
          }),
          p(`pointer-events-none absolute inset-x-0 bottom-9 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk membuka'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${CHAR}] px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          p(`font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          divider('my-6'),
          p(`font-body text-[16px] italic leading-relaxed text-[${IVORY}]/85`, '“{{quote_text}}”'),
          p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${RED}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-7 py-24 text-center',
      children: [
        div('uv-z', [kicker('Mempelai'), heading('Dua Hati, Satu Niat'), divider('mt-5')]),
        p('uv-z mx-auto mt-5 max-w-[300px] font-body text-[14px] italic text-muted', '{{opening_text}}'),
        div('mt-12 grid gap-12', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${CHAR}] px-7 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Waktu & Tempat'), heading('Hari Bahagia', true), divider('mt-5')]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `rounded-t-full border border-[${RED}]/60 pb-3 pt-5 text-center`,
          number_class: `block font-heading text-[26px] leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${RED}]`,
        })]),
        div('mt-12 grid gap-10', [
          el('article', `uv-z ${card} bg-[${IVORY}] text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[22px] leading-tight tracking-[0.04em] text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[15px] text-ink', '{{item.date}}'),
            p('font-body text-[14px] italic text-muted', '{{item.time}}'),
            sabbe('my-5'),
            p('font-heading text-[16px] tracking-[0.04em] text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${RED}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Kisah Kami'), heading('Perjalanan Cinta'), divider('mt-5')]),
          div('mt-12 grid gap-12', [
            div('uv-z text-center', [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[19px] leading-tight tracking-[0.04em] text-primary', '{{item.title}}'),
              p('mx-auto mt-2 max-w-[300px] font-body text-[14px] italic text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: lembar foto tersingkap ke atas satu per satu ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div('absolute inset-x-0 top-[9%]', [kicker('Galeri'), heading('Momen Kami')]),
          div('uv-flip-book relative mt-16 h-[320px] w-[250px]', [
            div(`uv-flip-page absolute inset-0 ${PAGES}`, [
              div(`h-full w-full rounded-t-[125px] border border-[${RED}] bg-white p-2.5 shadow-[0_22px_40px_-22px_rgba(43,37,34,0.55)] [backface-visibility:hidden] [transform-origin:top_center] [transform:perspective(1100px)_rotateX(calc(clamp(0,${S}*7_-_var(--i,0)*1.05,1)*100deg))]`, [
                img('h-full w-full rounded-t-[118px] object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
            div(`uv-flip-end absolute inset-0 z-0 grid place-items-center rounded-t-[125px] border border-[${RED}] bg-[${CHAR}] p-6`, [
              div('', [
                p(`font-script text-[34px] leading-tight text-[${IVORY}]`, 'semoga sakinah, mawaddah, wa rahmah'),
                divider('mt-4'),
              ]),
            ]),
          ]),
          p(`absolute inset-x-0 bottom-[7%] font-body text-[11px] uppercase tracking-[0.35em] text-muted`, 'Scroll untuk menyingkap'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-7 py-24 text-center',
      children: [
        div('uv-z', [kicker('Konfirmasi Kehadiran'), heading('Kabari Kami'), divider('mt-5')]),
        div(`uv-z mt-10 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[2px] border border-[${RED}]/50 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${CHAR}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${RED}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-14 font-heading text-[20px] tracking-[0.04em] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${RED}]/40 py-4`, name_class: 'font-heading text-[15px] tracking-[0.04em] text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${CHAR}] px-7`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true), divider('mt-5')]),
          p(`uv-z mx-auto mt-5 max-w-[300px] font-body text-[14px] italic text-[${IVORY}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} bg-[${IVORY}] text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[22px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] italic text-muted', 'a.n. {{item.holder}}'),
              sabbe('my-5'),
              comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${RED}] px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-primary` }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: tongkonan naik kembali, matahari terbenam di balik atap ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div('px-8', [
            p('font-body text-[14px] italic text-muted', '{{closing_text}}'),
          ]),
          valley({
            near: '1',
            turn: '0deg',
            lift: `calc(1_-_${RISE})`,
            sunY: `calc((1_-_${RISE})_*_-60px)`,
            spin: `calc((1_-_${RISE})_*_-360deg)`,
            sunOp: '1',
          }),
          div(`[opacity:${ramp(0.6, 4)}]`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${RED}]`, 'Terima Kasih'),
            p('mt-2 font-body text-[13px] italic text-muted', '{{closing_greeting}}'),
            p('mt-1 font-script text-[36px] text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
