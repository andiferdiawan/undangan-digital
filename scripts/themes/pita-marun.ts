import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Pita Marun — luxury merah marun, krem, dan emas. Pembuka: kartu lipat (gatefold) beludru marun diikat
 * pita satin emas. Setelah "Buka Undangan" diketuk (uv-play):
 * 1. simpul pita tertarik ke samping, mengecil dan terlepas
 * 2. pita vertikal meluncur turun, pita mendatar tertarik ke kiri & kanan
 * 3. kedua pintu kartu berayun terbuka 3D, menampilkan kartu krem berisi nama mempelai
 * Isi: kartu berbingkai ornamen + pita emas, tiket acara bertepi gerigi, catatan berklip (dress code,
 * konfirmasi), polaroid berklip, amplop marun berbintang untuk tanda kasih, amplop krem bersegel lilin di penutup.
 */
const A = '/theme-assets/pita-marun'

// ---------- Adegan waktu (uv-play): --uv-t 0 → 1 ----------
const T = 'var(--uv-t,1)'
const ramp = (from: number, speed: number) => `clamp(0,(${T}_-_${from})*${speed},1)`
const sm = (r: string) => `calc(${r}*${r}*(3_-_2*${r}))`

// ---------- Gaya ----------
const SATIN_H = 'bg-[linear-gradient(180deg,#9a6d2b,#f1d896_45%,#d2a85a_60%,#8c6224)]'
const SATIN_V = 'bg-[linear-gradient(90deg,#9a6d2b,#f1d896_45%,#d2a85a_60%,#8c6224)]'
const VELVET = 'bg-[linear-gradient(140deg,#7d1424,#4b0811_70%,#3d060d)]'
const btnGold = 'inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9cf8c,#c9a35b_50%,#a87b34)] px-8 py-3 font-body text-[13px] font-semibold uppercase tracking-[0.25em] text-primary shadow-[0_12px_26px_-12px_rgba(0,0,0,0.8)]'
const btnWine = 'inline-flex items-center justify-center bg-primary px-7 py-3 font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-surface'
const scriptGold = (t: string, cls = '', size = 48) => el('h2', `font-script text-[${size}px] leading-tight text-accent ${cls}`, t)
const kicker = (t: string, cls = 'text-ink/70') => p(`font-body text-[12px] font-semibold uppercase tracking-[0.35em] ${cls}`, t)
const sparkle = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.bintang}}')
const photoTone = 'sepia-[.12] saturate-[.95]'

/** Bingkai ornamen emas di dalam kartu krem: garis ganda + empat sudut filigri. */
const frame = (): ThemeNode[] => [
  div('pointer-events-none absolute inset-[7px] border border-accent/45'),
  img('pointer-events-none absolute left-[3px] top-[3px] w-14', '{{asset.sudut}}'),
  img('pointer-events-none absolute right-[3px] top-[3px] w-14 -scale-x-100', '{{asset.sudut}}'),
  img('pointer-events-none absolute bottom-[3px] left-[3px] w-14 -scale-y-100', '{{asset.sudut}}'),
  img('pointer-events-none absolute bottom-[3px] right-[3px] w-14 rotate-180', '{{asset.sudut}}'),
]
/** Klip kertas emas di tepi atas catatan/foto. */
const clip = (cls = 'left-1/2 -ml-[9px]') => img(`pointer-events-none absolute -top-5 z-10 h-12 w-[18px] ${cls}`, '{{asset.klip}}')

