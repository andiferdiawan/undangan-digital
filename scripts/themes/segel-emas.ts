import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Segel Emas — gading merona & beige hangat dengan segel lilin emas: sampul amplop bertutup segitiga bersegel,
 * kartu ayat bermonogram "A | B", foto bertepi putih dengan sudut terlipat, kartu pemutar musik, kartu
 * "Kami menikah!", baris tanggal bergaris, hitung mundur di kartu lengkung bersegel, kartu acara berikon garis
 * dengan lonjong monogram, dan pita "Amplop digital".
 * Warna turunan dari globals (bg-primary, text-primary, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/segel-emas'

const caps = (t: string, cls = '') => p(`font-heading text-[13px] font-medium uppercase tracking-[0.3em] ${cls}`, t)
const script = (t: string, cls = '') => el('h2', `font-script text-[44px] leading-tight text-primary ${cls}`, t)
const seal = (cls: string) => img(`pointer-events-none relative z-[2] select-none drop-shadow-[0_6px_8px_rgba(110,80,30,0.35)] ${cls}`, '{{asset.segel}}')
/** Huruf pertama nama panggilan (sisa teks berukuran 0). */
const initial = (who: 'groom' | 'bride', size: number) =>
  el('span', `inline-block text-[0px] leading-none first-letter:text-[${size}px]`, `{{${who}_nickname}}`)
/** Monogram "A | B" huruf tegak dengan garis pemisah. */
const monogram = (size: number, cls = '') => div(`flex items-center justify-center gap-3 font-heading font-light text-primary ${cls}`, [
  initial('groom', size),
  el('span', 'w-px self-stretch bg-primary/50'),
  initial('bride', size),
])
const btn = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-heading text-[13px] font-medium uppercase tracking-[0.25em] text-surface'
const btnLine = 'inline-flex items-center justify-center rounded-full border border-primary/70 px-6 py-2.5 font-heading text-[12px] font-medium uppercase tracking-[0.25em] text-primary'
const card = 'bg-surface shadow-[0_14px_30px_-20px_rgba(90,70,50,0.55)]'
const photoTone = 'saturate-[.88]'

/** Foto bertepi putih dengan sudut kanan bawah terlipat (lipatan kertas). */
function foldedPhoto(inner: ThemeNode, cls: string, aspect = 'aspect-[4/5]'): ThemeNode {
  return div(`relative ${card} p-2 ${cls}`, [
    div(`relative ${aspect} overflow-hidden bg-secondary`, [inner]),
    // sudut terpotong (warna latar) + lipatan kertas berbayang
    div('absolute bottom-0 right-0 h-10 w-10 bg-base [clip-path:polygon(100%_0,100%_100%,0_100%)]'),
    div('absolute bottom-0 right-0 h-10 w-10 bg-[linear-gradient(135deg,#ffffff_0%,#eee6dc_60%,#d9cdbd_100%)] shadow-[-3px_-3px_6px_rgba(90,70,50,0.18)] [clip-path:polygon(0_0,100%_0,0_100%)]'),
  ])
}

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal relative mt-10 text-center', [
    foldedPhoto(div('absolute inset-0', [
      img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[46px] text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]), `mx-auto w-[230px] ${who === 'groom' ? '-rotate-1' : 'rotate-1'}`),
    caps(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', 'mt-6 text-[11px] text-muted'),
    el('h3', 'mt-1 font-script text-[38px] leading-tight text-primary', `{{${who}_name}}`),
    p('mx-auto mt-1 max-w-[280px] font-body text-[16px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-body text-[14px] text-primary underline decoration-primary/40 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-011',
  slug: 'segel-emas',
  name: 'Segel Emas',
  category: 'elegan',
  description: 'Gading merona & beige hangat dengan segel lilin emas: sampul amplop bersegel, monogram "A | B", foto berlipat sudut, pemutar musik, hitung mundur di kartu lengkung bersegel, dan kartu acara berikon garis.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#857560',
    secondary_color: '#e7ddcf',
    accent_color: '#c9a24e',
    background_color: '#f4ede7',
    surface_color: '#fdfbf8',
    text_color: '#5a4f43',
    muted_color: '#8f8475',
    font_heading: 'Cormorant Garamond',
    font_body: 'Cormorant Garamond',
    font_script: 'Parisienne',
  },
  // lining-nums: angka Cormorant setinggi huruf kapital (bawaannya angka gaya lama)
  root_class: 'text-[17px] leading-relaxed text-ink [font-variant-numeric:lining-nums]',
  assets: {
    segel: `${A}/segel.svg`,
    cincin: `${A}/cincin.svg`,
    amplop: `${A}/amplop.svg`,
    gedung: `${A}/gedung.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-2.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/rustic-senja/slide-2.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/rustic-senja/bride-2.jpg',
  },
  sections: [
    // ---------- Sampul: amplop bertutup segitiga + segel emas + kartu undangan ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden bg-base px-6 py-10 text-center',
      children: [
        div('uv-reveal-zoom relative w-full max-w-[340px]', [
          // badan amplop
          div('relative bg-secondary px-5 pb-6 pt-[118px] shadow-[0_24px_40px_-24px_rgba(90,70,50,0.6)]', [
            div('absolute inset-x-0 top-0 h-[150px] bg-[#ddd1c0] [clip-path:polygon(0_0,100%_0,50%_100%)] [filter:drop-shadow(0_6px_6px_rgba(90,70,50,0.25))]'),
            // kartu undangan yang keluar dari amplop; segel menindih tepi atasnya
            div(`relative ${card} px-6 pb-8 pt-12`, [
              div('absolute -top-9 left-1/2 z-10 -translate-x-1/2', [seal('w-[70px]')]),
              caps('Undangan Pernikahan', 'text-[11px] text-muted'),
              monogram(44, 'mt-4'),
              p('mt-4 font-heading text-[22px] font-medium uppercase tracking-[0.18em] text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
              p('mt-1 font-body text-[15px] italic text-muted', '{{event_date}}'),
              div('mx-auto my-5 h-px w-16 bg-primary/30'),
              p('font-body text-[15px] italic text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
              comp('guest_name', 'mt-0.5 block font-heading text-[21px] font-medium leading-snug text-primary', { fallback: 'Tamu Undangan' }),
              div('uv-reveal-pop uv-d3 mt-5', [comp('open_button', btn, { label: 'Buka Undangan' })]),
            ]),
          ]),
        ]),
      ],
    },
    // ---------- Kartu ayat bersegel + foto berlipat + musik ----------
    {
      type: 'quote',
      class: 'relative bg-base px-7 pb-12 pt-14 text-center',
      children: [
        div('uv-reveal relative mx-auto max-w-[320px]', [
          div('absolute -top-8 left-1/2 -translate-x-1/2', [seal('w-14')]),
          div(`${card} px-7 pb-8 pt-10`, [
            p('font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
            p('mt-2 font-body text-[17px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
            caps('{{quote_source}}', 'mt-3 text-[11px] text-muted'),
            monogram(26, 'mt-5'),
          ]),
        ]),
      ],
    },
    {
      type: 'hero',
      class: 'relative bg-base px-7 pb-14 text-center',
      children: [
        foldedPhoto(div('absolute inset-0', [
          div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[42px] text-primary', '{{couple_names}}')]),
          comp('photo_slider', '', { interval: '4500', image_class: photoTone, dot_class: 'bg-surface' }),
        ]), 'uv-reveal mx-auto max-w-[320px] rotate-1'),
        div('uv-reveal mx-auto mt-8 max-w-[320px]', [comp('music_player', '', {
          label: 'Putar lagu kami',
          item_class: `${card} flex items-center gap-3 rounded-[14px] px-4 py-3 text-left`,
          button_class: 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/50 text-primary',
          text_class: 'font-body text-[15px] italic text-muted',
          label_class: 'font-heading text-[12px] font-medium uppercase tracking-[0.2em] text-primary',
          bar_class: 'mt-1.5 h-[3px] rounded-full bg-secondary',
          fill_class: 'h-full rounded-full bg-primary',
        })]),
        p('uv-reveal mx-auto mt-8 max-w-[300px] font-body text-[18px] leading-snug text-ink/85', '{{greeting}}'),
        p('uv-reveal mx-auto mt-2 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', 'Dengan penuh syukur, kami mengundang Anda untuk hadir di hari bahagia pernikahan kami.'),
      ],
    },
    // ---------- "Kami menikah!" + mempelai ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-7 pb-16 text-center',
      children: [
        div('uv-reveal mx-auto max-w-[320px] bg-secondary px-6 py-9 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]', [
          caps('Kami menikah!', 'text-[12px] text-muted'),
          monogram(54, 'mt-4'),
          p('mt-3 font-heading text-[20px] font-medium uppercase tracking-[0.2em] text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
        ]),
        p('uv-reveal uv-d1 mx-auto mt-8 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', '{{opening_text}}'),
        person('groom'),
        p('uv-reveal mt-8 font-script text-[52px] leading-none text-accent', '&'),
        person('bride'),
      ],
    },
    // ---------- Tanggal bergaris + hitung mundur di kartu lengkung bersegel ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        p('uv-reveal mx-auto max-w-[290px] font-body text-[17px] italic leading-snug text-muted', 'Dengan memohon rahmat Allah, kami akan melangsungkan pernikahan pada'),
        div('uv-reveal uv-d1 mx-auto mt-6 grid max-w-[290px] grid-cols-[1fr_auto_1fr] items-center gap-4 text-primary', [
          p('border-y border-primary/40 py-1 font-heading text-[13px] font-medium uppercase tracking-[0.25em]', '{{event_day}}'),
          p('font-heading text-[54px] font-light leading-none', '{{event_date_num}}'),
          p('border-y border-primary/40 py-1 font-heading text-[13px] font-medium tracking-[0.25em]', '{{event_year}}'),
        ]),
        caps('{{event_month}}', 'uv-reveal mt-2 text-[12px] text-muted'),
        div('uv-reveal relative mx-auto mt-14 max-w-[300px]', [
          div('absolute -top-8 left-1/2 -translate-x-1/2', [seal('w-16')]),
          div('rounded-t-full bg-secondary px-6 pb-9 pt-16', [
            script('Bersiaplah', 'text-[40px]'),
            p('-mt-1 font-script text-[28px] leading-tight text-primary', 'tinggal'),
            div('mx-auto mt-5', [comp('countdown', '', {
              item_class: 'relative py-1 text-center after:absolute after:-right-1 after:top-[2px] after:font-heading after:text-[26px] after:leading-none after:text-primary/50 after:content-[\':\'] [&:last-child]:after:content-none',
              number_class: 'block font-heading text-[34px] font-light leading-none text-primary',
              label_class: 'mt-1.5 block font-heading text-[10px] font-medium uppercase tracking-[0.18em] text-muted',
            })]),
            div('mt-7', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLine })]),
          ]),
        ]),
      ],
    },
    // ---------- Acara: kartu berikon garis + lonjong monogram ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-6 py-16 text-center',
      children: [
        script('Waktu & tempat', 'uv-reveal text-[42px]'),
        div('relative mt-8 grid gap-5', [
          el('article', `uv-reveal relative grid grid-cols-[1fr_64px] items-center gap-3 ${card} px-5 py-6 text-left`, [
            div('', [
              img('w-14 opacity-90', '{{asset.gedung}}'),
              caps('{{item.name}}', 'mt-3 text-[14px] text-primary'),
              p('mt-1 font-heading text-[18px] font-medium text-ink', '{{item.time}}'),
              p('font-body text-[16px] italic text-muted', '{{item.date}}'),
              caps('{{item.venue}}', 'mt-3 text-[12px] tracking-[0.18em] text-primary'),
              p('mt-0.5 font-body text-[16px] leading-snug text-muted', '{{item.address}}'),
              comp('map_button', `mt-4 ${btnLine}`, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' }),
            ]),
            // lonjong monogram di sisi kanan
            div('flex h-[104px] w-[64px] flex-col items-center justify-center self-start rounded-full bg-secondary font-script text-[26px] leading-none text-primary', [
              initial('groom', 26), el('span', 'text-[16px]', '&'), initial('bride', 26),
            ]),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-surface px-7',
      children: [
        div('py-16 text-center', [
          script('Kisah kami', 'uv-reveal text-[44px]'),
          div('relative mt-8 grid gap-9', [
            div('absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-primary/20'),
            div('uv-reveal relative mx-auto max-w-[300px] bg-surface py-2', [
              caps('{{item.date}}', 'text-[11px] text-muted'),
              el('h3', 'mt-1 font-script text-[32px] leading-tight text-primary', '{{item.title}}'),
              p('mt-1 font-body text-[17px] italic leading-snug text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: foto berlipat sudut ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('relative py-16', [
          script('Momen kami', 'uv-reveal text-[46px]'),
          div('relative mt-8 grid grid-cols-2 gap-x-3 gap-y-5', [
            el('figure', 'uv-reveal [&:nth-child(4n+1)]:-rotate-1 [&:nth-child(4n+2)]:mt-6 [&:nth-child(4n+2)]:rotate-1 [&:nth-child(4n+3)]:rotate-1 [&:nth-child(4n)]:mt-6 [&:nth-child(4n)]:-rotate-1', [
              foldedPhoto(img(`absolute inset-0 h-full w-full object-cover ${photoTone}`, '{{item.url}}', '{{item.caption}}'), 'w-full'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Amplop digital ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-base px-6 text-center',
      children: [
        div('relative pb-16', [
          div('uv-reveal bg-secondary px-6 py-6', [
            img('mx-auto w-14', '{{asset.amplop}}'),
            script('Amplop digital', 'mt-1 text-[38px]'),
          ]),
          p('uv-reveal uv-d1 mx-auto mt-6 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('relative mt-6 grid gap-4', [
            div(`uv-reveal ${card} px-5 py-6`, [
              caps('{{item.bank}}', 'text-[12px] text-muted'),
              p('mt-2 font-heading text-[26px] font-medium tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[16px] italic text-muted', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btn })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Konfirmasi: kartu bersegel ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-surface px-6 py-16 text-center',
      children: [
        div('uv-reveal relative mx-auto max-w-[340px]', [
          div('absolute -top-8 left-1/2 -translate-x-1/2', [seal('w-14')]),
          div('bg-secondary px-5 pb-6 pt-10', [
            script('Konfirmasi kehadiran', 'text-[36px]'),
            p('mx-auto mt-2 max-w-[260px] font-body text-[16px] italic leading-snug text-muted', 'Kehadiran Anda sangat berarti. Mohon isi formulir berikut.'),
            div(`mt-6 ${card} rounded-[16px] p-5 text-left`, [
              comp('rsvp_form', '', {
                input_class: 'w-full rounded-full border border-primary/25 bg-base/50 px-4 py-3 font-body text-[17px] text-ink outline-none focus:border-primary',
                button_class: `w-full ${btn} disabled:opacity-60`,
                label_class: 'grid gap-1.5 font-heading text-[12px] font-medium uppercase tracking-[0.15em] text-muted',
              }),
            ]),
          ]),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 pb-16 text-center',
      children: [
        script('Ucapan & doa', 'uv-reveal text-[42px]'),
        div('uv-reveal mt-6', [comp('wishes', '', {
          item_class: `${card} rounded-[14px] p-4`,
          name_class: 'font-heading text-[17px] font-medium text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-muted',
        })]),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-7 pb-16 pt-14 text-center',
      children: [
        foldedPhoto(div('absolute inset-0', [comp('photo_slider', '', { interval: '5000', image_class: photoTone, dots: 'false' })]), 'uv-reveal mx-auto max-w-[300px] -rotate-1'),
        script('Terima kasih', 'uv-reveal mt-10 text-[50px]'),
        p('uv-reveal uv-d1 mx-auto mt-2 max-w-[300px] font-body text-[17px] italic leading-snug text-ink/80', '{{closing_text}}'),
        div('uv-reveal relative mx-auto mt-10 max-w-[260px]', [
          div('absolute -top-7 left-1/2 -translate-x-1/2', [seal('w-12')]),
          div(`${card} px-6 pb-6 pt-9`, [
            caps('{{closing_greeting}}', 'text-[11px] text-muted'),
            monogram(34, 'mt-3'),
            p('mt-2 font-heading text-[17px] font-medium uppercase tracking-[0.2em] text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
