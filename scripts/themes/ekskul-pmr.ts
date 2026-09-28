import { hostDefinition } from './_host'

const F = '/theme-assets/ekskul-foto'

export const meta = {
  code: 'ACR-004',
  slug: 'ekskul-pmr',
  name: 'Relawan Muda',
  category: 'ekskul-pmr',
  description: 'Untuk PMR sekolah dan KSR/UKM kesehatan kampus: diklat, donor darah, pelantikan anggota, dan lomba P3K. Merah-putih bersih dengan detak jantung yang berdenyut, kotak P3K, tetes darah, dan garis waktu mengikuti scroll.',
}

export const definition = hostDefinition({
  kind: 'general',
  dir: '/theme-assets/ekskul-pmr',
  ink: '#2b2d42',
  main: '#d62839',
  accent: '#d62839',
  pale: '#fff4f4',
  deep: '#2b2d42',
  dark: false,
  playful: false,
  wavy: false,
  eyebrow: 'Undangan Kegiatan',
  fonts: { font_heading: 'Poppins', font_body: 'Nunito', font_script: 'Caveat' },
  radius: 'rounded-2xl',
  texts: { rundown: 'Susunan Kegiatan', host: 'Penyelenggara', gallery: 'Aksi Kemanusiaan', rsvp: 'Daftar Hadir', closing: 'Salam kemanusiaan!' },
  demo: {
    gallery: [`${F}/donor-darah.jpg`, `${F}/p3k.jpg`],
    host: { name: 'PMR Wira SMA Harapan Bangsa', title: 'Diklat & Pelantikan Anggota PMR 2026', tagline: 'Siap Menolong, Tulus Melayani' },
    event: { name: 'Pembukaan Diklat', venue: 'Aula SMA Harapan Bangsa', address: 'Jl. Contoh No. 1, Kota Anda' },
    quote: {
      arabic: 'وَمَنْ اَحْيَاهَا فَكَاَنَّمَآ اَحْيَا النَّاسَ جَمِيْعًا',
      text: 'Dan barang siapa memelihara kehidupan seorang manusia, maka seakan-akan dia telah memelihara kehidupan semua manusia.',
      source: 'QS. Al-Ma\'idah : 32',
    },
    story: [
      { date: '07.30', title: 'Registrasi Peserta', text: 'Pembagian kelompok dan perlengkapan' },
      { date: '08.00', title: 'Upacara Pembukaan', text: 'Sambutan pembina dan kepala sekolah' },
      { date: '09.00', title: 'Materi Pertolongan Pertama', text: 'Pembidaian, pembalutan, dan evakuasi' },
      { date: '13.00', title: 'Simulasi Tanggap Darurat', text: 'Praktik per kelompok' },
      { date: '15.30', title: 'Pelantikan Anggota', text: 'Pengucapan janji dan penyematan atribut' },
    ],
  },
})
