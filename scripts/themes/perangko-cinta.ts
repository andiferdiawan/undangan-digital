import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Perangko Cinta — editorial ala majalah: foto gelap layar penuh dengan nama besar berhuruf serif tipis
 * (Italiana) dan tanggal bertumpuk, pita teks berjalan "WEDDING DAY" (uv-marquee), kartu undangan bergaya
 * perangko (tepi berlubang dari CSS mask) di atas amplop krem berpita satin merah, kalender dengan tanggal
 * dilingkari tipis, timeline acara di atas foto gelap, pena bulu merah, dan pita merah di penutup.
 */
const A = '/theme-assets/perangko-cinta'

// ---------- Gaya ----------
const SATIN = 'bg-[linear-gradient(180deg,#5e0f15,#d9534f_45%,#a3222a_60%,#5e0f15)]'
const PERF = '[mask:radial-gradient(circle,transparent_4px,#000_4.5px)_-6px_-6px/12px_12px] [-webkit-mask:radial-gradient(circle,transparent_4px,#000_4.5px)_-6px_-6px/12px_12px]'
const btnWine = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-surface shadow-[0_10px_20px_-12px_rgba(60,10,14,0.8)]'
const btnLightOutline = 'inline-flex items-center justify-center rounded-full border border-surface/70 px-5 py-2 font-body text-[12px] font-semibold uppercase tracking-[0.18em] text-surface'
const script = (t: string, cls = '') => p(`font-script leading-tight ${cls}`, t)
const caps = (t: string, cls = '') => p(`font-body text-[13px] font-semibold uppercase tracking-[0.22em] ${cls}`, t)
const big = (t: string, cls = '') => p(`font-heading uppercase leading-none ${cls}`, t)
const bow = (cls: string) => img(`pointer-events-none select-none ${cls}`, '{{asset.pita}}', 'Pita merah')

/** Pita teks berjalan: isi digandakan 2× agar geseran -50% menyambung mulus. */
function marquee(word: string, cls: string): ThemeNode {
  const half = Array.from({ length: 4 }, () => word)
  // Jalur dibuat absolute agar lebarnya (max-content) tidak ikut mendorong lebar halaman
  return div(`relative h-[46px] overflow-hidden whitespace-nowrap ${cls}`, [
    div('uv-marquee absolute inset-y-0 left-0 items-center [--uv-dur:22s]', [...half, ...half].map(w => p('px-4 font-heading text-[20px] uppercase tracking-[0.12em]', w))),
  ])
}
/** Kartu bergaya perangko: lapisan berlubang (mask) di tepi, isi padat di tengah, bingkai tipis di dalam. */
function stamp(cls: string, children: ThemeNode[], pad = 'px-8 py-10', extra: ThemeNode[] = []): ThemeNode {
  return div(`relative [filter:drop-shadow(0_12px_16px_rgba(40,10,12,0.22))] ${cls}`, [
    div(`absolute inset-0 bg-surface ${PERF}`),
    div('absolute inset-[6px] bg-surface'),
    div('pointer-events-none absolute inset-[14px] border border-primary/25'),
    div(`relative ${pad}`, children),
    ...extra,
  ])
}
const photoTone = 'saturate-[.85] contrast-[1.05]'

