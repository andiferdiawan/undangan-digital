import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/aurelia-luxe'
const NAVY = '#1b2a41'
const DEEP = '#111b2b'
const GOLD = '#c6a15b'
const CHAMP = '#e9d8b4'

/** Judul section: simbol berlian kecil, eyebrow, judul, garis lengkung emas yang tergambar */
const title = (eyebrow: string, heading: string, light = false) => [
  p(`uv-reveal text-[10px] font-semibold uppercase tracking-[0.42em] ${light ? `text-[${CHAMP}]` : 'text-secondary'}`, eyebrow),
  el('h2', `uv-reveal uv-d1 mt-2 font-heading text-[32px] leading-tight ${light ? 'text-white' : 'text-primary'}`, heading),
  img('uv-reveal-zoom uv-d2 mx-auto mt-3 mb-6 h-7 w-52', '{{asset.curve}}'),
]
const sparkle = (pos: string, size = 'w-4') => img(`pointer-events-none absolute ${pos} ${size}`, '{{asset.sparkle}}')
/** Bingkai sudut lengkung di keempat pojok kartu */
const corners = (inset = '3') => [
  img(`pointer-events-none absolute left-${inset} top-${inset} w-10`, '{{asset.corner}}'),
  img(`pointer-events-none absolute right-${inset} top-${inset} w-10 -scale-x-100`, '{{asset.corner}}'),
  img(`pointer-events-none absolute bottom-${inset} left-${inset} w-10 -scale-y-100`, '{{asset.corner}}'),
  img(`pointer-events-none absolute bottom-${inset} right-${inset} w-10 -scale-100`, '{{asset.corner}}'),
]
const goldBtn = `uv-shine inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#b8904a] via-[${CHAMP}] to-[#b8904a] px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[${DEEP}] shadow-[0_12px_28px_rgba(198,161,91,0.35)]`
const navyBtn = `uv-shine inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[${CHAMP}] shadow-[0_12px_28px_rgba(27,42,65,0.28)]`

/**
 * Foto berbingkai lengkung: foto tersingkap seperti tirai (lapisan 1),
 * garis emas tipis bergeser (lapisan 2) — bergerak 3D mengikuti kemiringan ponsel.
 */
