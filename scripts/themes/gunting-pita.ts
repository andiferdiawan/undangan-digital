import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Gunting Pita — grand opening kantor & bisnis bernuansa krem & marun: logo perusahaan, "GRAND" serif
 * Didone dengan "Opening" tulisan tangan besar (Mea Culpa), strip jam | tanggal | bulan-tahun, pita simpul
 * satin marun melintang di sampul, dan adegan gunting pita (uv-play): gunting bergerak ke tengah,
 * pita terpotong & kedua ujungnya jatuh, lalu tulisan "Resmi Dibuka" muncul.
 */
const A = '/theme-assets/gunting-pita'

// ---------- Gaya ----------
const SATIN = 'bg-[linear-gradient(180deg,#3a0911,#8e2a38_30%,#b24d59_46%,#6e1a26_70%,#3a0911)] shadow-[0_6px_12px_rgba(40,8,14,0.3)]'
const btn = 'inline-flex items-center justify-center gap-2 bg-primary px-8 py-3 font-heading text-[13px] uppercase tracking-[0.22em] text-surface shadow-[0_12px_22px_-14px_rgba(60,10,20,0.9)]'
const btnLine = 'inline-flex items-center justify-center gap-2 border border-primary px-6 py-2.5 font-heading text-[12px] uppercase tracking-[0.2em] text-primary'
const caps = (t: string, cls = '') => p(`font-heading uppercase tracking-[0.18em] ${cls}`, t)
const script = (t: string, cls = '') => p(`font-script leading-none ${cls}`, t)
const txt = (t: string, cls = '', opt?: Parameters<typeof p>[2]) => p(`font-body text-[18px] leading-snug text-ink/85 ${cls}`, t, opt)
const divider = (cls = '') => img(`mx-auto w-[170px] ${cls}`, '{{asset.garis}}', '')
/** Judul bagian: kapital serif + kata tulisan tangan marun di bawahnya */
const title = (top: string, word: string, cls = '') => div(`uv-reveal text-center ${cls}`, [
  caps(top, 'text-[24px] tracking-[0.14em] text-ink'),
  script(word, '-mt-1 text-[52px] text-primary'),
])
/** Logo perusahaan; cadangan: lambang toko */
const logo = (cls: string) => div(`relative mx-auto ${cls}`, [
  img('h-full w-full object-contain', '{{host_logo}}', 'Logo {{host_name}}', { if: 'host_logo' }),
  img('h-full w-full', '{{asset.lambang}}', '', { if: '!host_logo' }),
])
/** Strip jam & hari | tanggal | bulan & tahun */
const dateStrip = (cls = '') => div(`mx-auto grid max-w-[320px] grid-cols-[1fr_auto_1fr] items-center ${cls}`, [
  div('border-r border-primary/60 pr-4 text-right', [
    caps('{{event_time}}', 'text-[11px] tracking-[0.08em] text-ink'),
    txt('{{event_day}}', 'mt-0.5 text-[20px]'),
  ]),
  p('px-5 font-heading text-[54px] leading-none text-primary', '{{event_date_num}}'),
  div('border-l border-primary/60 pl-4 text-left', [
    txt('{{event_month}}', 'text-[20px]'),
    txt('{{event_year}}', 'text-[20px]'),
  ]),
])

export const meta = {
  code: 'OFC-003',
  slug: 'gunting-pita',
  name: 'Gunting Pita',
  category: 'peresmian-korporat',
  description: 'Grand opening kantor & bisnis bernuansa krem & marun: logo perusahaan, "GRAND Opening" serif & tulisan tangan, strip tanggal, pita simpul satin marun, dan adegan gunting pita — pita terpotong, ujungnya jatuh, lalu "Resmi Dibuka" muncul.',
}

