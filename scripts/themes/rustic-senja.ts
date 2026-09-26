import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/rustic-senja'
const TAUPE = '#a8977a'
const title = (script: string, heading: string, light = false) => [
  p(`font-script text-[40px] leading-none ${light ? 'text-white/90' : 'text-secondary'}`, script),
  el('h2', `mt-1 font-heading text-[26px] uppercase tracking-[0.18em] ${light ? 'text-white' : 'text-primary'}`, heading),
  div(`mx-auto my-5 h-px w-16 ${light ? 'bg-white/60' : 'bg-secondary/60'}`),
]
/** Tombol bergaya kurung ( … ) seperti referensi */
const bracketBtn = 'inline-flex items-center gap-2 rounded-xl border-x-2 border-white px-5 py-2 text-sm font-bold text-white'

/** Foto mempelai dengan pita vertikal "THE GROOM/BRIDE" */
function person(who: 'groom' | 'bride'): ThemeNode {
  const isBride = who === 'bride'
  const band = div('grid place-items-center bg-secondary py-4', [
    el('span', '[writing-mode:vertical-rl] rotate-180 font-heading text-[26px] uppercase tracking-[0.25em] text-white', isBride ? 'The Bride' : 'The Groom'),
  ])
  const photo = div('relative aspect-[3/4] overflow-hidden bg-accent', [
    img('absolute inset-0 h-full w-full object-cover object-[35%_center]', `{{${who}_photo}}`, isBride ? 'Foto mempelai wanita' : 'Foto mempelai pria', { if: `${who}_photo` }),
    el('span', 'absolute inset-0 grid place-items-center font-script text-7xl text-white/90', `{{${who}_nickname}}`, { if: `!${who}_photo` }),
    div('absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent'),
    p(`absolute bottom-3 ${isBride ? 'right-4' : 'left-4'} font-heading text-3xl text-white`, `{{${who}_nickname}}`),
  ])
  return div(`mt-10 ${isBride ? 'text-right' : 'text-left'}`, [
    div(`grid w-[88%] overflow-hidden ${isBride ? 'ml-auto grid-cols-[1fr_54px] rounded-tl-[64px]' : 'grid-cols-[54px_1fr] rounded-tr-[64px]'}`,
      isBride ? [photo, band] : [band, photo]),
    el('h3', 'mt-4 font-heading text-[30px] leading-tight text-secondary', `{{${who}_name}}`),
    p('mt-1 text-[13.5px] text-ink/80', `{{${who}_parents}}`),
    el('a', 'mt-3 inline-flex rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-white', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'RST-002',
  slug: 'rustic-senja',
  name: 'Rustic Senja',
  category: 'rustic',
  description: 'Rustic modern berbasis foto: sampul dan halaman depan berupa slider foto prewedding yang memudar ke warna taupe, profil mempelai berpita vertikal, nuansa hangat dan natural.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#6b5a41',
    secondary_color: TAUPE,
    accent_color: '#cdbd9f',
    background_color: '#f7f3ec',
    surface_color: '#ffffff',
    text_color: '#3d3428',
    muted_color: '#857a6a',
    font_heading: 'Italiana',
    font_body: 'Quicksand',
    font_script: 'Ephesis',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {},
  demo: {
    cover_photos: [`${A}/slide-1.jpg`, `${A}/slide-2.jpg`, `${A}/slide-3.jpg`],
    gallery: [`${A}/slide-1.jpg`, `${A}/decor-1.jpg`, `${A}/rings.jpg`, `${A}/bride-2.jpg`, `${A}/slide-3.jpg`, `${A}/decor-2.jpg`],
    groom_photo: `${A}/slide-2.jpg`,
    bride_photo: `${A}/bride.jpg`,
  },
  sections: [
    {
      type: 'cover',
      class: `flex flex-col justify-end overflow-hidden bg-secondary px-8 pb-14 text-center text-white`,
      children: [
        comp('photo_slider', '', { dots: 'false' }),
        div(`absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-b from-transparent via-[${TAUPE}]/85 to-[${TAUPE}]`),
        p('relative font-heading text-[15px] uppercase tracking-[0.3em]', 'The Wedding of'),
        el('h1', 'relative mt-2 font-heading text-[44px] leading-tight', '{{couple_names}}'),
        p('relative mt-6 text-[13px] italic text-white/90', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
        comp('guest_name', 'relative mt-1 block font-heading text-[26px] tracking-wide', { fallback: 'Tamu Undangan' }),
        p('relative mt-2 text-[11px] italic text-white/80', '*Mohon maaf apabila ada kesalahan penulisan nama dan gelar'),
        comp('open_button', `relative mx-auto mt-7 ${bracketBtn}`, { label: '✉ Buka Undangan' }),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-secondary px-4 pb-6 pt-40',
      children: [
        comp('photo_slider', '', { interval: '5000' }),
        div('absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent'),
        div(`relative rounded-[36px] bg-[${TAUPE}]/90 px-6 pb-6 pt-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm`, [
          p('font-heading text-sm uppercase tracking-[0.28em] text-white/90', 'The Wedding of'),
          el('h2', 'mt-1 font-heading text-[40px] leading-tight', '{{couple_names}}'),
          p('text-[13px] text-white/85', '{{event_date}}'),
          div('mt-4', [
            comp('countdown', '', { item_class: 'py-1', number_class: 'block font-heading text-[34px] leading-none text-white', label_class: 'text-[11px] text-white/80' }),
          ]),
          div('mt-4', [comp('calendar_button', '', { label: '▦ Simpan ke Kalender', button_class: bracketBtn })]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'bg-base px-8 py-16 text-center',
      children: [
        p('font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
        p('mt-4 text-[13.5px] italic text-muted', '"{{quote_text}}"'),
        p('mt-3 font-heading text-sm uppercase tracking-[0.2em] text-secondary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'bg-surface px-6 py-16',
      children: [
        p('text-center font-script text-[38px] leading-tight text-primary', '{{greeting}}'),
        p('mx-auto mt-3 max-w-[320px] text-center text-[13.5px] text-ink/80', '{{opening_text}}'),
        person('groom'),
        p('my-8 text-center font-script text-6xl text-secondary', '&'),
        person('bride'),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden bg-secondary px-6 py-16 text-center text-white',
      children: [
        ...title('Save the Date', 'Acara Pernikahan', true),
        el('article', 'mt-2 rounded-[28px] bg-surface/95 p-6 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.12)]', [
          el('h3', 'font-heading text-[32px] leading-tight text-primary', '{{item.name}}'),
          div('mx-auto my-3 h-px w-12 bg-secondary/60'),
          p('font-bold text-primary', '{{item.date}}'),
          p('text-sm text-secondary', '{{item.time}}'),
          p('mt-4 font-heading text-xl text-primary', '{{item.venue}}'),
          p('text-[13px] text-muted', '{{item.address}}'),
          comp('map_button', 'mt-5 inline-flex rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white', { href: '{{item.map_url}}', label: '⌖ Lihat Lokasi' }, { if: 'item.map_url' }),
        ], { repeat: 'events' }),
      ],
    },
    {
      type: 'story',
      class: 'bg-base px-6',
      children: [
        div('py-16 text-center', [
          ...title('Our Story', 'Kisah Kami'),
          div('grid gap-6 text-left', [
            div('relative border-l-2 border-secondary/50 pl-5', [
              div('absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-secondary'),
              p('text-xs font-bold uppercase tracking-[0.2em] text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-2xl text-primary', '{{item.title}}'),
              p('mt-1 text-[13.5px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-surface px-4',
      children: [
        div('py-16 text-center', [
          ...title('Moments', 'Galeri'),
          div('columns-2 gap-2', [
            img('mb-2 w-full rounded-2xl object-cover', '{{item.url}}', '{{item.caption}}', { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-base px-6 py-16 text-center',
      children: [
        ...title('Kehadiran', 'RSVP'),
        div('rounded-[28px] bg-surface p-5 text-left shadow-[0_10px_24px_rgba(107,90,65,0.10)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-secondary/40 bg-base px-4 py-2.5 text-[16px] text-ink outline-none focus:border-secondary',
            button_class: 'w-full rounded-full bg-secondary py-3 font-bold text-white disabled:opacity-60',
          }),
        ]),
        el('h3', 'mb-4 mt-10 font-heading text-2xl text-primary', 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: 'rounded-2xl bg-surface p-4 shadow-sm', name_class: 'font-bold text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-6',
      children: [
        div('py-16 text-center', [
          ...title('Wedding Gift', 'Amplop Digital'),
          p('text-[13.5px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-6 grid gap-3', [
            div('rounded-[24px] bg-secondary p-6 text-white', [
              p('text-xs font-bold uppercase tracking-[0.2em] text-white/80', '{{item.bank}}'),
              p('mt-2 font-heading text-[28px] tracking-wide', '{{item.number}}'),
              p('text-[13px] text-white/85', 'a.n. {{item.holder}}'),
              comp('copy_button', 'mt-4', { value: '{{item.number}}', label: 'Salin Nomor', button_class: bracketBtn }),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative flex min-h-[85svh] flex-col justify-end overflow-hidden bg-secondary px-8 pb-24 pt-40 text-center text-white',
      children: [
        comp('photo_slider', '', { dots: 'false', interval: '6000' }),
        div(`absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-b from-transparent via-[${TAUPE}]/85 to-[${TAUPE}]`),
        p('relative text-[13.5px] text-white/90', '{{closing_text}}'),
        p('relative mt-3 font-heading text-lg', '{{closing_greeting}}'),
        p('relative mt-8 font-script text-[44px] leading-none', 'Terima Kasih'),
        el('h2', 'relative mt-2 font-heading text-[36px]', '{{couple_names}}'),
      ],
    },
  ],
}
