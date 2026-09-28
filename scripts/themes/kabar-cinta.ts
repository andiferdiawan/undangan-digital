import { koranDefinition } from './_koran'

const L = '/theme-assets/aurelia-luxe'
const R = '/theme-assets/rustic-senja'

export const meta = {
  code: 'MOD-004',
  slug: 'kabar-cinta',
  name: 'Kabar Cinta',
  category: 'modern',
  description: 'Gen Z pink bergaya tabloid: masthead "The Love Times", headline breaking news, ticker berita berjalan, stempel eksklusif berputar, foto berisolasi, stabilo kuning, kupon RSVP bergunting, surat pembaca, dan iklan baris untuk amplop digital.',
}

export const definition = koranDefinition({
  dir: '/theme-assets/kabar-cinta',
  genz: true,
  masthead: 'The Love Times',
  ink: '#1f1a1c',
  main: '#ff4f9a',
  paper: '#fff6fa',
  pale: '#ffe1ee',
  highlight: '#ffd84d',
  fonts: { font_heading: 'DM Serif Display', font_body: 'DM Sans', font_script: 'Permanent Marker' },
  demo: {
    cover_photos: [`${L}/slide-1.jpg`, `${L}/slide-2.jpg`, `${R}/slide-2.jpg`],
    gallery: [`${L}/slide-2.jpg`, `${L}/rings.jpg`, `${R}/slide-1.jpg`, `${L}/bouquet.jpg`],
    groom_photo: `${L}/groom.jpg`,
    bride_photo: `${L}/bride.jpg`,
  },
})
