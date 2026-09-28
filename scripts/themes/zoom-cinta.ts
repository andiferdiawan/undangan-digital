import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Zoom Cinta — Gen Z, lembut, minim aset. Konsepnya kedalaman (sumbu Z) yang mengikuti scroll:
 * - adegan pembuka & penutup (uv-scene): layar menempel, "Save the Date" terbang melewati penonton,
 *   hati-hati melesat keluar seperti menembus terowongan, nama mempelai muncul dari kejauhan;
 *   penutup kebalikannya (zoom out).
 * - section di tengah memakai uv-z: kartu datang dari jauh, tajam di tengah layar, lalu melewati penonton.
 * Nilai --uv-s (0..1) dan --uv-d (-1..1) diisi oleh useInviteMotion.
 */
const A = '/theme-assets/zoom-cinta'
const INK = '#2b1d2a'
const ROSE = '#ff6f9c'
const LILAC = '#c9b6ff'
const BLUSH = '#fff3f6'

// Ekspresi CSS berbasis progres adegan (--uv-s)
const S = 'var(--uv-s,1)'
const ramp = (from: number, speed: number) => `clamp(0,calc((${S}_-_${from})_*_${speed}),1)`

const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-6 text-center'
const card = `rounded-[28px] bg-white/80 p-6 shadow-[0_24px_60px_-30px_rgba(43,29,42,0.45)] ring-1 ring-[${ROSE}]/15 backdrop-blur-sm`
const pill = `inline-flex items-center gap-2 rounded-full bg-[${INK}] px-6 py-3 font-body text-[14px] font-semibold text-white shadow-[0_12px_30px_-12px_${ROSE}]`
const label = (t: string) => p(`font-body text-[11px] font-bold uppercase tracking-[0.35em] text-[${ROSE}]`, t)
const heading = (t: string) => el('h2', 'mt-2 font-heading text-[38px] leading-[1.05] text-primary', t)

/** Hati yang melesat keluar dari titik tengah seiring scroll (efek terowongan) */
const flyHeart = (x: number, y: number, size: string, delay = 0): ThemeNode =>
  div(`pointer-events-none absolute left-1/2 top-1/2 ${size} [transform:translate(-50%,-50%)_translate3d(calc(${S}_*_${x}px),calc(${S}_*_${y}px),0)_scale(calc(0.3_+_${S}_*_2.6))] [opacity:calc(0.9_-_${S}_*_${0.8 + delay})]`, [
    img('w-full', '{{asset.heart}}'),
  ])

