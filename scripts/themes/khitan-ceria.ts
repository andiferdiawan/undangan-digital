import { khitanDefinition } from './_khitan'

const F = '/theme-assets/khitan-foto'

export const meta = {
  code: 'KHT-001',
  slug: 'khitan-ceria',
  name: 'Pangeran Kecil',
  category: 'khitan-ceria',
  description: 'Khitanan ceria bernuansa toska & kuning: anak berpeci yang melambai, lentera berayun, masjid mungil, bingkai foto bergerigi yang berputar, dan animasi memantul yang seru untuk si jagoan.',
}

export const definition = khitanDefinition({
  dir: '/theme-assets/khitan-ceria',
  ink: '#1d6b69',
  main: '#7fd1c7',
  pale: '#eefaf8',
  gold: '#f6c453',
  deep: '#1d6b69',
  arch: false,
  fonts: { font_heading: 'Fredoka', font_body: 'Quicksand', font_script: 'Dancing Script' },
  radius: 'rounded-[26px]',
  demo: {
    child_photo: `${F}/anak-kopiah.jpg`,
    gallery: [`${F}/anak-kopiah.jpg`, `${F}/anak-masjid.jpg`, `${F}/anak-koko.jpg`, `${F}/anak-kabah.jpg`],
  },
})
