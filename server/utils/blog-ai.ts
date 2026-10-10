import type { H3Event } from 'h3'
import { extractJson } from './openrouter'
import { type AiConfig, type AiProvider, aiText } from './ai'
import { describeOverlap, findOverlap, mostSimilar, type TakenItem } from './blog-overlap'
import { brokenMap, checkExternalUrls, externalUrls, repairLinks } from './blog-links'
import { MD_LINK, internalKey, isOwnHost, mdUrl, ownLinkPath } from '../../shared/blog-links'

/**
 * Generator artikel blog SEO (teks saja, tanpa gambar) untuk mendongkrak trafik organik situs undangan.
 * Model menulis Markdown; server lalu membersihkan & memvalidasi: internal link hanya ke URL yang benar-benar
 * ada di situs (domain apa pun yang mirip merek diubah ke path relatif), eksternal link hanya https ke situs lain
 * dan benar-benar bisa dibuka (dicek sebelum disimpan), panjang meta sesuai batas, slug rapi.
 */

export type Intent = 'informasional' | 'komersial' | 'transaksional' | 'navigasional'
export interface BlogLink { url: string, title: string }
export interface BlogContext {
  categories: { slug: string, name: string }[]
  posts: { slug: string, title: string, category_slug: string | null, focus_keyword: string, tags: string[] }[]
  /** Semua artikel yang belum diarsip (draf & tayang) untuk cek kanibalisasi judul/kata kunci. */
  taken?: { slug: string, title: string, focus_keyword: string, status: string }[]
}

/** Artikel yang sudah ada (draf & tayang) sebagai pembanding anti-kanibalisasi. */
const takenPosts = (ctx: BlogContext): TakenItem[] =>
  (ctx.taken ?? ctx.posts).map(p => ({ title: p.title, focus_keyword: p.focus_keyword, slug: p.slug, status: (p as { status?: string }).status ?? 'published', kind: 'artikel' as const }))

/** Topik ditolak karena bersaing dengan artikel yang sudah ada (keyword cannibalization). */
export class BlogOverlapError extends Error {}
export interface ArticleBrief {
  topic: string
  focus_keyword?: string
  category_slug?: string | null
  intent?: Intent
}
export interface GeneratedArticle {
  title: string
  slug: string
  meta_title: string
  meta_description: string
  excerpt: string
  body: string
  category_slug: string | null
  tags: string[]
  focus_keyword: string
  search_intent: Intent
  faq: { q: string, a: string }[]
  sources: { title: string, url: string }[]
  ai_model: string
  stats: { words: number, internalLinks: number, externalLinks: number }
}

const INTENTS: Intent[] = ['informasional', 'komersial', 'transaksional', 'navigasional']

/** Halaman situs yang boleh ditautkan (selain artikel blog): beranda, harga, katalog per jenis acara & sub-kategori. */
export async function siteLinks(event: H3Event): Promise<BlogLink[]> {
  const db = publicDb(event)
  const [{ data: groups }, { data: cats }] = await Promise.all([
    db.from('event_groups').select('slug, name').eq('is_active', true).order('sort'),
    db.from('categories').select('slug, name, group_slug').order('sort'),
  ])
  const gName = new Map(((groups ?? []) as { slug: string, name: string }[]).map(g => [g.slug, g.name]))
  return [
    { url: '/', title: 'Beranda Undangan Virtual (buat undangan digital)' },
    { url: '/katalog', title: 'Katalog semua tema undangan digital' },
    { url: '/#harga', title: 'Harga paket undangan digital' },
    ...[...gName].map(([slug, name]) => ({ url: `/katalog/${slug}`, title: `Katalog tema undangan ${name}` })),
    ...((cats ?? []) as { slug: string, name: string, group_slug: string | null }[])
      .filter(c => c.group_slug && gName.has(c.group_slug))
      .slice(0, 30)
      .map(c => ({ url: `/katalog/${c.group_slug}/${c.slug}`, title: `Tema undangan ${c.name} (${gName.get(c.group_slug!)})` })),
  ]
}