export const definition: ThemeDefinition = {
  version: 1,
  kind: 'office',
  globals: {
    primary_color: '#6e1a26',
    secondary_color: '#3a0911',
    accent_color: '#b24d59',
    background_color: '#f4ece2',
    surface_color: '#fbf6ef',
    text_color: '#3e1f22',
    muted_color: '#8a6a66',
    font_heading: 'Playfair Display',
    font_body: 'Cormorant Garamond',
    font_script: 'Mea Culpa',
  },
  root_class: 'text-[18px] leading-relaxed [font-variant-numeric:lining-nums]',
  assets: {
    simpul: `${A}/simpul.svg`,
    gunting: `${A}/gunting.svg`,
    lambang: `${A}/lambang.svg`,
    garis: `${A}/garis.svg`,
  },
  demo: {
    gallery: ['/theme-assets/kantor-foto/gedung.jpg', '/theme-assets/kantor-foto/aula.jpg', '/theme-assets/kantor-foto/panggung.jpg'],
    host: { name: 'Modern Housing', title: 'Grand Opening Showroom Makassar', tagline: 'Dress code: busana formal & batik' },
    event: { name: 'Grand Opening', venue: 'Showroom Modern Housing', address: 'Jl. Contoh No. 123, Kota Anda' },
  },
  sections: [
    // ---------- Sampul: logo, GRAND Opening, strip tanggal, pita simpul ----------
    {
      type: 'cover',
      class: 'relative flex flex-col items-center justify-center overflow-hidden bg-base px-6 pb-10 pt-10 text-center',
      children: [
        logo('uv-reveal h-14 w-14'),
        caps('{{host_name}}', 'uv-reveal relative mt-2 text-[15px] tracking-[0.2em] text-ink'),
        div('uv-reveal uv-d1 relative mt-6', [
          caps('Grand', 'text-[54px] font-normal leading-none tracking-[0.08em] text-ink'),
          script('Opening', '-mt-3 text-[96px] text-primary'),
        ]),
        dateStrip('uv-reveal uv-d2 relative mt-2'),
        caps('{{event_venue}}', 'uv-reveal uv-d3 relative mx-auto mt-5 max-w-[320px] text-[13px] leading-relaxed text-ink'),
        p('uv-reveal uv-d3 relative mx-auto max-w-[320px] font-heading text-[12px] uppercase leading-relaxed tracking-[0.12em] text-muted', '{{event_tagline}}', { if: 'event_tagline' }),
        // pita melintang selebar layar + simpul satin di tengah
        div('uv-reveal-zoom uv-d3 relative -mx-6 mt-4 h-[206px] w-[calc(100%_+_3rem)]', [
          div(`absolute inset-x-0 top-[66px] h-[28px] ${SATIN}`),
          img('absolute left-1/2 top-0 w-[290px] -translate-x-1/2', '{{asset.simpul}}', 'Pita simpul'),
        ]),
        txt('Kepada Yth.', 'uv-reveal relative mt-4 text-[16px] italic text-muted'),
        comp('guest_name', 'uv-reveal relative mt-1 block font-heading text-[19px] uppercase tracking-[0.1em] text-ink', { fallback: 'Tamu Undangan' }),
        div('uv-reveal-pop relative mt-5', [comp('open_button', btn, { label: 'Buka Undangan' })]),
      ],
    },
    // ---------- Adegan gunting pita + sambutan ----------
    {
      type: 'hero',
      class: 'relative overflow-hidden bg-surface px-6 pb-14 pt-12 text-center',
      children: [
        caps('{{greeting}}', 'uv-reveal relative mx-auto max-w-[300px] text-[11px] leading-relaxed text-muted'),
        // --cut 0→1 (paruh pertama): gunting bergerak ke tengah; --fall 0→1 (paruh kedua): pita jatuh, tulisan muncul
        div('uv-play relative -mx-6 mt-6 h-[210px] [--uv-dur:3.4s] [--cut:clamp(0,calc(var(--uv-t)*2),1)] [--fall:clamp(0,calc(var(--uv-t)*2_-_1),1)]', [
          div('absolute inset-0 grid place-content-center [opacity:var(--fall)] [transform:scale(calc(0.85_+_var(--fall)*0.15))]', [
            caps('Resmi', 'text-[22px] tracking-[0.3em] text-ink'),
            script('Dibuka', '-mt-2 text-[80px] text-primary'),
          ]),
          div(`absolute left-0 top-[92px] h-[26px] w-1/2 origin-left ${SATIN} [transform:rotate(calc(var(--fall)*34deg))_translateY(calc(var(--fall)*40px))] [opacity:calc(1_-_var(--fall)*0.9)]`),
          div(`absolute right-0 top-[92px] h-[26px] w-1/2 origin-right ${SATIN} [transform:rotate(calc(var(--fall)*-34deg))_translateY(calc(var(--fall)*40px))] [opacity:calc(1_-_var(--fall)*0.9)]`),
          img('absolute top-[70px] w-[96px] [left:calc(var(--cut)*50%_-_60px)] [opacity:calc(1_-_var(--fall)*1.6)] [transform:rotate(calc(var(--cut)*-6deg))]', '{{asset.gunting}}', 'Gunting'),
        ]),
        p('uv-reveal relative mt-2 font-heading text-[22px] leading-snug text-ink', '{{event_title}}'),
        divider('uv-reveal uv-d1 relative mt-5'),
        txt('{{opening_text}}', 'uv-reveal uv-d2 relative mx-auto mt-5 max-w-[320px]'),
      ],
    },
    // ---------- Tentang penyelenggara ----------
    {
      type: 'profile',
      class: 'relative overflow-hidden bg-base px-6 py-14 text-center',
      children: [
        title('Tentang', 'kami'),
        div('uv-reveal uv-d1 relative mx-auto mt-6 max-w-[330px] border border-primary/30 bg-surface px-6 py-8', [
          div('pointer-events-none absolute inset-[6px] border border-primary/15'),
          logo('relative h-16 w-16'),
          caps('{{host_name}}', 'relative mt-4 text-[17px] leading-snug text-ink'),
          txt('{{event_tagline}}', 'relative mt-2 text-[17px] italic', { if: 'event_tagline' }),
          div('relative mt-6 border-t border-primary/20 pt-5', [
            caps('Narahubung', 'text-[11px] text-muted'),
            p('mt-1 font-heading text-[19px] text-primary', '{{contact_name}}'),
            txt('{{contact_phone}}', 'text-[17px]'),
            div('mt-4', [comp('map_button', btnLine, { href: '{{contact_link}}', label: 'Hubungi via WhatsApp' }, { if: 'contact_link' })]),
          ], { if: 'contact_name' }),
        ]),
      ],
    },
    // ---------- Waktu & tempat ----------
    {
      type: 'event',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        title('Waktu &', 'tempat'),
        div('relative mt-8 grid gap-10', [
          el('article', 'uv-reveal', [
            caps('{{item.name}}', 'text-[18px] tracking-[0.14em] text-primary'),
            div('mx-auto mt-4 h-px w-16 bg-primary/40'),
            txt('{{item.date}}', 'mt-4 text-[20px]'),
            caps('{{item.time}}', 'mt-1 text-[12px] text-muted'),
            caps('{{item.venue}}', 'mt-5 text-[14px] leading-relaxed text-ink'),
            txt('{{item.address}}', 'mx-auto mt-1 max-w-[280px] text-[17px]'),
            div('mt-5', [comp('map_button', btn, { href: '{{item.map_url}}', label: 'Lihat Lokasi' }, { if: 'item.map_url' })]),
          ], { repeat: 'events' }),
        ]),
        div('uv-reveal relative -mx-6 mt-10 h-[110px] w-[calc(100%_+_3rem)]', [
          div(`absolute inset-x-0 top-[42px] h-[20px] ${SATIN}`),
          img('absolute left-1/2 top-0 w-[180px] -translate-x-1/2', '{{asset.simpul}}', ''),
        ]),
      ],
    },
    // ---------- Susunan acara (isi Kisah = rundown) ----------
    {
      type: 'story',
      class: 'relative overflow-hidden bg-base px-6',
      children: [
        div('py-14 text-center', [
          title('Susunan', 'acara'),
          div('relative mx-auto mt-8 max-w-[330px] text-left', [
            div('absolute bottom-2 left-[74px] top-2 w-px bg-primary/40'),
            div('grid gap-6', [
              div('uv-reveal relative grid grid-cols-[64px_1fr] gap-5', [
                p('pt-0.5 text-right font-heading text-[15px] text-primary', '{{item.date}}'),
                div('relative', [
                  div('absolute -left-[15px] top-2 h-2.5 w-2.5 rotate-45 bg-primary'),
                  caps('{{item.title}}', 'text-[13px] leading-snug text-ink'),
                  txt('{{item.text}}', 'mt-1 text-[17px] text-muted'),
                ]),
              ], { repeat: 'story' }),
            ]),
          ]),
        ], { if: 'story' }),
      ],
    },
    // ---------- Hitung mundur ----------
    {
      type: 'countdown',
      class: 'relative overflow-hidden bg-primary px-6 py-14 text-center text-surface',
      children: [
        caps('Menuju', 'uv-reveal text-[20px] tracking-[0.2em] text-surface/90'),
        script('hari peresmian', 'uv-reveal uv-d1 -mt-1 text-[58px] text-surface'),
        div('uv-reveal uv-d2 mx-auto mt-6 max-w-[320px]', [comp('countdown', '', {
          item_class: 'border-r border-surface/30 py-1 text-center [&:last-child]:border-r-0',
          number_class: 'block font-heading text-[38px] leading-none text-surface',
          label_class: 'mt-2 block font-heading text-[10px] uppercase tracking-[0.2em] text-surface/75',
        })]),
        div('uv-reveal mt-8', [comp('calendar_button', '', { label: 'Simpan Tanggal', button_class: 'inline-flex items-center justify-center border border-surface/70 px-6 py-2.5 font-heading text-[12px] uppercase tracking-[0.2em] text-surface' })]),
      ],
    },
    {
      type: 'quote',
      class: 'relative overflow-hidden bg-surface px-7 py-14 text-center',
      children: [
        divider('uv-reveal'),
        p('uv-reveal uv-d1 mt-5 font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}', { if: 'quote_arabic' }),
        txt('“{{quote_text}}”', 'uv-reveal uv-d2 mx-auto mt-3 max-w-[320px] italic'),
        caps('{{quote_source}}', 'uv-reveal uv-d3 mt-4 text-[11px] text-primary'),
      ],
    },
    // ---------- Galeri ----------
    {
      type: 'gallery',
      class: 'relative overflow-hidden bg-base px-5',
      children: [
        div('py-14 text-center', [
          title('Sekilas', 'tentang kami'),
          div('mt-7 grid grid-cols-2 gap-3', [
            el('figure', 'uv-reveal relative aspect-[3/4] overflow-hidden border border-primary/30 bg-surface p-1.5 [&:nth-child(3n+1)]:col-span-2 [&:nth-child(3n+1)]:aspect-[4/3]', [
              img('h-full w-full object-cover', '{{item.url}}', '{{item.caption}}'),
            ], { repeat: 'gallery' }),
          ]),
        ], { if: 'gallery' }),
      ],
    },
    // ---------- Donasi / dukungan (tampil bila diaktifkan) ----------
    {
      type: 'gift',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        title('Dukung', 'kegiatan'),
        p('uv-reveal mt-2 font-heading text-[20px] text-ink', '{{donation_title}}', { if: 'donation_title' }),
        txt('{{donation_text}}', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[320px]', { if: 'donation_text' }),
        div('uv-reveal mx-auto mt-5 inline-flex flex-col border border-primary/30 bg-base px-6 py-3', [
          caps('Target', 'text-[10px] text-muted'),
          p('font-heading text-[22px] text-primary', '{{donation_target}}'),
        ], { if: 'donation_target' }),
        div('uv-reveal mx-auto mt-6 w-full max-w-[240px] border border-primary/30 bg-base p-4', [
          caps('Scan QRIS', 'text-[11px] text-primary'),
          img('mx-auto mt-2 aspect-square w-full object-contain', '{{donation_qris}}', 'QRIS'),
        ], { if: 'donation_qris' }),
        div('mt-6 grid gap-5', [{
          ...div('uv-reveal mx-auto w-full max-w-[320px] border border-primary/30 bg-base px-6 py-6', [
            caps('{{item.bank}}', 'text-[11px] text-muted'),
            p('mt-2 font-heading text-[24px] tracking-[0.06em] text-primary', '{{item.number}}'),
            txt('a.n. {{item.holder}}', 'mt-1 italic'),
            div('mt-4', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: btnLine })]),
          ]),
          repeat: 'gifts',
        }], { if: 'gifts' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative overflow-hidden bg-base px-6 py-14 text-center',
      children: [
        title('Konfirmasi', 'kehadiran'),
        txt('Mohon konfirmasi kehadiran Anda untuk membantu kami menyiapkan sambutan terbaik.', 'uv-reveal uv-d1 mx-auto mt-3 max-w-[300px] italic'),
        div('uv-reveal uv-d2 mt-7 border border-primary/30 bg-surface px-5 py-6 text-left', [comp('rsvp_form', '', {
          input_class: 'w-full border-0 border-b border-primary/40 bg-transparent px-1 py-2 font-body text-[18px] text-ink outline-none focus:border-primary',
          button_class: `mt-2 w-full ${btn} disabled:opacity-60`,
          label_class: 'grid gap-1 font-heading text-[11px] uppercase tracking-[0.16em] text-primary',
        })]),
      ],
    },
    {
      type: 'wishes',
      class: 'relative overflow-hidden bg-surface px-6 py-14 text-center',
      children: [
        title('Ucapan &', 'doa'),
        div('uv-reveal mt-6 text-left', [comp('wishes', '', {
          item_class: 'border-b border-primary/15 py-3',
          name_class: 'font-heading text-[16px] text-primary',
          text_class: 'mt-1 font-body text-[17px] leading-snug text-ink/85',
        })]),
      ],
    },
    // ---------- Penutup ----------
    {
      type: 'closing',
      class: 'relative overflow-hidden bg-base px-6 pb-16 pt-12 text-center',
      children: [
        div('uv-reveal relative -mx-6 h-[150px] w-[calc(100%_+_3rem)]', [
          div(`absolute inset-x-0 top-[58px] h-[24px] ${SATIN}`),
          img('absolute left-1/2 top-0 w-[250px] -translate-x-1/2', '{{asset.simpul}}', ''),
        ]),
        caps('Kami tunggu', 'uv-reveal mt-6 text-[22px] tracking-[0.16em] text-ink'),
        script('kehadiran Anda', 'uv-reveal uv-d1 -mt-1 text-[58px] text-primary'),
        txt('{{closing_text}}', 'uv-reveal uv-d2 mx-auto mt-4 max-w-[320px]'),
        logo('uv-reveal mt-8 h-12 w-12'),
        caps('{{host_name}}', 'uv-reveal mt-2 text-[14px] text-ink'),
        caps('{{closing_greeting}}', 'uv-reveal mx-auto mt-5 max-w-[300px] text-[10px] leading-relaxed text-muted'),
      ],
    },
  ],
}
