import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

const A = '/theme-assets/alur-cinta'
const INK = '#3d3bb7'
const PINK = '#ff7eb6'
const BUTTER = '#ffd966'
const LAV = '#efe9ff'

/**
 * Garis cerita: tergambar mengikuti scroll dengan hati kecil di ujungnya.
 * Setiap segmen masuk & keluar di tengah (x=50%), jadi antar-section terlihat menyambung.
 * side = arah gembungan gelombang; posisi = bagian section yang ditempati.
 */
function storyLine(side: 'kanan' | 'kiri', pos = 'inset-0'): ThemeNode {
  return div(`uv-scroll-line pointer-events-none absolute ${pos} [--uv-amp:${side === 'kanan' ? 34 : -34}] [--uv-waves:0.5]`, [
    img('uv-scroll-draw absolute inset-0 h-full w-full', `{{asset.line_${side}}}`),
    div('uv-scroll-follow w-10', [img('uv-wiggle w-full', '{{asset.hati}}', '')]),
  ])
}

/** Label bab + judul, di sisi yang berlawanan dengan gembungan garis */
function chapter(label: string, heading: string, side: 'left' | 'right', sub?: string): ThemeNode {
  const right = side === 'right'
  return div(`${right ? 'uv-reveal-right ml-auto text-right' : 'uv-reveal-left'} relative w-[64%]`, [
    el('span', `inline-block rounded-full bg-[${BUTTER}] px-3 py-1 font-heading text-[12px] font-semibold uppercase tracking-[0.14em] text-primary shadow-[2px_2px_0_${INK}]`, label),
    el('h2', 'mt-3 font-heading text-[30px] font-semibold leading-[1.1] text-primary', heading),
    img(`mt-1 h-3 w-28 ${right ? 'ml-auto' : ''}`, '{{asset.gelombang}}'),
    ...(sub ? [p('mt-2 text-[14px] leading-snug text-muted', sub)] : []),
  ])
}

