import { aqiqahDefinition } from './_aqiqah'

const F = '/theme-assets/aqiqah-foto'

export const meta = {
  code: 'AQI-002',
  slug: 'aqiqah-bunga',
  name: 'Bunga Mungil',
  category: 'aqiqah-putri',
  description: 'Aqiqah putri bernuansa pink lembut: bayi tertidur di atas awan berhias bunga, mainan gantung hati & bunga yang berayun, balon melayang, kambing aqiqah yang lucu, dan kartu detail kelahiran.',
}

export const definition = aqiqahDefinition({
  dir: '/theme-assets/aqiqah-bunga',
  ink: '#8e4460',
  main: '#f4a6b8',
  pale: '#fff1f4',
  gold: '#f5cf7a',
  deep: '#b8607d',
  eyebrow: 'Tasyakuran Aqiqah',
  welcome: 'Alhamdulillah, dengan penuh rasa syukur telah lahir putri kami',
  demo: {
    child_photo: `${F}/bayi-ungu.jpg`,
    child: { name: 'Aisyah Zahra Humaira', nickname: 'Zahra', gender: 'p', order: 'Putri pertama' },
    gallery: [`${F}/bayi-ungu.jpg`, `${F}/ibu-bayi.jpg`, `${F}/bayi-tidur.jpg`, `${F}/bayi-keranjang.jpg`],
  },
})
