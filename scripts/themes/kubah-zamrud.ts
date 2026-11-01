import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Kubah Zamrud — elegan islami bernuansa hijau zamrud, gading, dan emas lembut. Sampul foto penuh bergradasi
 * zamrud, pembatas belah ketupat emas, slide foto pasangan dalam bingkai lengkung,
 * kalender sebulan dengan hari H dilingkari, susunan acara berikon belah ketupat, hitung mundur di panel
 * lengkung zamrud, dan siluet garis kota bermasjid di penutup.
 * Warna turunan dari globals (bg-primary, text-accent, …) agar tetap serasi bila warna diganti user.
 */
const A = '/theme-assets/kubah-zamrud'

const caps = (t: string, cls = '') => p(`font-body text-[12px] font-semibold uppercase tracking-[0.35em] ${cls}`, t)
const heading = (t: string, cls = 'text-primary') => el('h2', `font-heading text-[30px] leading-tight ${cls}`, t)
const divider = (cls = '') => img(`mx-auto w-40 ${cls}`, '{{asset.ornamen}}')
/** Panel kisi jali di tepi (kiri asli, kanan dicerminkan). */
const jali = (cls: string) => img(`pointer-events-none absolute select-none ${cls}`, '{{asset.jali}}')
const btnSolid = 'inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.28em] text-surface shadow-[0_14px_26px_-16px_rgba(20,50,40,0.9)]'
const btnLight = 'inline-flex items-center justify-center rounded-full border border-accent bg-surface/10 px-7 py-3 font-body text-[12px] font-semibold uppercase tracking-[0.28em] text-surface backdrop-blur-[2px]'
const photoTone = 'saturate-[.85]'
/** Bingkai lengkung ganda (emas tipis di luar) untuk foto. */
const ARCH_FRAME = 'rounded-t-full border border-accent/70 p-[6px]'

