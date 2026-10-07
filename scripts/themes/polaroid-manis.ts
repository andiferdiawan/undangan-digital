import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Polaroid Manis — ulang tahun anak bernuansa pink lembut & krem: foto polaroid berselotip, lencana
 * angka usia berpita, rangkaian bunga mawar pink & daun sage, judul tulisan tangan (Dancing Script)
 * diapit ranting, strip tanggal "20 | JUNI | 2026", hitung mundur kotak pink, dan jadwal acara
 * zig-zag berikon (kue, hidangan, terompet, balon) yang disambung garis putus-putus berkelok.
 */
const A = '/theme-assets/polaroid-manis'

// ---------- Gaya ----------
const PAPER = 'bg-[radial-gradient(rgba(201,127,134,0.06)_1px,transparent_1px)] bg-[length:6px_6px]'
const btn = 'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-body text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_20px_-12px_rgba(160,80,90,0.9)]'
const btnSoft = 'inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 bg-white px-5 py-2 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-primary'
const script = (t: string, cls = '') => p(`font-script leading-tight ${cls}`, t)
const caps = (t: string, cls = '') => p(`font-body text-[11px] font-bold uppercase tracking-[0.2em] ${cls}`, t)
const txt = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[14px] leading-relaxed text-ink/85 ${cls}`, t, opt)
const deco = (asset: string, cls: string) => img(`pointer-events-none absolute select-none ${cls}`, `{{asset.${asset}}}`, '')
/** Judul tulisan tangan diapit ranting daun */
const title = (t: string, cls = '') => div(`uv-reveal flex items-center justify-center gap-3 ${cls}`, [
  img('w-12 -scale-x-100', '{{asset.daun}}', ''),
  script(t, 'text-[34px] text-secondary'),
  img('w-12', '{{asset.daun}}', ''),
])
const tape = (cls: string) => div(`pointer-events-none absolute h-6 w-20 bg-[#f1c4c7]/75 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${cls}`)
/** Bingkai polaroid berselotip */
const polaroid = (cls: string, children: ThemeNode[], tapeCls = '-top-3 left-1/2 -ml-10 -rotate-3') => div(`bg-white p-2.5 pb-9 shadow-[0_16px_30px_-18px_rgba(120,60,70,0.55)] ${cls}`, [
  div('relative h-full w-full overflow-hidden bg-[#f6e3e2]', children),
  tape(tapeCls),
])
const card = (cls: string, children: ThemeNode[]) => div(`relative rounded-[22px] border border-primary/25 bg-surface/90 px-6 py-7 shadow-[0_14px_30px_-22px_rgba(120,60,70,0.5)] ${cls}`, children)
const ICON_BY_ORDER = [1, 2, 3, 4].map(i => `[&:nth-child(4n+${i % 4})_img:nth-child(${i})]:block`).join(' ').replace('4n+0', '4n')

export const meta = {
  code: 'UTH-003',
  slug: 'polaroid-manis',
  name: 'Polaroid Manis',
  category: 'ulang-tahun-anak',
  description: 'Ulang tahun anak bernuansa pink lembut & krem: foto polaroid berselotip, lencana angka usia berpita, bunga mawar pink, judul tulisan tangan, strip tanggal, hitung mundur kotak pink, dan jadwal acara berikon yang disambung garis putus-putus berkelok.',
}

export const definition: ThemeDefinition = {
  version: 1,
  kind: 'birthday',
  globals: {
    primary_color: '#cf868d',
    secondary_color: '#8e5c63',
    accent_color: '#a9b99c',
    background_color: '#fbf3ef',
    surface_color: '#fffaf7',
    text_color: '#6b4a4f',
    muted_color: '#a2868a',
    font_heading: 'Playfair Display',
    font_body: 'Nunito',
    font_script: 'Dancing Script',
  },
  root_class: 'text-[14.5px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    bunga: `${A}/bunga.svg`,
    pita: `${A}/pita.svg`,
    lencana: `${A}/lencana.svg`,
    hati: `${A}/hati.svg`,
    daun: `${A}/daun.svg`,
    alur: `${A}/alur.svg`,
    kue: `${A}/ikon-kue.svg`,
    saji: `${A}/ikon-saji.svg`,
    terompet: `${A}/ikon-terompet.svg`,
    balon: `${A}/ikon-balon.svg`,
    jam: `${A}/ikon-jam.svg`,
    lokasi: `${A}/ikon-lokasi.svg`,
    kamera: `${A}/ikon-kamera.svg`,
  },
  demo: {
    child_photo: '/theme-assets/ultah-foto/bayi-balon.jpg',
    cover_photos: ['/theme-assets/aqiqah-foto/bayi-ungu.jpg', '/theme-assets/ultah-foto/anak-lilin.jpg'],
    gallery: ['/theme-assets/ultah-foto/bayi-balon.jpg', '/theme-assets/aqiqah-foto/bayi-ungu.jpg', '/theme-assets/aqiqah-foto/bayi-keranjang.jpg', '/theme-assets/ultah-foto/anak-lilin.jpg', '/theme-assets/aqiqah-foto/ibu-bayi.jpg'],
    child: { name: 'Aiza Putri Ramadhani', nickname: 'Aiza', gender: 'p', order: 'Putri pertama', birth_date: '2025-12-19' },
  },
  sections: [
    // ---------- Sampul: polaroid berselotip, lencana usia berpita, bunga ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-base ${PAPER} px-6 pb-10 pt-8 text-center`,
      children: [
        deco('hati', 'uv-float left-8 top-10 w-4'),
        deco('hati', 'uv-float right-10 top-24 w-3 [animation-delay:1s]'),
        script('Yuk, rayakan bersama!', 'uv-reveal relative text-[30px] text-primary'),
        el('h1', 'uv-reveal uv-d1 relative mt-1 font-heading text-[40px] font-bold uppercase leading-none text-secondary', '{{child_nickname}}'),
        caps('ulang tahun ke-{{age_number}}', 'uv-reveal uv-d1 relative mt-2 text-secondary/80'),
        div('relative mx-auto mt-7 h-[330px] w-full max-w-[330px]', [
          polaroid('uv-reveal absolute left-0 top-0 h-[220px] w-[180px] -rotate-[6deg]', [
            img('absolute inset-0 h-full w-full object-cover', '{{child_photo}}', 'Foto {{child_nickname}}', { if: 'child_photo' }),
            div('absolute inset-0 grid place-items-center', [script('{{child_nickname}}', 'text-[34px] text-primary')], { if: '!child_photo' }),
          ]),
          polaroid('uv-reveal uv-d2 absolute bottom-0 right-0 h-[210px] w-[170px] rotate-[5deg]', [
            div('absolute inset-0 grid place-items-center', [img('w-16', '{{asset.hati}}', '')]),
            comp('photo_slider', '', { interval: '4200', dots: 'false' }),
          ], '-top-3 left-3 -rotate-6'),
          div('uv-reveal-pop uv-d3 absolute right-2 top-2 grid h-[96px] w-[96px] place-items-center', [
            img('absolute inset-0 h-full w-full animate-spin animate-duration-[30s]', '{{asset.lencana}}', ''),
            div('relative leading-none', [
              p('font-heading text-[38px] font-bold text-secondary', '{{age_number}}'),
              script('tahun', '-mt-1 text-[18px] text-primary'),
            ]),
            img('absolute -bottom-4 left-1/2 w-14 -ml-7', '{{asset.pita}}', 'Pita'),
          ]),
          deco('bunga', 'uv-reveal uv-d3 -bottom-6 -left-8 w-[150px] -rotate-[8deg]'),
        ]),
        div('uv-reveal uv-d4 relative mt-8', [
          txt('Kepada Yth.', 'text-[13px] text-muted'),
          comp('guest_name', 'mt-0.5 block font-heading text-[20px] font-semibold text-secondary', { fallback: 'Tamu Undangan' }),
        ]),
        div('uv-reveal-pop uv-d5 relative mt-5', [comp('open_button', btn, { label: 'Buka Undangan ♥' })]),
      ],
    },
    // ---------- Ajakan + strip tanggal + waktu & tempat + kartu si kecil ----------
    {
      type: 'hero',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-14 pt-14 text-center`,
      children: [
        deco('bunga', '-right-[58px] -top-8 w-[140px] rotate-[160deg] opacity-90'),
        caps('{{greeting}}', 'uv-reveal relative mx-auto max-w-[270px] text-muted'),
        caps('Ikut rayakan bersama kami', 'uv-reveal uv-d1 relative mt-4 text-secondary'),
        script('Ulang Tahun ke-{{age_number}} {{child_nickname}}', 'uv-reveal uv-d1 relative mt-1 text-[38px] text-primary'),
        div('uv-reveal uv-d2 relative mx-auto mt-6 grid max-w-[320px] grid-cols-[1fr_auto_1fr] items-center gap-3', [
          p('font-heading text-[46px] font-bold leading-none text-secondary', '{{event_date_num}}'),
          div('border-x border-primary/50 px-4 py-1', [
            caps('{{event_month}}', 'text-[15px] tracking-[0.18em] text-secondary'),
            caps('{{event_day}}', 'mt-1 text-[10px] text-muted'),
          ]),
          p('font-heading text-[46px] font-bold leading-none text-secondary', '{{event_year}}'),
        ]),
        div('uv-reveal uv-d3 relative mx-auto mt-6 grid max-w-[330px] grid-cols-2 gap-3 text-left', [
          div('flex items-start gap-2', [img('mt-0.5 w-5 shrink-0', '{{asset.jam}}', ''), txt('{{event_time}}', 'text-[13px] font-bold')]),
          div('flex items-start gap-2', [img('mt-0.5 w-5 shrink-0', '{{asset.lokasi}}', ''), div('', [txt('{{event_venue}}', 'text-[13px] font-bold'), txt('{{event_address}}', 'text-[12px] text-muted')])]),
        ]),
      ],
    },
    // ---------- Si kecil tersayang ----------
    {
      type: 'profile',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-14 pt-2 text-center`,
      children: [
        card('uv-reveal mx-auto max-w-[340px]', [
          img('pointer-events-none absolute -top-5 left-1/2 w-14 -ml-7', '{{asset.pita}}', ''),
          script('Si Kecil Tersayang', 'text-[30px] text-secondary'),
          txt('{{opening_text}}', 'mt-3 text-[13.5px]'),
          p('mt-4 font-heading text-[22px] font-semibold leading-tight text-secondary', '{{child_name}}'),
          div('', [
            txt('{{child_order}} dari', 'mt-1 text-[13px] text-muted'),
            p('font-body text-[14px] font-bold text-primary', '{{parents_names}}'),
          ], { if: 'parents_names' }),
          div('mt-5 grid grid-cols-2 gap-3', [
            div('rounded-[14px] bg-base px-3 py-2.5', [caps('Usia', 'text-[10px] text-muted'), p('mt-0.5 font-heading text-[16px] font-semibold text-secondary', '{{child_age}}')]),
            div('rounded-[14px] bg-base px-3 py-2.5', [caps('Tanggal lahir', 'text-[10px] text-muted'), p('mt-0.5 font-heading text-[14px] font-semibold leading-snug text-secondary', '{{child_birth}}')]),
          ]),
          img('mx-auto mt-5 w-4', '{{asset.hati}}', ''),
        ]),
      ],
    },
    // ---------- Hitung mundur kotak pink ----------
    {
      type: 'countdown',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-14 pt-4 text-center`,
      children: [
        title('Hitung Mundur'),
        div('uv-reveal uv-d1 mx-auto mt-6 max-w-[330px]', [comp('countdown', '', {
          item_class: 'rounded-[16px] bg-primary/85 py-3 text-center shadow-[0_8px_16px_-10px_rgba(160,80,90,0.9)]',
          number_class: 'block font-heading text-[30px] font-bold leading-none text-white',
          label_class: 'mt-1 block font-body text-[10px] font-bold uppercase tracking-[0.18em] text-white/85',
        })]),
        div('uv-reveal uv-d2 mt-6', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnSoft })]),
      ],
    },
    // ---------- Jadwal acara zig-zag berikon ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-surface px-6 pb-14 pt-12',
      children: [
        deco('hati', 'uv-float right-8 top-8 w-4'),
        title('Jadwal Acara'),
        div('mx-auto mt-8 grid max-w-[360px] gap-12', [
          el('article', `uv-reveal relative flex items-start gap-4 [&:nth-child(even)]:flex-row-reverse [&:nth-child(even)]:text-right [&:nth-child(even)>img]:-scale-x-100 [&:last-child>img]:hidden ${ICON_BY_ORDER}`, [
            div('relative z-[1] h-[78px] w-[78px] shrink-0', [
              img('hidden h-full w-full', '{{asset.kue}}', ''),
              img('hidden h-full w-full', '{{asset.saji}}', ''),
              img('hidden h-full w-full', '{{asset.terompet}}', ''),
              img('hidden h-full w-full', '{{asset.balon}}', ''),
            ]),
            div('min-w-0 flex-1 pt-1', [
              p('font-heading text-[22px] font-bold leading-none text-secondary', '{{item.time}}'),
              p('mt-2 font-body text-[15px] font-extrabold text-ink', '{{item.name}}'),
              txt('{{item.date}}', 'text-[12.5px] text-muted'),
              txt('{{item.venue}}', 'mt-1 text-[13px] font-bold'),
              txt('{{item.address}}', 'text-[12.5px] text-muted'),
              div('mt-3', [comp('map_button', btnSoft, { href: '{{item.map_url}}', label: 'Lihat Peta' }, { if: 'item.map_url' })]),
            ]),
            // garis putus-putus berkelok ke ikon acara berikutnya (sisi seberang)
            img('pointer-events-none absolute left-[39px] top-[84px] h-[calc(100%_-_40px)] w-[calc(100%_-_78px)]', '{{asset.alur}}', ''),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 py-14 text-center`,
      children: [
        title('Sebuah Doa'),
        card('uv-reveal uv-d1 mx-auto mt-6 max-w-[340px]', [
          p('font-arabic text-[21px] leading-loose text-secondary', '{{quote_arabic}}', { if: 'quote_arabic' }),
          txt('“{{quote_text}}”', 'mt-2 italic'),
          caps('{{quote_source}}', 'mt-3 text-primary'),
          img('mx-auto mt-4 w-[110px]', '{{asset.bunga}}', ''),
        ]),
      ],
    },
    // ---------- Galeri polaroid ----------
    {
      type: 'gallery',
      class: `relative overflow-hidden bg-base ${PAPER} px-5`,
      children: [
        div('pb-14 pt-4 text-center', [
          div('uv-reveal flex items-center justify-center gap-3', [
            script('Galeri Foto', 'text-[34px] text-secondary'),
            img('w-7', '{{asset.kamera}}', ''),
          ]),
          div('mt-8 grid grid-cols-2 gap-x-4 gap-y-7', [
            el('figure', 'uv-reveal relative bg-white p-2 pb-7 shadow-[0_14px_26px_-18px_rgba(120,60,70,0.6)] [&:nth-child(odd)]:-rotate-[3deg] [&:nth-child(even)]:rotate-[3deg] [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:rotate-0', [
              img('aspect-[4/5] w-full object-cover', '{{item.url}}', '{{item.caption}}'),
              tape('-top-3 left-1/2 -ml-10 -rotate-2'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-surface px-6',
      children: [
        div('py-14 text-center', [
          title('Tanda Kasih'),
          txt('Doa dan kehadiran Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[300px] text-[13.5px]'),
          div('mt-7 grid gap-5', [{
            ...card('uv-reveal mx-auto w-full max-w-[330px]', [
              caps('{{item.bank}}', 'text-muted'),
              p('mt-2 font-heading text-[26px] font-bold tracking-[0.05em] text-secondary', '{{item.number}}'),
              txt('a.n. {{item.holder}}', 'mt-1'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btn })]),
            ]),
            repeat: 'gifts',
          }]),
        ], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 py-14 text-center`,
      children: [
        title('Kabari Kami, Ya'),
        txt('Mohon konfirmasi kehadiran Anda — cukup isi formulir di bawah ini.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[290px] text-[13.5px]'),
        card('uv-reveal uv-d2 mt-7 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full rounded-[14px] border border-primary/35 bg-white px-4 py-2.5 font-body text-[16px] text-ink outline-none focus:border-primary',
          button_class: `w-full ${btn} disabled:opacity-60`,
          label_class: 'font-body text-[12px] font-bold uppercase tracking-[0.12em] text-secondary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        title('Ucapan & Doa'),
        div('uv-reveal mt-6 text-left', [comp('wishes', '', {
          item_class: 'rounded-[18px] border border-primary/20 bg-base p-4',
          name_class: 'font-heading text-[16px] font-semibold text-secondary',
          text_class: 'mt-1 font-body text-[14px] leading-relaxed text-ink/85',
        })]),
      ],
    },
    // ---------- Penutup ----------
    {
      type: 'closing',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-24 pt-12 text-center`,
      children: [
        deco('bunga', '-left-[64px] -top-4 w-[140px] -rotate-[10deg] opacity-90'),
        deco('bunga', '-bottom-10 -right-[60px] w-[140px] rotate-[170deg] opacity-90'),
        title('Terima Kasih', 'relative'),
        polaroid('uv-reveal relative mx-auto mt-7 h-[230px] w-[190px] -rotate-[3deg]', [
          img('absolute inset-0 h-full w-full object-cover', '{{child_photo}}', 'Foto {{child_nickname}}', { if: 'child_photo' }),
          div('absolute inset-0 grid place-items-center', [script('{{child_nickname}}', 'text-[34px] text-primary')], { if: '!child_photo' }),
        ]),
        txt('{{closing_text}}', 'uv-reveal relative mx-auto mt-7 max-w-[310px]'),
        caps('Dengan penuh cinta', 'uv-reveal relative mt-6 text-muted'),
        p('uv-reveal relative mt-1 font-heading text-[20px] font-semibold text-secondary', '{{parents_names}}', { if: 'parents_names' }),
        script('& {{child_nickname}}', 'uv-reveal relative text-[30px] text-primary'),
        caps('{{closing_greeting}}', 'uv-reveal relative mt-5 text-[10px] text-muted'),
      ],
    },
  ],
}
