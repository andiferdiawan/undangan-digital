/**
 * Markdown sederhana & aman untuk halaman statis yang diedit admin.
 * Semua HTML di-escape lebih dulu; hanya sintaks berikut yang diubah:
 * ## / ### judul, - daftar, 1. daftar bernomor, **tebal**, *miring*, [teks](url).
 * Garis miring terbalik menampilkan karakter apa adanya: \\ \* \[ \] \# \> \- \. \)
 */
import { MD_LINK, ownLinkPath } from '#shared/blog-links'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i
export const isSafeHref = (url: string) => SAFE_HREF.test(url.trim())

function safeHref(url: string): string | null {
  const u = url.trim()
  return SAFE_HREF.test(u) ? u : null
}

// Karakter ber-escape diganti penanda sementara agar tidak dibaca sebagai sintaks, lalu dikembalikan.
const ESCAPED = /\\([\\*[\]#>.)-])/g
const LITERAL = /\uE000(\d+)\uE001/g
function protect(text: string) {
  const lit: string[] = []
  const s = text.replace(ESCAPED, (_, c: string) => `\uE000${lit.push(c) - 1}\uE001`)
  return { s, restore: (out: string, f: (c: string) => string = c => c) => out.replace(LITERAL, (_, i: string) => f(lit[Number(i)] ?? '')) }
}

function inline(text: string): string {
  const p = protect(text)
  let s = esc(p.s)
  s = s.replace(MD_LINK, (_, label: string, url: string) => {
    const raw = url.replace(/&amp;/g, '&')
    // Tautan ke situs sendiri yang terlanjur ditulis dengan domain (benar atau tiruan merek, mis. undanganvirtual.id)
    // ditampilkan sebagai tautan internal relatif
    const href = safeHref(ownLinkPath(raw) ?? raw)
    if (!href) return label
    const ext = /^https?:\/\//i.test(href)
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
  return p.restore(s, esc)
}

/** Teks polos dari satu baris Markdown (tanpa tebal/miring/tautan & escape) — untuk daftar isi. */
function plain(md: string) {
  const p = protect(md)
  return p.restore(p.s.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*/g, ''))
}

// Daftar: butir yang dipisah baris kosong tetap satu daftar; nomor butir pertama menjadi nomor awal <ol>.
type List = { type: 'ul' | 'ol', start: number, items: string[] }
const LIST_ITEM = /^(?:[-*]|(\d{1,9})[.)])\s+(.*)$/
const listHtml = (l: List) => `<${l.type}${l.start > 1 ? ` start="${l.start}"` : ''}>${l.items.map(i => `<li>${inline(i)}</li>`).join('')}</${l.type}>`
function addItem(list: List | null, m: RegExpExecArray, flush: () => void): List {
  const type = m[1] ? 'ol' : 'ul'
  if (list?.type === type) { list.items.push(m[2]!); return list }
  flush()
  return { type, start: m[1] ? Number(m[1]) : 1, items: [m[2]!] }
}

export function renderMarkdown(src: string): string {
  const lines = (src || '').replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let para: string[] = []
  let list: List | null = null

  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = [] }
  const flushList = () => { if (list) out.push(listHtml(list)); list = null }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushPara(); continue }
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    const li = LIST_ITEM.exec(line)
    if (h) { flushPara(); flushList(); out.push(`<h${h[1]!.length}>${inline(h[2]!)}</h${h[1]!.length}>`) }
    else if (li) { flushPara(); list = addItem(list, li, flushList) }
    else { flushList(); para.push(line) }
  }
  flushPara(); flushList()
  return out.join('\n')
}

export interface TocItem { id: string, text: string, level: 2 | 3 }

const headingId = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/\*|\[|\]\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'bagian'

/**
 * Markdown artikel blog: sama seperti renderMarkdown, ditambah id pada judul (untuk daftar isi & tautan #),
 * kutipan "> " (contoh teks undangan), dan daftar isi yang dikembalikan terpisah.
 */
export function renderArticle(src: string): { html: string, toc: TocItem[] } {
  const lines = (src || '').replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  const toc: TocItem[] = []
  const used = new Set<string>()
  let para: string[] = []
  let quote: string[] = []
  let list: List | null = null

  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = [] }
  const flushQuote = () => { if (quote.length) out.push(`<blockquote>${quote.map(q => q ? `<p>${inline(q)}</p>` : '').join('')}</blockquote>`); quote = [] }
  const flushList = () => { if (list) out.push(listHtml(list)); list = null }
  const flushAll = () => { flushPara(); flushQuote(); flushList() }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushPara(); if (quote.length) quote.push(''); continue }
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    const q = /^>\s?(.*)$/.exec(line)
    const li = LIST_ITEM.exec(line)
    if (q) { flushPara(); flushList(); quote.push(q[1]!.trim()); continue }
    if (quote.length) flushQuote()
    if (h) {
      flushAll()
      const level = h[1]!.length as 2 | 3
      let id = headingId(h[2]!)
      for (let i = 2; used.has(id); i++) id = `${headingId(h[2]!)}-${i}`
      used.add(id)
      const text = plain(h[2]!)
      toc.push({ id, text, level })
      out.push(`<h${level} id="${id}">${inline(h[2]!)}</h${level}>`)
    }
    else if (li) { flushPara(); list = addItem(list, li, flushList) }
    else { flushList(); para.push(line) }
  }
  flushAll()
  return { html: out.join('\n'), toc }
}