function systemPrompt(siteName: string, siteHost: string) {
  return `Anda adalah penulis konten SEO senior berbahasa Indonesia untuk ${siteName} (${siteHost}), layanan pembuatan undangan digital (pernikahan, aqiqah, khitanan, ulang tahun, acara kantor & umum).
Tulis artikel blog orisinal, akurat, dan benar-benar membantu pembaca (prinsip E-E-A-T & helpful content Google), sekaligus mengarahkan pembaca secara halus untuk membuat undangan digital di situs kami.

# Aturan konten
- Bahasa Indonesia baku yang hangat dan mudah dibaca; paragraf pendek (2–4 kalimat); hindari klaim berlebihan dan hal yang tidak pasti.
- Panjang body 1.200–1.800 kata. Jangan menulis H1 (judul sudah menjadi H1). Mulai dengan paragraf pembuka yang langsung menjawab inti pertanyaan dan memuat kata kunci utama dalam 100 kata pertama.
- Struktur: 5–8 subjudul "## " (H2) yang memuat variasi kata kunci, boleh "### " (H3) di dalamnya; gunakan daftar berbutir/bernomor dan contoh kalimat/teks undangan bila relevan; akhiri dengan "## Kesimpulan".
- Format Markdown sederhana saja: ##, ###, paragraf, "- " daftar, "1. " daftar bernomor, **tebal**, *miring*, [teks](url), dan "> " kutipan untuk contoh teks. DILARANG: gambar, tabel, HTML, emoji berlebihan.
- Internal link: sisipkan 3–6 tautan kontekstual dengan anchor text deskriptif (bukan "klik di sini"), HANYA ke URL dari daftar "URL internal yang boleh ditautkan". Tulis PERSIS sebagai path relatif yang diawali "/" (contoh: [contoh teks](/blog/slug-artikel)). JANGAN PERNAH menulis nama domain untuk tautan internal — bukan https://${siteHost}/..., apalagi domain lain seperti undanganvirtual.id/.co.id/.net (domain itu bukan milik kami). Utamakan artikel terkait, dan minimal satu tautan ke halaman katalog/harga yang relevan sebagai ajakan bertindak.
- Eksternal link: 2–4 tautan https ke sumber tepercaya yang PASTI ada (situs pemerintah .go.id, Kemenag https://kemenag.go.id, KBBI https://kbbi.kemendikdasmen.go.id/entri/<kata> — domain lama kbbi.kemdikbud.go.id sudah tidak aktif —, Wikipedia bahasa Indonesia, lembaga resmi). Jangan mengarang alamat halaman (judul artikel Wikipedia harus benar-benar ada): bila tidak yakin halaman spesifiknya ada, pakai halaman utama situs tersebut. Semua tautan diperiksa otomatis; yang tidak bisa dibuka akan dihapus. Cantumkan juga di "sources" — "sources" hanya berisi situs eksternal, bukan halaman ${siteName}.
- Setiap tautan WAJIB berformat [teks](url). Jangan menulis URL atau path polos di kalimat, dan jangan memakai penanda kutipan seperti 【…】 atau [1].
- Jangan mencantumkan FAQ di body; FAQ diisi terpisah (4–6 pertanyaan yang sering dicari orang, jawaban 2–4 kalimat).

# Metadata SEO
- title: judul menarik 45–70 karakter yang memuat kata kunci utama (boleh tahun hanya bila relevan).
- meta_title: ≤ 60 karakter, kata kunci di depan.
- meta_description: 140–160 karakter, memuat kata kunci dan ajakan membaca.
- slug: huruf kecil-tanda hubung, 3–6 kata, memuat kata kunci, tanpa kata sambung.
- excerpt: ringkasan 1–2 kalimat (≤ 250 karakter).
- tags: 3–6 tag pendek huruf kecil.

# Format jawaban
Balas HANYA satu objek JSON valid (tanpa markdown pembungkus), dengan kunci:
{"title","slug","meta_title","meta_description","excerpt","focus_keyword","search_intent","category_slug","tags":[...],"body":"markdown","faq":[{"q","a"}],"sources":[{"title","url"}]}`
}