function person(who: 'groom' | 'bride'): ThemeNode {
  return div('uv-reveal relative mt-10', [
    div(`relative mx-auto w-[200px] ${ARCH_FRAME}`, [
      div('relative aspect-[3/4] overflow-hidden rounded-t-full bg-primary', [
        img(`absolute inset-0 h-full w-full object-cover object-top ${photoTone}`, `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
        div('absolute inset-0 grid place-items-center', [el('span', 'font-script text-[50px] text-surface', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
      ]),
    ]),
    caps(who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita', 'mt-6 text-accent'),
    el('h3', 'mt-1 font-heading text-[28px] font-semibold leading-tight text-primary', `{{${who}_name}}`),
    p('mx-auto mt-1 max-w-[280px] font-body text-[16px] leading-snug text-muted', `{{${who}_parents}}`, { if: `${who}_parents` }),
    el('a', 'mt-2 inline-block font-body text-[14px] text-primary underline decoration-accent/60 underline-offset-4', 'Instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ])
}

export const meta = {
  code: 'LUX-010',
  slug: 'kubah-zamrud',
  name: 'Kubah Zamrud',
  category: 'elegan',
  description: 'Elegan islami hijau zamrud, gading, dan emas lembut. Sampul foto penuh, slide foto dalam bingkai lengkung, kalender hari H, susunan acara berikon belah ketupat, dan hitung mundur di panel lengkung.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: '#1f4a3d',
    secondary_color: '#8fa89a',
    accent_color: '#b08d57',
    background_color: '#f4efe6',
    surface_color: '#fbf8f2',
    text_color: '#2b3a33',
    muted_color: '#6c7a71',
    font_heading: 'Cormorant Garamond',
    font_body: 'Cormorant Garamond',
    font_script: 'Great Vibes',
  },
  // lining-nums: angka Cormorant setinggi huruf kapital (bawaannya angka gaya lama)
  root_class: 'text-[17px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    jali: `${A}/jali.svg`,
    siluet: `${A}/siluet.svg`,
    ornamen: `${A}/ornamen.svg`,
    cincin: `${A}/cincin.svg`,
  },
  demo: {
    cover_photos: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-2.jpg'],
    gallery: ['/theme-assets/aurelia-luxe/slide-1.jpg', '/theme-assets/aurelia-luxe/rings.jpg', '/theme-assets/rustic-senja/bride-2.jpg', '/theme-assets/aurelia-luxe/bouquet.jpg', '/theme-assets/rustic-senja/slide-1.jpg', '/theme-assets/aurelia-luxe/slide-3.jpg'],
    groom_photo: '/theme-assets/aurelia-luxe/groom.jpg',
    bride_photo: '/theme-assets/aurelia-luxe/bride.jpg',
  },
  sections: [
    // ---------- Sampul: foto penuh + kisi jali di tepi ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-end overflow-hidden bg-primary text-center',
      children: [
        comp('photo_slider', 'absolute inset-0', { interval: '5000', image_class: photoTone, dots: 'false' }),
        div('absolute inset-0 bg-[linear-gradient(180deg,rgba(18,40,33,0.55)_0%,rgba(18,40,33,0.1)_32%,rgba(18,40,33,0.35)_58%,rgba(14,34,28,0.92)_100%)]'),
        div('absolute inset-x-0 top-12', [
          caps('Undangan Pernikahan', 'uv-reveal text-[11px] tracking-[0.45em] text-surface/90'),
          img('uv-reveal uv-d1 mx-auto mt-3 w-32 brightness-150', '{{asset.ornamen}}'),
        ]),
        div('relative w-full px-10 pb-12', [
          el('h1', 'uv-reveal-zoom uv-d2 font-script text-[58px] leading-[1.05] text-surface [text-shadow:0_2px_18px_rgba(0,0,0,0.35)]', '{{groom_nickname}} & {{bride_nickname}}'),
          caps('{{event_date}}', 'uv-reveal uv-d3 mt-3 text-[12px] tracking-[0.3em] text-surface/90'),
          div('uv-reveal uv-d3 mx-auto mt-6 h-px w-20 bg-accent/80'),
          p('uv-reveal uv-d4 mt-5 font-body text-[15px] italic text-surface/80', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
          comp('guest_name', 'mt-1 block font-heading text-[23px] leading-snug text-surface', { fallback: 'Tamu Undangan' }),
          div('uv-reveal-pop uv-d5 mt-6', [comp('open_button', btnLight, { label: 'Buka Undangan' })]),
        ]),
      ],
    },
    // ---------- Sapaan + slide foto + kalender ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-base px-6 pb-14 pt-12 text-center',
      children: [
        // Foto pasangan (Foto Sampul, lalu galeri) bergeser otomatis dalam bingkai lengkung
        div('uv-reveal-mask relative mx-auto max-w-[320px] rounded-t-[160px] border border-accent/70 p-[6px]', [
          div('relative aspect-[4/5] overflow-hidden rounded-t-[154px] bg-primary', [
            div('absolute inset-0 grid place-items-center px-6', [el('span', 'font-script text-[44px] leading-tight text-surface', '{{couple_names}}')]),
            comp('photo_slider', '', { interval: '4000', image_class: photoTone, dot_class: 'bg-surface' }),
          ]),
        ]),
        divider('uv-reveal mt-8'),
        p('uv-reveal uv-d1 mt-5 font-body text-[14px] font-semibold uppercase tracking-[0.2em] text-muted', '{{greeting}}'),
        heading('Keluarga & Sahabat Terkasih', 'uv-reveal uv-d2 mt-2 text-primary'),
        p('uv-reveal uv-d3 mx-auto mt-4 max-w-[300px] font-body text-[18px] leading-snug text-ink/85', 'Dengan penuh syukur, kami mengundang Anda untuk hadir dan mendoakan di hari istimewa pernikahan kami. Kehadiran Anda adalah kebahagiaan bagi kami.'),
        divider('uv-reveal mt-8'),
        p('uv-reveal mt-6 font-heading text-[34px] leading-none text-primary', '{{event_date_num}} {{event_month}} {{event_year}}'),
        caps('{{event_day}}', 'uv-reveal mt-2 text-accent'),
        div('uv-reveal relative mx-auto mt-6 max-w-[310px] border-y border-accent/40 py-5', [
          comp('month_calendar', '', {
            head_class: 'pb-2 font-body text-[11px] font-semibold uppercase tracking-wider text-muted',
            day_class: 'font-body text-[17px] text-ink/85',
            active_class: 'font-body text-[17px] font-bold text-surface',
            marker: 'circle',
            marker_class: 'bg-primary shadow-[0_0_0_4px_rgba(176,141,87,0.35)]',
          }),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative bg-base px-8 pb-16 pt-4 text-center',
      children: [
        p('uv-reveal font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        p('uv-reveal uv-d1 mx-auto mt-3 max-w-[320px] font-body text-[19px] italic leading-snug text-ink/85', '“{{quote_text}}”'),
        caps('{{quote_source}}', 'uv-reveal uv-d2 mt-3 text-accent'),
      ],
    },
    // ---------- Mempelai (panel zamrud tipis di atas) ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        div('uv-reveal', [caps('Yang Berbahagia', 'text-accent'), heading('Kedua Mempelai', 'mt-2 text-primary')]),
        divider('uv-reveal mt-5'),
        p('uv-reveal uv-d1 mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', '{{opening_text}}'),
        person('groom'),
        p('uv-reveal mt-8 font-script text-[54px] leading-none text-accent', '&'),
        person('bride'),
      ],
    },
    // ---------- Susunan acara: ikon belah ketupat + garis ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-base px-7 py-16 text-center',
      children: [
        div('uv-reveal', [caps('Waktu & Tempat', 'text-accent'), heading('Rangkaian Acara', 'mt-2 text-primary')]),
        divider('uv-reveal mt-5'),
        div('relative mx-auto mt-10 grid max-w-[340px] gap-10 text-left', [
          el('article', 'uv-reveal relative grid grid-cols-[56px_1fr] gap-x-4', [
            div('relative flex flex-col items-center', [
              img('relative z-[1] w-14 bg-base', '{{asset.cincin}}'),
              div('mt-2 w-px flex-1 bg-accent/40'),
            ]),
            div('pb-2', [
              p('font-heading text-[22px] leading-none text-accent', '{{item.time}}'),
              el('h3', 'mt-1.5 font-heading text-[26px] font-semibold leading-tight text-primary', '{{item.name}}'),
              p('font-body text-[16px] italic text-muted', '{{item.date}}'),
              div('mt-4 rounded-2xl border border-accent/35 bg-surface px-4 py-4', [
                caps('{{item.venue}}', 'text-[12px] tracking-[0.2em] text-primary'),
                p('mt-1 font-body text-[16px] leading-snug text-muted', '{{item.address}}'),
                comp('map_button', `mt-4 ${btnSolid} !px-5 !py-2.5 !text-[11px]`, { href: '{{item.map_url}}', label: 'Petunjuk Lokasi' }, { if: 'item.map_url' }),
              ]),
            ]),
          ], { repeat: 'events' }),
        ]),
      ],
    },
    // ---------- Hitung mundur: panel lengkung zamrud ----------
    {
      type: 'countdown',
      class: 'relative bg-base px-4 pb-14 text-center',
      children: [
        div('uv-reveal relative overflow-hidden rounded-b-[28px] rounded-t-[180px] bg-primary px-6 pb-12 pt-16 text-surface shadow-[0_30px_50px_-30px_rgba(20,50,40,0.9)]', [
          div('pointer-events-none absolute inset-[10px] rounded-b-[20px] rounded-t-[170px] border border-accent/50'),
          caps('Menuju Hari Bahagia', 'relative text-[11px] tracking-[0.4em] text-surface/80'),
          p('relative mt-3 font-script text-[46px] leading-tight text-surface', 'Sampai Jumpa'),
          img('relative mx-auto mt-2 w-36 brightness-150', '{{asset.ornamen}}'),
          div('relative mx-auto mt-6 max-w-[300px]', [comp('countdown', '', {
            item_class: 'relative py-1 text-center after:absolute after:-right-1.5 after:top-[4px] after:font-heading after:text-[26px] after:leading-none after:text-surface/40 after:content-[\':\'] [&:last-child]:after:content-none',
            number_class: 'block font-heading text-[38px] leading-none text-surface',
            label_class: 'mt-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-surface/70',
          })]),
          div('relative mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: btnLight })]),
        ]),
      ],
    },
    {
      type: 'story',
      class: 'relative bg-surface px-7',
      children: [
        div('py-16 text-center', [
          div('uv-reveal', [caps('Kisah Kami', 'text-accent'), heading('Perjalanan Cinta', 'mt-2 text-primary')]),
          divider('uv-reveal mt-5'),
          div('relative mt-10 grid gap-10', [
            div('absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-accent/35'),
            div('uv-reveal relative mx-auto max-w-[300px] bg-surface py-2', [
              caps('{{item.date}}', 'text-accent'),
              el('h3', 'mt-1 font-heading text-[24px] font-semibold leading-tight text-primary', '{{item.title}}'),
              p('mt-2 font-body text-[17px] italic leading-snug text-ink/85', '{{item.text}}'),
            ], { repeat: 'story' }),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: digeser satu per satu, foto berbingkai lengkung ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base text-center',
      children: [
        div('relative py-16', [
          div('uv-reveal px-7', [caps('Galeri', 'text-accent'), heading('Momen Bahagia', 'mt-2 text-primary')]),
          divider('uv-reveal mt-5'),
          div('uv-reveal mt-8', [comp('gallery_carousel', '', {
            item_class: 'rounded-t-full border border-accent/70 p-[6px]',
            image_class: `aspect-[3/4] w-full rounded-t-full object-cover ${photoTone}`,
            text_class: 'mt-4 font-body text-[13px] font-semibold uppercase tracking-[0.25em] text-muted',
            button_class: 'grid h-10 w-10 place-items-center rounded-full border border-accent/60 bg-surface text-primary',
            dot_class: 'text-primary',
          })]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Tanda kasih ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-primary px-7 text-center text-surface',
      children: [
        div('relative py-16', [
          jali('-left-[80px] top-6 w-[120px] opacity-25'),
          jali('-right-[80px] top-6 w-[120px] -scale-x-100 opacity-25'),
          caps('Tanda Kasih', 'uv-reveal relative text-surface/75'),
          heading('Hadiah Pernikahan', 'uv-reveal uv-d1 relative mt-2 text-surface'),
          img('uv-reveal relative mx-auto mt-4 w-36 brightness-150', '{{asset.ornamen}}'),
          p('uv-reveal uv-d2 relative mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-surface/85', 'Doa restu Anda adalah hadiah terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('relative mt-8 grid gap-4', [
            div('uv-reveal rounded-[20px] border border-accent/60 bg-white/[0.05] px-5 py-6', [
              caps('{{item.bank}}', 'text-surface/75'),
              p('mt-2 font-heading text-[28px] font-semibold tracking-wider', '{{item.number}}'),
              p('font-body text-[16px] italic text-surface/80', 'a.n. {{item.holder}}'),
              div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: 'rounded-full bg-surface px-5 py-2 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-primary' })]),
            ], { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Konfirmasi kehadiran ----------
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-surface px-7 py-16 text-center',
      children: [
        div('uv-reveal', [caps('Buku Tamu', 'text-accent'), heading('Konfirmasi Kehadiran', 'mt-2 text-primary')]),
        divider('uv-reveal mt-5'),
        p('uv-reveal uv-d1 mx-auto mt-4 max-w-[300px] font-body text-[17px] italic leading-snug text-muted', 'Mohon kabari kami kehadiran Anda agar kami dapat mempersiapkan sambutan terbaik.'),
        div('uv-reveal relative mt-8 rounded-[22px] border border-accent/40 bg-base p-6 text-left', [
          comp('rsvp_form', '', {
            input_class: 'w-full rounded-xl border border-primary/20 bg-surface px-4 py-3 font-body text-[17px] text-ink outline-none focus:border-primary',
            button_class: `w-full ${btnSolid} disabled:opacity-60`,
            label_class: 'grid gap-1.5 font-body text-[13px] font-semibold uppercase tracking-[0.15em] text-muted',
          }),
        ]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-7 pb-16 text-center',
      children: [
        div('uv-reveal', [caps('Ucapan & Doa', 'text-accent'), heading('Doa Restu', 'mt-2 text-primary')]),
        divider('uv-reveal mt-5'),
        div('uv-reveal mt-8', [comp('wishes', '', {
          item_class: 'rounded-[18px] border border-accent/30 bg-base p-4',
          name_class: 'font-heading text-[18px] font-semibold text-primary',
          text_class: 'mt-1 font-body text-[16px] leading-snug text-muted',
        })]),
      ],
    },
    // ---------- Penutup: siluet garis kota bermasjid ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-7 pb-0 pt-16 text-center',
      children: [
        caps('Kami menanti kehadiran Anda', 'uv-reveal text-muted'),
        el('h2', 'uv-reveal-zoom uv-d1 mt-3 font-script text-[54px] leading-tight text-primary', 'Terima Kasih'),
        p('uv-reveal uv-d2 mx-auto mt-3 max-w-[300px] font-body text-[17px] italic leading-snug text-ink/80', '{{closing_text}}'),
        divider('uv-reveal mt-7'),
        p('uv-reveal mt-6 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-muted', '{{closing_greeting}}'),
        p('uv-reveal mt-2 font-script text-[40px] leading-tight text-primary', '{{couple_names}}'),
        img('uv-reveal relative mx-auto mt-10 w-full max-w-[420px] opacity-80', '{{asset.siluet}}'),
        div('-mx-7 h-3 bg-primary'),
      ],
    },
  ],
}