function person(who: 'groom' | 'bride'): ThemeNode {
  return div(`${who === 'groom' ? 'uv-z-left' : 'uv-z-right'} ${card} text-center`, [
    div(`relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-[${BLUSH}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-[56px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p(`mt-4 font-script text-[24px] text-[${ROSE}]`, who === 'groom' ? 'the groom' : 'the bride'),
    el('h3', 'font-heading text-[28px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[13px] text-muted', `{{${who}_parents}}`),
    el('a', `mt-2 inline-block font-body text-[13px] font-semibold text-[${ROSE}]`, '@instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'MOD-006',
  slug: 'zoom-cinta',
  name: 'Zoom Cinta',
  category: 'modern',
  description: 'Gen Z yang lembut & simpel dengan konsep 3D sumbu Z: saat di-scroll, undangan terasa "masuk ke dalam" — tulisan terbang melewati layar, hati melesat seperti terowongan, nama muncul dari kejauhan, dan setiap kartu datang dari jauh lalu melintas. Penutupnya zoom out.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: LILAC,
    accent_color: ROSE,
    background_color: BLUSH,
    surface_color: '#ffffff',
    text_color: INK,
    muted_color: '#7a6878',
    font_heading: 'DM Serif Display',
    font_body: 'DM Sans',
    font_script: 'Caveat',
  },
  root_class: 'text-[14.5px] leading-relaxed',
  assets: { heart: `${A}/heart.svg` },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,${BLUSH}_45%,#f3e9ff_100%)] px-6 text-center`,
      children: [
        div('pointer-events-none absolute left-8 top-24 w-6', [img('uv-float w-full opacity-70', '{{asset.heart}}')]),
        div('pointer-events-none absolute bottom-40 right-10 w-9', [img('uv-float3d w-full', '{{asset.heart}}')]),
        p(`uv-reveal font-body text-[11px] font-bold uppercase tracking-[0.4em] text-[${ROSE}]`, 'We’re getting married'),
        el('h1', 'uv-reveal-zoom uv-d1 mt-5 font-heading text-[56px] leading-[0.95] text-primary', [
          el('span', 'block', '{{groom_nickname}}'),
          el('span', `block font-script text-[40px] text-[${ROSE}]`, '&'),
          el('span', 'block', '{{bride_nickname}}'),
        ]),
        p('uv-reveal uv-d2 mt-5 font-body text-[14px] font-semibold text-muted', '{{event_date}}'),
        div(`uv-reveal uv-d3 mx-auto mt-8 w-full max-w-[280px] ${card} py-4`, [
          p('font-body text-[12px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-[22px] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d4 mt-7', [comp('open_button', pill, { label: 'Zoom in ♡' })]),
        p('uv-reveal uv-d5 mt-3 font-body text-[11px] text-muted', 'scroll pelan-pelan, ya'),
      ],
    },
    // ---------- Adegan pembuka: masuk ke dalam ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.8)] bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,${BLUSH}_55%,#efe4ff_100%)]`,
      children: [
        div(stage, [
          flyHeart(-150, -260, 'w-10', 0),
          flyHeart(160, -200, 'w-7', 0.1),
          flyHeart(-180, 180, 'w-8', 0.05),
          flyHeart(150, 250, 'w-12', 0),
          flyHeart(20, -330, 'w-6', 0.2),
          flyHeart(-40, 320, 'w-6', 0.15),
          // "Save the Date" terbang melewati penonton
          div(`pointer-events-none absolute inset-0 flex flex-col items-center justify-center [transform:scale(calc(1_+_${S}_*_5))] [opacity:calc(1_-_${S}_*_2.6)]`, [
            p('font-heading text-[46px] leading-none text-primary', 'Save'),
            p(`font-script text-[34px] leading-none text-[${ROSE}]`, 'the'),
            p('font-heading text-[46px] leading-none text-primary', 'Date'),
          ]),
          // Nama muncul dari kejauhan
          div(`relative [transform:scale(calc(0.25_+_0.75_*_${ramp(0.3, 2.4)}))] [opacity:${ramp(0.32, 3)}]`, [
            p('font-arabic text-[20px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
            p('mx-auto mt-3 max-w-[300px] font-body text-[13px] text-muted', '{{opening_text}}'),
            el('h2', 'mt-4 font-heading text-[46px] leading-[1] text-primary', [
              el('span', 'block', '{{groom_nickname}}'),
              el('span', `block font-script text-[34px] text-[${ROSE}]`, 'and'),
              el('span', 'block', '{{bride_nickname}}'),
            ]),
          ]),
          // Tanggal mendarat di akhir adegan
          div(`relative mt-6 [transform:translateY(calc((1_-_${ramp(0.72, 4)})_*_40px))] [opacity:${ramp(0.72, 4)}]`, [
            el('span', `inline-block rounded-full bg-white px-5 py-2 font-body text-[13px] font-bold text-primary ring-1 ring-[${ROSE}]/30`, '{{event_date}}'),
          ]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-6 py-24 text-center',
      children: [
        div(`uv-z ${card} px-6 py-10`, [
          img('mx-auto w-8', '{{asset.heart}}'),
          p('mt-4 font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
          p('mt-3 font-heading text-[18px] italic leading-snug text-primary', '“{{quote_text}}”'),
          p(`mt-3 font-body text-[12px] font-bold uppercase tracking-[0.25em] text-[${ROSE}]`, '{{quote_source}}'),
        ]),
      ],
    },
    {
      type: 'profile',
      class: 'relative bg-base px-6 pb-20 pt-4 text-center',
      children: [
        div('uv-z', [label('Meet the couple'), heading('Dua Hati, Satu Cerita')]),
        p('uv-z mx-auto mt-3 max-w-[300px] font-script text-[22px] text-muted', '{{greeting}}'),
        div('mt-10 grid gap-10', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: `relative bg-[linear-gradient(180deg,${BLUSH}_0%,#f3e9ff_100%)] px-6 py-20 text-center`,
      children: [
        div('uv-z', [label('Save the date'), heading('Hari Bahagia')]),
        div(`uv-z mt-8 ${card}`, [
          comp('countdown', '', {
            item_class: `rounded-2xl bg-[${BLUSH}] py-3`,
            number_class: 'block font-heading text-[30px] leading-none text-primary',
            label_class: 'font-body text-[10px] font-bold uppercase tracking-wider text-muted',
          }),
        ]),
        div('mt-10 grid gap-10', [
          el('article', `uv-z ${card} text-center`, [
            p(`font-body text-[11px] font-bold uppercase tracking-[0.3em] text-[${ROSE}]`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[30px] leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-body text-[14px] font-semibold text-ink', '{{item.date}}'),
            p('font-body text-[13px] text-muted', '{{item.time}}'),
            p('mt-4 font-heading text-[19px] text-primary', '{{item.venue}}'),
            p('font-body text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${pill}`, { href: '{{item.map_url}}', label: '📍 Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        div('uv-z mt-10', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: `inline-flex rounded-full bg-white px-6 py-2.5 font-body text-[14px] font-semibold text-primary ring-1 ring-[${ROSE}]/30` })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-6',
      children: [
        div('py-20 text-center', [
          div('uv-z', [label('Our story'), heading('Perjalanan Kami')]),
          div('mt-10 grid gap-8', [
            div(`uv-z ${card} text-left`, [
              p(`font-script text-[22px] text-[${ROSE}]`, '{{item.date}}'),
              el('h3', 'font-heading text-[24px] leading-tight text-primary', '{{item.title}}'),
              p('mt-1 font-body text-[13.5px] text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: `bg-[linear-gradient(180deg,${BLUSH}_0%,#f3e9ff_100%)] px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [label('Gallery'), heading('Momen Kita')]),
          div('mt-10 grid gap-10', [
            div('uv-z overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(43,29,42,0.5)]', [
              img('aspect-[4/5] w-full rounded-[22px] object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        div('uv-z', [label('RSVP'), heading('Kamu Datang, Kan?')]),
        div(`uv-z mt-8 ${card} text-left`, [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-2xl border-0 bg-[${BLUSH}] px-4 py-3 font-body text-[16px] text-ink outline-none ring-1 ring-[${ROSE}]/20 focus:ring-2 focus:ring-[${ROSE}]`,
            button_class: `w-full ${pill} justify-center disabled:opacity-60`,
            label_class: 'font-body text-[13px] font-bold text-primary',
          }),
        ]),
        el('h3', 'uv-z mb-4 mt-12 font-heading text-[26px] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: `${card} p-4`, name_class: 'font-heading text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: `bg-[linear-gradient(180deg,${BLUSH}_0%,#f3e9ff_100%)] px-6`,
      children: [
        div('py-20 text-center', [
          div('uv-z', [label('Wedding gift'), heading('Tanda Kasih')]),
          p('uv-z mx-auto mt-3 max-w-[300px] font-body text-[13.5px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-8', [
            div(`uv-z ${card} text-left`, [
              p(`font-body text-[12px] font-bold uppercase tracking-[0.25em] text-[${ROSE}]`, '{{item.bank}}'),
              p('mt-2 font-heading text-[28px] tracking-wide text-primary', '{{item.number}}'),
              p('font-body text-[13px] text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full bg-[${BLUSH}] px-5 py-2 font-body text-[13px] font-semibold text-primary ring-1 ring-[${ROSE}]/30` })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Adegan penutup: zoom out ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.2)] bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,${BLUSH}_55%,#efe4ff_100%)]`,
      children: [
        div(stage, [
          // Hati besar menyusut menjauh ke tengah
          div(`pointer-events-none absolute left-1/2 top-1/2 z-0 w-40 [transform:translate(-50%,-50%)_scale(calc(5_-_${S}_*_3.8))] [opacity:calc(0.35_-_${S}_*_0.2)]`, [img('w-full', '{{asset.heart}}')]),
          div(`relative z-10 [transform:scale(calc(2.4_-_1.4_*_${ramp(0, 1.6)}))] [opacity:${ramp(0.05, 2.2)}]`, [
            p('mx-auto max-w-[300px] font-body text-[13.5px] text-muted', '{{closing_text}}'),
            p(`mt-4 font-script text-[30px] text-[${ROSE}]`, 'terima kasih'),
            el('h2', 'mt-2 font-heading text-[42px] leading-none text-primary', '{{couple_names}}'),
            p('mt-3 font-body text-[12px] text-muted', '{{closing_greeting}}'),
          ]),
        ]),
      ],
    },
  ],
}
