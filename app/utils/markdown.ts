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
