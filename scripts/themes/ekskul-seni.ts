import { hostDefinition } from './_host'

const F = '/theme-assets/ekskul-foto'

export const meta = {
  code: 'ACR-005',
  slug: 'ekskul-seni',
  name: 'Panggung Karya',
  category: 'ekskul-seni',
  description: 'Untuk ekskul seni, sanggar, dan UKM seni kampus: pentas seni, pameran karya, konser, dan malam apresiasi. Tirai panggung yang berayun, palet cat & kuas yang bergerak, not balok melayang, dan garis kuas meliuk mengikuti scroll.',
}

export const definition = hostDefinition({
  kind: 'general',
  dir: '/theme-assets/ekskul-seni',
  ink: '#2a1638',
  main: '#ef6f5e',
  accent: '#2ec4b6',
  pale: '#fff7ec',
  deep: '#4b1f5e',
  dark: true,
  playful: true,
  wavy: true,
  eyebrow: 'Pentas Seni',
  fonts: { font_heading: 'Fredoka', font_body: 'Nunito', font_script: 'Caveat Brush' },
  radius: 'rounded-[20px]',
  texts: { rundown: 'Susunan Pentas', host: 'Dipersembahkan Oleh', gallery: 'Karya Kami', rsvp: 'Pesan Kursimu', closing: 'Sampai jumpa di panggung!' },
  demo: {
    gallery: [`${F}/panggung.jpg`, `${F}/palet.jpg`, `${F}/gamelan.jpg`],
    host: { name: 'UKM Seni & Budaya Universitas Harapan Bangsa', title: 'Malam Apresiasi Seni 2026', tagline: 'Berkarya, Berbudaya, Bermakna' },
    event: { name: 'Pentas Seni & Pameran Karya', venue: 'Gedung Kesenian Kampus', address: 'Jl. Contoh No. 1, Kota Anda' },
    quote: {
      arabic: 'إِنَّ اللّٰهَ جَمِيْلٌ يُحِبُّ الْجَمَالَ',
      text: 'Sesungguhnya Allah itu indah dan mencintai keindahan.',
      source: 'HR. Muslim',
    },
    story: [
      { date: '18.30', title: 'Open Gate & Pameran Karya', text: 'Lukisan, fotografi, dan kriya anggota' },
      { date: '19.30', title: 'Pembukaan', text: 'Tilawah dan sambutan ketua panitia' },
      { date: '19.45', title: 'Musik Tradisi', text: 'Penampilan gamelan dan angklung' },
      { date: '20.15', title: 'Teater & Musikalisasi Puisi', text: 'Persembahan divisi teater dan sastra' },
      { date: '21.00', title: 'Apresiasi & Penutupan', text: 'Penghargaan karya terbaik' },
    ],
  },
})
