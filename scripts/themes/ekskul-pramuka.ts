import { hostDefinition } from './_host'

const F = '/theme-assets/ekskul-foto'

export const meta = {
  code: 'ACR-003',
  slug: 'ekskul-pramuka',
  name: 'Jelajah Rimba',
  category: 'ekskul-pramuka',
  description: 'Untuk kegiatan Pramuka ekskul SMA, Racana, atau UKM kampus: perkemahan, pelantikan, dan Persami. Hutan hijau & khaki dengan panji regu yang berayun, api unggun menyala, kompas bergoyang, dan jejak setapak yang mengikuti scroll.',
}

export const definition = hostDefinition({
  kind: 'general',
  dir: '/theme-assets/ekskul-pramuka',
  ink: '#3d2a12',
  main: '#c8a96a',
  accent: '#c8a96a',
  pale: '#f6efe0',
  deep: '#1f3b2c',
  dark: true,
  playful: false,
  wavy: true,
  eyebrow: 'Salam Pramuka!',
  fonts: { font_heading: 'Josefin Sans', font_body: 'Nunito', font_script: 'Permanent Marker' },
  radius: 'rounded-xl',
  texts: { rundown: 'Agenda Kegiatan', host: 'Penyelenggara', gallery: 'Jejak Petualangan', rsvp: 'Konfirmasi Kehadiran', closing: 'Satyaku kudarmakan, darmaku kubaktikan!' },
  demo: {
    gallery: [`${F}/tenda-malam.jpg`, `${F}/api-unggun.jpg`, `${F}/tenda-bukit.jpg`],
    host: { name: 'Gugus Depan Pramuka SMA Harapan Bangsa', title: 'Perkemahan Sabtu Minggu & Pelantikan Bantara', tagline: 'Siap Sedia, Tangguh, dan Berkarakter' },
    event: { name: 'Upacara Pembukaan', venue: 'Bumi Perkemahan Rimba Asri', address: 'Jl. Contoh No. 1, Kota Anda' },
    quote: {
      arabic: 'وَتَعَاوَنُوْا عَلَى الْبِرِّ وَالتَّقْوٰىۖ وَلَا تَعَاوَنُوْا عَلَى الْاِثْمِ وَالْعُدْوَانِ',
      text: 'Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa, dan jangan tolong-menolong dalam berbuat dosa dan permusuhan.',
      source: 'QS. Al-Ma\'idah : 2',
    },
    story: [
      { date: 'Hari 1 · 07.00', title: 'Apel & Upacara Pembukaan', text: 'Seluruh peserta berseragam lengkap' },
      { date: '09.00', title: 'Pendirian Tenda', text: 'Lomba kerapian tenda per regu' },
      { date: '13.00', title: 'Materi Kepramukaan', text: 'Tali-temali, semaphore, dan navigasi darat' },
      { date: '19.30', title: 'Api Unggun & Pentas Seni', text: 'Api unggun dan penampilan tiap regu' },
      { date: 'Hari 2 · 06.00', title: 'Jelajah Alam', text: 'Hiking dan pos-pos tantangan' },
      { date: '10.00', title: 'Pelantikan & Penutupan', text: 'Pelantikan Bantara dan pembagian penghargaan' },
    ],
  },
})
