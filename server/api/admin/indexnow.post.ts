import { z } from 'zod'

/**
 * Kirim URL ke Bing lewat IndexNow. `{ all: true }` → semua URL sitemap (dorongan awal / setelah perubahan besar);
 * `{ paths }` → path tertentu milik situs, mis. artikel yang baru diterbitkan dari editor.
 */
const Body = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ paths: z.array(z.string().trim().startsWith('/').max(500)).min(1).max(100) }),
])

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, Body.parse)
  const paths = 'all' in body ? (await sitemapUrls(event)).map(u => u.loc) : body.paths.filter(p => !p.startsWith('//'))
  return await submitIndexNow(event, paths, { timeoutMs: 15_000 })
})