// ── Editor visual → Markdown ──
// Dokumen editor (JSON ProseMirror/TipTap) diubah ke Markdown yang dibaca renderArticle. Hanya node & mark
// yang didukung renderer: paragraf, H2/H3, daftar, kutipan, tebal, miring, tautan. Penulisan tanda dibuat
// selalu terbaca benar oleh regex renderer: miring di luar, tebal di dalam; spasi di tepi dikeluarkan dari tanda.

export interface EditorNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: EditorNode[]
  text?: string
  marks?: { type: string, attrs?: Record<string, unknown> | null }[]
}

const escText = (s: string) => s.replace(/[\\*[\]]/g, '\\$&')
const escUrl = (u: string) => u.trim().replace(/[\s()*"<>]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`)
const hasMark = (n: EditorNode, t: string) => !!n.marks?.some(m => m.type === t)
const hrefOf = (n: EditorNode) => {
  const h = n.marks?.find(m => m.type === 'link')?.attrs?.href
  return typeof h === 'string' && isSafeHref(h) ? h.trim() : ''
}

/** Bungkus teks dengan penanda; spasi di awal/akhir tetap di luar penanda. */
function wrapMd(s: string, open: string, close = open) {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s)!
  return m[2] ? `${m[1]}${open}${m[2]}${close}${m[3]}` : s
}

/** Kelompokkan simpul berurutan yang kuncinya sama. */
function runs<T>(nodes: EditorNode[], key: (n: EditorNode) => T) {
  const out: { key: T, nodes: EditorNode[] }[] = []
  for (const n of nodes) {
    const k = key(n)
    const last = out[out.length - 1]
    if (last && last.key === k) last.nodes.push(n)
    else out.push({ key: k, nodes: [n] })
  }
  return out
}

const textOf = (n: EditorNode) => (n.type === 'text' ? n.text ?? '' : n.type === 'hardBreak' ? ' ' : '').replace(/\s*\n\s*/g, ' ')

function emphasisMd(nodes: EditorNode[]) {
  return runs(nodes, n => hasMark(n, 'italic')).map((it) => {
    const body = runs(it.nodes, n => hasMark(n, 'bold'))
      .map(b => (b.key ? wrapMd(escText(b.nodes.map(textOf).join('')), '**') : escText(b.nodes.map(textOf).join(''))))
      .join('')
    return it.key ? wrapMd(body, '*') : body
  }).join('')
}

function inlineMd(nodes: EditorNode[] = []) {
  return runs(nodes, hrefOf).map((r) => {
    const label = emphasisMd(r.nodes)
    return r.key && label.trim() ? wrapMd(label, '[', `](${escUrl(r.key)})`) : label
  }).join('').trim()
}

/** Paragraf yang kebetulan diawali "#", ">", "- " atau "1. " di-escape agar tidak berubah jadi judul/daftar. */
const escLineStart = (s: string) => s.replace(/^([#>]|-(?=\s))/, '\\$1').replace(/^(\d+)([.)])(?=\s)/, '$1\\$2')

/** Isi butir daftar; daftar bersarang diratakan karena renderer hanya mengenal satu tingkat. */
function listItemsMd(list: EditorNode): string[] {
  return (list.content ?? []).flatMap((li) => {
    const own = (li.content ?? []).filter(c => c.type !== 'bulletList' && c.type !== 'orderedList').map(c => inlineMd(c.content)).filter(Boolean).join(' ')
    const nested = (li.content ?? []).filter(c => c.type === 'bulletList' || c.type === 'orderedList').flatMap(listItemsMd)
    return [own, ...nested].filter(Boolean)
  })
}

function blockMd(n: EditorNode): string[] {
  switch (n.type) {
    case 'heading': {
      const t = inlineMd(n.content)
      return t ? [`${n.attrs?.level === 3 ? '###' : '##'} ${t}`] : []
    }
    case 'paragraph': {
      const t = inlineMd(n.content)
      return t ? [escLineStart(t)] : []
    }
    case 'bulletList':
    case 'orderedList': {
      const items = listItemsMd(n)
      const start = Math.max(1, Math.floor(Number(n.attrs?.start)) || 1)
      return items.length ? [items.map((t, i) => `${n.type === 'orderedList' ? `${start + i}.` : '-'} ${t}`).join('\n')] : []
    }
    case 'blockquote': {
      const lines = (n.content ?? []).flatMap(c => (c.type === 'paragraph' || c.type === 'heading') ? [inlineMd(c.content)] : c.type === 'bulletList' || c.type === 'orderedList' ? listItemsMd(c) : blockMd(c).flatMap(b => b.split('\n'))).filter(Boolean)
      return lines.length ? [lines.map(l => `> ${l}`).join('\n')] : []
    }
    default:
      return n.content ? n.content.flatMap(blockMd) : []
  }
}

export function docToMarkdown(doc: EditorNode): string {
  return (doc.content ?? []).flatMap(blockMd).join('\n\n')
}
