import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Bosara — adat Makassar yang lapang & elegan, 3 warna saja (gading, merah muda baju bodo, emas) dan
 * 2 aset (dasar & tutup bosara, wadah seserahan adat Makassar). Konsep 3D mengikuti scroll:
 * - pembuka: tutup bosara terangkat, kartu undangan naik dari dalam lalu mendekat ke layar
 * - tengah: kartu datang dari kejauhan (uv-z), garis kotak-kotak lipa' sabbe sebagai aksen
 * - galeri: lembar foto tersingkap ke atas satu per satu (uv-flip-book)
 * - penutup: kartu kembali ke dalam bosara dan tutupnya dipasang lagi
 */
const IVORY = '#fbf7f2'
const ROSE = '#8e3b54'
const GOLD = '#c49a55'
const A = '/theme-assets/bosara'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:900px]'
const card = `rounded-[3px] border border-[${GOLD}]/60 bg-white/75 px-7 pb-8 pt-7 shadow-[0_24px_50px_-34px_rgba(142,59,84,0.55)]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${ROSE}] px-7 py-3 font-body text-[12px] uppercase tracking-[0.28em] text-[${IVORY}]`
const kicker = (t: string) => p(`font-body text-[11px] uppercase tracking-[0.4em] text-[${GOLD}]`, t)
const heading = (t: string, light = false) => el('h2', `mt-3 font-heading text-[26px] leading-[1.2] tracking-[0.06em] ${light ? `text-[${IVORY}]` : 'text-primary'}`, t)
/** Garis pemisah: benang emas dengan belah ketupat kecil. */
const divider = (cls = '') => div(`mx-auto flex items-center justify-center gap-2 ${cls}`, [
  div(`h-px w-14 bg-[${GOLD}]`), div(`h-2 w-2 rotate-45 border border-[${GOLD}]`), div(`h-px w-14 bg-[${GOLD}]`),
])
/** Pita kotak-kotak lipa' sabbe (sarung sutra Makassar) — murni CSS. */
const sabbe = (cls = '') => div(`mx-auto h-[7px] w-36 [background-image:repeating-linear-gradient(90deg,${ROSE}_0_7px,${GOLD}_7px_9px,${IVORY}_9px_11px,${GOLD}_11px_13px)] ${cls}`)

/**
 * Bosara 3D. lid = tutup terangkat (0..1), t = kartu naik (0..1), z = kartu mendekat & bosara memudar (0..1).
 */
