import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kerangka tema pernikahan gaya surat kabar: masthead, headline "breaking news", kolom berita,
 * profil sebagai "wawancara eksklusif", agenda acara, kronologi, foto liputan, kupon RSVP,
 * surat pembaca (ucapan), iklan baris (amplop digital), dan kolofon redaksi.
 * Versi genz = tabloid pink dengan stiker & stabilo; versi klasik = koran vintage hitam-krem.
 */
export interface KoranOpts {
  dir: string
  genz: boolean
  masthead: string
  ink: string
  main: string // warna sorotan (pink / merah tinta)
  paper: string
  pale: string
  highlight: string // warna stabilo
  fonts: Pick<ThemeDefinition['globals'], 'font_heading' | 'font_body' | 'font_script'>
  demo: NonNullable<ThemeDefinition['demo']>
}

export function koranDefinition(o: KoranOpts): ThemeDefinition {
  const A = o.dir
  const rule = `border-y-[3px] border-double border-[${o.ink}]`
  const kicker = (t: string) => p(`uv-reveal font-body text-[11px] font-bold uppercase tracking-[0.3em] text-[${o.main}]`, t)
  const hl = o.genz ? `bg-[linear-gradient(transparent_58%,${o.highlight}_58%)] px-1` : ''
  const photoFx = o.genz ? '' : 'grayscale contrast-125'
  const section = (title: string, sub?: string): ThemeNode[] => [
    div(`uv-reveal ${rule} py-1.5 text-center`, [
      el('h2', `font-heading text-[26px] font-bold uppercase leading-none tracking-wide text-primary`, title),
    ]),
    ...(sub ? [p('uv-reveal uv-d1 mt-2 text-center font-body text-[13px] italic text-muted', sub)] : []),
  ]
  const sticker = (asset: string, pos: string, anim = 'uv-wiggle') => div(`pointer-events-none absolute ${pos}`, [img(`${anim} w-full`, `{{asset.${asset}}}`)])
  const box = `border-2 border-[${o.ink}] bg-surface p-4 ${o.genz ? `shadow-[4px_4px_0_${o.main}]` : ''}`
  const btn = o.genz
    ? `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[${o.ink}] bg-[${o.main}] px-6 py-2.5 font-body text-[14px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_${o.ink}]`
    : `inline-flex items-center justify-center gap-2 border-2 border-[${o.ink}] bg-[${o.ink}] px-6 py-2.5 font-body text-[13px] font-bold uppercase tracking-[0.2em] text-[${o.paper}]`

  /** Foto berbingkai ala koran (kolom) dengan keterangan */
  const newsPhoto = (src: string, caption: string, extra: string, cond?: string): ThemeNode =>
    el('figure', `relative ${extra}`, [
      ...(o.genz ? [div('pointer-events-none absolute -top-3 left-1/2 z-10 w-20 -translate-x-1/2', [img('w-full', '{{asset.isolasi}}')])] : []),
      div(`overflow-hidden border-2 border-[${o.ink}] bg-[${o.pale}] p-1`, [
        img(`uv-reveal-mask aspect-[4/5] w-full object-cover object-top ${photoFx}`, src, caption),
      ]),
      el('figcaption', 'mt-1 font-body text-[11px] italic text-muted', caption),
    ], cond ? { if: cond } : {})

  const person = (who: 'groom' | 'bride', delay: string): ThemeNode =>
    div(`uv-reveal-pop ${delay} text-center`, [
      newsPhoto(`{{${who}_photo}}`, who === 'groom' ? 'Sang mempelai pria. (Dok. pribadi)' : 'Sang mempelai wanita. (Dok. pribadi)', `mx-auto w-full ${o.genz ? (who === 'groom' ? '-rotate-2' : 'rotate-2') : ''}`, `${who}_photo`),
      div(`grid aspect-[4/5] place-items-center border-2 border-dashed border-[${o.ink}]/40 bg-[${o.pale}]`, [
        el('span', 'font-heading text-[34px] font-bold text-primary', `{{${who}_nickname}}`),
      ], { if: `!${who}_photo` }),
      el('h3', 'mt-3 font-heading text-[19px] font-bold leading-tight text-primary', `{{${who}_name}}`),
      p('mt-1 font-body text-[12.5px] leading-snug text-ink/80', `{{${who}_parents}}`),
      el('a', `mt-1.5 inline-block font-body text-[12px] font-bold text-[${o.main}] underline`, '@ Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
    ])

  return {
    version: 1,
    globals: {
      primary_color: o.ink,
      secondary_color: o.main,
      accent_color: o.main,
      background_color: o.paper,
      surface_color: o.genz ? '#ffffff' : '#f8f2e4',
      text_color: o.ink,
      muted_color: o.genz ? '#6d5a63' : '#5c554a',
      ...o.fonts,
    },
    root_class: 'text-[14.5px] leading-relaxed',
    assets: {
      ticker: `${A}/ticker.svg`,
      stempel: `${A}/stempel.svg`,
      halftone: `${A}/halftone.svg`,
      breaking: `${A}/breaking.svg`,
      garis: `${A}/garis.svg`,
      isolasi: `${A}/isolasi.svg`,
      cuaca: `${A}/cuaca.svg`,
      stiker_a: `${A}/stiker_a.svg`,
      stiker_b: `${A}/stiker_b.svg`,
      gunting: `${A}/gunting.svg`,
    },
    demo: o.demo,
    sections: [
      // ---------- Halaman depan ----------
      {
        type: 'cover',
        class: `relative flex flex-col overflow-hidden bg-base px-5 pb-10 pt-0 text-center`,
        children: [
          div('-mx-5 h-7 overflow-hidden', [img('h-7 w-full object-cover object-left', '{{asset.ticker}}', '')]),
          div(`mt-3 flex items-center justify-between border-b border-[${o.ink}] pb-1 font-body text-[10px] font-bold uppercase tracking-wider text-muted`, [
            el('span', '', 'Edisi Spesial'),
            el('span', '', '{{event_day}}, {{event_date_num}} {{event_month}} {{event_year}}'),
            el('span', '', 'Harga: Doa Restu'),
          ]),
          el('h1', `uv-reveal-zoom mt-2 font-heading text-[44px] font-black uppercase leading-[0.95] tracking-tight text-primary`, o.masthead),
          div(`${rule} mt-1 py-1 font-body text-[10.5px] font-bold uppercase tracking-[0.25em] text-muted`, 'Kabar Bahagia Terpercaya Sejak Hari Ini'),
          div('relative mt-5', [
            sticker('breaking', '-left-2 -top-5 z-10 w-24', 'uv-float'),
            p(`uv-reveal font-body text-[12px] font-bold uppercase tracking-[0.25em] text-[${o.main}]`, 'Berita Utama'),
            el('h2', 'uv-reveal-pop uv-d1 mt-1 font-heading text-[34px] font-black leading-[1.05] text-primary', [
              el('span', hl, '{{groom_nickname}} & {{bride_nickname}}'),
              el('span', 'block', 'Resmi Menikah!'),
            ]),
          ]),
          div(`uv-reveal-zoom uv-d2 relative mx-auto mt-5 aspect-[4/3] w-full overflow-hidden border-2 border-[${o.ink}] ${o.genz ? `shadow-[6px_6px_0_${o.main}]` : ''}`, [
            div(`absolute inset-0 ${photoFx}`, [comp('photo_slider', '', { dots: 'false', interval: '4200' })]),
            div('pointer-events-none absolute -bottom-2 -right-2 w-24', [img('uv-spin3d w-full', '{{asset.stempel}}')]),
          ]),
          p('mt-1 text-left font-body text-[11px] italic text-muted', 'Foto: kedua mempelai menjelang hari bahagia.'),
          div(`uv-reveal uv-d3 mx-auto mt-5 w-full max-w-[300px] ${box} py-3`, [
            p('font-body text-[11px] font-bold uppercase tracking-[0.2em] text-muted', 'Kepada Yth. Pembaca Setia'),
            comp('guest_name', 'mt-0.5 block font-heading text-[20px] font-bold text-primary', { fallback: 'Tamu Undangan' }),
          ]),
          div('uv-reveal-pop uv-d4 mt-5', [comp('open_button', btn, { label: 'Baca Selengkapnya →' })]),
          ...(o.genz ? [sticker('stiker_a', 'right-4 top-28 w-10'), sticker('stiker_b', 'left-3 top-[58%] w-8', 'uv-float')] : []),
        ],
      },
      // ---------- Kolom utama ----------
      {
        type: 'hero',
        class: 'relative overflow-hidden bg-base px-5 pb-12 pt-12',
        children: [
          ...section('Kabar Utama', '{{event_hijri}}'),
          p('uv-reveal mt-5 text-center font-arabic text-[22px] text-primary', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'),
          p('uv-reveal uv-d1 mt-3 text-center font-body text-[14px] font-bold italic text-[' + o.main + ']', '{{greeting}}'),
          p(`uv-reveal uv-d2 mt-4 text-justify font-body text-[14.5px] leading-relaxed text-ink first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-[52px] first-letter:font-black first-letter:leading-[0.8] first-letter:text-[${o.main}]`, '{{opening_text}}'),
          div('mt-6 grid grid-cols-2 gap-4', [
            div(`uv-reveal-left border-r border-[${o.ink}]/30 pr-4`, [
              p('font-body text-[10.5px] font-bold uppercase tracking-[0.2em] text-muted', 'Mempelai Pria'),
              p('mt-1 font-heading text-[20px] font-bold leading-tight text-primary', '{{groom_name}}'),
            ]),
            div('uv-reveal-right', [
              p('font-body text-[10.5px] font-bold uppercase tracking-[0.2em] text-muted', 'Mempelai Wanita'),
              p('mt-1 font-heading text-[20px] font-bold leading-tight text-primary', '{{bride_name}}'),
            ]),
          ]),
          img('uv-reveal mx-auto mt-8 h-6 w-52', '{{asset.garis}}'),
        ],
      },
      // ---------- Kutipan hari ini ----------
      {
        type: 'quote',
        class: `relative overflow-hidden bg-[${o.pale}] px-6 py-12 text-center`,
        bg: '{{asset.halftone}}',
        children: [
          div(`relative mx-auto max-w-[340px] ${box} px-5 py-6`, [
            kicker('Kutipan Hari Ini'),
            p('uv-reveal uv-d1 mt-3 font-arabic text-[19px] leading-loose text-primary', '{{quote_arabic}}'),
            p('uv-reveal uv-d2 mt-2 font-heading text-[16px] italic leading-snug text-ink', '“{{quote_text}}”'),
            p('uv-reveal uv-d3 mt-2 font-body text-[12px] font-bold uppercase tracking-wider text-muted', '— {{quote_source}}'),
          ]),
        ],
      },
      // ---------- Wawancara eksklusif ----------
      {
        type: 'profile',
        class: 'relative overflow-hidden bg-base px-5 py-14',
        children: [
          ...section('Wawancara Eksklusif', 'Mengenal lebih dekat dua tokoh utama edisi ini'),
          div('mt-7 grid grid-cols-2 gap-4', [person('groom', 'uv-d1'), person('bride', 'uv-d2')]),
          ...(o.genz ? [sticker('stiker_a', 'bottom-6 right-5 w-9', 'uv-float')] : []),
        ],
      },
      // ---------- Agenda acara ----------
      {
        type: 'event',
        class: `relative overflow-hidden bg-[${o.pale}] px-5 py-14`,
        children: [
          ...section('Agenda Acara', 'Catat tanggalnya, jangan sampai ketinggalan berita'),
          div(`uv-reveal-pop uv-d1 mt-6 ${box}`, [
            p('text-center font-body text-[11px] font-bold uppercase tracking-[0.25em] text-muted', 'Hitung Mundur'),
            div('mt-2', [comp('countdown', '', {
              item_class: `border border-[${o.ink}]/40 bg-[${o.paper}] py-2 text-center`,
              number_class: 'block font-heading text-[26px] font-black leading-none text-primary',
              label_class: 'font-body text-[10px] font-bold uppercase tracking-wider text-muted',
            })]),
          ]),
          div('mt-6 grid gap-5', [
            el('article', `uv-reveal-flip ${box} text-left`, [
              div(`flex items-center justify-between border-b border-[${o.ink}]/30 pb-2`, [
                el('span', `font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[${o.main}]`, '{{item.day}}'),
                el('span', 'font-body text-[11px] font-bold text-muted', '{{item.time}}'),
              ]),
              el('h3', 'mt-2 font-heading text-[24px] font-black leading-tight text-primary', '{{item.name}}'),
              p('mt-1 font-body text-[14px] font-bold text-ink', '{{item.date}}'),
              p('mt-2 font-heading text-[16px] font-bold text-primary', '{{item.venue}}'),
              p('font-body text-[13px] text-muted', '{{item.address}}'),
              comp('map_button', `mt-4 ${btn}`, { href: '{{item.map_url}}', label: '📍 Petunjuk Lokasi' }, { if: 'item.map_url' }),
            ], { repeat: 'events' }),
          ]),
          div(`uv-reveal mt-6 flex items-center gap-4 ${box}`, [
            img('w-20 shrink-0', '{{asset.cuaca}}', 'Prakiraan cuaca'),
            div('text-left', [
              p('font-body text-[11px] font-bold uppercase tracking-[0.2em] text-muted', 'Prakiraan Cuaca Hari H'),
              p('font-heading text-[17px] font-bold leading-snug text-primary', 'Cerah berawan, 100% bahagia'),
              p('font-body text-[12px] text-muted', 'Peluang turun doa restu: sangat tinggi.'),
            ]),
          ]),
          div('uv-reveal mt-6 text-center', [comp('calendar_button', '', { label: '📅 Simpan ke Kalender', button_class: btn })]),
        ],
      },
      // ---------- Kronologi ----------
      {
        type: 'story',
        class: 'relative overflow-hidden bg-base px-5',
        children: [
          div('py-14', [
            ...section('Kronologi', 'Laporan perjalanan hingga hari bahagia'),
            div('mt-6 grid gap-5', [
              el('article', `uv-reveal-left border-l-[3px] border-[${o.main}] pl-4`, [
                p(`font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[${o.main}]`, '{{item.date}}'),
                el('h3', 'mt-0.5 font-heading text-[20px] font-bold leading-tight text-primary', '{{item.title}}'),
                p('mt-1 font-body text-[13.5px] text-ink/85', '{{item.text}}'),
              ], { repeat: 'story' }),
            ]),
          ], { if: 'story' }),
        ],
      },
      // ---------- Foto liputan ----------
      {
        type: 'gallery',
        class: `bg-[${o.pale}] px-5`,
        children: [
          div('py-14', [
            ...section('Foto Liputan', 'Momen-momen yang berhasil diabadikan redaksi'),
            div('mt-7 grid grid-cols-2 gap-4', [
              div(`group uv-reveal-pop ${o.genz ? 'odd:-rotate-2 even:rotate-2' : ''}`, [
                newsPhoto('{{item.url}}', '{{item.caption}}', ''),
              ], { repeat: 'gallery' }),
            ]),
          ], { if: 'gallery' }),
        ],
      },
      // ---------- Kupon RSVP & surat pembaca ----------
      {
        type: 'rsvp',
        class: 'relative overflow-hidden bg-base px-5 py-14',
        children: [
          ...section('Kupon Kehadiran', 'Isi, lalu kirim sebelum hari H'),
          div(`uv-reveal-flip relative mt-7 border-2 border-dashed border-[${o.ink}] bg-surface p-5 text-left`, [
            div(`absolute -top-4 left-6 w-9 bg-base px-1`, [img('w-full', '{{asset.gunting}}', '')]),
            comp('rsvp_form', '', {
              input_class: `w-full border-2 border-[${o.ink}]/60 bg-[${o.paper}] px-3 py-2.5 font-body text-[16px] text-ink outline-none focus:border-[${o.main}]`,
              button_class: `w-full ${btn} disabled:opacity-60`,
              label_class: 'font-body text-[12px] font-bold uppercase tracking-wider text-primary',
            }),
          ]),
          div('mt-12', [...section('Surat Pembaca')]),
          comp('wishes', 'mt-5 text-left', { item_class: `border-b border-[${o.ink}]/25 bg-transparent py-3`, name_class: 'font-heading font-bold text-primary' }),
        ],
      },
      // ---------- Iklan baris (amplop digital) ----------
      {
        type: 'gift',
        class: `bg-[${o.pale}] px-5`,
        children: [
          div('py-14', [
            ...section('Iklan Baris', 'Bagi pembaca yang ingin mengirim tanda kasih'),
            div('mt-6 grid gap-4', [
              div('uv-reveal-pop', [
                div(`${box} text-left`, [
                  div(`flex items-center justify-between border-b border-[${o.ink}]/30 pb-2`, [
                    el('span', `font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[${o.main}]`, 'Dicari: Doa & Hadiah'),
                    el('span', 'font-body text-[11px] font-bold text-muted', '{{item.bank}}'),
                  ]),
                  p('mt-2 font-heading text-[24px] font-black tracking-wider text-primary', '{{item.number}}'),
                  p('font-body text-[13px] text-muted', 'a.n. {{item.holder}}'),
                  div('mt-3', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `border-2 border-[${o.ink}] px-4 py-1.5 font-body text-[12px] font-bold uppercase tracking-wider text-primary` })]),
                ]),
              ], { repeat: 'gifts' }),
            ]),
          ], { if: 'gifts' }),
        ],
      },
      // ---------- Redaksi (penutup) ----------
      {
        type: 'closing',
        class: 'relative overflow-hidden bg-base px-5 pb-16 pt-12 text-center',
        children: [
          ...section('Dari Redaksi'),
          p('uv-reveal mt-5 text-justify font-body text-[14px] leading-relaxed text-ink', '{{closing_text}}'),
          p(`uv-reveal uv-d1 mt-4 font-body text-[14px] font-bold italic text-[${o.main}]`, '{{closing_greeting}}'),
          div('uv-reveal-zoom uv-d2 relative mx-auto mt-6 w-28', [img('uv-spin3d w-full', '{{asset.stempel}}', '')]),
          p('uv-reveal uv-d3 mt-4 font-body text-[11px] font-bold uppercase tracking-[0.25em] text-muted', 'Pemimpin Redaksi'),
          p('uv-reveal-pop uv-d3 font-script text-[34px] leading-tight text-primary', '{{couple_names}}'),
          div(`uv-reveal uv-d4 mt-6 ${rule} py-2 font-body text-[10.5px] uppercase tracking-[0.2em] text-muted`, `${o.masthead} · Edisi Spesial Pernikahan · {{event_year}}`),
          div('-mx-5 mt-6 h-7 overflow-hidden', [img('h-7 w-full object-cover object-left', '{{asset.ticker}}', '')]),
        ],
      },
    ],
  }
}
