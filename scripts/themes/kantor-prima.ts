import { hostDefinition } from './_host'

const F = '/theme-assets/kantor-foto'

export const meta = {
  code: 'OFC-001',
  slug: 'kantor-prima',
  name: 'Korporat Prima',
  category: 'peresmian-korporat',
  description: 'Undangan resmi perusahaan bernuansa navy & emas: pita peresmian yang berayun, gedung dengan jendela berkelip, logo perusahaan dalam bingkai, dan susunan acara dengan garis yang tergambar saat di-scroll.',
}

export const definition = hostDefinition({
  kind: 'office',
  dir: '/theme-assets/kantor-prima',
  ink: '#0f2438',
  main: '#d4af61',
  accent: '#d4af61',
  pale: '#f4f1ea',
  deep: '#0f2438',
  dark: true,
  playful: false,
  wavy: false,
  eyebrow: 'Undangan Resmi',
  fonts: { font_heading: 'Montserrat', font_body: 'Plus Jakarta Sans', font_script: 'Playfair Display' },
  radius: 'rounded-2xl',
  texts: { rundown: 'Susunan Acara', host: 'Tuan Rumah Acara', gallery: 'Sekilas Tentang Kami', rsvp: 'Mohon Konfirmasi', closing: 'Terima kasih' },
  demo: {
    gallery: [`${F}/gedung.jpg`, `${F}/aula.jpg`],
  },
})
