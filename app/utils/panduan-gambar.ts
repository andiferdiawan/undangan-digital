// Dibuat otomatis oleh scripts/panduan/screenshots.ts — jangan diubah manual.
/** Ukuran screenshot panduan reseller (public/panduan/reseller/<nama>.webp). */
export const PANDUAN_GAMBAR = {
  'aktivasi-token': { w: 716, h: 680 },
  'analitik-buat-link': { w: 716, h: 1146 },
  'analitik-penjualan': { w: 716, h: 714 },
  'analitik-per-link': { w: 780, h: 1364 },
  'analitik-ringkasan': { w: 780, h: 1514 },
  'analitik-sumber': { w: 716, h: 744 },
  'buat-link-bayar': { w: 716, h: 1340 },
  'checkout': { w: 780, h: 1388 },
  'daftar-reseller': { w: 716, h: 1796 },
  'dashboard-ringkasan': { w: 780, h: 1224 },
  'editor-undangan': { w: 780, h: 1560 },
  'katalog': { w: 780, h: 1560 },
  'kirim-tamu': { w: 780, h: 1560 },
  'link-referral': { w: 716, h: 384 },
  'pencairan': { w: 716, h: 856 },
  'pesanan-lunas': { w: 780, h: 1560 },
  'pesanan-pelanggan': { w: 716, h: 1472 },
  'rekening': { w: 716, h: 1008 },
  'tema-detail': { w: 780, h: 1560 },
} as const
export type PanduanGambar = keyof typeof PANDUAN_GAMBAR