function userPrompt(brief: ArticleBrief, ctx: BlogContext, links: BlogLink[]) {
  const similar = mostSimilar({ title: brief.topic, focus_keyword: brief.focus_keyword }, takenPosts(ctx), 25)
  const avoid = similar.length
    ? `\n\nArtikel yang SUDAH ADA dan paling dekat dengan topik ini (judul — kata kunci). Judul, slug, dan kata kunci utama Anda WAJIB berbeda dan tidak boleh bersaing dengan artikel-artikel ini (hindari kanibalisasi kata kunci). Ambil sudut/kebutuhan pembaca yang berbeda, dan tautkan ke artikel terkait bila relevan:\n${similar.map(p => `- ${p.title} — ${p.focus_keyword || '-'}${p.slug ? ` (/blog/${p.slug})` : ''}`).join('\n')}`
    : ''
  const posts = ctx.posts.slice(0, 80).map(p => `- /blog/${p.slug} — ${p.title}`).join('\n') || '- (belum ada artikel lain)'
  const pages = links.map(l => `- ${l.url} — ${l.title}`).join('\n')
  const cats = ctx.categories.map(c => `${c.slug} (${c.name})`).join(', ')
  return `Topik artikel: ${brief.topic}
Kata kunci utama: ${brief.focus_keyword || '(tentukan sendiri dari topik, 2–5 kata yang paling sering dicari)'}
Search intent: ${brief.intent ?? 'informasional'}
Kategori: ${brief.category_slug || '(pilih yang paling sesuai)'} — pilihan: ${cats}

URL internal yang boleh ditautkan:
${posts}
${pages}${avoid}`
}

/** Slug rapi sesuai batasan database. */
export function slugifyBlog(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 84).replace(/-+$/, '')
}

