import { ultahDefinition } from './_ultah'

const F = '/theme-assets/ultah-foto'

export const meta = {
  code: 'UTH-001',
  slug: 'ultah-balon',
  name: 'Pesta Balon',
  category: 'ulang-tahun-anak',
  description: 'Ulang tahun anak yang ceria bernuansa pastel: balon bergoyang, konfeti berjatuhan, bendera segitiga berayun, kue dengan lilin yang berkedip, dan angka usia besar di lencana bintang.',
}

export const definition = ultahDefinition({
  dir: '/theme-assets/ultah-balon',
  ink: '#5b3a6b',
  main: '#ff8fab',
  pale: '#fff4f8',
  gold: '#ffc94d',
  deep: '#7a4f93',
  elegant: false,
  fonts: { font_heading: 'Fredoka', font_body: 'Quicksand', font_script: 'Caveat Brush' },
  radius: 'rounded-[24px]',
  demo: {
    child_photo: `${F}/bayi-balon.jpg`,
    gallery: [`${F}/bayi-balon.jpg`, `${F}/anak-lilin.jpg`],
    child: { name: 'Zahra Khadijah Putri', nickname: 'Zahra', gender: 'p', order: 'Putri pertama', birth_date: '2025-12-19' },
  },
})
