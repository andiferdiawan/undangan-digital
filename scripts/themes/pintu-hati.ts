import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Pintu Hati — Gen Z simpel, hanya dua warna soft (sage & krem) plus satu tinta sage tua.
 * Konsep 3D mengikuti scroll (useInviteMotion):
 * - adegan pembuka: dua daun pintu terbuka (rotateY) memperlihatkan nama; penutup: pintu menutup kembali
 * - section tengah: kartu berayun masuk dari kiri/kanan (uv-z-left / uv-z-right)
 * - galeri: korsel silinder 3D yang berputar sesuai scroll (--uv-s)
 */
const SAGE = '#b7cfb1'
const CREAM = '#fbf7ef'
const INK = '#34473a'

const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`
const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center [perspective:1000px]'
const card = `rounded-[26px] bg-white p-6 shadow-[0_22px_50px_-28px_rgba(52,71,58,0.45)] ring-1 ring-[${SAGE}]/60`
const pill = `inline-flex items-center justify-center gap-2 rounded-full bg-[${INK}] px-6 py-3 font-body text-[14px] font-semibold lowercase text-[${CREAM}]`
const label = (t: string) => p(`font-body text-[12px] font-semibold lowercase tracking-[0.3em] text-[${INK}]/60`, t)
const heading = (t: string) => el('h2', 'mt-1 font-heading text-[36px] font-semibold lowercase leading-[1.05] text-primary', t)

/** Daun pintu; open = ekspresi 0..1 seberapa terbuka */
const door = (side: 'l' | 'r', open: string, text: string): ThemeNode =>
  div(`absolute inset-y-0 ${side === 'l' ? 'left-0 [transform-origin:left_center] border-r' : 'right-0 [transform-origin:right_center] border-l'} flex w-1/2 items-center ${side === 'l' ? 'justify-end pr-3' : 'justify-start pl-3'} border-[${INK}]/15 bg-[${SAGE}] shadow-[inset_0_0_60px_rgba(52,71,58,0.12)] [transform:rotateY(calc(${open}_*_${side === 'l' ? '-' : ''}105deg))]`, [
    p('font-heading text-[40px] font-semibold lowercase leading-none text-primary', text),
    div(`absolute top-1/2 ${side === 'l' ? 'right-3' : 'left-3'} mt-10 h-8 w-1.5 rounded-full bg-[${INK}]/40`),
  ])

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`${who === 'groom' ? 'uv-z-left' : 'uv-z-right'} ${card} text-center`, [
    div(`relative mx-auto aspect-square w-40 overflow-hidden rounded-full bg-[${SAGE}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-[40px] font-semibold lowercase text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p('mt-4 font-script text-[26px] text-primary/70', who === 'groom' ? 'the groom' : 'the bride'),
    el('h3', 'font-heading text-[24px] font-semibold leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[13px] text-muted', `{{${who}_parents}}`),
    el('a', 'mt-2 inline-block font-body text-[13px] font-semibold text-primary underline', '@instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

// Korsel: 6 posisi di sekeliling silinder (foto ke-7 dst. mengulang posisi)
const SLOTS = [0, 60, 120, 180, 240, 300]
  .map((deg, i) => `[&:nth-child(6n+${i + 1})]:[transform:rotateY(${deg}deg)_translateZ(210px)]`).join(' ')

export const meta = {
  code: 'MOD-007',
  slug: 'pintu-hati',
  name: 'Pintu Hati',
  category: 'modern',
  description: 'Gen Z simpel dengan dua warna soft (sage & krem) dan konsep 3D: saat di-scroll dua daun pintu terbuka memperlihatkan nama, kartu berayun masuk seperti pintu, galeri berupa korsel silinder yang berputar, lalu pintu menutup di akhir.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: SAGE,
    accent_color: INK,
    background_color: CREAM,
    surface_color: '#ffffff',
    text_color: INK,
    muted_color: '#6f7d72',
    font_heading: 'Outfit',
    font_body: 'DM Sans',
    font_script: 'Sacramento',
  },
  root_class: 'text-[14.5px] leading-relaxed',
  assets: {},
  demo: {
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[${CREAM}] px-6 text-center`,
      children: [
        div(`pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[${SAGE}]/60`),
        div(`pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-[${SAGE}]/50`),
        label('the wedding of'),
        el('h1', 'uv-reveal-zoom mt-4 font-heading text-[54px] font-semibold lowercase leading-[0.95] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', 'block font-script text-[46px] normal-case text-primary/70', '+'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        p('uv-reveal uv-d2 mt-5 font-body text-[14px] font-semibold text-muted', '{{event_date}}'),
        div(`uv-reveal uv-d3 relative mx-auto mt-8 w-full max-w-[280px] rounded-[22px] bg-white/80 px-5 py-4 ring-1 ring-[${SAGE}]`, [
          p('font-body text-[12px] text-muted', 'untuk'),
          comp('guest_name', 'mt-0.5 block font-heading text-[21px] font-semibold text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d4 relative mt-7', [comp('open_button', pill, { label: 'buka pintunya ✦' })]),
        p('uv-reveal uv-d5 relative mt-3 font-body text-[11px] lowercase text-muted', 'lalu scroll pelan-pelan'),
      ],
    },
    // ---------- Adegan pembuka: pintu terbuka ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${CREAM}]`,
      children: [
        div(stage, [
          // Di balik pintu: nama & pembuka, mendekat dari dalam ruangan
          div(`relative [transform:translateZ(calc((1_-_${ramp(0.2, 1.6)})_*_-420px))] [opacity:${ramp(0.15, 2)}]`, [
            p('font-arabic text-[20px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
            p('mx-auto mt-3 max-w-[300px] font-body text-[13px] text-muted', '{{opening_text}}'),
            el('h2', 'mt-5 font-heading text-[46px] font-semibold lowercase leading-[1] text-primary', [
              el('span', 'block', '{{groom_nickname}}'),
              el('span', 'block font-script text-[40px] normal-case text-primary/70', '+'),
              el('span', 'block', '{{bride_nickname}}'),
            ]),
            div(`mt-6 [opacity:${ramp(0.7, 4)}] [transform:translateY(calc((1_-_${ramp(0.7, 4)})_*_30px))]`, [
              el('span', `inline-block rounded-full bg-[${SAGE}] px-5 py-2 font-body text-[13px] font-semibold text-primary`, '{{event_date}}'),
            ]),
          ]),
          door('l', ramp(0, 2.2), 'save the'),
          door('r', ramp(0, 2.2), 'date'),
          p(`pointer-events-none absolute inset-x-0 bottom-10 font-body text-[11px] lowercase tracking-[0.3em] text-primary/60 [opacity:calc(1_-_${S}_*_6)]`, 'scroll untuk membuka ↓'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative bg-[${CREAM}] px-6 py-24 text-center`,
      children: [
        div(`uv-z ${card} bg-[${SAGE}]/40 px-6 py-10 ring-0`, [
          p('font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
          p('mt-3 font-heading text-[17px] italic leading-snug text-primary', '“{{quote_text}}”'),
          p('mt-3 font-body text-[12px] font-semibold lowercase tracking-[0.25em] text-primary/70', '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: `relative bg-[${CREAM}] px-6 pb-20 pt-4 text-center`,
      children: [
        div('uv-z', [label('meet the couple'), heading('kami berdua')]),
        p('uv-z mx-auto mt-3 max-w-[300px] font-body text-[13px] text-muted', '{{greeting}}'),
        div('mt-10 grid gap-10', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[${SAGE}]/35 px-6 py-20 text-center`,
      children: [
        div('uv-z', [label('save the date'), heading('hari bahagia')]),
        div(`uv-z mt-8 ${card}`, [
          comp('countdown', '', {
            item_class: `rounded-2xl bg-[${CREAM}] py-3 text-center`,
            number_class: 'block font-heading text-[30px] font-semibold leading-none text-primary',
            label_class: 'font-body text-[10px] font-semibold lowercase tracking-wider text-muted',
          }),
        ]),
        div('mt-10 grid gap-10', [
          el('article', `uv-z-left ${card} text-center`, [
            p('font-body text-[12px] font-semibold lowercase tracking-[0.3em] text-primary/60', '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[28px] font-semibold lowercase leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-body text-[14px] font-semibold text-ink', '{{item.date}}'),
            p('font-body text-[13px] text-muted', '{{item.time}}'),
            p('mt-4 font-heading text-[18px] font-semibold text-primary', '{{item.venue}}'),
            p('font-body text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${pill}`, { href: '{{item.map_url}}', label: 'lihat lokasi ↗' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: 'simpan ke kalender', button_class: `inline-flex rounded-full bg-white px-6 py-2.5 font-body text-[14px] font-semibold lowercase text-primary ring-1 ring-[${SAGE}]` })]),
      ],
    },
    {
      type: 'story',
      class: `relative bg-[${CREAM}] px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [label('our story'), heading('perjalanan kami')]),
          div('mt-10 grid gap-8', [
            div(`uv-z-right ${card} text-left`, [
              p('font-script text-[24px] text-primary/70', '{{item.date}}'),
              el('h3', 'font-heading text-[22px] font-semibold lowercase leading-tight text-primary', '{{item.title}}'),
              p('mt-1 font-body text-[13.5px] text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: korsel silinder 3D berputar mengikuti scroll ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.4)] bg-[${SAGE}]/35`,
      children: [
        div(stage, [
          div('absolute inset-x-0 top-[12%]', [label('gallery'), heading('momen kita')]),
          div(`relative mt-16 h-[230px] w-[160px] [transform-style:preserve-3d] [transform:translateZ(-210px)_rotateY(calc(${S}_*_-300deg))]`, [
            div(`absolute inset-0 [backface-visibility:hidden] ${SLOTS}`, [
              div('h-full w-full overflow-hidden rounded-[20px] bg-white p-1.5 shadow-[0_20px_40px_-20px_rgba(52,71,58,0.6)]', [
                img('h-full w-full rounded-[15px] object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
          ]),
          p('absolute inset-x-0 bottom-[10%] font-body text-[11px] lowercase tracking-[0.3em] text-primary/60', 'terus scroll untuk memutar'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative bg-[${CREAM}] px-6 py-20 text-center`,
      children: [
        div('uv-z', [label('rsvp'), heading('kamu datang?')]),
        div(`uv-z mt-8 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-2xl border-0 bg-[${CREAM}] px-4 py-3 font-body text-[16px] text-ink outline-none ring-1 ring-[${SAGE}] focus:ring-2 focus:ring-[${INK}]`,
            button_class: `w-full ${pill} disabled:opacity-60`,
            label_class: 'font-body text-[13px] font-semibold lowercase text-primary',
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-12 font-heading text-[24px] font-semibold lowercase text-primary', 'doa & ucapan'),
        comp('wishes', 'text-left', { item_class: `${card} p-4`, name_class: 'font-heading font-semibold text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[${SAGE}]/35 px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [label('wedding gift'), heading('tanda kasih')]),
          p('uv-z mx-auto mt-3 max-w-[300px] font-body text-[13.5px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-8', [
            div(`uv-z-left ${card} text-left`, [
              p('font-body text-[12px] font-semibold lowercase tracking-[0.25em] text-primary/60', '{{item.bank}}'),
              p('mt-2 font-heading text-[26px] font-semibold tracking-wide text-primary', '{{item.number}}'),
              p('font-body text-[13px] text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'salin nomor', button_class: `rounded-full bg-[${CREAM}] px-5 py-2 font-body text-[13px] font-semibold text-primary ring-1 ring-[${SAGE}]` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: pintu menutup kembali ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.2)] bg-[${CREAM}]`,
      children: [
        div(stage, [
          div(`relative [opacity:calc(1_-_${ramp(0.55, 3)})]`, [
            p('mx-auto max-w-[300px] font-body text-[13.5px] text-muted', '{{closing_text}}'),
            p('mt-4 font-script text-[30px] text-primary/70', 'terima kasih'),
            el('h2', 'mt-1 font-heading text-[40px] font-semibold lowercase leading-none text-primary', '{{couple_names}}'),
            p('mt-3 font-body text-[12px] text-muted', '{{closing_greeting}}'),
          ]),
          door('l', `calc(1_-_${ramp(0.35, 1.8)})`, 'see you'),
          door('r', `calc(1_-_${ramp(0.35, 1.8)})`, 'there ♡'),
        ]),
      ],
    },
  ],
}