const clip = (s: unknown, n: number) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`
}

/**
 * Bersihkan body: H1 → H2, buang gambar/HTML, internal link yang tidak dikenal dijadikan teks biasa,
 * eksternal link hanya https ke domain lain. Tautan absolut ke situs sendiri atau domain tiruan merek
 * (mis. https://undanganvirtual.id/blog/x) diperlakukan sebagai internal: diubah ke path relatif yang valid.
 * Mengembalikan jumlah link untuk statistik.
 */
export function sanitizeBody(md: string, allowed: Set<string>, siteHost: string) {
  let internal = 0
  const external: { title: string, url: string }[] = []
  let body = String(md ?? '').replace(/\r\n?/g, '\n')
    .replace(/^#\s+/gm, '## ')
    .replace(/^#{4,6}\s+/gm, '### ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\(['"])/g, '$1') // sisa escape JSON dari model, mis. Assalamu\'alaikum
    .replace(/[ \t]*【[^】\n]*】/g, '') // penanda kutipan gaya chatbot, mis. 【https://…】
  // URL polos di teks → tautan Markdown, agar ikut divalidasi (domain sendiri → internal, eksternal → diperiksa).
  // Tautan Markdown yang sudah ada disisihkan dulu supaya URL di dalamnya tidak ikut diubah.
  const kept: string[] = []
  body = body.replace(MD_LINK, m => `\uE010${kept.push(m) - 1}\uE011`)
    .replace(/(^|[\s:])(https?:\/\/[^\s<>[\]"'\uE010\uE011]+)/gm, (m, pre: string, raw: string) => {
      const url = raw.replace(/[.,;:!?)]+$/, '')
      try {
        const host = new URL(url).hostname.replace(/^www\./, '')
        return `${pre}[${isOwnHost(host, siteHost) ? siteHost : host}](${url})${raw.slice(url.length)}`
      }
      catch { return m }
    })
    .replace(/\uE010(\d+)\uE011/g, (_, i: string) => kept[Number(i)] ?? '')
  body = body.replace(MD_LINK, (_, label: string, rawUrl: string) => {
    const url = rawUrl.trim()
    const own = ownLinkPath(url, siteHost)
    if (own !== null || url.startsWith('/')) {
      const key = internalKey(own ?? url)
      if (!allowed.has(key)) return label
      internal++
      return `[${label}](${key})`
    }
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:' || isOwnHost(u.hostname, siteHost)) return label
      const href = mdUrl(u.toString())
      external.push({ title: label, url: href })
      return `[${label}](${href})`
    }
    catch { return label }
  })
  return { body: body.replace(/\n{3,}/g, '\n\n').trim(), internal, external }
}

/** Artikel terkait untuk "Baca juga" bila model terlalu sedikit memberi internal link. */
function related(ctx: BlogContext, cat: string | null, tags: string[], exclude: string) {
  const t = new Set(tags)
  return ctx.posts
    .filter(p => p.slug !== exclude)
    .map(p => ({ p, score: (p.category_slug === cat ? 2 : 0) + p.tags.filter(x => t.has(x)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.p)
}

/** Tulis satu artikel SEO lengkap lewat penyedia AI terpilih. */
export async function generateArticle(o: {
  event: H3Event
  cfg: AiConfig
  provider: AiProvider
  model?: string
  brief: ArticleBrief
  ctx: BlogContext
  timeoutMs: number
}): Promise<GeneratedArticle> {
  const config = useRuntimeConfig(o.event)
  const origin = siteOrigin(o.event)
  const siteHost = new URL(origin).hostname.replace(/^www\./, '')
  const links = await siteLinks(o.event)
  const allowed = new Set<string>([...o.ctx.posts.map(p => `/blog/${p.slug}`), ...links.map(l => l.url), '/blog'])
  const startedAt = Date.now()

  // Anti kanibalisasi: tolak topik yang bersaing dengan artikel yang sudah ada sebelum memanggil AI
  const taken = takenPosts(o.ctx)
  const pre = findOverlap({ title: o.brief.topic, focus_keyword: o.brief.focus_keyword }, taken)
  if (pre) throw new BlogOverlapError(`Topik tumpang tindih dengan ${describeOverlap(pre)}. Pilih sudut lain atau perbarui artikel tersebut.`)

  const res = await aiText({
    cfg: o.cfg, provider: o.provider, model: o.model, json: true, temperature: 0.7,
    system: systemPrompt(String(config.public.siteName || 'Undangan Virtual'), siteHost),
    turns: [{ role: 'user', content: userPrompt(o.brief, o.ctx, links) }],
    // Sisakan waktu untuk putaran perbaikan judul bila ternyata mirip artikel lain & pemeriksaan tautan eksternal
    siteUrl: origin, timeoutMs: Math.max(30_000, o.timeoutMs - 35_000),
  })
  if (res.finish === 'length') throw new Error('Artikel terpotong (batas token model). Coba lagi atau pilih model lain.')
  let raw: any
  try { raw = extractJson(res.text) }
  catch { throw new Error('Jawaban AI bukan JSON yang valid. Coba lagi.') }

  let title = clip(raw.title || o.brief.topic, 120)
  if (title.length < 10) throw new Error('Judul artikel dari AI terlalu pendek.')
  let focus = clip(raw.focus_keyword || o.brief.focus_keyword || o.brief.topic, 80)

  // Judul/kata kunci hasil AI ternyata bersaing dengan artikel lain → minta judul & kata kunci baru (sekali)
  let clash = findOverlap({ title, focus_keyword: focus }, taken)
  if (clash) {
    const left = o.timeoutMs - (Date.now() - startedAt)
    if (left < 12_000) throw new BlogOverlapError(`Judul hasil AI tumpang tindih dengan ${describeOverlap(clash)}.`)
    const fix = await aiText({
      cfg: o.cfg, provider: o.provider, model: o.model, json: true, temperature: 0.8,
      system: 'Anda editor SEO. Buat judul & kata kunci utama baru yang tetap sesuai isi artikel, tetapi jelas berbeda dari artikel lain agar tidak terjadi kanibalisasi kata kunci. Balas HANYA JSON {"title","meta_title","slug","focus_keyword"}.',
      turns: [{
        role: 'user',
        content: `Topik artikel: ${o.brief.topic}
