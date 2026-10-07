import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Anggrek Emas — aqiqah putri bernuansa kertas gading & emas: anggrek bulan pink dan lili putih di
 * sudut-sudut, ornamen bulan sabit & bintang emas, judul tulisan tangan hitam (Great Vibes), nama
 * bertulisan tangan emas, foto bayi berbingkai lengkung, kartu pemutar musik, strip tanggal
 * (hari | tanggal | tahun), kalender sebulan berpenanda hati, dan lokasi acara bertombol kecil.
 */
const A = '/theme-assets/anggrek-emas'

// ---------- Gaya ----------
const PAPER = 'bg-[radial-gradient(rgba(184,146,79,0.05)_1px,transparent_1px)] bg-[length:5px_5px]'
const btn = 'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-heading text-[13px] uppercase tracking-[0.18em] text-white shadow-[0_10px_20px_-12px_rgba(140,100,40,0.8)]'
const pill = 'inline-flex items-center justify-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 font-heading text-[11px] uppercase tracking-[0.14em] text-primary'
const caps = (t: string, cls = '') => p(`font-heading uppercase tracking-[0.22em] ${cls}`, t)
const script = (t: string, cls = '') => p(`font-script leading-none ${cls}`, t)
const txt = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[17px] leading-snug text-ink/85 ${cls}`, t, opt)
const deco = (asset: string, cls: string) => img(`pointer-events-none absolute select-none ${cls}`, `{{asset.${asset}}}`, '')
const divider = (cls = '') => img(`mx-auto w-[180px] ${cls}`, '{{asset.garis}}', '')
/** Ikon emas kecil + judul kapital + subjudul tulisan tangan */
const heading = (icon: string, title: string, sub = '') => div('uv-reveal text-center', [
  img('mx-auto w-8', `{{asset.${icon}}}`, ''),
  caps(title, 'mt-2 text-[14px] text-ink'),
  ...(sub ? [script(sub, 'mt-1 text-[34px] text-primary')] : []),
])
/** Foto berbingkai lengkung dengan garis emas tipis di luar */
const archPhoto = (cls: string, children: ThemeNode[]) => div(`relative mx-auto rounded-t-[999px] border border-primary/45 p-2 ${cls}`, [
  div('relative h-full w-full overflow-hidden rounded-t-[999px] bg-[#f3e8e6]', children),
])
const childPhoto = [
  img('absolute inset-0 h-full w-full object-cover', '{{child_photo}}', 'Foto {{child_nickname}}', { if: 'child_photo' }),
  div('absolute inset-0 grid place-items-center', [script('{{child_nickname}}', 'text-[44px] text-primary')], { if: '!child_photo' }),
]
const fact = (label: string, value: string) => div('rounded-[14px] border border-primary/25 bg-surface px-3 py-2.5', [
  caps(label, 'text-[10px] tracking-[0.16em] text-muted'),
  p('mt-1 font-body text-[17px] font-semibold leading-tight text-ink', value),
])

export const meta = {
  code: 'AQI-003',
  slug: 'anggrek-emas',
  name: 'Anggrek Emas',
  category: 'aqiqah-putri',
  description: 'Aqiqah putri bernuansa kertas gading & emas: anggrek bulan pink dan lili putih di sudut, ornamen bulan sabit & bintang, nama bertulisan tangan emas, foto bayi berbingkai lengkung, kartu pemutar musik, strip tanggal, dan kalender berpenanda hati.',
}

export const definition: ThemeDefinition = {
  version: 1,
  kind: 'aqiqah',
  globals: {
    primary_color: '#b8924f',
    secondary_color: '#3f3a36',
    accent_color: '#e3a9b1',
    background_color: '#fbf6ef',
    surface_color: '#fffdf9',
    text_color: '#4a433e',
    muted_color: '#8c8079',
    font_heading: 'Marcellus',
    font_body: 'Cormorant Garamond',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    anggrek: `${A}/anggrek.svg`,
    lili: `${A}/lili.svg`,
    ornamen: `${A}/ornamen.svg`,
    garis: `${A}/garis.svg`,
    lokasi: `${A}/ikon-lokasi.svg`,
    kado: `${A}/ikon-kado.svg`,
    surat: `${A}/ikon-surat.svg`,
    bayi: `${A}/ikon-bayi.svg`,
  },
  demo: {
    child_photo: '/theme-assets/aqiqah-foto/bayi-keranjang.jpg',
    cover_photos: ['/theme-assets/aqiqah-foto/bayi-tidur.jpg', '/theme-assets/aqiqah-foto/ibu-bayi.jpg'],
    gallery: ['/theme-assets/aqiqah-foto/bayi-keranjang.jpg', '/theme-assets/aqiqah-foto/bayi-tidur.jpg', '/theme-assets/aqiqah-foto/ibu-bayi.jpg', '/theme-assets/aqiqah-foto/bayi-ungu.jpg'],
    child: { name: 'Danna Aisyah Ramadhani', nickname: 'Danna', gender: 'p', order: 'Putri pertama' },
  },
  sections: [
    // ---------- Sampul: bunga di sudut, ornamen, judul tulisan tangan, foto lengkung ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-base ${PAPER} px-6 pb-28 pt-14 text-center`,
      children: [
        deco('anggrek', '-left-10 -top-10 w-[175px]'),
        deco('anggrek', '-right-10 -top-10 w-[155px] -scale-x-100'),
        deco('lili', '-bottom-10 -left-14 w-[180px] rotate-[8deg]'),
        deco('lili', '-bottom-12 -right-12 w-[160px] -scale-x-100'),
        caps('Tasyakuran Aqiqah {{child_gender}}', 'uv-reveal relative mt-16 text-[12px] text-primary'),
        img('uv-reveal uv-d1 relative mx-auto mt-3 w-[120px]', '{{asset.ornamen}}', ''),
        script('Aqiqah', 'uv-reveal uv-d1 relative mt-2 text-[66px] text-secondary'),
        script('{{child_nickname}}', 'uv-reveal uv-d2 relative mt-1 text-[48px] text-primary'),
        caps('{{child_name}}', 'uv-reveal uv-d2 relative mx-auto mt-2 max-w-[300px] text-[14px] leading-relaxed text-ink'),
        archPhoto('uv-reveal-mask uv-d3 mt-6 h-[300px] w-[230px]', childPhoto),
        txt('Kepada Yth.', 'uv-reveal relative mt-7 text-[16px] italic text-muted'),
        comp('guest_name', 'uv-reveal relative mt-1 block font-heading text-[18px] uppercase tracking-[0.12em] text-ink', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop relative mt-6', [comp('open_button', btn, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Musik, pembuka, orang tua, strip tanggal ----------
    {
      type: 'hero',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-14 pt-12 text-center`,
      children: [
        deco('lili', '-right-12 -top-10 w-[150px] rotate-[200deg] opacity-90'),
        comp('music_player', 'uv-reveal relative mx-auto mb-10 block max-w-[300px]', {
          label: 'Putar lagu',
          item_class: 'rounded-[22px] border border-primary/30 bg-surface px-6 py-5 text-center shadow-[0_14px_30px_-24px_rgba(120,90,40,0.6)]',
          label_class: 'font-heading text-[12px] uppercase tracking-[0.2em] text-ink',
          text_class: 'mt-1 font-script text-[26px] leading-tight text-primary',
          bar_class: 'h-[3px] rounded-full bg-primary/20',
          fill_class: 'rounded-full bg-primary',
          button_class: 'h-12 w-12 rounded-full bg-primary text-white shadow-[0_8px_16px_-8px_rgba(140,100,40,0.9)]',
        }),
        p('uv-reveal relative font-arabic text-[24px] leading-loose text-secondary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
        txt('{{opening_text}}', 'uv-reveal uv-d1 relative mx-auto mt-4 max-w-[310px]'),
        caps('Bersama ayah & bunda', 'uv-reveal uv-d2 relative mt-7 text-[12px] text-primary'),
        caps('{{father_name}}', 'uv-reveal uv-d2 relative mt-2 text-[14px] leading-relaxed text-ink'),
        script('&', 'uv-reveal uv-d2 relative text-[30px] text-primary'),
        caps('{{mother_name}}', 'uv-reveal uv-d2 relative text-[14px] leading-relaxed text-ink'),
        divider('uv-reveal relative mt-7'),
        caps('Mengundang Anda di', 'uv-reveal relative mt-6 text-[12px] text-ink'),
        caps('Tasyakuran Aqiqah', 'uv-reveal uv-d1 relative mt-2 text-[26px] tracking-[0.18em] text-primary'),
        caps('{{event_month}}', 'uv-reveal uv-d2 relative mt-6 text-[13px] text-primary'),
        div('uv-reveal uv-d2 relative mx-auto mt-2 grid max-w-[300px] grid-cols-[1fr_auto_1fr] items-center gap-4', [
          caps('{{event_day}}', 'border-y border-primary/50 py-2 text-[12px] tracking-[0.16em] text-ink'),
          p('font-heading text-[58px] leading-none text-primary', '{{event_date_num}}'),
          caps('{{event_year}}', 'border-y border-primary/50 py-2 text-[12px] tracking-[0.16em] text-ink'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative overflow-hidden bg-base ${PAPER} px-7 pb-14 pt-4 text-center`,
      children: [
        divider('uv-reveal'),
        p('uv-reveal uv-d1 mt-5 font-arabic text-[22px] leading-loose text-secondary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        txt('“{{quote_text}}”', 'uv-reveal uv-d2 mx-auto mt-3 max-w-[320px] text-[18px] italic'),
        caps('{{quote_source}}', 'uv-reveal uv-d3 mt-4 text-[11px] text-primary'),
      ],
    },
    // ---------- Detail kelahiran ----------
    {
      type: 'profile',
      class: `relative overflow-hidden bg-surface px-6 py-14 text-center`,
      children: [
        deco('anggrek', '-right-12 -top-4 w-[150px] -scale-x-100 opacity-90'),
        heading('bayi', 'Telah lahir dengan selamat', 'buah hati kami'),
        script('{{child_nickname}}', 'uv-reveal relative mt-5 text-[46px] text-secondary'),
        caps('{{child_name}}', 'uv-reveal relative mt-2 text-[13px] leading-relaxed text-ink'),
        txt('{{child_order}} dari {{parents_names}}', 'uv-reveal uv-d1 relative mx-auto mt-2 max-w-[300px] text-[16px] italic text-muted', { if: 'parents_names' }),
        div('uv-reveal uv-d2 relative mx-auto mt-7 grid max-w-[330px] grid-cols-2 gap-3 text-left', [
          div('col-span-2', [fact('Tanggal lahir', '{{child_birth}}')]),
          div('', [fact('Jam lahir', '{{child_birth_time}}')], { if: 'child_birth_time' }),
          div('', [fact('Berat', '{{child_weight}}')], { if: 'child_weight' }),
          div('', [fact('Panjang', '{{child_length}}')], { if: 'child_length' }),
        ]),
      ],
    },
    // ---------- Kalender sebulan + hitung mundur ----------
    {
      type: 'countdown',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 py-14 text-center`,
      children: [
        script('Hari Bahagia', 'uv-reveal text-[42px] text-secondary'),
        caps('{{event_month}} {{event_year}}', 'uv-reveal uv-d1 mt-2 text-[13px] text-primary'),
        div('uv-reveal uv-d1 relative mx-auto mt-5 max-w-[310px] rounded-[22px] border border-primary/25 bg-surface px-4 py-5', [
          deco('anggrek', '-left-14 -top-12 w-[100px] opacity-95'),
          comp('month_calendar', 'relative', {
            head_class: 'pb-1 font-heading text-[10px] uppercase tracking-[0.08em] text-muted',
            day_class: 'font-body text-[17px] text-ink',
            active_class: 'font-body text-[17px] font-bold text-white',
            marker: 'heart',
            marker_class: 'text-primary',
          }),
        ]),
        div('uv-reveal uv-d2 mx-auto mt-8 max-w-[320px]', [comp('countdown', '', {
          item_class: 'border-r border-primary/30 py-1 text-center [&:last-child]:border-r-0',
          number_class: 'block font-heading text-[36px] leading-none text-primary',
          label_class: 'mt-1 block font-heading text-[10px] uppercase tracking-[0.18em] text-muted',
        })]),
        div('uv-reveal mt-7', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: pill })]),
      ],
    },
    // ---------- Lokasi acara ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        deco('lili', '-left-14 bottom-0 w-[150px] rotate-[10deg] opacity-90'),
        heading('lokasi', 'Lokasi acara', 'di mana acaranya?'),
        div('relative mt-8 grid gap-9', [
          el('article', 'uv-reveal', [
            script('{{item.name}}', 'text-[36px] text-primary'),
            caps('{{item.time}}', 'mt-3 text-[12px] text-ink'),
            txt('{{item.date}}', 'mt-1 text-[16px] italic text-muted'),
            caps('{{item.venue}}', 'mt-3 text-[13px] leading-relaxed text-ink'),
            txt('{{item.address}}', 'mx-auto mt-1 max-w-[280px] text-[16px]'),
            div('mt-4', [comp('map_button', pill, { href: '{{item.map_url}}', label: '⌖ Lihat lokasi' }, { if: 'item.map_url' })]),
            divider('mt-8 w-[120px] opacity-70'),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    // ---------- Galeri ----------
    {
      type: 'gallery',
      class: `relative overflow-hidden bg-base ${PAPER} px-5`,
      children: [
        div('pb-14 pt-12 text-center', [
          script('Galeri', 'uv-reveal text-[42px] text-secondary'),
          caps('momen si kecil', 'uv-reveal uv-d1 mt-2 text-[12px] text-primary'),
          div('mt-7 grid grid-cols-2 gap-3', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden rounded-t-[999px] border border-primary/40 bg-surface p-1.5 [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/3] [&:nth-child(3n+1)]:rounded-t-[200px]', [
              img('h-full w-full rounded-t-[inherit] object-cover', '{{item.url}}', '{{item.caption}}'),
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
          heading('kado', 'Tanda kasih'),
          txt('Doa restu Anda adalah hadiah terindah bagi si kecil. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[300px] text-[16px] italic'),
          div('mt-7 grid gap-5', [{
            ...div('uv-reveal mx-auto w-full max-w-[320px] rounded-[22px] border border-primary/30 bg-base px-6 py-7', [
              caps('{{item.bank}}', 'text-[11px] text-muted'),
              p('mt-2 font-heading text-[24px] tracking-[0.1em] text-primary', '{{item.number}}'),
              txt('a.n. {{item.holder}}', 'mt-1 italic'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: pill })]),
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
        heading('surat', 'Konfirmasi kehadiran'),
        txt('Mohon konfirmasi kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[290px] text-[16px] italic'),
        div('uv-reveal uv-d2 mt-7 rounded-[22px] border border-primary/25 bg-surface px-5 py-6 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full rounded-[12px] border border-primary/30 bg-base px-4 py-2.5 font-body text-[17px] text-ink outline-none focus:border-primary',
          button_class: `w-full ${btn} disabled:opacity-60`,
          label_class: 'font-heading text-[12px] uppercase tracking-[0.14em] text-ink',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        script('Doa & Ucapan', 'uv-reveal text-[40px] text-secondary'),
        div('uv-reveal mt-6 text-left', [comp('wishes', '', {
          item_class: 'border-b border-primary/20 py-3',
          name_class: 'font-heading text-[14px] uppercase tracking-[0.1em] text-primary',
          text_class: 'mt-1 font-body text-[17px] leading-snug text-ink/85',
        })]),
      ],
    },
    // ---------- Penutup ----------
    {
      type: 'closing',
      class: `relative overflow-hidden bg-base ${PAPER} px-6 pb-24 pt-14 text-center`,
      children: [
        deco('anggrek', '-left-10 -top-6 w-[170px]'),
        deco('lili', '-bottom-10 -right-12 w-[170px] -scale-x-100'),
        archPhoto('uv-reveal relative mt-8 h-[250px] w-[200px]', childPhoto),
        txt('{{closing_text}}', 'uv-reveal relative mx-auto mt-7 max-w-[310px]'),
        caps('Dengan penuh cinta,', 'uv-reveal relative mt-7 text-[12px] text-muted'),
        script('{{parents_names}}', 'uv-reveal uv-d1 relative mx-auto mt-3 max-w-[320px] text-[34px] leading-tight text-secondary'),
        script('& {{child_nickname}}', 'uv-reveal uv-d2 relative mt-1 text-[34px] text-primary'),
        img('uv-reveal relative mx-auto mt-6 w-[110px]', '{{asset.ornamen}}', ''),
        caps('{{closing_greeting}}', 'uv-reveal relative mx-auto mt-4 max-w-[300px] text-[11px] leading-relaxed text-muted'),
      ],
    },
  ],
}
