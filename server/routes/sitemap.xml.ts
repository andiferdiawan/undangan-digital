/** Sitemap: halaman publik + semua tema yang tayang. Undangan pribadi tidak dimasukkan. */
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
  const { data } = await publicDb(event)
    .from('themes')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  const themes = (data ?? []) as { slug: string, updated_at: string }[]
  const latest = themes[0]?.updated_at
  const urls: { loc: string, lastmod?: string, priority: string, freq: string }[] = [
    { loc: `${origin}/`, lastmod: latest, priority: '1.0', freq: 'daily' },
    { loc: `${origin}/reseller`, priority: '0.6', freq: 'monthly' },
    ...themes.map(t => ({ loc: `${origin}/tema/${encodeURIComponent(t.slug)}`, lastmod: t.updated_at, priority: '0.8', freq: 'weekly' })),
  ]
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
})
