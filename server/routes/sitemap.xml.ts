/** Sitemap: halaman publik + semua tema yang tayang. Undangan pribadi tidak dimasukkan. */
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
  const { data } = await publicDb(event)
    .from('themes')
    .select('slug, updated_at, category_id')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  const themes = (data ?? []) as { slug: string, updated_at: string, category_id: number | null }[]
  // Halaman katalog per jenis acara & sub-kategori yang punya tema (halaman lanjutan ditemukan lewat tautan pagination)
  const [{ data: groupRows }, { data: catRows }] = await Promise.all([
    publicDb(event).from('event_groups').select('slug').eq('is_active', true).order('sort'),
    publicDb(event).from('categories').select('id, slug, group_slug').order('sort'),
  ])
  const cats = (catRows ?? []) as { id: number, slug: string, group_slug: string | null }[]
  const groupOf = (id: number | null) => cats.find(c => c.id === id)?.group_slug ?? 'pernikahan'
  const lastIn = (pred: (t: typeof themes[number]) => boolean) => themes.find(pred)?.updated_at
  const catalogUrls = [
    ...((groupRows ?? []) as { slug: string }[]).filter(g => themes.some(t => groupOf(t.category_id) === g.slug)).map(g => ({
      loc: `${origin}/katalog/${g.slug}`, lastmod: lastIn(t => groupOf(t.category_id) === g.slug), priority: '0.8', freq: 'weekly',
    })),
    ...cats.filter(c => themes.some(t => t.category_id === c.id)).map(c => ({
      loc: `${origin}/katalog/${c.group_slug ?? 'pernikahan'}/${c.slug}`, lastmod: lastIn(t => t.category_id === c.id), priority: '0.7', freq: 'weekly',
    })),
  ]
  const { data: pageRows } = await publicDb(event).from('pages').select('slug, updated_at').eq('is_published', true).order('sort')
  const pages = (pageRows ?? []) as { slug: string, updated_at: string }[]
  const latest = themes[0]?.updated_at
  const urls: { loc: string, lastmod?: string, priority: string, freq: string }[] = [
    { loc: `${origin}/`, lastmod: latest, priority: '1.0', freq: 'daily' },
    { loc: `${origin}/katalog`, lastmod: latest, priority: '0.9', freq: 'daily' },
    ...catalogUrls,
    { loc: `${origin}/reseller`, priority: '0.6', freq: 'monthly' },
    ...pages.map(p => ({ loc: `${origin}/${encodeURIComponent(p.slug)}`, lastmod: p.updated_at, priority: '0.4', freq: 'monthly' })),
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
