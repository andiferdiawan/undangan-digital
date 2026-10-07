import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Pilot Cilik — ulang tahun anak bernuansa langit periwinkle: awan putih lembut, taburan bintang emas,
 * beruang pilot di pesawat baling-baling yang melayang, beruang di balon udara, foto si kecil berbingkai
 * putih dengan awan di tepinya, judul tulisan tangan tebal (Caveat Brush), nama bertulisan indah
 * (Great Vibes), dan "pencapaian tahun pertamaku" (isi Kisah) dalam awan zig-zag bergaris putus-putus.
 */
const A = '/theme-assets/pilot-cilik'

// ---------- Gaya ----------
const SKY = 'bg-[radial-gradient(rgba(154,164,226,0.18)_1.2px,transparent_1.2px)] bg-[length:18px_18px]'
const btn = 'inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-7 py-3 font-body text-[14px] font-semibold text-white shadow-[0_10px_20px_-12px_rgba(47,58,107,0.7)]'
const head = (t: string, cls = '') => el('h2', `font-heading text-[38px] leading-tight text-primary ${cls}`, t)
const txt = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[15px] leading-relaxed text-ink/85 ${cls}`, t, opt)
const caps = (t: string, cls = '') => p(`font-body text-[12px] font-semibold uppercase tracking-[0.18em] ${cls}`, t)
const deco = (asset: string, cls: string) => img(`pointer-events-none absolute select-none ${cls}`, `{{asset.${asset}}}`, '')
const stars = (cls: string) => deco('bintang', `w-[240px] opacity-90 ${cls}`)
const card = (cls: string, children: ThemeNode[]) => div(`relative rounded-[26px] bg-surface px-6 py-7 shadow-[0_18px_34px_-26px_rgba(47,58,107,0.6)] ${cls}`, children)
/** Foto berbingkai putih membulat dengan awan menutupi tepi bawah */
const cloudPhoto = (cls: string, children: ThemeNode[]) => div(`relative mx-auto ${cls}`, [
  div('relative h-full w-full overflow-hidden rounded-[28px] border-[6px] border-white bg-[#dfe4f8] shadow-[0_20px_36px_-24px_rgba(47,58,107,0.7)]', children),
  deco('awan', '-bottom-9 -left-10 w-[calc(100%_+_80px)]'),
])
const childPhoto = [
  img('absolute inset-0 h-full w-full object-cover', '{{child_photo}}', 'Foto {{child_nickname}}', { if: 'child_photo' }),
  div('absolute inset-0 grid place-items-center', [p('font-script text-[52px] text-primary', '{{child_nickname}}')], { if: '!child_photo' }),
]

export const meta = {
  code: 'UTH-004',
  slug: 'pilot-cilik',
  name: 'Pilot Cilik',
  category: 'ulang-tahun-anak',
  description: 'Ulang tahun anak bernuansa langit periwinkle: awan lembut, bintang emas, beruang pilot di pesawat yang melayang, beruang di balon udara, foto berbingkai awan, dan "pencapaian tahun pertamaku" dalam awan zig-zag bergaris putus-putus.',
}

export const definition: ThemeDefinition = {
  version: 1,
  kind: 'birthday',
  globals: {
    primary_color: '#2f3a6b',
    secondary_color: '#9aa4e2',
    accent_color: '#f0c36a',
    background_color: '#eaedfb',
    surface_color: '#ffffff',
    text_color: '#3d4466',
    muted_color: '#7c84a8',
    font_heading: 'Caveat Brush',
    font_body: 'Lora',
    font_script: 'Great Vibes',
  },
  root_class: 'text-[15px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    awan: `${A}/awan.svg`,
    awan_kecil: `${A}/awan-kecil.svg`,
    bintang: `${A}/bintang.svg`,
    pesawat: `${A}/pesawat.svg`,
    balon: `${A}/balon-udara.svg`,
    beruang: `${A}/beruang.svg`,
    alur: `${A}/alur.svg`,
    panah: `${A}/panah.svg`,
  },
  demo: {
    child_photo: '/theme-assets/aqiqah-foto/bayi-biru.jpg',
    cover_photos: ['/theme-assets/aqiqah-foto/bayi-biru.jpg', '/theme-assets/ultah-foto/anak-lilin.jpg'],
    gallery: ['/theme-assets/aqiqah-foto/bayi-biru.jpg', '/theme-assets/ultah-foto/anak-lilin.jpg', '/theme-assets/aqiqah-foto/bayi-tidur.jpg', '/theme-assets/ultah-foto/bayi-balon.jpg'],
    child: { name: 'Arkan Rafisqy Pratama', nickname: 'Arkan', gender: 'l', order: 'Putra pertama', birth_date: '2025-12-19' },
    story: [
      { date: 'Bulan ke-5', title: 'Gigi pertama', text: 'Sekarang sudah 8 gigi mungil!' },
      { date: 'Bulan ke-9', title: 'Kata pertama', text: '"Mama" — lalu disusul "Baba".' },
      { date: 'Bulan ke-11', title: 'Langkah pertama', text: 'Tiga langkah berani menuju pelukan Ayah.' },
      { date: 'Usia 1 tahun', title: '10 kg kebahagiaan', text: 'Tumbuh sehat dan selalu ceria.' },
    ],
  },
  sections: [
    // ---------- Sampul: foto berbingkai awan, pesawat beruang, nama, usia ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-base ${SKY} px-6 pb-12 pt-10 text-center`,
      children: [
        stars('-left-6 top-6'),
        stars('-right-10 bottom-24 rotate-180'),
        deco('awan_kecil', 'uv-float left-[-30px] top-[46%] w-[110px] opacity-80'),
        cloudPhoto('uv-reveal-zoom h-[320px] w-full max-w-[280px]', childPhoto),
        div('pointer-events-none relative z-[2] -mt-16 ml-auto mr-[-14px] w-[150px]', [img('uv-float w-full', '{{asset.pesawat}}', 'Beruang pilot')]),
        p('uv-reveal uv-d1 relative -mt-2 font-script text-[68px] leading-none text-primary', '{{child_nickname}}'),
        caps('{{age_number}} tahun', 'uv-reveal uv-d2 relative mt-3 text-[14px] tracking-[0.3em] text-primary'),
        img('uv-reveal uv-d2 relative mx-auto mt-3 w-8 animate-bounce', '{{asset.panah}}', ''),
        txt('Kepada Yth.', 'uv-reveal uv-d3 relative mt-5 text-[13px] italic text-muted'),
        comp('guest_name', 'uv-reveal uv-d3 relative mt-0.5 block font-heading text-[26px] leading-tight text-primary', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop uv-d4 relative mt-5', [comp('open_button', btn, { label: 'Buka Undangan ✈' })]),
      ],
    },
    // ---------- Sapaan + tanggal ----------
    {
      type: 'hero',
      class: `relative overflow-hidden bg-base ${SKY} px-6 pb-14 pt-14 text-center`,
      children: [
        stars('-right-12 -top-4'),
        caps('{{greeting}}', 'uv-reveal relative mx-auto max-w-[280px] text-[11px] text-muted'),
        head('Teman-teman tersayang!', 'uv-reveal uv-d1 relative mt-3'),
        txt('{{opening_text}}', 'uv-reveal uv-d2 relative mx-auto mt-4 max-w-[320px]'),
        card('uv-reveal-pop uv-d3 mx-auto mt-8 max-w-[300px] py-6', [
          caps('{{event_day}}', 'text-[11px] text-muted'),
          p('mt-1 font-heading text-[40px] leading-none text-primary', '{{event_date_num}} {{event_month}}'),
          caps('{{event_year}} · pukul {{event_time}}', 'mt-2 text-[11px] tracking-[0.12em] text-secondary'),
        ]),
        div('pointer-events-none relative mx-auto -mb-4 mt-6 w-[130px]', [img('uv-float w-full -scale-x-100', '{{asset.pesawat}}', '')]),
      ],
    },
    // ---------- Tempat acara ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        deco('awan_kecil', '-right-6 top-8 w-[110px]'),
        deco('awan_kecil', '-left-8 bottom-10 w-[100px]'),
        head('Pestanya di sini', 'uv-reveal relative'),
        div('relative mt-6 grid gap-6', [
          el('article', 'uv-reveal mx-auto w-full max-w-[320px] rounded-[24px] bg-base px-6 py-6', [
            p('font-heading text-[26px] leading-tight text-primary', '{{item.name}}'),
            caps('{{item.time}}', 'mt-2 text-[11px] text-secondary'),
            txt('{{item.date}}', 'text-[13px] italic text-muted'),
            p('mt-3 font-body text-[15px] font-semibold text-ink', '{{item.venue}}'),
            txt('{{item.address}}', 'text-[14px] text-muted'),
            div('mt-4', [comp('map_button', btn, { href: '{{item.map_url}}', label: 'Lihat di peta' }, { if: 'item.map_url' })]),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    // ---------- Pencapaian tahun pertama (isi Kisah) dalam awan zig-zag ----------
    {
      type: 'story',
      class: `relative overflow-hidden bg-base ${SKY} px-5`,
      children: [
        div('py-14 text-center', [
          head('Pencapaian tahun pertamaku', 'uv-reveal mx-auto max-w-[300px]'),
          div('mx-auto mt-8 grid max-w-[360px] gap-10', [
            el('article', 'uv-reveal relative flex [&:nth-child(even)]:justify-end [&:nth-child(even)>img]:-scale-x-100 [&:last-child>img]:hidden', [
              div('relative z-[1] w-[64%] rounded-[999px] bg-white px-5 py-4 shadow-[0_12px_24px_-18px_rgba(47,58,107,0.7)]', [
                caps('{{item.date}}', 'text-[10px] tracking-[0.14em] text-secondary'),
                p('mt-1 font-heading text-[22px] leading-tight text-primary', '{{item.title}}'),
                txt('{{item.text}}', 'mt-0.5 text-[13px] leading-snug'),
              ]),
              // garis putus-putus menuju awan berikutnya di sisi seberang
              img('pointer-events-none absolute left-[32%] top-[calc(100%_-_8px)] h-[56px] w-[36%]', '{{asset.alur}}', ''),
            ], { repeat: 'story' }),
          ]),
          div('pointer-events-none relative mx-auto mt-8 w-[90px]', [img('uv-float w-full', '{{asset.balon}}', 'Balon udara')]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Si kecil ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        head('Si pilot kecil', 'uv-reveal'),
        card('uv-reveal uv-d1 mx-auto mt-6 max-w-[330px] bg-base shadow-none', [
          p('font-script text-[46px] leading-none text-primary', '{{child_nickname}}'),
          p('mt-3 font-body text-[17px] font-semibold text-ink', '{{child_name}}'),
          txt('{{child_order}} dari {{parents_names}}', 'mt-1 text-[14px] text-muted', { if: 'parents_names' }),
          div('mt-5 grid grid-cols-2 gap-3', [
            div('rounded-[18px] bg-white px-3 py-3', [caps('Usia', 'text-[10px] text-muted'), p('mt-1 font-heading text-[24px] leading-none text-primary', '{{child_age}}')]),
            div('rounded-[18px] bg-white px-3 py-3', [caps('Lahir', 'text-[10px] text-muted'), p('mt-1 font-body text-[13px] font-semibold leading-snug text-ink', '{{child_birth}}')]),
          ]),
        ]),
      ],
    },
    {
      type: 'quote',
      class: `relative overflow-hidden bg-base ${SKY} px-7 pb-14 pt-24 text-center`,
      children: [
        deco('balon', 'uv-float right-6 top-4 w-[56px]'),
        stars('-bottom-16 -left-28'),
        p('uv-reveal relative mx-auto max-w-[300px] font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        txt('“{{quote_text}}”', 'uv-reveal uv-d1 relative mx-auto mt-3 max-w-[300px] italic'),
        caps('{{quote_source}}', 'uv-reveal uv-d2 relative mt-3 text-[11px] text-secondary'),
      ],
    },
    // ---------- Hadiah ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-surface px-6',
      children: [
        div('py-14 text-center', [
          head('Hadiah impian', 'uv-reveal'),
          txt('Hadiah terbaik adalah kehadiran dan doa Anda. Bila ingin memberi tanda kasih, dapat melalui:', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[300px]'),
          div('mt-7 grid gap-5', [{
            ...card('uv-reveal mx-auto w-full max-w-[320px] bg-base shadow-none', [
              caps('{{item.bank}}', 'text-[11px] text-muted'),
              p('mt-2 font-heading text-[32px] leading-none tracking-[0.04em] text-primary', '{{item.number}}'),
              txt('a.n. {{item.holder}}', 'mt-1 text-[14px]'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btn })]),
            ]),
            repeat: 'gifts',
          }]),
          div('pointer-events-none relative mx-auto mt-8 w-[80px]', [img('uv-float w-full', '{{asset.balon}}', '')]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Hitung mundur "72 : 02 : 22 : 15" ----------
    {
      type: 'countdown',
      class: `relative overflow-hidden bg-base ${SKY} px-6 py-14 text-center`,
      children: [
        head('Menuju pesta', 'uv-reveal'),
        div('uv-reveal uv-d1 mx-auto mt-6 max-w-[320px]', [comp('countdown', '', {
          // titik dua pemisah digambar dari dua titik bulat (after + bayangan)
          item_class: 'relative py-1 text-center [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:-right-[4px] [&:not(:last-child)]:after:top-[10px] [&:not(:last-child)]:after:h-[6px] [&:not(:last-child)]:after:w-[6px] [&:not(:last-child)]:after:rounded-full [&:not(:last-child)]:after:bg-primary [&:not(:last-child)]:after:shadow-[0_13px_0_rgb(var(--c-primary))] [&:not(:last-child)]:after:content-empty',
          number_class: 'block font-heading text-[40px] leading-none text-primary',
          label_class: 'mt-1 block font-body text-[10px] uppercase tracking-[0.14em] text-muted',
        })]),
        div('uv-reveal uv-d2 mt-7', [comp('calendar_button', '', { label: 'Simpan tanggal', button_class: btn })]),
      ],
    },
    // ---------- Galeri ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-surface px-5',
      children: [
        div('py-14 text-center', [
          head('Momen si kecil', 'uv-reveal'),
          div('mt-7 grid grid-cols-2 gap-4', [
            el('figure', 'uv-reveal relative aspect-[4/5] overflow-hidden rounded-[22px] border-[5px] border-white bg-base shadow-[0_14px_26px_-18px_rgba(47,58,107,0.7)] [&:nth-child(odd)]:-rotate-2 [&:nth-child(even)]:rotate-2 [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/3] [&:nth-child(3n+1)]:rotate-0', [
              img('h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: `relative overflow-hidden bg-base ${SKY} px-6 py-14 text-center`,
      children: [
        head('Konfirmasi kehadiran', 'uv-reveal'),
        txt('Kabari kami, ya — biar si kecil tahu siapa saja yang datang.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[290px]'),
        div('relative mx-auto mt-6 max-w-[360px]', [
          div('pointer-events-none relative z-[1] mx-auto -mb-6 w-[96px]', [img('w-full', '{{asset.beruang}}', 'Beruang')]),
          card('uv-reveal text-left', [comp('rsvp_form', '', {
            input_class: 'w-full rounded-[14px] border border-secondary/50 bg-base px-4 py-2.5 font-body text-[16px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: 'font-body text-[13px] font-semibold text-primary',
          })]),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        head('Doa & ucapan', 'uv-reveal'),
        div('uv-reveal mt-6 text-left', [comp('wishes', '', {
          item_class: 'rounded-[20px] bg-base p-4',
          name_class: 'font-heading text-[20px] text-primary',
          text_class: 'mt-1 font-body text-[14px] leading-relaxed text-ink/85',
        })]),
      ],
    },
    // ---------- Penutup ----------
    {
      type: 'closing',
      class: `relative overflow-hidden bg-base ${SKY} px-6 pb-16 pt-12 text-center`,
      children: [
        stars('-right-10 top-4'),
        cloudPhoto('uv-reveal h-[300px] w-full max-w-[260px]', childPhoto),
        div('pointer-events-none relative z-[2] -mt-14 mr-auto ml-[-10px] w-[140px]', [img('uv-float w-full -scale-x-100', '{{asset.pesawat}}', '')]),
        head('Sampai jumpa!', 'uv-reveal relative mt-2 text-[44px]'),
        p('uv-reveal uv-d1 relative font-script text-[56px] leading-none text-primary', '{{child_nickname}}'),
        txt('{{closing_text}}', 'uv-reveal uv-d2 relative mx-auto mt-5 max-w-[310px]'),
        txt('Dengan sayang, {{parents_names}}', 'uv-reveal relative mt-5 text-[14px] font-semibold text-primary', { if: 'parents_names' }),
        caps('{{closing_greeting}}', 'uv-reveal relative mx-auto mt-4 max-w-[300px] text-[10px] leading-relaxed text-muted'),
      ],
    },
  ],
}
