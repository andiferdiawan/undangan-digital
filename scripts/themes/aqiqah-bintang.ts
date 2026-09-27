import { aqiqahDefinition } from './_aqiqah'

const F = '/theme-assets/aqiqah-foto'

export const meta = {
  code: 'AQI-001',
  slug: 'aqiqah-bintang',
  name: 'Bintang Kecil',
  category: 'aqiqah-putra',
  description: 'Aqiqah putra bernuansa biru langit: bayi tertidur di bulan sabit, mainan gantung bintang yang berayun, kambing aqiqah yang lucu, kartu detail kelahiran, dan animasi memantul yang manis.',
}

export const definition = aqiqahDefinition({
  dir: '/theme-assets/aqiqah-bintang',
  ink: '#2c4a7a',
  main: '#8fbde6',
  pale: '#eef5fc',
  gold: '#f2c14e',
  deep: '#2c4a7a',
  eyebrow: 'Tasyakuran Aqiqah',
  welcome: 'Alhamdulillah, dengan penuh rasa syukur telah lahir putra kami',
  demo: {
    child_photo: `${F}/bayi-biru.jpg`,
    gallery: [`${F}/bayi-biru.jpg`, `${F}/bayi-keranjang.jpg`, `${F}/ibu-bayi.jpg`, `${F}/bayi-tidur.jpg`],
  },
})