Judul saat ini: ${title}
Kata kunci saat ini: ${focus}
Bertabrakan dengan artikel: "${clash.item.title}" (kata kunci: ${clash.item.focus_keyword || '-'})
Artikel lain yang juga sudah ada (jangan mirip):
${mostSimilar({ title, focus_keyword: focus }, taken, 15).map(p => `- ${p.title} — ${p.focus_keyword || '-'}`).join('\n')}
Ringkasan isi artikel: ${clip(raw.excerpt || raw.meta_description || '', 300)}`,
      }],
      siteUrl: origin, timeoutMs: Math.max(8_000, left - 10_000),
    })
    let fixed: any = null
    try { fixed = extractJson(fix.text) }
    catch { /* ditangani di bawah */ }
    const t2 = clip(fixed?.title, 120)
    const k2 = clip(fixed?.focus_keyword, 80)
    clash = t2.length >= 10 ? findOverlap({ title: t2, focus_keyword: k2 || focus }, taken) : clash
    if (clash || t2.length < 10) throw new BlogOverlapError(`Judul hasil AI tumpang tindih dengan ${describeOverlap(clash!)}. Topik ini sebaiknya diganti sudutnya.`)
    title = t2
    focus = k2 || focus
    raw.meta_title = fixed?.meta_title || t2
    raw.slug = fixed?.slug || t2
  }
  const category = o.ctx.categories.some(c => c.slug === raw.category_slug) ? String(raw.category_slug)
    : o.brief.category_slug && o.ctx.categories.some(c => c.slug === o.brief.category_slug) ? o.brief.category_slug : null
  const tags = [...new Set(((Array.isArray(raw.tags) ? raw.tags : []) as unknown[])
    .map(t => clip(t, 40).toLowerCase()).filter(Boolean))].slice(0, 6)
  const slug = slugifyBlog(String(raw.slug || title)) || slugifyBlog(title)
  if (slug.length < 3) throw new Error('Slug artikel tidak valid.')

  const clean = sanitizeBody(String(raw.body ?? ''), allowed, siteHost)
  let body = clean.body
  let internal = clean.internal
  // Pastikan selalu ada internal link antarartikel (topical cluster)
  if (internal < 2) {
    const rel = related(o.ctx, category, tags, slug)
    if (rel.length) {
      body += `\n\n**Baca juga:**\n${rel.map(p => `- [${p.title}](/blog/${p.slug})`).join('\n')}`
      internal += rel.length
    }
  }
  const words = body.split(/\s+/).filter(Boolean).length
  if (words < 500) throw new Error(`Artikel terlalu pendek (${words} kata). Coba lagi.`)

  const srcIn = (Array.isArray(raw.sources) ? raw.sources : []) as { title?: string, url?: string }[]
  let sources: { title: string, url: string }[] = []
  for (const s of [...srcIn.map(s => ({ title: String(s?.title ?? ''), url: String(s?.url ?? '') })), ...clean.external]) {
    try {
      const u = new URL(s.url)
      if (u.protocol !== 'https:' || isOwnHost(u.hostname, siteHost)) continue
      const href = mdUrl(u.toString())
      if (sources.some(x => x.url === href)) continue
      sources.push({ title: clip(s.title || u.hostname, 120), url: href })
    }
    catch { /* abaikan URL rusak */ }
  }
  sources = sources.slice(0, 10)

  // Pastikan setiap tautan eksternal benar-benar bisa dibuka: yang rusak/tidak merespons dilepas (teks tetap)
  // dan dihapus dari sumber. Tetap diberi waktu minimal walau AI memakai hampir seluruh jatah waktunya.
  const checks = await checkExternalUrls(externalUrls(body, sources, siteHost), {
    deadline: Math.max(startedAt + o.timeoutMs - 2_000, Date.now() + 10_000),
  })
  const fixed = repairLinks({ body, sources, isValid: k => allowed.has(k), siteHost, broken: brokenMap(checks, { includeUnchecked: true }) })
  body = fixed.body
  sources = fixed.sources
  const dropped = fixed.changes.filter(c => c.kind === 'external').length
  const removed = [...new Set(fixed.changes.filter(c => !c.to).map(c => `${c.from} (${c.reason})`))]
  if (removed.length) console.info('[blog] tautan eksternal dilepas:', removed.join('; '))

  const faq = ((Array.isArray(raw.faq) ? raw.faq : []) as { q?: string, a?: string, question?: string, answer?: string }[])
    .map(f => ({ q: clip(f.q ?? f.question, 200), a: clip(f.a ?? f.answer, 700) }))
    .filter(f => f.q.length > 5 && f.a.length > 10)
    .slice(0, 8)

  const intent = INTENTS.includes(raw.search_intent) ? raw.search_intent as Intent : (o.brief.intent ?? 'informasional')
  return {
    title,
    slug,
    meta_title: clip(raw.meta_title || title, 70),
    meta_description: clip(raw.meta_description || raw.excerpt || title, 170),
    excerpt: clip(raw.excerpt || raw.meta_description || '', 400),
    body: body.slice(0, 60_000),
    category_slug: category,
    tags,
    focus_keyword: focus,
    search_intent: intent,
    faq,
    sources,
    ai_model: res.model,
    stats: { words, internalLinks: internal, externalLinks: clean.external.length - dropped },
  }
}

/** Porsi maksud pencarian (search intent) default untuk usulan topik, dalam persen. */
export const DEFAULT_INTENT_MIX: Record<Intent, number> = { informasional: 50, transaksional: 20, navigasional: 10, komersial: 20 }

const INTENT_GUIDE: Record<Intent, string> = {
  informasional: 'pembaca ingin tahu/belajar: contoh kalimat & teks undangan, etika, tata cara, adat & tradisi, tips persiapan acara',
  transaksional: 'pembaca siap bertindak/membeli: cara membuat/memesan undangan digital, langkah membuat undangan online dari HP, pesan undangan aqiqah/khitanan/nikah digital',
  navigasional: 'pembaca mencari situs/halaman/fitur tertentu dari merek Undangan Virtual: katalog tema, fitur RSVP & buku tamu, amplop digital, dashboard, program reseller, cara memakai fiturnya',
  komersial: 'pembaca membandingkan sebelum membeli: undangan cetak vs digital, rekomendasi tema, fitur yang wajib ada, kelebihan & kekurangan, memilih layanan undangan digital',
}

/** Bagi jumlah topik ke tiap intent sesuai porsi (metode sisa terbesar; total selalu = count). */
export function intentQuota(count: number, mix: Record<Intent, number> = DEFAULT_INTENT_MIX): Record<Intent, number> {
  const total = INTENTS.reduce((n, i) => n + Math.max(0, mix[i] ?? 0), 0) || 100
  const exact = INTENTS.map(i => ({ i, v: (Math.max(0, mix[i] ?? 0) / total) * count }))
  const quota = Object.fromEntries(exact.map(e => [e.i, Math.floor(e.v)])) as Record<Intent, number>
  let left = count - INTENTS.reduce((n, i) => n + quota[i], 0)
  for (const e of [...exact].sort((a, b) => (b.v % 1) - (a.v % 1))) {
    if (left <= 0) break
    if (e.v > 0) { quota[e.i]++; left-- }
  }
  return quota
}

type SuggestedTopic = { topic: string, focus_keyword: string, category_slug: string | null, intent: Intent }

/**
 * Usulan topik baru (untuk antrean artikel harian) yang belum pernah ditulis, dengan porsi intent yang ditentukan
 * (default 50% informasional, 20% transaksional, 10% navigasional, 20% komersial). Model diminta mengelompokkan
 * per intent; server mengambil tepat sesuai kuota, meminta tambahan sekali bila ada kelompok yang kurang, lalu
 * menyelang-nyeling urutannya agar artikel harian bergantian intent.
 */
export async function suggestTopics(o: {
  event: H3Event
  cfg: AiConfig
  provider: AiProvider
  model?: string
  ctx: BlogContext
  existing: string[]
  count: number
  mix?: Record<Intent, number>
  /** Artikel yang sudah ada (draf & tayang) dengan kata kuncinya; default dari ctx.taken. */
  taken?: TakenItem[]
  timeoutMs: number
}): Promise<SuggestedTopic[]> {
  const deadline = Date.now() + o.timeoutMs
  const quota = intentQuota(o.count, o.mix)
  // Pembanding anti-kanibalisasi: artikel (judul + kata kunci) dan semua topik yang pernah dibuat
  const compare: TakenItem[] = [
    ...(o.taken ?? takenPosts(o.ctx)),
    ...o.existing.map(t => ({ title: t, kind: 'topik' as const })),
  ]
  const usedKeywords = [...new Set(compare.map(c => c.focus_keyword).filter(Boolean))] as string[]
  const picked: Record<Intent, SuggestedTopic[]> = { informasional: [], transaksional: [], navigasional: [], komersial: [] }
  const missing = () => INTENTS.filter(i => picked[i].length < quota[i])

  for (let round = 1; round <= 2; round++) {
    const need = missing()
    if (!need.length) break
    const left = deadline - Date.now()
    if (round > 1 && left < 25_000) break
    const res = await aiText({
      cfg: o.cfg, provider: o.provider, model: o.model, json: true, temperature: 0.9,
      system: `Anda adalah ahli riset kata kunci SEO untuk situs undangan digital Indonesia "Undangan Virtual" (pernikahan, aqiqah, khitanan, ulang tahun, acara kantor & umum; nuansa syar'i & modern).
Usulkan topik artikel blog yang benar-benar dicari orang Indonesia di Google, bermanfaat, dan bisa mengarahkan pembaca ke pembelian undangan digital secara wajar.
Satu topik = satu kebutuhan pembaca yang jelas; jangan membuat variasi kata kunci dari topik yang sama. Hindari topik yang butuh angka regulasi/hukum.
Arti tiap maksud pencarian (search intent):
${INTENTS.map(i => `- ${i}: ${INTENT_GUIDE[i]}`).join('\n')}
Balas HANYA JSON berkelompok per intent, dengan JUMLAH PERSIS sesuai permintaan:
{"informasional":[{"topic":"judul kerja","focus_keyword":"kata kunci 2-5 kata","category_slug":"..."}],"transaksional":[...],"navigasional":[...],"komersial":[...]}`,
      turns: [{
        role: 'user',
        content: `Jumlah topik yang diminta per intent: ${need.map(i => `${i} = ${quota[i] - picked[i].length}`).join(', ')}.
Kategori yang tersedia (isi category_slug dengan slug): ${o.ctx.categories.map(c => `${c.slug} (${c.name})`).join(', ')}.
Kata kunci utama yang SUDAH DIPAKAI (jangan dipakai lagi, juga jangan sinonimnya): ${usedKeywords.slice(0, 200).join('; ') || '(belum ada)'}
Jangan mengulang atau terlalu mirip dengan topik yang sudah ada berikut:
${[...o.existing.slice(0, 200), ...INTENTS.flatMap(i => picked[i].map(t => t.topic))].map(t => `- ${t}`).join('\n') || '- (belum ada)'}`,
      }],
      siteUrl: siteOrigin(o.event), timeoutMs: Math.max(15_000, (round > 1 ? left : deadline - Date.now()) - 5_000),
    })
    let raw: any
    try { raw = extractJson(res.text) }
    catch {
      if (round === 1) continue
      break
    }
    // Terima juga format lama {"topics":[{..., "intent"}]}
    const buckets: Record<string, any[]> = Array.isArray(raw?.topics)
      ? (raw.topics as any[]).reduce((m: Record<string, any[]>, t) => ((m[t?.intent] ??= []).push(t), m), {})
      : raw ?? {}
    for (const i of need) {
      for (const t of (Array.isArray(buckets[i]) ? buckets[i] : [])) {
        if (picked[i].length >= quota[i]) break
        const topic = clip(t?.topic, 200)
        const focusKeyword = clip(t?.focus_keyword, 80)
        if (topic.length < 5) continue
        // Tolak topik yang bersaing dengan artikel/topik lain atau dengan usulan lain di batch ini
        if (findOverlap({ title: topic, focus_keyword: focusKeyword }, compare)) continue
        compare.push({ title: topic, focus_keyword: focusKeyword, kind: 'topik' })
        picked[i].push({
          topic,
          focus_keyword: focusKeyword,
          category_slug: o.ctx.categories.some(c => c.slug === t?.category_slug) ? String(t.category_slug) : null,
          intent: i,
        })
      }
    }
  }

  const all = INTENTS.flatMap(i => picked[i])
  if (!all.length) throw new Error('AI tidak menghasilkan usulan topik yang valid. Coba lagi atau pilih model lain.')
  // Selang-seling intent: posisi relatif tiap topik di kelompoknya → urutan antrean tersebar merata
  return INTENTS
    .flatMap(i => picked[i].map((t, k) => ({ t, key: (k + 0.5) / picked[i].length + INTENTS.indexOf(i) * 1e-3 })))
    .sort((a, b) => a.key - b.key)
    .map(x => x.t)
}
