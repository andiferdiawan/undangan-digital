import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { MD_LINK, internalKey, ownLinkPath } from '../../../../shared/blog-links'

/**
 * Periksa tautan semua artikel blog yang belum diarsip: tautan internal berdomain salah (mis. undanganvirtual.id),
 * path internal yang halamannya tidak ada, dan tautan eksternal yang rusak (dibuka satu per satu dari server).
 * `fix: true` sekaligus memperbaikinya (isi lama dicadangkan di database, tanggal "diperbarui" tidak berubah).
 * Tautan eksternal yang tidak sempat diperiksa hanya dilaporkan, tidak diubah.
 */
const Body = z.object({ fix: z.boolean().optional() })

interface Row { id: string, slug: string, title: string, status: string, body: string, sources: { title: string, url: string }[] | null }

/** Halaman publik yang benar-benar ada: isi sitemap + halaman yang boleh ditautkan generator + rute statis. */
async function internalPaths(event: H3Event) {
  const origin = siteOrigin(event)
  const [urls, links] = await Promise.all([sitemapUrls(event), siteLinks(event)])
  const set = new Set<string>([
    '/', '/blog', '/katalog', '/reseller', '/reseller/panduan', '/masuk', '/daftar', '/kontak', '/favorit',
    '/tentang-kami', '/kebijakan-privasi', '/syarat-ketentuan', '/kebijakan-pengembalian',
  ])
  for (const u of urls) set.add(internalKey(decodeURIComponent(u.loc.slice(origin.length)) || '/'))
  for (const l of links) set.add(internalKey(l.url))
  return (key: string) => key.startsWith('/#') || set.has(key)
}

export default defineEventHandler(async (event) => {
  const started = Date.now()
  const { client } = await requireAdmin(event)
  const { fix } = await readValidatedBody(event, b => Body.parse(b ?? {}))
  const siteHost = new URL(siteOrigin(event)).hostname.replace(/^www\./, '')

  const [isValid, { data, error }] = await Promise.all([
    internalPaths(event),
    client.from('blog_posts').select('id, slug, title, status, body, sources').neq('status', 'archived')
      .order('published_at', { ascending: false, nullsFirst: true }).limit(3000),
  ])
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  const posts = (data ?? []) as Row[]

  const urls = [...new Set(posts.flatMap(p => externalUrls(p.body, p.sources ?? [], siteHost)))]
  const checks = await checkExternalUrls(urls, { deadline: started + 200_000, concurrency: 8 })
  const broken = brokenMap(checks, { includeUnchecked: false })

  let internalLinks = 0
  let fixed = 0
  let skipped = 0
  const issues = []
  for (const p of posts) {
    for (const m of p.body.matchAll(MD_LINK)) {
      const u = m[2]!.trim()
      if ((u.startsWith('/') && !u.startsWith('//')) || ownLinkPath(u, siteHost)) internalLinks++
    }
    const r = repairLinks({ body: p.body, sources: p.sources ?? [], isValid, siteHost, broken })
    if (!r.changes.length) continue
    let saved: boolean | null = null
    if (fix) {
      saved = await serverRpc<boolean>(event, 'server_blog_link_fix', {
        p_id: p.id,
        p_old_md5: createHash('md5').update(p.body).digest('hex'),
        p_body: r.body,
        p_sources: r.sources,
        p_note: r.changes.map(c => `${c.kind}: ${c.from} → ${c.to ?? 'dilepas'}${c.reason ? ` (${c.reason})` : ''}`).join('\n'),
      })
      if (saved) fixed++
      else skipped++
    }
    issues.push({ id: p.id, slug: p.slug, title: p.title, status: p.status, changes: r.changes, saved })
  }

  const list = [...checks.values()]
  return {
    checkedAt: new Date().toISOString(),
    fix: !!fix,
    posts: posts.length,
    internalLinks,
    external: {
      total: list.length,
      ok: list.filter(c => c.ok).length,
      broken: list.filter(c => !c.ok && !c.unchecked).length,
      unchecked: list.filter(c => c.unchecked).length,
    },
    brokenUrls: list.filter(c => !c.ok && !c.unchecked).map(c => ({ url: c.url, reason: c.reason })),
    uncheckedUrls: list.filter(c => c.unchecked).map(c => c.url),
    fixed,
    skipped,
    issues,
  }
})
