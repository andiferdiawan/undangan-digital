import { hostDefinition } from './_host'

const F = '/theme-assets/acara-foto'

export const meta = {
  code: 'ACR-002',
  slug: 'acara-kumpul',
  name: 'Kumpul Seru',
  category: 'reuni-gathering',
  description: 'Ceria & playful untuk reuni, gathering, dan arisan: tali foto polaroid yang berayun, teman-teman yang bergoyang, stiker lucu, dan susunan acara dengan garis meliuk yang mengikuti scroll.',
}

export const definition = hostDefinition({
  kind: 'general',
  dir: '/theme-assets/acara-kumpul',
  ink: '#1e2a3a',
  main: '#ff6b4a',
  accent: '#1aa39a',
  pale: '#fff8ec',
  deep: '#1aa39a',
  dark: false,
  playful: true,
  wavy: true,
  eyebrow: 'Save the Date',
  fonts: { font_heading: 'Fredoka', font_body: 'Nunito', font_script: 'Caveat Brush' },
  radius: 'rounded-[20px]',
  texts: { rundown: 'Seru-seruan Kita', host: 'Panitia Acara', gallery: 'Kenangan Kita', rsvp: 'Kamu Datang, Kan?', closing: 'See you there!' },
  demo: {
    gallery: [`${F}/reuni.jpg`, `${F}/kumpul.jpg`, `${F}/sahabat.jpg`],
    host: { name: 'Alumni Angkatan 2006', title: 'Reuni Akbar 20 Tahun', tagline: 'Dua Dekade, Satu Cerita' },
  },
})
