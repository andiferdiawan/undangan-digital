import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/lontara-bugis'
const GOLD = '#e8c66f'
const EMERALD = '#0e4636'

const title = (eyebrow: string, heading: string, light = false) => [
  p(`uv-reveal text-[10.5px] font-bold uppercase tracking-[0.34em] ${light ? `text-[${GOLD}]` : 'text-accent'}`, eyebrow),
  el('h2', `uv-reveal uv-d1 mt-1 font-heading text-[30px] leading-tight ${light ? 'text-[#fbf3e4]' : 'text-primary'}`, heading),
  img('uv-reveal-zoom uv-d2 mx-auto my-4 h-5 w-44', '{{asset.divider}}'),
]
const walasuji = (pos: string) => img(`pointer-events-none absolute inset-x-0 ${pos} z-10 h-6 w-full object-cover`, '{{asset.walasuji}}')
/** Bunga emas melayang dengan rotasi 3D (hiasan) */
const bunga = (pos: string, size = 'w-8', delay = '') =>
  div(`pointer-events-none absolute ${pos} ${size} opacity-80`, [img(`uv-float3d w-full ${delay}`, '{{asset.bunga}}')])

/**
 * Bingkai lengkung emas 3D: foto (lapisan 1), bingkai (lapisan 2), nama (lapisan 3)
 * — bergerak mengikuti giroskop/mouse sehingga terasa berlapis.
 */