function bosara(o: { lid: string, t: string, z: string, inner: ThemeNode[] }): ThemeNode {
  const fade = `[opacity:calc(1_-_${o.z}_*_1.8)]`
  return div('relative mt-4 h-[270px] w-[240px] [transform-style:preserve-3d]', [
    // kartu undangan (di dalam mangkuk)
    div(`absolute left-[26px] top-[164px] h-[104px] w-[188px] rounded-[2px] border border-[${GOLD}]/70 bg-[${IVORY}] px-3 py-3 text-center shadow-[0_8px_22px_-10px_rgba(0,0,0,0.35)] [clip-path:inset(-40px_-40px_max(0px,calc(108px_-_${o.t}_*_150px))_-40px)] [transform:translateY(calc(${o.t}_*_-150px))_translateZ(calc(1px_+_${o.z}_*_300px))]`, o.inner),
    // mangkuk berkaki
    img(`absolute bottom-0 left-0 h-[120px] w-[240px] [transform:translateZ(3px)] ${fade}`, '{{asset.dasar}}', 'Bosara'),
    // tutup kubah
    div(`absolute left-0 top-[20px] w-[240px] [transform-origin:50%_100%] [transform:translateZ(6px)_translateY(calc(${o.lid}_*_-150px))_rotateX(calc(${o.lid}_*_-28deg))] [opacity:calc(1_-_${o.lid}_*_1.15_-_${o.z}_*_2)]`, [
      img('block h-[150px] w-[240px]', '{{asset.tutup}}', 'Tutup bosara'),
    ]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`uv-z ${card} text-center`, [
    div(`relative mx-auto h-44 w-36 overflow-hidden rounded-t-full border border-[${GOLD}] bg-[${ROSE}]/10 outline outline-1 outline-offset-4 outline-[${GOLD}]/50`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[44px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    sabbe('mt-6'),
    p(`mt-5 font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[21px] leading-tight tracking-[0.04em] text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] italic text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] text-[${GOLD}] underline`, 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Lembar galeri: indeks & tumpukan (lembar pertama di atas) lewat nth-child pada tiap lembar
const PAGES = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--i:${i}] [&:nth-child(6n+${i + 1})]:z-[${6 - i}]`).join(' ')

export const meta = {
  code: 'ADT-006',
  slug: 'bosara',
  name: 'Bosara',
  category: 'adat',
  description: 'Adat Makassar yang lapang dan elegan, tiga warna (gading, merah muda baju bodo, emas) dengan efek 3D saat di-scroll: tutup bosara terangkat, kartu undangan naik lalu mendekat ke layar, foto tersingkap satu per satu, dan di akhir bosara tertutup kembali.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: ROSE,
    secondary_color: GOLD,
    accent_color: GOLD,
    background_color: IVORY,
    surface_color: IVORY,
    text_color: '#4a2a33',
    muted_color: '#86666e',
    font_heading: 'Cinzel',
    font_body: 'Lora',
    font_script: 'Parisienne',
  },
  root_class: 'text-[15px] leading-relaxed',
  assets: { dasar: `${A}/dasar.svg`, tutup: `${A}/tutup.svg` },
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
        div(`pointer-events-none absolute inset-5 rounded-t-[999px] border border-[${GOLD}]/45`),
        kicker('Undangan Pernikahan'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-6 font-script text-[56px] leading-[1.05] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-heading text-[18px] text-[${GOLD}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        divider('uv-reveal uv-d2 mt-5'),
        p('uv-reveal uv-d2 mt-4 font-body text-[13px] uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 mx-auto mt-8 w-24', [img('uv-float w-full', '{{asset.tutup}}', 'Tutup bosara'), img('-mt-1 w-full', '{{asset.dasar}}', '')]),
        div('uv-reveal uv-d4 relative mt-7', [
          p('font-body text-[13px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[19px] tracking-[0.04em] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-8', [comp('open_button', btn, { label: 'Buka Bosara' })]),
      ],
    },
    // ---------- Pembuka: tutup bosara terangkat, kartu naik & mendekat ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.8)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div(`absolute inset-x-0 top-[11%] [opacity:calc(1_-_${ramp(0.5, 3)})]`, [kicker('Sebuah kabar bahagia'), divider('mt-4')]),
          bosara({
            lid: ramp(0.04, 3),
            t: ramp(0.3, 3),
            z: ramp(0.64, 2.8),
            inner: [
              p(`font-body text-[7.5px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Bismillahirrahmanirrahim'),
              p('mt-1 font-body text-[8px] italic leading-snug text-muted', 'Dengan rahmat Allah, kami mengundang Anda di hari bahagia kami'),
              p('mt-1 font-script text-[24px] leading-none text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
              sabbe('mt-1.5 !h-[4px] !w-20'),
              p('mt-1.5 font-body text-[8px] uppercase tracking-[0.25em] text-primary', '{{event_date}}'),
            ],
          }),
          p(`pointer-events-none absolute inset-x-0 bottom-9 font-body text-[11px] uppercase tracking-[0.35em] text-muted [opacity:calc(1_-_${S}_*_6)]`, 'Scroll untuk membuka'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${ROSE}] px-8 py-24 text-center`,
      children: [
        div('uv-z', [
          p(`font-arabic text-[21px] leading-loose text-[${IVORY}]`, '{{quote_arabic}}'),
          divider('my-6'),
          p(`font-body text-[16px] italic leading-relaxed text-[${IVORY}]/85`, '“{{quote_text}}”'),
          p(`mt-4 font-body text-[11px] uppercase tracking-[0.3em] text-[${GOLD}]`, '{{quote_source}}'),
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
      class: `relative bg-[${ROSE}] px-7 py-24 text-center`,
      children: [
        div('uv-z', [kicker('Waktu & Tempat'), heading('Hari Bahagia', true), divider('mt-5')]),
        div('uv-z mt-10', [comp('countdown', '', {
          item_class: `rounded-t-full border border-[${GOLD}]/60 pb-3 pt-5 text-center`,
          number_class: `block font-heading text-[26px] leading-none text-[${IVORY}]`,
          label_class: `font-body text-[10px] uppercase tracking-[0.2em] text-[${GOLD}]`,
        })]),
        div('mt-12 grid gap-10', [
          el('article', `uv-z ${card} bg-[${IVORY}] text-center`, [
            p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[22px] leading-tight tracking-[0.04em] text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[15px] text-ink', '{{item.date}}'),
            p('font-body text-[14px] italic text-muted', '{{item.time}}'),
            sabbe('my-5'),
            p('font-heading text-[16px] tracking-[0.04em] text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'Simpan ke Kalender', button_class: `inline-flex rounded-full border border-[${GOLD}] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.2em] text-[${IVORY}]` })]),
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
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.date}}'),
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
              div(`h-full w-full rounded-t-[125px] border border-[${GOLD}] bg-white p-2.5 shadow-[0_22px_40px_-22px_rgba(74,42,51,0.6)] [backface-visibility:hidden] [transform-origin:top_center] [transform:perspective(1100px)_rotateX(calc(clamp(0,${S}*7_-_var(--i,0)*1.05,1)*100deg))]`, [
                img('h-full w-full rounded-t-[118px] object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
            div(`uv-flip-end absolute inset-0 z-0 grid place-items-center rounded-t-[125px] border border-[${GOLD}] bg-[${ROSE}] p-6`, [
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
            input_class: `w-full rounded-[2px] border border-[${GOLD}]/50 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${ROSE}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: `font-body text-[11px] uppercase tracking-[0.2em] text-[${GOLD}]`,
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-14 font-heading text-[20px] tracking-[0.04em] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `border-b border-[${GOLD}]/40 py-4`, name_class: 'font-heading text-[15px] tracking-[0.04em] text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${ROSE}] px-7`,
      children: [
        div('py-24 text-center', [
          div('uv-z', [kicker('Tanda Kasih'), heading('Amplop Digital', true), divider('mt-5')]),
          p(`uv-z mx-auto mt-5 max-w-[300px] font-body text-[14px] italic text-[${IVORY}]/80`, 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} bg-[${IVORY}] text-center`, [
              p(`font-body text-[11px] uppercase tracking-[0.35em] text-[${GOLD}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[22px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] italic text-muted', 'a.n. {{item.holder}}'),
              sabbe('my-5'),
              comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}] px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] text-primary` }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: kartu kembali ke dalam bosara & tutup dipasang ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${IVORY}]`,
      children: [
        div(stage, [
          div('px-8', [
            p('font-body text-[14px] italic text-muted', '{{closing_text}}'),
          ]),
          bosara({
            lid: `calc(1_-_${ramp(0.42, 3)})`,
            t: `calc(1_-_${ramp(0.1, 3)})`,
            z: '0',
            inner: [
              p(`font-body text-[7.5px] uppercase tracking-[0.3em] text-[${GOLD}]`, 'Terima kasih'),
              p('mt-2 font-script text-[24px] leading-none text-primary', '{{couple_names}}'),
              sabbe('mt-2 !h-[4px] !w-20'),
              p('mt-2 font-body text-[8px] italic text-muted', '{{closing_greeting}}'),
            ],
          }),
          div(`mt-4 [opacity:${ramp(0.74, 4)}]`, [
            p('font-body text-[13px] italic text-muted', '{{closing_greeting}}'),
            p('mt-1 font-script text-[36px] text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
