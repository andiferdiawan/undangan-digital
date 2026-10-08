/**
 * Deteksi tumpang tindih judul/kata kunci artikel (keyword cannibalization). Dua artikel dianggap bersaing bila
 * kata kunci utamanya sama, atau judulnya memakai kata-kata inti yang hampir sama. Kata umum situs ("undangan"),
 * kata penghubung, dan kata pembuka generik ("cara", "contoh", "tips") diabaikan; sinonim disamakan.
 */

export interface TakenItem {
  title: string
  focus_keyword?: string | null
  slug?: string | null
  status?: string | null
  kind?: 'artikel' | 'topik'
}

const STOP = new Set([
  'dan', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'atau', 'agar', 'supaya', 'serta', 'pada', 'dalam', 'ini', 'itu',
  'jadi', 'bagi', 'oleh', 'saat', 'ketika', 'sebelum', 'setelah', 'tanpa', 'juga', 'akan', 'bisa', 'dapat', 'harus',
  'apa', 'apakah', 'bagaimana', 'kapan', 'mengapa', 'kenapa', 'siapa', 'mana', 'berapa', 'vs', 'versus', 'yuk', 'ala',
  'cara', 'contoh', 'tips', 'trik', 'panduan', 'lengkap', 'terbaru', 'terbaik', 'mudah', 'praktis', 'simpel', 'beserta',
  'hal', 'perlu', 'wajib', 'penting', 'ide', 'inspirasi', 'daftar', 'langkah', 'kamu', 'anda', 'kita', 'menulis', 'membuat',
  'via', 'lewat', 'melalui', 'secara', 'sesuai', 'tentang', 'seputar', 'mengenal', 'memahami',
  'undangan', 'acara', 'the', 'of', 'and', 'a',
])

const CANON: Record<string, string> = {
  pernikahan: 'nikah', menikah: 'nikah', nikahan: 'nikah', perkawinan: 'nikah', kawin: 'nikah', kawinan: 'nikah', wedding: 'nikah', walimah: 'nikah', walimatul: 'nikah', resepsi: 'nikah',
  online: 'digital', virtual: 'digital', website: 'digital', web: 'digital', elektronik: 'digital',
  ultah: 'ulangtahun', birthday: 'ulangtahun',
  khitanan: 'khitan', sunatan: 'khitan', sunat: 'khitan', khitan: 'khitan',
  akikah: 'aqiqah', aqiqahan: 'aqiqah',
  kalimat: 'teks', kata: 'teks', redaksi: 'teks', template: 'teks', format: 'teks',
  syari: 'syari', syar: 'syari', islami: 'islam', islamic: 'islam', muslim: 'islam',
  wa: 'whatsapp', whatsapp: 'whatsapp',
  tamu: 'tamu', undangannya: 'undangan',
}

/** Kata inti (sudah dinormalisasi) dari sebuah judul / frasa kata kunci. */
export function coreTokens(s: string | null | undefined): Set<string> {
  const out = new Set<string>()
  const text = String(s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/ulang\s+tahun/g, 'ulangtahun').replace(/['’`]/g, '')
  for (let w of text.split(/[^a-z0-9]+/)) {
    if (!w || /^\d+$/.test(w)) continue
    if (w.length > 5 && w.endsWith('nya')) w = w.slice(0, -3)
    w = CANON[w] ?? w
    if (w.length < 3 || STOP.has(w)) continue
    out.add(w)
  }
  return out
}

const sameSet = (a: Set<string>, b: Set<string>) => a.size > 0 && a.size === b.size && [...a].every(x => b.has(x))

/**
 * Skor kemiripan 0..1 antar dua judul. Dasarnya Jaccard; bila kata inti judul yang lebih pendek seluruhnya
 * terkandung di judul lain (≥ 3 kata), dianggap 0.9 (sama, hanya ditambah keterangan). Bila masing-masing
 * punya kata pembeda (mis. "Bugis" vs "Jawa"), hanya Jaccard yang dipakai.
 */
export function titleSimilarity(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  const inter = [...a].filter(x => b.has(x)).length
  const jac = inter / (a.size + b.size - inter)
  const subset = inter === Math.min(a.size, b.size)
  return subset && inter >= 3 ? Math.max(jac, 0.9) : jac
}

export interface Overlap { item: TakenItem, score: number, reason: string }

/** Cari artikel/topik yang bersaing dengan kandidat. null = aman (cukup berbeda). */
export function findOverlap(cand: { title: string, focus_keyword?: string | null }, taken: TakenItem[], threshold = 0.7): Overlap | null {
  const ct = coreTokens(cand.title)
  const ck = coreTokens(cand.focus_keyword)
  let best: Overlap | null = null
  for (const item of taken) {
    const ik = coreTokens(item.focus_keyword)
    if (ck.size >= 2 && sameSet(ck, ik)) return { item, score: 1, reason: 'kata kunci utamanya sama' }
    const score = titleSimilarity(ct, coreTokens(item.title))
    // Kata kunci kandidat = judul lain persis (mis. topik "adat pernikahan bugis" vs artikel "Mengenal Adat Pernikahan Bugis")
    const kwInTitle = ck.size >= 2 && sameSet(ck, coreTokens(item.title))
    const s = kwInTitle ? Math.max(score, 0.95) : score
    if (s >= threshold && (!best || s > best.score))
      best = { item, score: s, reason: kwInTitle ? 'kata kuncinya sama dengan judul artikel lain' : 'judulnya terlalu mirip' }
  }
  return best
}

/** Daftar item paling mirip (untuk diberikan ke AI sebagai "jangan ulangi"). */
export function mostSimilar(cand: { title: string, focus_keyword?: string | null }, taken: TakenItem[], n: number) {
  const ct = coreTokens(`${cand.title} ${cand.focus_keyword ?? ''}`)
  return taken
    .map(item => ({ item, score: titleSimilarity(ct, coreTokens(`${item.title} ${item.focus_keyword ?? ''}`)) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(x => x.item)
}

export const describeOverlap = (o: Overlap) =>
  `${o.item.kind === 'topik' ? 'topik antrean' : 'artikel'} "${o.item.title}"${o.item.slug ? ` (/blog/${o.item.slug}${o.item.status === 'draft' ? ', draf' : ''})` : ''} — ${o.reason}`
