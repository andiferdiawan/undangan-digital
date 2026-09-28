import { khitanDefinition } from './_khitan'

const F = '/theme-assets/khitan-foto'

export const meta = {
  code: 'KHT-002',
  slug: 'khitan-mihrab',
  name: 'Mihrab',
  category: 'khitan-klasik',
  description: 'Walimatul khitan islami klasik: hijau zamrud & emas, bingkai foto lengkung mihrab, lentera yang berayun dan berpendar, siluet masjid, bintang segi delapan, serta animasi yang anggun.',
}

export const definition = khitanDefinition({
  dir: '/theme-assets/khitan-mihrab',
  ink: '#0f4a3a',
  main: '#a8cdb9',
  pale: '#f6f1e4',
  gold: '#c9a14a',
  deep: '#0f4a3a',
  arch: true,
  fonts: { font_heading: 'Marcellus', font_body: 'Nunito', font_script: 'Great Vibes' },
  radius: 'rounded-2xl',
  demo: {
    child_photo: `${F}/anak-kopiah.jpg`,
    gallery: [`${F}/anak-masjid.jpg`, `${F}/anak-kopiah.jpg`, `${F}/anak-kabah.jpg`, `${F}/anak-koko.jpg`],
  },
})