// ---------- Kartu lipat berpita (gatefold 3D) ----------
const W = 260
const H = 380
function door(side: 'l' | 'r', open: string): ThemeNode {
  const l = side === 'l'
  return div(`absolute inset-y-0 ${l ? 'left-0' : 'right-0'} w-1/2 [transform-style:preserve-3d] [transform-origin:${l ? 'left' : 'right'}_center] [transform:rotateY(calc(${open}*${l ? '-108' : '108'}deg))_translateZ(1px)]`, [
    // muka luar: beludru marun berbingkai emas
    div(`absolute inset-0 ${l ? 'rounded-l-[3px]' : 'rounded-r-[3px]'} ${VELVET} shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] [backface-visibility:hidden]`, [
      div(`pointer-events-none absolute inset-y-[10px] ${l ? 'left-[10px] right-0 border-r-0' : 'left-0 right-[10px] border-l-0'} border border-accent/60`),
      img(`pointer-events-none absolute top-[6px] w-12 ${l ? 'left-[6px]' : 'right-[6px] -scale-x-100'}`, '{{asset.sudut}}'),
      img(`pointer-events-none absolute bottom-[6px] w-12 ${l ? 'left-[6px] -scale-y-100' : 'right-[6px] rotate-180'}`, '{{asset.sudut}}'),
    ]),
    // muka dalam: krem
    div(`absolute inset-0 bg-surface bg-[linear-gradient(90deg,rgba(0,0,0,0.06),transparent_30%)] [backface-visibility:hidden] [transform:rotateY(180deg)]`, [
      div('pointer-events-none absolute inset-[8px] border border-accent/40'),
    ]),
  ])
}
/**
 * Progres adegan dibaca dari variabel CSS milik wadah luar (lihat hero): --pl simpul ditarik, --sl pita meluncur,
 * --op pintu terbuka, --rv isi kartu tampil. Tanpa wadah (sampul) semuanya 0 = masih terikat.
 */
