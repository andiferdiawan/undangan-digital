import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kertas Asmara — krem kertas dengan merah tua: coretan tulisan tangan "love you" di latar, foto polaroid
 * yang dimiringkan, nama tulisan tangan "A + B =" dengan hati cat kuas, amplop merah berisi kartu
 * surat, strip tanggal berkotak dengan hati di hari H, kartu merah membulat untuk ucapan & hadiah, dan
 * polaroid "sampai jumpa!" di penutup.
 * Warna turunan dari globals (bg-primary, text-primary, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/kertas-asmara'

const script = (t: string, cls = '') => el('h2', `font-script text-[46px] leading-none text-primary ${cls}`, t)
const small = (t: string, cls = '') => p(`font-body text-[14px] leading-relaxed text-muted ${cls}`, t)
const heart = (cls: string) => img(`pointer-events-none select-none ${cls}`, '{{asset.hati}}')
const btn = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-surface'
const btnLight = 'inline-flex items-center justify-center rounded-full border border-primary px-6 py-2.5 font-body text-[12px] font-semibold uppercase tracking-[0.22em] text-primary'
/** Foto tampil apa adanya (berwarna atau hitam-putih sesuai foto asli pelanggan). */
const photoTone = ''

/** Coretan tulisan tangan "love you" berulang di latar (merah tipis, miring). */
function scribbles(cls: string): ThemeNode {
  const row = (top: string, indent: string) => p(`absolute ${top} ${indent} whitespace-nowrap font-script text-[34px] leading-none text-primary/25`, 'love you i love you love you i love you')
  return div(`pointer-events-none absolute inset-0 overflow-hidden ${cls}`, [
    div('absolute -inset-x-20 inset-y-0 -rotate-[14deg]', [
      row('top-[6%]', '-left-10'), row('top-[15%]', 'left-6'), row('top-[24%]', '-left-24'),
      row('top-[33%]', '-left-4'), row('top-[42%]', 'left-10'),
    ]),
  ])
}

/** Bingkai polaroid putih berbayang. */
const polaroid = (inner: ThemeNode, caption: ThemeNode | null, cls: string) =>
  div(`bg-surface p-2.5 pb-3 shadow-[0_16px_30px_-16px_rgba(60,20,20,0.55)] ${cls}`, caption ? [inner, caption] : [inner])

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal text-center', [
    polaroid(div('relative aspect-[4/5] overflow-hidden bg-secondary', [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[40px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]), p('pt-2 font-script text-[26px] leading-none text-primary', `{{${who}_nickname}}`), `mx-auto w-full ${who === 'groom' ? '-rotate-3' : 'rotate-3'}`),
    p('mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-muted', who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita'),
    el('h3', 'mt-1 font-body text-[15px] font-semibold leading-snug text-ink', `{{${who}_name}}`),
    p('mt-1 font-body text-[13px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
  ])
}

export const meta = {
  code: 'MOD-015',
  slug: 'kertas-asmara',
  name: 'Kertas Asmara',
  category: 'modern',
  description: 'Krem kertas & merah tua: coretan "love you" tulisan tangan, foto polaroid miring, hati cat kuas, amplop merah berisi kartu surat, strip tanggal berkotak dengan hati, dan kartu merah membulat.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#b42a2f',
    secondary_color: '#e7dccf',
    accent_color: '#8e1d22',
    background_color: '#f1ece5',
    surface_color: '#fcfaf6',
    text_color: '#2a2422',
    muted_color: '#76695f',
    font_heading: 'Montserrat',
    font_body: 'Montserrat',
    font_script: 'Mr Dafoe',
  },
  root_class: 'text-[15px] leading-relaxed text-ink',
  assets: {
    hati: `${A}/hati.svg`,
    hati_garis: `${A}/hati-garis.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-3.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-3.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: polaroid foto besar + coretan "love you" + nama "A + B =" hati ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden bg-base px-6 pb-10 pt-12 text-center',
      children: [
        scribbles(''),
        div('relative mt-2 w-full max-w-[330px]', [
          // polaroid kecil di belakang (foto mempelai wanita bila ada)
          div('absolute -right-1 -top-2 w-[42%] rotate-[9deg]', [
            polaroid(div('relative aspect-square overflow-hidden bg-secondary', [
              img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, '{{bride_photo}}', 'Foto mempelai wanita'),
            ]), null, ''),
          ], { if: 'bride_photo' }),
          div('uv-reveal-zoom relative w-[86%] -rotate-[4deg]', [
            polaroid(div('relative aspect-[4/5] overflow-hidden bg-secondary', [
              div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[40px] text-primary', '{{couple_names}}')]),
              comp('photo_slider', '', { interval: '4500', image_class: photoTone, dots: 'false' }),
            ]), p('pt-2 font-script text-[28px] leading-none text-primary', '{{event_dd}}.{{event_mm}}.{{event_yy}}'), ''),
          ]),
        ]),
        div('uv-reveal uv-d2 relative mt-7 flex items-center justify-center gap-2 font-script text-[44px] leading-none text-ink', [
          el('span', '', '{{groom_nickname}}'), el('span', 'text-[34px]', '+'), el('span', '', '{{bride_nickname}}'), el('span', 'text-[34px]', '='),
        ]),
        heart('uv-reveal-pop uv-d3 relative mt-2 w-[72px]'),
        p('uv-reveal uv-d4 relative mt-4 font-body text-[13px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
        comp('guest_name', 'relative mt-0.5 block font-body text-[17px] font-semibold text-ink', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop uv-d5 relative mt-5', [comp('open_button', btn, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Amplop merah berisi kartu surat + strip tanggal ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-6 pb-14 pt-12 text-center',
      children: [
        scribbles(''),
        // Dua polaroid foto yang miring (seperti panel pembuka referensi)
        div('relative mx-auto h-[300px] w-full max-w-[340px]', [
          div('uv-reveal-left absolute left-0 top-0 w-[56%] -rotate-[7deg]', [
            polaroid(div('relative aspect-[4/5] overflow-hidden bg-secondary', [
              div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[34px] text-primary', '{{couple_names}}')]),
              comp('photo_slider', '', { interval: '4000', image_class: photoTone, dots: 'false' }),
            ]), null, ''),
          ]),
          div('uv-reveal-right uv-d1 absolute right-0 top-10 w-[50%] rotate-[6deg]', [
            polaroid(div('relative aspect-[4/5] overflow-hidden bg-secondary', [
              img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, '{{bride_photo}}', 'Foto mempelai wanita'),
            ]), null, ''),
          ], { if: 'bride_photo' }),
        ]),
        div('uv-reveal relative mt-4 flex items-center justify-center gap-2 font-script text-[40px] leading-none text-ink', [
          el('span', '', '{{groom_nickname}}'), el('span', 'text-[30px]', '+'), el('span', '', '{{bride_nickname}}'), el('span', 'text-[30px]', '='),
        ]),
        heart('uv-reveal-pop uv-d1 relative mx-auto mt-2 w-[64px]'),
        div('uv-reveal relative mx-auto mt-8 h-[350px] w-full max-w-[330px]', [
          // punggung amplop + tutup terbuka
          div('absolute inset-x-0 bottom-0 h-[140px] bg-accent'),
          div('absolute inset-x-0 bottom-[140px] h-[60px] bg-accent [clip-path:polygon(0_100%,50%_0,100%_100%)]'),
          // kartu surat keluar dari amplop
          div('absolute inset-x-6 top-2 h-[260px] -rotate-[5deg] bg-surface px-5 py-5 text-left shadow-[0_10px_20px_-12px_rgba(0,0,0,0.4)]', [
            p('font-script text-[30px] leading-none text-primary', 'Untukmu, sahabat & keluarga'),
            small('{{greeting}}', 'mt-3 text-[12px]'),
            small('Kami mengundang Anda untuk hadir dan menjadi bagian dari hari bahagia kami.', 'mt-1 text-[12px]'),
          ]),
          // badan depan amplop (dua sayap + bawah)
          div('absolute inset-x-0 bottom-0 h-[140px] bg-primary [clip-path:polygon(0_0,50%_55%,100%_0,100%_100%,0_100%)] [filter:drop-shadow(0_-2px_4px_rgba(0,0,0,0.15))]'),
          div('absolute inset-x-0 bottom-0 h-[140px] bg-[linear-gradient(160deg,rgba(255,255,255,0.12),transparent_45%)] [clip-path:polygon(0_0,50%_55%,0_100%)]'),
        ]),
        p('uv-reveal mt-10 font-script text-[40px] leading-none text-ink', '{{event_month}} {{event_year}}'),
        div('uv-reveal uv-d1 mx-auto mt-5 grid max-w-[300px] grid-cols-5 items-center gap-2', [
          p('rounded-lg border border-primary/25 py-2 font-body text-[14px] text-muted/70', '{{event_day_minus_two}}'),
          p('rounded-lg border border-primary/25 py-2 font-body text-[14px] text-muted', '{{event_day_minus_one}}'),
          div('relative grid h-12 place-items-center', [
            img('absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)]', '{{asset.hati_garis}}'),
            p('relative font-body text-[18px] font-bold text-primary', '{{event_date_num}}'),
          ]),
          p('rounded-lg border border-primary/25 py-2 font-body text-[14px] text-muted', '{{event_day_plus_one}}'),
          p('rounded-lg border border-primary/25 py-2 font-body text-[14px] text-muted/70', '{{event_day_plus_two}}'),
        ]),
        p('uv-reveal uv-d2 mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-muted', '{{event_day}}'),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 text-center',
      children: [
        p('uv-reveal font-arabic text-[21px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        small('“{{quote_text}}”', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] italic text-ink/80'),
        p('uv-reveal uv-d2 mt-3 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-primary', '{{quote_source}}'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-16 text-center',
      children: [
        heart('absolute right-6 top-8 w-9 rotate-12'),
        script('Kedua mempelai', 'uv-reveal'),
        small('{{opening_text}}', 'uv-reveal uv-d1 mx-auto mt-4 max-w-[300px]'),
        div('mt-10 grid grid-cols-2 gap-x-5', [person('groom'), person('bride')]),
      ],
    },
    // ---------- Acara: judul tulisan tangan + jam merah + hati ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-7 py-16',
      children: [
        heart('absolute -right-2 top-10 w-12 -rotate-12'),
        heart('absolute right-14 top-20 w-7 rotate-12'),
        div('relative grid gap-12', [
          el('article', 'uv-reveal relative', [
            script('{{item.name}}', 'text-[42px]'),
            p('mt-2 font-body text-[22px] font-semibold leading-none text-primary', '{{item.time}}'),
            small('{{item.date}}', 'mt-1'),
            div('mt-3 flex items-start gap-2', [
              heart('mt-1 w-3.5 shrink-0'),
              div('', [
                p('font-body text-[13px] font-semibold uppercase tracking-[0.12em] text-ink', '{{item.venue}}'),
                small('{{item.address}}', 'text-[13px] leading-snug'),
              ]),
            ]),
            comp('map_button', `mt-4 ${btnLight}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'countdown',
      class: 'relative bg-surface px-7 py-14 text-center',
      children: [
        script('Menuju hari H', 'uv-reveal'),
        div('uv-reveal mx-auto mt-7 max-w-[320px]', [comp('countdown', '', {
          item_class: 'mx-1 rounded-xl border border-primary/25 bg-base py-3 text-center',
          number_class: 'block font-body text-[26px] font-bold leading-none text-primary',
          label_class: 'mt-1.5 block font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-muted',
        })]),
        div('mt-7', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLight })]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('py-16 text-center', [
          script('Cerita kami', 'uv-reveal'),
          div('mt-8 grid gap-8', [
            div('uv-reveal mx-auto max-w-[300px]', [
              p('font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-primary', '{{item.date}}'),
              p('mt-1 font-script text-[32px] leading-none text-ink', '{{item.title}}'),
              small('{{item.text}}', 'mt-2'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: polaroid miring ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-surface px-6 text-center',
      children: [
        div('relative py-16', [
          scribbles('opacity-60'),
          script('Momen kami', 'uv-reveal relative'),
          div('relative mt-8 grid grid-cols-2 gap-x-4 gap-y-6', [
            el('figure', 'uv-reveal bg-surface p-2 pb-6 shadow-[0_14px_24px_-16px_rgba(60,20,20,0.6)] [&:nth-child(4n+1)]:-rotate-3 [&:nth-child(4n+2)]:mt-6 [&:nth-child(4n+2)]:rotate-2 [&:nth-child(4n+3)]:rotate-2 [&:nth-child(4n)]:mt-6 [&:nth-child(4n)]:-rotate-2', [
              img(`aspect-[4/5] w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Hadiah: kartu merah membulat dengan hati ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('relative py-14', [
          div('uv-reveal relative rounded-[26px] bg-primary px-6 pb-8 pt-10 text-surface', [
            heart('absolute -right-3 -top-6 w-14 rotate-12'),
            el('h2', 'font-script text-[44px] leading-none', 'Tanda kasih'),
            p('mx-auto mt-3 max-w-[260px] font-body text-[13px] leading-relaxed text-surface/85', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
            div('mt-6 grid gap-3', [
              div('rounded-2xl bg-surface px-5 py-5 text-ink', [
                p('font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-muted', '{{item.bank}}'),
                p('mt-1 font-body text-[22px] font-bold tracking-wider text-primary', '{{item.number}}'),
                small('a.n. {{item.holder}}', 'text-[13px]'),
                div('mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btn })]),
              ], { repeat: 'gifts' }),
            ]),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-6 py-14 text-center',
      children: [
        script('Konfirmasi', 'uv-reveal'),
        small('Mohon konfirmasi kehadiran Anda melalui formulir berikut.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[290px]'),
        div('uv-reveal mt-7 rounded-[22px] border border-primary/30 bg-surface p-5 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full rounded-xl border border-primary/25 bg-base/60 px-4 py-3 font-body text-[14px] text-ink outline-none focus:border-primary',
          button_class: `w-full ${btn} disabled:opacity-60`,
          label_class: 'grid gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-muted',
        })]),
      ],
    },
    // ---------- Ucapan: kartu merah ----------
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-6 pb-14 text-center',
      children: [
        div('uv-reveal relative rounded-[26px] bg-primary px-5 pb-6 pt-9', [
          el('h2', 'font-script text-[44px] leading-none text-surface', 'Ucapan & doa'),
          div('mt-6', [comp('wishes', '', {
            item_class: 'rounded-2xl bg-surface p-4 text-left',
            name_class: 'font-body text-[13px] font-semibold text-primary',
            text_class: 'mt-1 font-body text-[13px] leading-relaxed text-muted',
          })]),
        ]),
      ],
    },
    // ---------- Penutup: polaroid "sampai jumpa!" ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-surface px-7 pb-16 pt-14 text-center',
      children: [
        small('{{closing_text}}', 'uv-reveal mx-auto max-w-[300px]'),
        div('uv-reveal relative mx-auto mt-10 w-[78%] max-w-[290px] rotate-2', [
          polaroid(div('relative aspect-[4/5] overflow-hidden bg-secondary', [
            comp('photo_slider', '', { interval: '5000', image_class: photoTone, dots: 'false' }),
          ]), p('pt-3 font-script text-[34px] leading-none text-primary', 'sampai jumpa!'), ''),
          heart('absolute -bottom-4 -right-5 w-14 rotate-12'),
        ]),
        p('uv-reveal mt-10 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-muted', '{{closing_greeting}}'),
        p('uv-reveal mt-2 font-script text-[40px] leading-none text-ink', '{{couple_names}}'),
      ],
    },
  ],
}