function curvedPhoto(photo: ThemeNode[], shape: string, size: string): ThemeNode {
  return div(`uv-tilt relative mx-auto aspect-[3/4] ${size}`, [
    div(`uv-depth-2 pointer-events-none absolute -inset-2.5 ${shape} border border-secondary/70`),
    div(`uv-depth-1 absolute inset-0 ${shape} bg-primary shadow-[0_26px_50px_rgba(17,27,43,0.28)]`, [
      div(`uv-reveal-mask absolute inset-0 overflow-hidden ${shape}`, photo),
    ]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  const isBride = who === 'bride'
  // Pria: lengkung atas (arch); wanita: oval — keduanya "simply curve"
  const shape = isBride ? 'rounded-[50%]' : 'rounded-t-[999px]'
  return div(`${isBride ? 'uv-reveal-right' : 'uv-reveal-left'} relative mt-12 text-center`, [
    curvedPhoto([
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, isBride ? 'Foto mempelai wanita' : 'Foto mempelai pria', { if: `${who}_photo` }),
      div(`absolute inset-0 grid place-items-center bg-gradient-to-b from-[${NAVY}] to-[${DEEP}]`, [
        el('span', `font-script text-6xl text-[${CHAMP}]`, `{{${who}_nickname}}`),
      ], { if: `!${who}_photo` }),
    ], shape, 'w-56'),
    p('mt-7 text-[10px] font-semibold uppercase tracking-[0.42em] text-secondary', isBride ? 'The Bride' : 'The Groom'),
    el('h3', 'mt-1 font-heading text-[27px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 text-[13px] text-muted', `{{${who}_parents}}`),
    el('a', 'mt-3 inline-flex rounded-full border border-secondary/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-002',
  slug: 'aurelia-luxe',
  name: 'Aurelia Luxe',
  category: 'elegan',
  description: 'Premium elegan berfoto: gading, navy tengah malam, dan emas sampanye. Garis lengkung emas yang tergambar perlahan, simbol berlian, bintang berkilau, dan emblem melingkar; foto mempelai berbingkai lengkung yang tersingkap seperti tirai dan bergerak 3D.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: NAVY,
    secondary_color: GOLD,
    accent_color: CHAMP,
    background_color: '#f8f5ef',
    surface_color: '#ffffff',
    text_color: '#1f2633',
    muted_color: '#767b85',
    font_heading: 'Playfair Display',
    font_body: 'Montserrat',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[13.5px] leading-relaxed',
  assets: {
    curve: `${A}/curve.svg`,
    emblem: `${A}/emblem.svg`,
    diamond: `${A}/diamond.svg`,
    sparkle: `${A}/sparkle.svg`,
    corner: `${A}/corner.svg`,
  },
  demo: {
    cover_photos: [`${A}/slide-1.jpg`, `${A}/slide-2.jpg`, `${A}/slide-3.jpg`],
    gallery: [`${A}/slide-2.jpg`, `${A}/rings.jpg`, `${A}/bride.jpg`, `${A}/groom.jpg`, `${A}/slide-1.jpg`, `${A}/bouquet.jpg`],
    groom_photo: `${A}/groom.jpg`,
    bride_photo: `${A}/bride.jpg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-base px-7 pb-14 pt-12 text-center',
      children: [
        ...corners('4'),
        sparkle('left-10 top-24', 'w-5'),
        sparkle('right-12 top-40', 'w-3'),
        sparkle('bottom-32 right-10', 'w-4'),
        p('uv-reveal relative text-[10px] font-semibold uppercase tracking-[0.46em] text-secondary', 'The Wedding of'),
        div('uv-reveal-zoom uv-d1 relative mt-6 w-full', [
          curvedPhoto([
            comp('photo_slider', '', { dots: 'false', interval: '4500' }),
            div(`absolute inset-0 -z-10 grid place-items-center bg-gradient-to-b from-[${NAVY}] to-[${DEEP}]`, [img('uv-float3d w-16', '{{asset.diamond}}')]),
          ], 'rounded-t-[999px]', 'w-52'),
        ]),
        el('h1', 'uv-reveal-zoom uv-d2 relative mt-7 font-heading text-[40px] leading-[1.1] text-primary', '{{couple_names}}'),
        img('uv-reveal uv-d3 relative mx-auto mt-2 h-6 w-48', '{{asset.curve}}'),
        p('uv-reveal uv-d3 relative mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-muted', '{{event_date}}'),
        div('uv-reveal uv-d4 relative mx-auto mt-6 w-full max-w-[290px] border-y border-secondary/40 py-3', [
          p('text-[11px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-[19px] text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal uv-d5 relative mt-7', [comp('open_button', navyBtn, { label: 'Buka Undangan' })]),
      ],
    },
    {
      type: 'hero',
      class: `relative flex min-h-[100svh] flex-col items-center justify-end overflow-hidden bg-[${DEEP}] px-6 pb-16 pt-40 text-center text-white`,
      children: [
        div('absolute inset-x-0 top-[22%] flex justify-center', [img('uv-float3d w-20 opacity-80', '{{asset.diamond}}')]),
        comp('photo_slider', '', { interval: '5200' }),
        div(`absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[${DEEP}] via-[${DEEP}]/75 to-transparent`),
        div('uv-reveal-zoom relative w-24', [img('w-full', '{{asset.emblem}}')]),
        p(`uv-reveal uv-d1 relative mt-3 text-[10px] font-semibold uppercase tracking-[0.46em] text-[${CHAMP}]`, 'Save the Date'),
        el('h2', 'uv-reveal-zoom uv-d2 relative mt-2 font-script text-[54px] leading-none', '{{couple_names}}'),
        p('uv-reveal uv-d3 relative mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white/85', '{{event_date}}'),
        div('uv-reveal-flip uv-d4 relative mt-6 w-full', [
          comp('countdown', '', {
            item_class: `border border-[${CHAMP}]/35 bg-white/5 py-3 backdrop-blur-md`,
            number_class: `block font-heading text-[28px] leading-none text-[${CHAMP}]`,
            label_class: 'mt-1 block text-[9.5px] uppercase tracking-[0.25em] text-white/75',
          }),
        ]),
        div('uv-reveal uv-d5 relative mt-6', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: goldBtn })]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-base px-8 py-20 text-center',
      children: [
        sparkle('left-8 top-10', 'w-4'),
        sparkle('bottom-12 right-9', 'w-3'),
        div('uv-reveal-zoom mx-auto w-14', [img('uv-spin3d w-full', '{{asset.diamond}}', 'Simbol berlian')]),
        p('uv-reveal uv-d1 mt-7 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
        img('uv-reveal uv-d2 mx-auto my-4 h-6 w-44', '{{asset.curve}}'),
        p('uv-reveal uv-d2 text-[13px] italic text-muted', '"{{quote_text}}"'),
        p('uv-reveal uv-d3 mt-4 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-secondary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-20',
      children: [
        sparkle('right-8 top-12', 'w-4'),
        sparkle('left-7 top-[52%]', 'w-3'),
        div('text-center', [
          p('uv-reveal font-heading text-[22px] italic leading-snug text-primary', '{{greeting}}'),
          p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] text-[13px] text-ink/75', '{{opening_text}}'),
        ]),
        person('groom'),
        div('uv-reveal-zoom relative mx-auto my-10 grid w-24 place-items-center', [
          img('w-full', '{{asset.emblem}}'),
          p('absolute font-script text-[46px] leading-none text-secondary', '&'),
        ]),
        person('bride'),
      ],
    },
    {
      type: 'event',
      class: `relative overflow-hidden bg-[${DEEP}] px-6 py-20 text-center text-white`,
      children: [
        sparkle('left-8 top-16', 'w-4'),
        sparkle('right-10 top-32', 'w-3'),
        div('relative', title('Rangkaian Acara', 'Hari Bahagia', true)),
        div('relative grid gap-6', [
          el('article', `uv-reveal-flip relative rounded-t-[140px] rounded-b-[18px] border border-[${CHAMP}]/40 bg-surface px-6 pb-7 pt-12 text-ink shadow-[0_24px_48px_rgba(0,0,0,0.35)]`, [
            img('mx-auto -mt-2 mb-3 w-9', '{{asset.diamond}}'),
            p('text-[10px] font-semibold uppercase tracking-[0.4em] text-secondary', '{{item.day}}'),
            el('h3', 'mt-1 font-heading text-[28px] leading-tight text-primary', '{{item.name}}'),
            img('mx-auto my-3 h-5 w-36', '{{asset.curve}}'),
            p('font-semibold text-primary', '{{item.date}}'),
            p('text-[12.5px] text-muted', '{{item.time}}'),
            p('mt-4 font-heading text-[19px] text-primary', '{{item.venue}}'),
            p('text-[12.5px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${navyBtn}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'bg-base px-6',
      children: [
        div('py-20 text-center', [
          ...title('Our Journey', 'Kisah Kami'),
          div('relative grid gap-7 text-left', [
            div('uv-reveal-left relative pl-8', [
              div('absolute bottom-[-28px] left-[7px] top-4 w-px bg-secondary/40'),
              img('absolute left-0 top-1 w-4', '{{asset.diamond}}'),
              p('text-[10.5px] font-semibold uppercase tracking-[0.3em] text-secondary', '{{item.date}}'),
              el('h3', 'mt-0.5 font-heading text-[21px] text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-surface px-5',
      children: [
        div('py-20 text-center', [
          ...title('Gallery', 'Momen Berharga'),
          div('columns-2 gap-3', [
            div('uv-reveal-mask mb-3 break-inside-avoid overflow-hidden rounded-t-[999px] rounded-b-[14px]', [
              img('w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative bg-base px-6 py-20 text-center',
      children: [
        ...title('Konfirmasi', 'Kehadiran'),
        div('uv-reveal-flip relative rounded-[20px] border border-secondary/30 bg-surface p-6 text-left shadow-[0_14px_34px_rgba(27,42,65,0.08)]', [
          ...corners('2'),
          div('relative', [
            comp('rsvp_form', '', {
              input_class: 'w-full rounded-none border-0 border-b border-secondary/50 bg-transparent px-1 py-2.5 text-[16px] text-ink outline-none focus:border-primary',
              button_class: 'w-full rounded-full bg-primary py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60',
              label_class: 'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted',
            }),
          ]),
        ]),
        el('h3', 'uv-reveal mb-5 mt-12 font-heading text-[22px] text-primary', 'Doa & Ucapan'),
        comp('wishes', 'text-left', { item_class: 'border-l-2 border-secondary/60 bg-surface px-4 py-3', name_class: 'font-heading text-[16px] text-primary', text_class: 'text-[13px] text-muted' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-6',
      children: [
        div('py-20 text-center', [
          ...title('Wedding Gift', 'Tanda Kasih'),
          p('uv-reveal text-[13px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-7 grid gap-6', [
            div('uv-reveal-flip', [
              // tanpa overflow-hidden agar lapisan 3D tidak dipipihkan
              div(`uv-tilt relative rounded-[18px] bg-gradient-to-br from-[#24375a] via-[${NAVY}] to-[${DEEP}] p-6 text-left text-white shadow-[0_24px_46px_rgba(17,27,43,0.35)]`, [
                div('uv-shine pointer-events-none absolute inset-0 rounded-[18px]'),
                div(`pointer-events-none absolute inset-2 rounded-[13px] border border-[${CHAMP}]/30`),
                img('uv-depth-2 pointer-events-none absolute right-5 top-5 w-10', '{{asset.diamond}}'),
                p(`uv-depth-1 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-[${CHAMP}]`, '{{item.bank}}'),
                p('uv-depth-2 mt-6 font-heading text-[25px] tracking-[0.1em]', '{{item.number}}'),
                p('uv-depth-1 text-[12.5px] text-white/75', 'a.n. {{item.holder}}'),
                div('uv-depth-2 mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${CHAMP}]/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[${CHAMP}]` })]),
              ]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: `relative flex min-h-[92svh] flex-col items-center justify-end overflow-hidden bg-[${DEEP}] px-8 pb-24 pt-40 text-center text-white`,
      children: [
        comp('photo_slider', '', { dots: 'false', interval: '6000' }),
        div(`absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[${DEEP}] via-[${DEEP}]/85 to-transparent`),
        div('uv-reveal-zoom relative w-9', [img('uv-spin3d w-full', '{{asset.diamond}}')]),
        p('uv-reveal uv-d1 relative mt-6 text-[13px] text-white/85', '{{closing_text}}'),
        p(`uv-reveal uv-d2 relative mt-3 font-heading text-[15px] italic text-[${CHAMP}]`, '{{closing_greeting}}'),
        p('uv-reveal uv-d3 relative mt-9 font-script text-[48px] leading-none', 'Terima Kasih'),
        img('uv-reveal uv-d4 relative mx-auto mt-2 h-6 w-44', '{{asset.curve}}'),
        el('h2', `uv-reveal uv-d4 relative mt-2 font-heading text-[26px] tracking-[0.08em] text-[${CHAMP}]`, '{{couple_names}}'),
      ],
    },
  ],
}