function gatefold(): ThemeNode {
  return div(`relative mx-auto h-[${H}px] w-[${W}px] [perspective:1200px] [transform-style:preserve-3d]`, [
    // kartu dalam (terlihat setelah pintu terbuka)
    div('absolute inset-0 rounded-[3px] bg-surface px-6 text-center text-primary shadow-[0_30px_50px_-24px_rgba(0,0,0,0.85)] [transform:translateZ(-1px)]', [
      ...frame(),
      div(`relative flex h-full flex-col items-center justify-center [opacity:var(--rv,0)]`, [
        p('font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/60', 'The Wedding of'),
        p('mt-3 font-script text-[46px] leading-[1.05] text-primary', '{{groom_nickname}}'),
        p('font-heading text-[22px] italic leading-none text-accent', '&'),
        p('font-script text-[46px] leading-[1.05] text-primary', '{{bride_nickname}}'),
        div('mx-auto mt-4 h-px w-20 bg-accent/60'),
        p('mt-4 font-heading text-[15px] italic text-primary/80', '{{event_date}}'),
      ]),
    ]),
    door('l', 'var(--op,0)'),
    door('r', 'var(--op,0)'),
    // pita: vertikal meluncur turun, mendatar tertarik ke kiri & kanan
    div(`absolute inset-y-0 left-1/2 -ml-[11px] w-[22px] ${SATIN_V} shadow-[0_0_6px_rgba(0,0,0,0.45)] [opacity:calc(1_-_var(--sl,0)*1.7)] [transform:translateZ(2px)_translateY(calc(var(--sl,0)*70%))]`),
    div(`absolute left-0 top-1/2 -mt-[11px] h-[22px] w-1/2 ${SATIN_H} shadow-[0_2px_5px_rgba(0,0,0,0.45)] [opacity:calc(1_-_var(--sl,0))] [transform:translateZ(2px)_translateX(calc(var(--sl,0)*-125%))]`),
    div(`absolute right-0 top-1/2 -mt-[11px] h-[22px] w-1/2 ${SATIN_H} shadow-[0_2px_5px_rgba(0,0,0,0.45)] [opacity:calc(1_-_var(--sl,0))] [transform:translateZ(2px)_translateX(calc(var(--sl,0)*125%))]`),
    // simpul: tertarik ke kanan atas, berputar, mengecil, lalu lepas
    div(`absolute left-1/2 top-1/2 -ml-[78px] -mt-[55px] w-[156px] [opacity:calc(1_-_var(--pl,0))] [transform:translateZ(4px)_translate(calc(var(--pl,0)*70px),calc(var(--pl,0)*-34px))_rotate(calc(var(--pl,0)*28deg))_scale(calc(1_-_var(--pl,0)*0.55))]`, [
      img('w-full', '{{asset.pita}}', 'Pita emas'),
    ]),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('', [
    div('relative mx-auto aspect-[3/4] w-[118px] overflow-hidden rounded-[50%] bg-secondary/15 ring-1 ring-accent ring-offset-4 ring-offset-surface', [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[40px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    p('mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-accent', who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-heading text-[17px] font-semibold leading-snug text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[13px] italic leading-snug text-primary/70', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-1 inline-block font-body text-[12px] font-semibold text-accent underline underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-008',
  slug: 'pita-marun',
  name: 'Pita Marun',
  category: 'elegan',
  description: 'Luxury merah marun, krem, dan emas. Dibuka dengan menarik pita satin emas: simpul terlepas, pita meluncur, lalu kartu lipat beludru terbuka 3D. Kartu berbingkai ornamen, tiket acara, catatan berklip, polaroid, amplop berbintang, dan amplop bersegel lilin emas.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#6b0f1a',
    secondary_color: '#8c1d2b',
    accent_color: '#c9a35b',
    background_color: '#560a14',
    surface_color: '#f7f0e3',
    text_color: '#f3e6cc',
    // muted dipakai komponen bawaan di dalam kartu krem (tombol kehadiran RSVP, label ucapan)
    muted_color: '#8a5d55',
    font_heading: 'Playfair Display',
    font_body: 'EB Garamond',
    font_script: 'Alex Brush',
  },
  root_class: 'text-[16px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    pita: `${A}/pita-simpul.svg`,
    segel: `${A}/segel-emas.svg`,
    klip: `${A}/klip.svg`,
    sudut: `${A}/sudut-emas.svg`,
    bintang: `${A}/bintang.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul: kartu lipat masih terikat pita ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden bg-base bg-[radial-gradient(ellipse_at_50%_35%,#7a1424,transparent_70%)] px-6 py-10 text-center',
      children: [
        sparkle('left-4 top-6 w-20 opacity-70'),
        sparkle('bottom-10 right-3 w-24 rotate-90 opacity-60'),
        p('uv-reveal-zoom relative font-script text-[52px] leading-none text-accent', 'Undangan'),
        p('uv-reveal uv-d1 relative mt-1 font-body text-[12px] font-semibold uppercase tracking-[0.4em] text-ink/75', 'Pernikahan'),
        p('uv-reveal uv-d2 relative mt-1 font-heading text-[14px] italic text-accent', '{{event_date}}'),
        div('uv-reveal-pop uv-d3 relative mt-4', [
          div('-mb-[106px] origin-top scale-[0.72]', [gatefold()]),
        ]),
        p('uv-reveal uv-d4 relative mt-6 font-body text-[14px] italic text-ink/75', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
        comp('guest_name', 'relative mt-1 block font-heading text-[22px] italic leading-snug text-ink', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop uv-d5 relative mt-5', [comp('open_button', btnGold, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Pembuka: pita ditarik, kartu terbuka ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base bg-[radial-gradient(ellipse_at_50%_30%,#7a1424,transparent_65%)] px-6 pb-16 pt-12 text-center',
      children: [
        sparkle('left-3 top-4 w-24 opacity-70'),
        sparkle('right-2 top-[300px] w-20 rotate-45 opacity-60'),
        div(`uv-play relative [--uv-dur:5.6s] [--pl:${sm(ramp(0.04, 3.2))}] [--sl:${sm(ramp(0.3, 3.2))}]`, [
          div(`[--op:${sm(ramp(0.56, 2.6))}] [--rv:${ramp(0.62, 3)}]`, [gatefold()]),
        ]),
        p('uv-reveal relative mt-10 font-script text-[40px] leading-tight text-accent', 'Dengan penuh cinta'),
        p('uv-reveal uv-d1 relative mx-auto mt-2 max-w-[300px] font-body text-[16px] italic leading-snug text-ink/80', 'Hari bahagia ini ingin kami lewati bersama orang-orang terkasih. Kehadiran Anda melengkapi kebahagiaan kami.'),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 pt-4 text-center',
      children: [
        div('uv-reveal mx-auto flex items-center justify-center gap-3', [div('h-px w-12 bg-accent/60'), div('h-2 w-2 rotate-45 bg-accent'), div('h-px w-12 bg-accent/60')]),
        p('uv-reveal uv-d1 mt-6 font-arabic text-[22px] leading-loose text-accent', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d2 mx-auto mt-3 max-w-[320px] font-heading text-[17px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        p('uv-reveal uv-d3 mt-3 font-body text-[12px] font-semibold uppercase tracking-[0.3em] text-accent', '{{quote_source}}'),
      ],
    },
    // ---------- Mempelai: kartu berbingkai ornamen + pita emas ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-5 pb-16 pt-6 text-center',
      children: [
        div('uv-reveal relative mx-auto max-w-[350px] bg-surface px-6 pb-14 pt-11 text-primary shadow-[0_26px_44px_-24px_rgba(0,0,0,0.85)]', [
          ...frame(),
          p('relative font-script text-[36px] leading-tight text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
          p('relative mx-auto mt-2 max-w-[270px] font-body text-[15px] italic leading-snug text-primary/75', '{{opening_text}}'),
          div('relative mt-7 grid grid-cols-2 gap-4', [person('groom'), person('bride')]),
        ]),
        div('uv-reveal-pop relative -mt-12 flex justify-center', [img('w-44', '{{asset.pita}}', 'Pita emas')]),
        p('uv-reveal relative mx-auto mt-2 max-w-[290px] font-body text-[15px] italic leading-snug text-ink/75', '{{greeting}}'),
      ],
    },
    // ---------- Tanggal & hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-6 text-center',
      children: [
        sparkle('-right-4 top-2 w-24 opacity-60'),
        scriptGold('Save the Date', 'uv-reveal relative'),
        div('uv-reveal uv-d1 relative mx-auto mt-6 grid max-w-[320px] grid-cols-[1fr_auto_1fr] items-center gap-4', [
          p('border-y border-accent/50 py-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-ink/85', '{{event_day}}'),
          p('font-heading text-[60px] leading-none text-accent', '{{event_date_num}}'),
          p('border-y border-accent/50 py-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-ink/85', '{{event_month}} {{event_year}}'),
        ]),
        div('uv-reveal uv-d2 relative mx-auto mt-9 max-w-[320px]', [comp('countdown', '', {
          item_class: 'border border-accent/40 bg-white/[0.04] py-3 text-center',
          number_class: 'block font-heading text-[30px] leading-none text-accent',
          label_class: 'mt-1 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70',
        })]),
        div('relative mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: 'inline-flex items-center justify-center rounded-full border border-accent/70 px-6 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-accent' })]),
      ],
    },
    // ---------- Tiket acara + catatan dress code ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-6 pb-20 pt-6 text-center',
      children: [
        scriptGold('Waktu & Tempat', 'uv-reveal relative'),
        div('relative mt-10 grid gap-12', [
          el('article', 'uv-reveal relative mx-auto w-full max-w-[330px] bg-surface text-primary shadow-[0_24px_40px_-24px_rgba(0,0,0,0.85)]', [
            // tepi bergerigi atas & bawah, takik kiri-kanan, garis sobek
            div('absolute inset-x-0 -top-[6px] h-[6px] bg-[radial-gradient(circle_at_6px_6px,rgb(var(--c-surface))_5px,transparent_5.5px)] bg-[length:12px_6px] bg-repeat-x'),
            div('absolute inset-x-0 -bottom-[6px] h-[6px] bg-[radial-gradient(circle_at_6px_0,rgb(var(--c-surface))_5px,transparent_5.5px)] bg-[length:12px_6px] bg-repeat-x'),
            div('px-6 pb-6 pt-9', [
              p('font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/60', '{{item.name}}'),
              p('mt-2 font-script text-[40px] leading-[1.1] text-primary', '{{item.venue}}'),
              div('mx-auto mt-2 h-px w-16 bg-accent/60'),
            ]),
            // garis sobek + takik kiri-kanan yang selalu sejajar dengannya
            div('relative mx-6 border-t-2 border-dashed border-primary/20', [
              div('absolute -left-[36px] -top-[13px] h-6 w-6 rounded-full bg-base'),
              div('absolute -right-[36px] -top-[13px] h-6 w-6 rounded-full bg-base'),
            ]),
            div('px-6 pb-8 pt-5', [
              div('grid grid-cols-2 divide-x divide-primary/20', [
                p('px-2 font-heading text-[15px] leading-snug text-primary', '{{item.date}}'),
                p('px-2 font-heading text-[15px] leading-snug text-primary', '{{item.time}}'),
              ]),
              p('mx-auto mt-4 max-w-[260px] font-body text-[14px] italic leading-snug text-primary/70', '{{item.address}}'),
              comp('map_button', `mt-5 ${btnWine}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
            ]),
          ], { repeat: 'events' }),
        ]),
        div('uv-reveal relative mx-auto mt-14 max-w-[300px] rotate-[-2deg] bg-surface px-6 pb-7 pt-9 text-primary shadow-[0_20px_34px_-20px_rgba(0,0,0,0.85)]', [
          clip(),
          p('font-script text-[34px] leading-none text-primary', 'Dress Code'),
          p('mt-3 font-body text-[14px] italic leading-snug text-primary/75', 'Kami akan senang bila Anda berkenan hadir dengan busana bernuansa marun, emas, atau krem.'),
          div('mt-4 flex justify-center gap-2.5', [
            div('h-8 w-8 rounded-full bg-primary ring-1 ring-black/10'),
            div('h-8 w-8 rounded-full bg-secondary ring-1 ring-black/10'),
            div('h-8 w-8 rounded-full bg-[linear-gradient(135deg,#e9cf8c,#c9a35b_55%,#a87b34)] ring-1 ring-black/10'),
            div('h-8 w-8 rounded-full bg-[#efe3cc] ring-1 ring-black/10'),
          ]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('pb-16 pt-2 text-center', [
          scriptGold('Kisah Kami', 'uv-reveal'),
          div('mx-auto mt-8 grid max-w-[320px] gap-8 border-l border-accent/50 pl-6 text-left', [
            div('uv-reveal relative', [
              div('absolute -left-[31px] top-1.5 h-3 w-3 rotate-45 bg-accent'),
              p('font-body text-[12px] font-semibold uppercase tracking-[0.25em] text-accent', '{{item.date}}'),
              el('h3', 'mt-1 font-heading text-[20px] italic leading-tight text-ink', '{{item.title}}'),
              p('mt-1 font-body text-[15px] leading-snug text-ink/75', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: polaroid berklip ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-5 text-center',
      children: [
        div('relative pb-20 pt-2', [
          scriptGold('Momen Kami', 'uv-reveal relative'),
          div('relative mt-10 grid grid-cols-2 gap-x-4 gap-y-9', [
            el('figure', 'uv-reveal relative bg-surface p-2 pb-7 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.85)] [&:nth-child(odd)]:rotate-[-3deg] [&:nth-child(even)]:mt-6 [&:nth-child(even)]:rotate-[2deg]', [
              clip('left-1/2 -ml-[9px]'),
              img(`aspect-[4/5] w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Tanda kasih: amplop marun berbintang ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('pb-16 pt-2', [
          div('uv-reveal relative mx-auto max-w-[340px] bg-secondary px-6 pb-9 pt-[136px] shadow-[0_26px_44px_-24px_rgba(0,0,0,0.85)]', [
            div('pointer-events-none absolute inset-[8px] border border-dashed border-accent/55'),
            div('absolute inset-x-0 top-0 h-[122px] bg-accent/70 [clip-path:polygon(0_0,100%_0,50%_100%)]'),
            div('absolute inset-x-0 top-0 h-[119px] bg-[#7d1726] [clip-path:polygon(0_0,100%_0,50%_100%)]'),
            sparkle('-right-3 top-1 w-24 opacity-90'),
            sparkle('-left-4 top-[150px] w-16 -scale-x-100 opacity-70'),
            p('relative font-script text-[44px] leading-tight text-accent', 'Tanda Kasih'),
            p('relative mx-auto mt-2 max-w-[270px] font-body text-[15px] italic leading-snug text-ink/85', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
            div('relative mt-6 grid gap-4', [
              div('bg-surface px-5 py-6 text-primary', [
                p('font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/60', '{{item.bank}}'),
                p('mt-1 font-heading text-[26px] tracking-wider', '{{item.number}}'),
                p('font-body text-[14px] italic text-primary/70', 'a.n. {{item.holder}}'),
                div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnWine })]),
              ], { repeat: 'gifts' }),
            ]),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Konfirmasi: catatan krem berklip ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-4 text-center',
      children: [
        scriptGold('Konfirmasi Kehadiran', 'uv-reveal relative', 42),
        p('uv-reveal uv-d1 relative mx-auto mt-2 max-w-[290px] font-body text-[15px] italic leading-snug text-ink/80', 'Mohon kabari kami kehadiran Anda melalui formulir berikut.'),
        div('uv-reveal relative mx-auto mt-10 max-w-[340px] bg-surface p-6 pt-9 text-left text-primary shadow-[0_24px_40px_-24px_rgba(0,0,0,0.85)]', [
          clip('left-10'),
          comp('rsvp_form', '', {
            input_class: 'w-full border border-primary/25 bg-white px-4 py-3 font-body text-[16px] text-primary outline-none focus:border-primary',
            button_class: `w-full ${btnWine} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.18em] text-primary/70',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-4 text-center',
      children: [
        scriptGold('Doa & Ucapan', 'uv-reveal relative'),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'bg-surface p-4 text-primary',
          name_class: 'font-heading text-[16px] italic text-primary',
          text_class: 'mt-1 font-body text-[15px] leading-snug text-primary/75',
        })]),
      ],
    },
    // ---------- Penutup: amplop krem bersegel lilin emas ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base bg-[radial-gradient(ellipse_at_50%_70%,#7a1424,transparent_65%)] px-6 pb-20 pt-6 text-center',
      children: [
        sparkle('left-2 top-10 w-20 opacity-60'),
        scriptGold('Terima Kasih', 'uv-reveal relative'),
        p('uv-reveal uv-d1 relative mx-auto mt-3 max-w-[300px] font-body text-[16px] italic leading-snug text-ink/80', '{{closing_text}}'),
        div('uv-reveal-pop uv-d2 relative mx-auto mt-10 h-[210px] w-[300px] bg-surface shadow-[0_26px_44px_-22px_rgba(0,0,0,0.9)]', [
          div('absolute inset-x-0 top-0 h-[118px] bg-[#ebdfc8] [clip-path:polygon(0_0,100%_0,50%_100%)]'),
          div('absolute inset-x-0 top-[1px] h-[118px] bg-[linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.08))] [clip-path:polygon(0_0,100%_0,50%_100%)]'),
          img('absolute left-1/2 top-[84px] -ml-[34px] w-[68px]', '{{asset.segel}}', 'Segel lilin emas'),
          p('absolute inset-x-0 bottom-9 font-script text-[26px] leading-none text-primary', 'Dengan hormat & penuh harap'),
          p('absolute inset-x-0 bottom-4 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/70', '{{couple_names}}'),
        ]),
        p('uv-reveal relative mt-10 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-ink/75', '{{closing_greeting}}'),
      ],
    },
  ],
}
