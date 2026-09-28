import { ultahDefinition } from './_ultah'

const F = '/theme-assets/ultah-foto'

export const meta = {
  code: 'UTH-002',
  slug: 'ultah-emas',
  name: 'Milad Emas',
  category: 'milad-dewasa',
  description: 'Syukuran milad dewasa yang anggun: navy & emas, angka usia besar berkilau, konfeti emas yang turun perlahan, kue bertingkat dengan lilin menyala, dan kartu bergaya premium.',
}

export const definition = ultahDefinition({
  dir: '/theme-assets/ultah-emas',
  ink: '#1f2a44',
  main: '#e8cf8a',
  pale: '#fbf7ee',
  gold: '#c9a24d',
  deep: '#1f2a44',
  elegant: true,
  fonts: { font_heading: 'Playfair Display', font_body: 'Montserrat', font_script: 'Great Vibes' },
  radius: 'rounded-2xl',
  demo: {
    child_photo: `${F}/milad-kue.jpg`,
    gallery: [`${F}/milad-kue.jpg`, `${F}/milad-lilin.jpg`],
    child: { name: 'Nur Aisyah Rahmawati', nickname: 'Aisyah', gender: 'p', order: '', birth_date: '2001-12-19' },
  },
})