const card = `relative rounded-[26px] border-2 border-primary bg-surface p-5 shadow-[5px_5px_0_${PINK}]`
const pillBtn = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-secondary px-6 py-2.5 font-heading text-[15px] font-semibold text-white shadow-[3px_3px_0_${INK}]`
const sticker = (asset: string, pos: string, anim = 'uv-float') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])

function polaroid(who: 'groom' | 'bride'): ThemeNode {
  const isBride = who === 'bride'
  return div(`${isBride ? 'uv-reveal-right ml-auto' : 'uv-reveal-left'} relative w-[62%]`, [div(`relative ${isBride ? 'rotate-3' : '-rotate-3'}`, [
    div(`rounded-[22px] border-2 border-primary bg-surface p-2.5 pb-4 shadow-[5px_5px_0_${PINK}]`, [
      div(`relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[${LAV}]`, [
        img('uv-reveal-mask absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, isBride ? 'Foto mempelai wanita' : 'Foto mempelai pria', { if: `${who}_photo` }),
        div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-4xl font-semibold text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
      ]),
      el('h3', 'mt-3 px-1 font-heading text-[19px] font-semibold leading-tight text-primary', `{{${who}_name}}`),
      p('mt-0.5 px-1 text-[12.5px] leading-snug text-muted', `{{${who}_parents}}`),
      el('a', 'mt-1 inline-block px-1 text-[12.5px] font-bold text-secondary underline', '@instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
    ]),
    sticker(isBride ? 'bintang' : 'daisy', `${isBride ? '-left-4' : '-right-4'} -top-4 w-11`, isBride ? 'uv-wiggle' : 'animate-spin animate-duration-8000'),
  ])])
}

export const meta = {
  code: 'MOD-003',
  slug: 'alur-cinta',
  name: 'Alur Cinta',
  category: 'modern',
  description: 'Gen Z yang bercerita: garis putus-putus berliuk tergambar mengikuti scroll dengan hati kecil yang menempel di ujungnya, membawa tamu dari bab ke bab — prolog, takdir, pemeran utama, hari H, sampai epilog. Palet lavender, pink permen karet, dan kuning mentega.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: PINK,
    accent_color: BUTTER,
    background_color: '#f7f3ff',
    surface_color: '#ffffff',
    text_color: '#2b2a5a',
    muted_color: '#6f6c9e',
    font_heading: 'Fredoka',
    font_body: 'Quicksand',
    font_script: 'Caveat',
  },
  root_class: 'text-[14.5px] leading-relaxed',
  assets: {
    line_kanan: `${A}/line-kanan.svg`,
    line_kiri: `${A}/line-kiri.svg`,
    hati: `${A}/hati.svg`,
    daisy: `${A}/daisy.svg`,
    bintang: `${A}/bintang.svg`,
    awan: `${A}/awan.svg`,
    surat: `${A}/surat.svg`,
    gelombang: `${A}/gelombang.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-3.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/bride-2.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    {
      type: 'cover',
      class: 'flex flex-col items-center justify-center overflow-hidden bg-base px-6 pb-12 pt-14 text-center',
      children: [
        sticker('awan', 'left-3 top-12 w-24'),
        sticker('awan', '-right-4 top-36 w-20', 'uv-float uv-d2'),
        sticker('bintang', 'bottom-28 left-6 w-9', 'uv-wiggle'),
        sticker('daisy', 'bottom-40 right-5 w-12', 'animate-spin animate-duration-8000'),
        p('uv-reveal-pop relative font-script text-[26px] text-secondary', 'psst… ada cerita nih'),
        div('uv-reveal-pop uv-d1 relative mx-auto mt-4 w-48', [div('-rotate-4', [
          div(`relative aspect-square overflow-hidden rounded-[28px] border-2 border-primary bg-[${LAV}] shadow-[6px_6px_0_${PINK}]`, [
            comp('photo_slider', '', { dots: 'false', interval: '3500' }),
            div('absolute inset-0 -z-10 grid place-items-center', [img('uv-float w-16', '{{asset.hati}}')]),
          ]),
        ])]),
        el('h1', `uv-reveal-pop uv-d2 relative mt-6 font-heading text-[40px] font-semibold leading-[1.05] text-primary`, '{{couple_names}}'),
        p('uv-reveal uv-d3 relative mt-1 text-[13px] font-bold uppercase tracking-[0.18em] text-muted', '{{event_date}}'),
        div(`uv-reveal-pop uv-d4 relative mx-auto mt-5 w-full max-w-[290px] ${card} py-3`, [
          p('text-[12.5px] text-muted', 'Hai, spesial buat kamu 👋'),
          comp('guest_name', 'mt-0.5 block font-heading text-[20px] font-semibold text-primary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-6', [comp('open_button', pillBtn, { label: 'Mulai Ceritanya ↓' })]),
      ],
    },
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-6 pb-20 pt-24',
      children: [
        storyLine('kanan'),
        sticker('awan', '-left-6 top-6 w-24 opacity-80'),
        chapter('Prolog', 'Di suatu hari yang indah…', 'left', 'dua orang yang dipertemukan Allah memutuskan untuk melangkah bersama.'),
        div(`uv-reveal-flip relative mt-10 ${card} text-center`, [
          p('font-arabic text-[20px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
          el('p', 'mt-2 font-heading text-[34px] font-semibold leading-tight text-primary', '{{couple_names}}'),
          p('mt-1 text-[12.5px] font-bold uppercase tracking-[0.16em] text-secondary', '{{event_date}}'),
          div('mt-4', [
            comp('countdown', '', {
              item_class: `rounded-2xl bg-[${LAV}] py-2`,
              number_class: 'block font-heading text-[26px] font-semibold leading-none text-primary',
              label_class: 'text-[10.5px] font-bold uppercase tracking-wider text-muted',
            }),
          ]),
          div('mt-4', [comp('calendar_button', '', { label: '📅 Simpan Tanggal', button_class: pillBtn })]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-base px-6 py-20',
      children: [
        storyLine('kiri'),
        chapter('Chapter · Takdir', 'Semua berawal dari takdir-Nya', 'right'),
        div(`uv-reveal-flip relative mt-8 ${card} text-center`, [
          p('font-arabic text-[20px] leading-loose text-primary', '{{quote_arabic}}'),
          p('mt-3 text-[13.5px] italic text-ink/80', '"{{quote_text}}"'),
          p('mt-2 font-heading text-[13px] font-semibold text-secondary', '{{quote_source}}'),
        ]),
        sticker('bintang', 'bottom-8 left-8 w-8', 'uv-wiggle'),
      ],
    },
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-6 py-20',
      children: [
        // Dua segmen = liukan S: pria di atas (kiri), wanita di bawah (kanan)
        storyLine('kanan', 'inset-x-0 top-0 h-1/2'),
        storyLine('kiri', 'inset-x-0 top-1/2 h-1/2'),
        chapter('Chapter · Pemeran Utama', 'Kenalan dulu, yuk!', 'left'),
        p('uv-reveal relative mt-3 w-[64%] text-[13.5px] text-ink/80', '{{greeting}} {{opening_text}}'),
        div('relative mt-10', [polaroid('groom')]),
        p('uv-reveal-pop relative my-10 text-center font-script text-[34px] text-secondary', 'dan…'),
        div('relative', [polaroid('bride')]),
      ],
    },
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-6 py-20',
      children: [
        storyLine('kiri'),
        chapter('Chapter · Hari H', 'Akhirnya, kami menikah!', 'right', 'Catat tanggalnya ya, kami tunggu kehadiranmu.'),
        div('relative mt-8 grid gap-5', [
          el('article', `uv-reveal-flip ${card} text-center`, [
            el('span', `inline-block rounded-full bg-[${LAV}] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary`, '{{item.day}}'),
            el('h3', 'mt-2 font-heading text-[26px] font-semibold leading-tight text-primary', '{{item.name}}'),
            p('mt-1 font-bold text-ink', '{{item.date}}'),
            p('text-[13px] font-semibold text-secondary', '{{item.time}}'),
            p('mt-3 font-heading text-[17px] font-semibold text-primary', '{{item.venue}}'),
            p('text-[12.5px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-4 ${pillBtn}`, { href: '{{item.map_url}}', label: '📍 Lihat Lokasi' }, { if: 'item.map_url' }),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'bg-base',
      children: [
        div('relative overflow-hidden px-6 py-20', [
          storyLine('kanan'),
          chapter('Chapter · Perjalanan', 'Cerita kami sejauh ini', 'left'),
          div('relative mt-8 grid w-[66%] gap-5', [
            div(`uv-reveal-left ${card} p-4`, [
              p('text-[11px] font-bold uppercase tracking-wider text-secondary', '{{item.date}}'),
              el('h3', 'font-heading text-[17px] font-semibold leading-tight text-primary', '{{item.title}}'),
              p('mt-1 text-[13px] leading-snug text-ink/80', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    {
      type: 'gallery',
      class: 'bg-base',
      children: [
        div('relative overflow-hidden px-6 py-20', [
          storyLine('kiri'),
          chapter('Chapter · Kenangan', 'Potongan momen kami', 'right'),
          div('relative mt-8 grid grid-cols-2 gap-3', [
            div('group uv-reveal-pop', [
              div(`overflow-hidden rounded-[20px] border-2 border-primary bg-surface p-1.5 shadow-[4px_4px_0_${PINK}] group-odd:-rotate-2 group-even:rotate-2`, [
                img('aspect-[4/5] w-full rounded-[14px] object-cover', '{{item.url}}', '{{item.caption}}'),
              ]),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-6 py-20',
      children: [
        storyLine('kanan'),
        chapter('Chapter · Giliranmu', 'Kamu datang, kan?', 'left', 'Isi sebentar ya, biar kami bisa siapkan tempat terbaik.'),
        div(`uv-reveal-flip relative mt-8 ${card}`, [
          sticker('surat', '-right-3 -top-6 w-14', 'uv-wiggle'),
          comp('rsvp_form', '', {
            input_class: `w-full rounded-2xl border-2 border-primary/25 bg-[${LAV}] px-4 py-2.5 text-[16px] text-ink outline-none focus:border-primary`,
            button_class: `w-full rounded-full border-2 border-primary bg-secondary py-3 font-heading text-[15px] font-semibold text-white shadow-[3px_3px_0_${INK}] disabled:opacity-60`,
            label_class: 'font-heading text-[14px] font-semibold text-primary',
          }),
        ]),
        el('h3', 'uv-reveal relative mb-4 mt-12 text-center font-heading text-[22px] font-semibold text-primary', 'Doa & Ucapan 💌'),
        div('relative', [comp('wishes', '', { item_class: `rounded-2xl border-2 border-primary/20 bg-surface p-4`, name_class: 'font-heading font-semibold text-primary', text_class: 'text-[13.5px] text-ink/80' })]),
      ],
    },
    {
      type: 'gift',
      class: 'bg-base',
      children: [
        div('relative overflow-hidden px-6 py-20', [
          storyLine('kiri'),
          chapter('Chapter · Tanda Kasih', 'Kalau mau kirim kado', 'right', 'Doa restumu sudah lebih dari cukup, kok.'),
          div('relative mt-8 grid gap-5', [
            div('uv-reveal-pop', [
              div(`uv-tilt relative rounded-[26px] border-2 border-primary bg-gradient-to-br from-[${LAV}] to-[#ffe3f0] p-5 shadow-[5px_5px_0_${INK}]`, [
                img('uv-depth-2 absolute -right-3 -top-5 w-12', '{{asset.hati}}'),
                p('uv-depth-1 font-heading text-[15px] font-semibold uppercase tracking-wider text-secondary', '{{item.bank}}'),
                p('uv-depth-2 mt-2 font-heading text-[26px] font-semibold tracking-wider text-primary', '{{item.number}}'),
                p('uv-depth-1 text-[13px] text-muted', 'a.n. {{item.holder}}'),
                div('uv-depth-2 mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full border-2 border-primary bg-surface px-4 py-1.5 font-heading text-[13px] font-semibold text-primary' })]),
              ]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-6 pb-24 text-center',
      children: [
        // Garis terakhir berakhir tepat di atas hati besar
        storyLine('kanan', 'inset-x-0 top-0 h-56'),
        sticker('awan', '-left-4 top-10 w-24'),
        sticker('bintang', 'right-6 top-24 w-9', 'uv-wiggle'),
        div('relative pt-56', [
          div('uv-reveal-pop mx-auto w-24', [img('animate-heart-beat animate-count-infinite w-full', '{{asset.hati}}', 'Hati')]),
          el('span', `uv-reveal uv-d1 mt-6 inline-block rounded-full bg-[${BUTTER}] px-3 py-1 font-heading text-[12px] font-semibold uppercase tracking-[0.14em] text-primary shadow-[2px_2px_0_${INK}]`, 'Epilog'),
          el('h2', 'uv-reveal-pop uv-d2 mt-3 font-heading text-[30px] font-semibold leading-tight text-primary', 'Tamat? Justru baru dimulai ♡'),
          p('uv-reveal uv-d3 mx-auto mt-3 max-w-[320px] text-[13.5px] text-ink/80', '{{closing_text}}'),
          p('uv-reveal uv-d3 mt-2 font-script text-[22px] text-secondary', '{{closing_greeting}}'),
          p('uv-reveal-pop uv-d4 mt-6 font-heading text-[28px] font-semibold text-primary', '{{couple_names}}'),
        ]),
      ],
    },
  ],
}
