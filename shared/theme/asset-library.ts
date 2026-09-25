/**
 * Pustaka ornamen yang boleh dipakai tema hasil AI.
 * AI tidak membuat gambar; ia memilih aset dari sini. Setelah tema disimpan,
 * admin dapat mengganti aset per tema dengan file di bucket theme-assets/{slug}/.
 */
export const ASSET_LIBRARY: { path: string, desc: string }[] = [
  { path: '/theme-assets/sakinah-sage/couple.svg', desc: 'Ilustrasi pasangan muslim faceless (pria peci & koko, wanita berkhimar), rasio 3:4, latar transparan' },
  { path: '/theme-assets/sakinah-sage/groom.svg', desc: 'Ilustrasi mempelai pria muslim faceless, berdiri, tinggi' },
  { path: '/theme-assets/sakinah-sage/bride.svg', desc: 'Ilustrasi mempelai wanita berkhimar faceless, berdiri, tinggi' },
  { path: '/theme-assets/sakinah-sage/lanterns.svg', desc: 'Tiga lampion (fanous) menggantung, terakota & kuning, untuk pojok atas' },
  { path: '/theme-assets/sakinah-sage/crescent.svg', desc: 'Bulan sabit terakota kecil' },
  { path: '/theme-assets/sakinah-sage/skyline.svg', desc: 'Siluet masjid & menara transparan hijau, untuk bagian bawah section (lebar penuh)' },
  { path: '/theme-assets/sakinah-sage/pattern.svg', desc: 'Pola bintang segi delapan tipis, tile 64px, untuk latar (bg)' },
  { path: '/theme-assets/sakinah-sage/corner.svg', desc: 'Ornamen sudut garis geometris terakota' },
  { path: '/theme-assets/sakinah-sage/star.svg', desc: 'Bintang segi delapan (rub el hizb) garis sage, dekorasi besar transparan' },
  { path: '/theme-assets/sakinah-sage/divider.svg', desc: 'Pembatas garis horizontal dengan bintang di tengah' },
  { path: '/theme-assets/floral-blush/floral.svg', desc: 'Rangkaian bunga pink & daun sage untuk pojok' },
  { path: '/theme-assets/floral-blush/petals.svg', desc: 'Pola kelopak bunga pink tipis, tile 120px, untuk latar (bg)' },
  { path: '/theme-assets/minimalis-monokrom/hero.svg', desc: 'Latar gelap gradasi dengan lingkaran tipis, cocok untuk cover foto (bg-cover)' },
  { path: '/theme-assets/minimalis-monokrom/line.svg', desc: 'Pembatas garis tipis abu-abu dengan lingkaran kecil' },
]
