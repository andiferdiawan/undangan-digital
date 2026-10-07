import type { H3Event } from 'h3'
import { extractJson } from './openrouter'
import { type AiConfig, type AiProvider, aiText } from './ai'

/**
 * Generator artikel blog SEO (teks saja, tanpa gambar) untuk mendongkrak trafik organik situs undangan.
 * Model menulis Markdown; server lalu membersihkan & memvalidasi: internal link hanya ke URL yang benar-benar
 * ada di situs, eksternal link hanya https ke situs lain, panjang meta sesuai batas, slug rapi.
 */

export type Intent = 'informasional' | 'komersial' | 'transaksional' | 'navigasional'
export interface BlogLink { url: string, title: string }
export interface BlogContext {
  categories: { slug: string, name: string }[]
  posts: { slug: string, title: string, category_slug: string | null, focus_keyword: string, tags: string[] }[]
}
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

function systemPrompt(siteName: string) {
  return `Anda adalah penulis konten SEO senior berbahasa Indonesia untuk ${siteName}, layanan pembuatan undangan digital (pernikahan, aqiqah, khitanan, ulang tahun, acara kantor & umum).
Tulis artikel blog orisinal, akurat, dan benar-benar membantu pembaca (prinsip E-E-A-T & helpful content Google), sekaligus mengarahkan pembaca secara halus untuk membuat undangan digital di situs kami.

# Aturan konten
- Bahasa Indonesia baku yang hangat dan mudah dibaca; paragraf pendek (2–4 kalimat); hindari klaim berlebihan dan hal yang tidak pasti.
- Panjang body 1.200–1.800 kata. Jangan menulis H1 (judul sudah menjadi H1). Mulai dengan paragraf pembuka yang langsung menjawab inti pertanyaan dan memuat kata kunci utama dalam 100 kata pertama.
- Struktur: 5–8 subjudul "## " (H2) yang memuat variasi kata kunci, boleh "### " (H3) di dalamnya; gunakan daftar berbutir/bernomor dan contoh kalimat/teks undangan bila relevan; akhiri dengan "## Kesimpulan".
- Format Markdown sederhana saja: ##, ###, paragraf, "- " daftar, "1. " daftar bernomor, **tebal**, *miring*, [teks](url), dan "> " kutipan untuk contoh teks. DILARANG: gambar, tabel, HTML, emoji berlebihan.
- Internal link: sisipkan 3–6 tautan kontekstual dengan anchor text deskriptif (bukan "klik di sini"), HANYA ke URL dari daftar "URL internal yang boleh ditautkan" (tulis persis, diawali "/"). Utamakan artikel terkait, dan minimal satu tautan ke halaman katalog/harga yang relevan sebagai ajakan bertindak.
- Eksternal link: 2–4 tautan ke sumber tepercaya yang Anda yakini benar ada (situs pemerintah .go.id, Kemenag, KBBI, Wikipedia bahasa Indonesia, lembaga resmi). Pakai URL halaman utama/halaman stabil, wajib https. Cantumkan juga di "sources".
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
  const posts = ctx.posts.slice(0, 80).map(p => `- /blog/${p.slug} — ${p.title}`).join('\n') || '- (belum ada artikel lain)'
  const pages = links.map(l => `- ${l.url} — ${l.title}`).join('\n')
  const cats = ctx.categories.map(c => `${c.slug} (${c.name})`).join(', ')
  return `Topik artikel: ${brief.topic}
Kata kunci utama: ${brief.focus_keyword || '(tentukan sendiri dari topik, 2–5 kata yang paling sering dicari)'}
Search intent: ${brief.intent ?? 'informasional'}
Kategori: ${brief.category_slug || '(pilih yang paling sesuai)'} — pilihan: ${cats}

URL internal yang boleh ditautkan:
${posts}
${pages}`
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
 * eksternal link hanya https ke domain lain. Mengembalikan jumlah link untuk statistik.
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
  body = body.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, rawUrl: string) => {
    const url = rawUrl.trim()
    if (url.startsWith('/')) {
      const path = url.split('#')[0]!.split('?')[0]!.replace(/\/$/, '') || '/'
      const key = url.startsWith('/#') ? url : path
      if (!allowed.has(key)) return label
      internal++
      return `[${label}](${key})`
    }
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:' || u.hostname === siteHost || u.hostname.endsWith(`.${siteHost}`)) return label
      external.push({ title: label, url: u.toString() })
      return `[${label}](${u.toString()})`
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

  const res = await aiText({
    cfg: o.cfg, provider: o.provider, model: o.model, json: true, temperature: 0.7,
    system: systemPrompt(String(config.public.siteName || 'Undangan Virtual')),
    turns: [{ role: 'user', content: userPrompt(o.brief, o.ctx, links) }],
    siteUrl: origin, timeoutMs: o.timeoutMs,
  })
  if (res.finish === 'length') throw new Error('Artikel terpotong (batas token model). Coba lagi atau pilih model lain.')
  let raw: any
  try { raw = extractJson(res.text) }
  catch { throw new Error('Jawaban AI bukan JSON yang valid. Coba lagi.') }

  const title = clip(raw.title || o.brief.topic, 120)
  if (title.length < 10) throw new Error('Judul artikel dari AI terlalu pendek.')
  const focus = clip(raw.focus_keyword || o.brief.focus_keyword || o.brief.topic, 80)
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
  const sources: { title: string, url: string }[] = []
  for (const s of [...srcIn.map(s => ({ title: String(s?.title ?? ''), url: String(s?.url ?? '') })), ...clean.external]) {
    try {
      const u = new URL(s.url)
      if (u.protocol !== 'https:' || u.hostname.endsWith(siteHost)) continue
      if (sources.some(x => x.url === u.toString())) continue
      sources.push({ title: clip(s.title || u.hostname, 120), url: u.toString() })
    }
    catch { /* abaikan URL rusak */ }
  }

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
    sources: sources.slice(0, 10),
    ai_model: res.model,
    stats: { words, internalLinks: internal, externalLinks: clean.external.length },
  }
}

/** Usulan topik baru (untuk antrean artikel harian) yang belum pernah ditulis. */
export async function suggestTopics(o: {
  event: H3Event
  cfg: AiConfig
  provider: AiProvider
  model?: string
  ctx: BlogContext
  existing: string[]
  count: number
  timeoutMs: number
}): Promise<{ topic: string, focus_keyword: string, category_slug: string | null, intent: Intent }[]> {
  const res = await aiText({
    cfg: o.cfg, provider: o.provider, model: o.model, json: true, temperature: 0.9,
    system: `Anda adalah ahli riset kata kunci SEO untuk situs undangan digital Indonesia (pernikahan, aqiqah, khitanan, ulang tahun, acara kantor & umum).
Usulkan topik artikel blog yang banyak dicari di Google Indonesia, campuran intent informasional (contoh kalimat, etika, tata cara, adat) dan komersial/transaksional (perbandingan, cara membuat undangan digital) yang bisa membawa pembaca membeli undangan digital.
Balas HANYA JSON: {"topics":[{"topic":"judul kerja","focus_keyword":"kata kunci 2-5 kata","category_slug":"...","intent":"informasional|komersial|transaksional|navigasional"}]}`,
    turns: [{
      role: 'user',
      content: `Buat ${o.count} topik baru. Kategori yang tersedia: ${o.ctx.categories.map(c => `${c.slug} (${c.name})`).join(', ')}.
Jangan mengulang atau terlalu mirip dengan topik yang sudah ada berikut:
${o.existing.slice(0, 200).map(t => `- ${t}`).join('\n') || '- (belum ada)'}`,
    }],
    siteUrl: siteOrigin(o.event), timeoutMs: o.timeoutMs,
  })
  let raw: any
  try { raw = extractJson(res.text) }
  catch { throw new Error('Usulan topik dari AI bukan JSON yang valid.') }
  const seen = new Set(o.existing.map(t => t.toLowerCase().trim()))
  return ((Array.isArray(raw?.topics) ? raw.topics : []) as any[])
    .map(t => ({
      topic: clip(t?.topic, 200),
      focus_keyword: clip(t?.focus_keyword, 80),
      category_slug: o.ctx.categories.some(c => c.slug === t?.category_slug) ? String(t.category_slug) : null,
      intent: (INTENTS.includes(t?.intent) ? t.intent : 'informasional') as Intent,
    }))
    .filter(t => t.topic.length >= 5 && !seen.has(t.topic.toLowerCase()))
    .slice(0, o.count)
}
