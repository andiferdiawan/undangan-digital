/**
 * Markdown sederhana & aman untuk halaman statis yang diedit admin.
 * Semua HTML di-escape lebih dulu; hanya sintaks berikut yang diubah:
 * ## / ### judul, - daftar, 1. daftar bernomor, **tebal**, *miring*, [teks](url).
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function safeHref(url: string): string | null {
  const u = url.trim()
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(u)) return u
  return null
}

function inline(text: string): string {
  let s = esc(text)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
    const href = safeHref(url.replace(/&amp;/g, '&'))
    if (!href) return label
    const ext = /^https?:\/\//i.test(href)
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
  return s
}

export function renderMarkdown(src: string): string {
  const lines = (src || '').replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let para: string[] = []
  let list: { type: 'ul' | 'ol', items: string[] } | null = null

  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = [] }
  const flushList = () => { if (list) out.push(`<${list.type}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.type}>`); list = null }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    const ul = /^[-*]\s+(.*)$/.exec(line)
    const ol = /^\d+[.)]\s+(.*)$/.exec(line)
    if (h) { flushPara(); flushList(); out.push(`<h${h[1]!.length}>${inline(h[2]!)}</h${h[1]!.length}>`) }
    else if (ul || ol) {
      flushPara()
      const type = ul ? 'ul' : 'ol'
      if (!list || list.type !== type) { flushList(); list = { type, items: [] } }
      list.items.push((ul ?? ol)![1]!)
    }
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
  let list: { type: 'ul' | 'ol', items: string[] } | null = null

  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = [] }
  const flushQuote = () => { if (quote.length) out.push(`<blockquote>${quote.map(q => q ? `<p>${inline(q)}</p>` : '').join('')}</blockquote>`); quote = [] }
  const flushList = () => { if (list) out.push(`<${list.type}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.type}>`); list = null }
  const flushAll = () => { flushPara(); flushQuote(); flushList() }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); if (quote.length) quote.push(''); continue }
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    const q = /^>\s?(.*)$/.exec(line)
    const ul = /^[-*]\s+(.*)$/.exec(line)
    const ol = /^\d+[.)]\s+(.*)$/.exec(line)
    if (q) { flushPara(); flushList(); quote.push(q[1]!.trim()); continue }
    if (quote.length) flushQuote()
    if (h) {
      flushAll()
      const level = h[1]!.length as 2 | 3
      let id = headingId(h[2]!)
      for (let i = 2; used.has(id); i++) id = `${headingId(h[2]!)}-${i}`
      used.add(id)
      const text = h[2]!.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      toc.push({ id, text, level })
      out.push(`<h${level} id="${id}">${inline(h[2]!)}</h${level}>`)
    }
    else if (ul || ol) {
      flushPara()
      const type = ul ? 'ul' : 'ol'
      if (!list || list.type !== type) { flushList(); list = { type, items: [] } }
      list.items.push((ul ?? ol)![1]!)
    }
    else { flushList(); para.push(line) }
  }
  flushAll()
  return { html: out.join('\n'), toc }
}