function arch(photo: ThemeNode[], label?: ThemeNode, size = 'w-56'): ThemeNode {
  return div(`uv-tilt relative mx-auto aspect-[3/4] ${size}`, [
    div('uv-depth-1 absolute inset-[7%] overflow-hidden rounded-t-[999px] bg-primary shadow-[0_24px_50px_rgba(0,0,0,0.35)]', photo),
    img('uv-depth-2 pointer-events-none absolute inset-0 h-full w-full', '{{asset.bingkai}}'),
    ...(label ? [label] : []),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  const isBride = who === 'bride'
  return div(`${isBride ? 'uv-reveal-right' : 'uv-reveal-left'} mt-10 text-center`, [
    arch([
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, isBride ? 'Foto mempelai wanita' : 'Foto mempelai pria', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center bg-gradient-to-b from-[#135543] to-[#0a3328]', [
        el('span', `font-script text-7xl text-[${GOLD}]`, `{{${who}_nickname}}`),
      ], { if: `!${who}_photo` }),
      div('absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent'),
    ], p(`uv-depth-3 absolute inset-x-0 bottom-[10%] font-script text-[42px] leading-none text-[#fbf3e4] [text-shadow:0_4px_14px_rgba(0,0,0,0.6)]`, `{{${who}_nickname}}`, { if: `${who}_photo` }), 'w-60'),
    el('h3', 'mt-5 font-heading text-[26px] leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 text-[13.5px] text-muted', `{{${who}_parents}}`),
    el('a', 'mt-3 inline-flex rounded-full border border-accent/60 px-4 py-1.5 text-xs font-bold text-accent', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

const goldBtn = `uv-shine inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c79a3e] via-[${GOLD}] to-[#c79a3e] px-7 py-3 text-sm font-bold text-[#0a3328] shadow-[0_10px_26px_rgba(232,198,111,0.35)]`

export const meta = {
  code: 'ADT-004',
  slug: 'lontara-bugis',
  name: 'Lontara Bugis',
  category: 'adat',
  description: 'Adat Bugis berfoto dengan gerak 3D: foto mempelai dalam bingkai lengkung emas yang bergerak mengikuti kemiringan ponsel, bosara dan bunga emas berputar 3D, motif lipa\' sabbe hijau zamrud, walasuji, dan animasi muncul saat digulir.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: EMERALD,
    secondary_color: '#7a1f2b',
    accent_color: '#b8862f',
    background_color: '#f8f0e0',
    surface_color: '#fffaf0',
    text_color: '#22302a',
    muted_color: '#6c7568',
    font_heading: 'Cinzel',
    font_body: 'Nunito',
    font_script: 'Pinyon Script',
  },
  root_class: 'text-[14px] leading-relaxed',
  assets: {
    sabbe: `${A}/sabbe.svg`,
    walasuji: `${A}/walasuji.svg`,
    bingkai: `${A}/bingkai.svg`,
    bosara: `${A}/bosara.svg`,
    bunga: `${A}/bunga.svg`,
    divider: `${A}/divider.svg`,
  },
  demo: {
    cover_photos: [`${A}/slide-3.jpg`, `${A}/bride.jpg`, `${A}/slide-2.jpg`],
    gallery: [`${A}/keluarga.jpg`, `${A}/bride.jpg`, `${A}/groom.jpg`, `${A}/slide-3.jpg`, `${A}/slide-2.jpg`, `${A}/pelaminan.jpg`],
    groom_photo: `${A}/groom.jpg`,
    bride_photo: `${A}/bride.jpg`,
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-14 text-center',
      bg: '{{asset.sabbe}}',
      children: [
        div(`absolute inset-0 bg-gradient-to-b from-[#0a3328]/92 via-[${EMERALD}]/85 to-[#06241c]/96`),
        walasuji('top-0'),
        bunga('left-5 top-14', 'w-9'),
        bunga('right-6 top-24', 'w-7', 'uv-d2'),
        bunga('bottom-24 left-8', 'w-6'),
        p(`uv-reveal relative text-[10.5px] font-bold uppercase tracking-[0.36em] text-[${GOLD}]`, 'Mappabotting'),
        div('uv-reveal-zoom uv-d1 relative mt-4 w-full', [
          arch([
            comp('photo_slider', '', { dots: 'false', interval: '4500' }),
            div('absolute inset-0 -z-10 grid place-items-center bg-gradient-to-b from-[#135543] to-[#0a3328]', [
              img('uv-spin3d w-20', '{{asset.bosara}}'),
            ]),
          ], undefined, 'w-52'),
        ]),
        el('h1', `uv-reveal-zoom uv-d2 relative mt-4 font-script text-[50px] leading-none text-[${GOLD}] [text-shadow:0_6px_20px_rgba(0,0,0,0.4)]`, '{{couple_names}}'),
        p(`uv-reveal uv-d3 relative mt-2 font-heading text-xs tracking-[0.25em] text-[#f3dc9c]`, '{{event_date}}'),
        div(`uv-reveal uv-d4 relative mx-auto mt-5 w-full max-w-[290px] rounded-2xl border border-[${GOLD}]/50 bg-white/10 px-4 py-3 backdrop-blur-md`, [
          p('text-[11px] text-white/80', 'Tabe\', Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-0.5 block font-heading text-lg text-white', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal uv-d5 relative mt-6', [comp('open_button', goldBtn, { label: '✉ Buka Undangan' })]),
        walasuji('bottom-0'),
      ],
    },
    {
      type: 'hero',
      class: 'relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-primary px-6 pb-16 pt-40 text-center text-white',
      bg: '{{asset.sabbe}}',
      children: [
        // Tanpa foto: pola sabbe + bosara 3D mengisi ruang atas
        div('absolute inset-x-0 top-[18%] flex justify-center', [img('uv-spin3d w-24 opacity-90', '{{asset.bosara}}')]),
        comp('photo_slider', '', { interval: '5000' }),
        div('absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#06241c] via-[#06241c]/75 to-transparent'),
        walasuji('top-0'),
        p('uv-reveal relative font-arabic text-[24px] text-[#f3dc9c]', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        p(`uv-reveal uv-d1 relative mt-4 text-[10.5px] font-bold uppercase tracking-[0.34em] text-[${GOLD}]`, 'Tudang Botting'),
        el('h2', 'uv-reveal-zoom uv-d2 relative mt-1 font-script text-[56px] leading-none [text-shadow:0_6px_20px_rgba(0,0,0,0.45)]', '{{couple_names}}'),
        p('uv-reveal uv-d3 relative mt-2 font-heading text-sm tracking-[0.2em] text-white/90', '{{event_date}}'),
        div('uv-reveal-flip uv-d4 relative mt-6', [
          comp('countdown', '', {
            item_class: `rounded-2xl border border-[${GOLD}]/40 bg-white/10 py-3 backdrop-blur-md`,
            number_class: `block font-heading text-[28px] leading-none text-[${GOLD}]`,
            label_class: 'mt-1 block text-[10px] uppercase tracking-widest text-white/80',
          }),
        ]),
        div('uv-reveal uv-d5 relative mt-5', [comp('calendar_button', '', { label: '▦ Simpan ke Kalender', button_class: goldBtn })]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-base px-8 py-16 text-center',
      children: [
        div('uv-reveal-zoom mx-auto w-16', [img('uv-spin3d w-full', '{{asset.bosara}}', 'Bosara')]),
        p('uv-reveal uv-d1 mt-6 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
        p('uv-reveal uv-d2 mt-4 text-[13.5px] italic text-muted', '"{{quote_text}}"'),
        p('uv-reveal uv-d3 mt-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-16',
      children: [
        bunga('right-4 top-6', 'w-8'),
        bunga('left-4 top-[48%]', 'w-6', 'uv-d2'),
        p('uv-reveal text-center font-script text-[34px] leading-tight text-primary', '{{greeting}}'),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] text-center text-[13.5px] text-ink/80', '{{opening_text}}'),
        person('groom'),
        div('uv-reveal-zoom my-8 flex items-center justify-center gap-4', [
          div('h-px w-16 bg-accent/50'),
          p('font-script text-6xl leading-none text-accent', '&'),
          div('h-px w-16 bg-accent/50'),
        ]),
        person('bride'),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden px-6 py-20 text-center',
      bg: '{{asset.sabbe}}',
      children: [
        div(`absolute inset-0 bg-gradient-to-b from-[${EMERALD}]/95 to-[#06241c]/95`),
        walasuji('top-0'),
        div('relative', title('Save the Date', 'Rangkaian Acara', true)),
        div('relative grid gap-5', [
          el('article', `uv-reveal-flip relative rounded-[26px] border border-[${GOLD}]/50 bg-surface p-6 text-ink shadow-[0_20px_40px_rgba(0,0,0,0.3)]`, [
            p('text-[10.5px] font-bold uppercase tracking-[0.3em] text-accent', '{{item.day}}'),
            el('h3', 'mt-1 font-heading text-[26px] leading-tight text-primary', '{{item.name}}'),
            img('mx-auto my-3 h-4 w-32', '{{asset.divider}}'),
            p('font-bold text-primary', '{{item.date}}'),
            p('text-sm text-secondary', '{{item.time}}'),
            p('mt-4 font-heading text-lg text-primary', '{{item.venue}}'),
            p('text-[13px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-5 ${goldBtn}`, { href: '{{item.map_url}}', label: '⌖ Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
        walasuji('bottom-0'),
      ],
    },
    {
      type: 'story',
      class: 'bg-base px-6',
      children: [
        div('py-16 text-center', [
          ...title('Our Story', 'Kisah Kami'),
          div('grid gap-6 text-left', [
            div('uv-reveal-left relative border-l-2 border-accent/50 pl-5', [
              div('absolute -left-[9px] top-1 h-4 w-4 rotate-45 border-2 border-accent bg-base'),
              p('text-xs font-bold uppercase tracking-[0.2em] text-accent', '{{item.date}}'),
              el('h3', 'font-heading text-xl text-primary', '{{item.title}}'),
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
          ...title('Galeri', 'Momen Bahagia'),
          div('columns-2 gap-3', [
            div('uv-reveal-zoom mb-3 break-inside-avoid overflow-hidden rounded-t-[999px] rounded-b-2xl border-2 border-accent/40 p-1', [
              img('w-full rounded-t-[999px] rounded-b-xl object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'bg-base px-6 py-16 text-center',
      children: [
        ...title('Kehadiran', 'RSVP'),
        div('uv-reveal-flip rounded-[26px] border border-accent/30 bg-surface p-5 text-left shadow-[0_12px_30px_rgba(14,70,54,0.10)]', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-accent/40 bg-base px-4 py-2.5 text-[16px] text-ink outline-none focus:border-primary',
            button_class: 'w-full rounded-full bg-primary py-3 font-bold text-white disabled:opacity-60',
          }),
        ]),
        el('h3', 'uv-reveal mb-4 mt-10 font-heading text-xl text-primary', 'Ucapan & Doa'),
        comp('wishes', 'text-left', { item_class: 'rounded-2xl border border-accent/25 bg-surface p-4', name_class: 'font-bold text-primary' }),
      ],
    },
    {
      type: 'gift',
      class: 'bg-surface px-6',
      children: [
        div('py-16 text-center', [
          ...title('Tanda Kasih', 'Amplop Digital'),
          p('uv-reveal text-[13.5px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-6 grid gap-5', [
            div('uv-reveal-flip', [
              // Kartu 3D berlapis: latar, kilau emas, dan teks mengambang
              // tanpa overflow-hidden agar lapisan 3D (translateZ) tidak dipipihkan
              div(`uv-tilt relative rounded-[22px] bg-gradient-to-br from-[#135543] via-[${EMERALD}] to-[#06241c] p-6 text-left text-white shadow-[0_22px_44px_rgba(6,36,28,0.35)]`, [
                div('uv-shine pointer-events-none absolute inset-0 rounded-[22px]'),
                img('pointer-events-none absolute right-4 top-4 w-16 opacity-30', '{{asset.bunga}}'),
                p(`uv-depth-1 text-xs font-bold uppercase tracking-[0.25em] text-[${GOLD}]`, '{{item.bank}}'),
                p('uv-depth-2 mt-4 font-heading text-[24px] tracking-[0.12em]', '{{item.number}}'),
                p('uv-depth-1 text-[13px] text-white/80', 'a.n. {{item.holder}}'),
                div('uv-depth-2 mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full border border-[${GOLD}]/70 px-4 py-1.5 text-xs font-bold text-[${GOLD}]` })]),
              ]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative flex min-h-[90svh] flex-col justify-end overflow-hidden bg-primary px-8 pb-24 pt-40 text-center text-white',
      children: [
        comp('photo_slider', '', { dots: 'false', interval: '6000' }),
        div(`absolute inset-0 bg-gradient-to-b from-transparent via-[${EMERALD}]/70 to-[#06241c]`),
        walasuji('bottom-0'),
        div('uv-reveal-zoom relative mx-auto w-14', [img('uv-spin3d w-full', '{{asset.bosara}}')]),
        p('uv-reveal uv-d1 relative mt-5 text-[13.5px] text-white/90', '{{closing_text}}'),
        p('uv-reveal uv-d2 relative mt-3 font-heading text-sm', '{{closing_greeting}}'),
        p(`uv-reveal uv-d3 relative mt-8 font-script text-[46px] leading-none text-[${GOLD}]`, 'Terima Kasih'),
        el('h2', 'uv-reveal-zoom uv-d4 relative mt-2 font-heading text-[28px] tracking-[0.12em]', '{{couple_names}}'),
      ],
    },
  ],
}