function person(who: 'groom' | 'bride'): ThemeNode {
  const flip = who === 'bride'
  return div('uv-reveal grid grid-cols-2 items-end gap-5 text-left', [
    div(`relative aspect-[3/4] overflow-hidden bg-secondary/15 ${flip ? 'order-last' : ''}`, [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [big(`{{${who}_nickname}}`, 'text-[30px] text-primary/60')], { if: `!${who}_photo` }),
    ]),
    div(flip ? 'text-right' : '', [
      script(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', 'text-[30px] text-primary'),
      big(`{{${who}_name}}`, 'mt-2 text-[24px] leading-[1.15] text-ink'),
      p('mt-2 font-body text-[15px] italic leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
      el('a', 'mt-2 inline-block font-body text-[12px] font-semibold uppercase tracking-[0.15em] text-primary underline underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
    ]),
  ])
}

export const meta = {
  code: 'MOD-012',
  slug: 'perangko-cinta',
  name: 'Perangko Cinta',
  category: 'modern',
  description: 'Editorial ala majalah: foto gelap layar penuh dengan nama besar dan tanggal bertumpuk, pita teks berjalan "WEDDING DAY", kartu undangan bergaya perangko di atas amplop berpita satin merah, kalender bertanggal dilingkari, timeline acara di atas foto, dan pena bulu merah.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#7d1a22',
    secondary_color: '#1d1714',
    accent_color: '#b3262d',
    background_color: '#f6f1ea',
    surface_color: '#fdfaf5',
    text_color: '#3b2622',
    muted_color: '#86706a',
    font_heading: 'Italiana',
    font_body: 'Cormorant Garamond',
    font_script: 'Allura',
  },
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    pita: `${A}/pita-merah.svg`,
    pena: `${A}/pena-bulu.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul editorial: foto penuh, nama besar, tanggal bertumpuk, pita teks berjalan ----------
    {
      type: 'cover',
      class: 'relative flex flex-col overflow-hidden bg-secondary text-surface',
      children: [
        div('absolute inset-0', [comp('photo_slider', '', { interval: '5000', image_class: photoTone, dots: 'false' })]),
        div('pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.65))]'),
        el('h1', 'uv-reveal relative px-6 pt-12 text-left font-heading uppercase leading-none', [
          el('span', 'block text-[56px] tracking-[0.04em]', '{{groom_nickname}}'),
          el('span', 'block pl-24 font-script text-[48px] normal-case leading-[0.8] text-surface/85', '&'),
          el('span', 'block text-right text-[56px] tracking-[0.04em]', '{{bride_nickname}}'),
        ]),
        div('flex-1'),
        div('uv-reveal uv-d2 relative grid grid-cols-[1fr_auto] items-end gap-4 px-6 pb-7', [
          div('text-left', [
            p('font-body text-[15px] italic text-surface/80', 'Kepada Yth.'),
            comp('guest_name', 'block font-heading text-[22px] leading-tight text-surface', { fallback: 'Tamu Undangan' }),
            div('mt-4', [comp('open_button', 'inline-flex items-center justify-center rounded-full bg-surface px-6 py-2.5 font-body text-[13px] font-semibold uppercase tracking-[0.18em] text-primary', { label: 'Buka Undangan' })]),
          ]),
          div('text-right', [
            big('{{event_date_num}}', 'text-[60px]'),
            caps('{{event_month}}', 'my-1 text-[12px] tracking-[0.3em] text-surface/85'),
            big('{{event_year}}', 'text-[44px]'),
          ]),
        ]),
        marquee('Wedding Day', 'relative bg-base text-primary'),
      ],
    },
    // ---------- Kartu perangko di atas amplop berpita ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-5 pb-20 pt-16 text-center',
      children: [
        div('uv-reveal relative mx-auto h-[250px] w-full max-w-[320px] -rotate-[6deg]', [
          div('absolute inset-x-0 -top-[92px] h-[94px] bg-[#efe5d6] [clip-path:polygon(0_100%,100%_100%,50%_0)]'),
          div('absolute inset-0 bg-[#e9dfcf] shadow-[0_24px_40px_-24px_rgba(40,10,12,0.5)]'),
          div('absolute inset-0 bg-[#ece2d3] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]'),
        ]),
        stamp('uv-reveal uv-d1 relative z-[1] mx-auto -mt-[300px] w-[300px] max-w-full rotate-[3deg]', [
          script('Kepada Tamu Terhormat', 'text-[34px] text-primary'),
          caps('Dengan penuh sukacita', 'mt-3 text-[11px] text-muted'),
          p('mt-1 font-body text-[16px] italic text-ink', 'kami mengundang Anda ke pernikahan'),
          script('{{groom_nickname}} & {{bride_nickname}}', 'mt-2 text-[42px] text-primary'),
          p('mx-auto mt-2 max-w-[220px] font-body text-[16px] leading-snug text-ink/85', 'untuk hadir dan memberikan doa restu di hari bahagia kami.'),
          caps('{{event_date}}', 'mt-4 text-[11px] text-primary'),
        ], 'px-8 pb-16 pt-10', [
          // pita satin melintang di sudut kiri-bawah kartu (ikut posisi kartu, tidak menutupi teks) + simpul
          div(`pointer-events-none absolute -bottom-5 -left-[70px] h-[16px] w-[190px] -rotate-[40deg] ${SATIN} shadow-[0_3px_6px_rgba(0,0,0,0.3)]`),
          bow('absolute -bottom-9 -left-9 w-[88px] -rotate-[24deg]'),
        ]),
        img('pointer-events-none absolute -right-2 bottom-6 w-[70px] rotate-[18deg]', '{{asset.pena}}', 'Pena bulu'),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-14 pt-2 text-center',
      children: [
        bow('uv-reveal mx-auto w-16'),
        p('uv-reveal uv-d1 mt-4 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d2 mx-auto mt-2 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        caps('{{quote_source}}', 'uv-reveal uv-d3 mt-4 text-[11px] text-primary'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-6 text-center',
      children: [
        script('Kedua Mempelai', 'uv-reveal text-[46px] text-primary'),
        p('uv-reveal uv-d1 mx-auto mt-2 max-w-[300px] font-body text-[16px] italic leading-snug text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-10', [
          person('groom'),
          big('&', 'uv-reveal font-script text-[56px] normal-case text-primary/70'),
          person('bride'),
        ]),
      ],
    },
    // ---------- Kalender (tanggal dilingkari) + hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-4 text-center',
      children: [
        img('pointer-events-none absolute -left-2 top-[430px] w-16 -rotate-[25deg]', '{{asset.pena}}', 'Pena bulu'),
        div('uv-reveal relative mx-auto max-w-[340px] border border-primary/20 bg-surface px-5 pb-6 pt-8', [
          script('Hari Bahagia', 'text-[44px] text-primary'),
          caps('{{event_date}}', 'mt-1 text-[11px] text-muted'),
          div('mx-auto mt-5 max-w-[290px]', [comp('month_calendar', '', {
            head_class: 'pb-1 font-body text-[11px] font-semibold uppercase text-muted',
            day_class: 'font-body text-[16px] text-ink',
            active_class: 'font-body text-[16px] font-bold text-primary',
            marker: 'circle',
            marker_class: 'border border-primary bg-transparent',
          })]),
        ]),
        script('Menuju hari bahagia', 'uv-reveal relative mt-12 text-[42px] text-primary'),
        div('uv-reveal relative mx-auto mt-5 max-w-[330px]', [comp('countdown', '', {
          item_class: 'border-r border-primary/30 py-1 text-center [&:last-child]:border-r-0',
          number_class: 'block font-heading text-[40px] leading-none text-primary',
          label_class: 'mt-1 block font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted',
        })]),
        div('relative mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnWine })]),
      ],
    },
    // ---------- Timeline acara di atas foto gelap ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-secondary px-7 pb-16 pt-14 text-left text-surface',
      children: [
        div('absolute inset-0 opacity-45', [comp('photo_slider', '', { interval: '6000', image_class: photoTone, dots: 'false' })]),
        div('pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,12,0.85),rgba(20,14,12,0.6)_50%,rgba(20,14,12,0.9))]'),
        script('Susunan Acara', 'uv-reveal relative text-center text-[46px] text-surface'),
        div('relative mt-10 pl-9', [
          div('absolute bottom-3 left-[11px] top-3 w-px bg-surface/45'),
          div('grid gap-10', [
            el('article', 'uv-reveal relative', [
              div('absolute -left-[31px] top-3 h-3 w-3 rotate-45 bg-surface'),
              big('{{item.time}}', 'text-[28px] text-surface'),
              caps('{{item.name}}', 'mt-2 text-[13px] text-surface'),
              p('mt-1 font-body text-[16px] italic text-surface/75', '{{item.date}}'),
              caps('{{item.venue}}', 'mt-3 text-[12px] text-surface/90'),
              p('font-body text-[15px] leading-snug text-surface/70', '{{item.address}}'),
              div('mt-4', [comp('map_button', btnLightOutline, { href: '{{item.map_url}}', label: 'Lihat Peta' }, { if: 'item.map_url' })]),
            ], { repeat: 'events' }),
          ]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-base px-7',
      children: [
        div('pb-14 pt-14 text-center', [
          script('Kisah Kami', 'uv-reveal text-[46px] text-primary'),
          div('mx-auto mt-8 grid max-w-[320px] gap-8', [
            div('uv-reveal', [
              caps('{{item.date}}', 'text-[11px] text-primary'),
              big('{{item.title}}', 'mt-2 text-[24px] text-ink'),
              p('mt-2 font-body text-[16px] italic leading-snug text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri editorial dengan pita teks berjalan ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('pb-16 pt-12', [
          marquee('Momen Kami', 'bg-primary text-surface'),
          div('mt-8 grid grid-cols-2 gap-3 px-5', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden bg-secondary/10 [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/5]', [
              img(`h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Tanda kasih: kartu perangko ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('pb-16 pt-6', [
          script('Tanda Kasih', 'uv-reveal text-[46px] text-primary'),
          p('uv-reveal uv-d1 mx-auto mt-2 max-w-[300px] font-body text-[16px] italic leading-snug text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-6', [{
            ...stamp('uv-reveal mx-auto w-full max-w-[320px]', [
              caps('{{item.bank}}', 'text-[11px] text-muted'),
              big('{{item.number}}', 'mt-2 text-[30px] tracking-[0.06em] text-primary'),
              p('mt-1 font-body text-[16px] italic text-ink', 'a.n. {{item.holder}}'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnWine })]),
            ], 'px-7 py-9'),
            repeat: 'gifts',
          }]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-4 text-center',
      children: [
        script('Konfirmasi Kehadiran', 'uv-reveal text-[42px] text-primary'),
        p('uv-reveal uv-d1 mx-auto mt-2 max-w-[300px] font-body text-[16px] italic leading-snug text-muted', 'Mohon konfirmasi kehadiran Anda melalui formulir berikut.'),
        div('uv-reveal mt-8 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-primary/40 bg-transparent px-1 py-2 font-body text-[18px] text-ink outline-none focus:border-primary',
          button_class: `mt-2 w-full ${btnWine} disabled:opacity-60`,
          label_class: 'grid gap-1 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-primary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-2 text-center',
      children: [
        script('Doa & Ucapan', 'uv-reveal text-[44px] text-primary'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: 'border-b border-primary/15 py-3',
          name_class: 'font-heading text-[18px] text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-ink/80',
        })]),
      ],
    },
    // ---------- Penutup: yang berbahagia + pita merah ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base pt-4 text-center',
      children: [
        div('px-7 pb-14', [
          script('Yang Berbahagia', 'uv-reveal text-[46px] text-primary'),
          p('uv-reveal uv-d1 mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-ink', '{{groom_parents}}', { if: 'groom_parents' }),
          p('uv-reveal uv-d1 mx-auto mt-2 max-w-[300px] font-body text-[17px] italic leading-snug text-ink', '{{bride_parents}}', { if: 'bride_parents' }),
          bow('uv-reveal-pop mx-auto mt-6 w-24'),
          p('uv-reveal mx-auto mt-6 max-w-[300px] font-body text-[16px] italic leading-snug text-muted', '{{closing_text}}'),
          big('{{couple_names}}', 'uv-reveal mt-6 text-[30px] text-primary'),
          caps('{{closing_greeting}}', 'uv-reveal mt-4 text-[11px] text-muted'),
        ]),
        marquee('Terima Kasih', 'bg-primary text-surface'),
      ],
    },
  ],
}
