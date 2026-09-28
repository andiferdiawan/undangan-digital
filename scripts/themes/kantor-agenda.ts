import { hostDefinition } from './_host'

const F = '/theme-assets/kantor-foto'

export const meta = {
  code: 'OFC-002',
  slug: 'kantor-agenda',
  name: 'Agenda Pro',
  category: 'seminar-rapat',
  description: 'Modern & bersih untuk seminar, workshop, dan rapat kerja: kartu ID peserta yang berayun, layar presentasi dengan grafik yang tumbuh, dan rundown bergaris waktu yang tergambar mengikuti scroll.',
}

export const definition = hostDefinition({
  kind: 'office',
  dir: '/theme-assets/kantor-agenda',
  ink: '#0e1a3a',
  main: '#2446d8',
  accent: '#1aa6c9',
  pale: '#f3f6ff',
  deep: '#132a8a',
  dark: false,
  playful: false,
  wavy: false,
  eyebrow: 'You Are Invited',
  fonts: { font_heading: 'Outfit', font_body: 'Inter', font_script: 'Outfit' },
  radius: 'rounded-2xl',
  texts: { rundown: 'Rundown Acara', host: 'Diselenggarakan Oleh', gallery: 'Suasana Acara', rsvp: 'Daftar Hadir', closing: 'Sampai jumpa di lokasi!' },
  demo: {
    gallery: [`${F}/panggung.jpg`, `${F}/aula.jpg`],
    host: { name: 'Forum Bisnis Syariah Nusantara', title: 'Seminar Nasional Ekonomi Syariah 2026', tagline: 'Membangun Usaha Berkah di Era Digital' },
  },
})
