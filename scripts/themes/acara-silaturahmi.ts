import { hostDefinition } from './_host'

const F = '/theme-assets/acara-foto'

export const meta = {
  code: 'ACR-001',
  slug: 'acara-silaturahmi',
  name: 'Nur Silaturahmi',
  category: 'pengajian-silaturahmi',
  description: 'Islami hijau & emas untuk halal bihalal, pengajian, dan tasyakuran: lentera & ketupat yang berayun, masjid dengan jendela bercahaya, pola bintang delapan, dan susunan acara yang tergambar saat di-scroll.',
}

export const definition = hostDefinition({
  kind: 'general',
  dir: '/theme-assets/acara-silaturahmi',
  ink: '#0f4c3a',
  main: '#c9a24d',
  accent: '#c9a24d',
  pale: '#fbf6ea',
  deep: '#0f4c3a',
  dark: true,
  playful: false,
  wavy: false,
  eyebrow: 'Undangan',
  fonts: { font_heading: 'Marcellus', font_body: 'Plus Jakarta Sans', font_script: 'Great Vibes' },
  radius: 'rounded-2xl',
  texts: { rundown: 'Susunan Acara', host: 'Shahibul Bait', gallery: 'Kebersamaan', rsvp: 'Konfirmasi Kehadiran', closing: 'Jazakumullahu khairan' },
  demo: {
    gallery: [`${F}/masjid.jpg`, `${F}/jamaah.jpg`],
  },
})
