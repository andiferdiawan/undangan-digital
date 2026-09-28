import { koranDefinition } from './_koran'

const L = '/theme-assets/aurelia-luxe'
const R = '/theme-assets/rustic-senja'

export const meta = {
  code: 'MOD-005',
  slug: 'harian-bahagia',
  name: 'Harian Bahagia',
  category: 'modern',
  description: 'Koran vintage hitam-krem dengan tinta merah: masthead klasik, kolom berita dengan huruf awal besar, foto hitam-putih, stempel edisi khusus berputar, ticker berjalan, agenda acara, kronologi, kupon kehadiran, dan iklan baris.',
}

export const definition = koranDefinition({
  dir: '/theme-assets/harian-bahagia',
  genz: false,
  masthead: 'Harian Bahagia',
  ink: '#1b1b1b',
  main: '#a3281f',
  paper: '#f2ead8',
  pale: '#e8dfc9',
  highlight: '#e0b64a',
  fonts: { font_heading: 'Playfair Display', font_body: 'Libre Baskerville', font_script: 'Pinyon Script' },
  demo: {
    cover_photos: [`${R}/slide-1.jpg`, `${L}/slide-1.jpg`, `${R}/slide-3.jpg`],
    gallery: [`${R}/slide-2.jpg`, `${L}/rings.jpg`, `${R}/slide-3.jpg`, `${L}/slide-2.jpg`],
    groom_photo: `${L}/groom.jpg`,
    bride_photo: `${L}/bride.jpg`,
  },
})
