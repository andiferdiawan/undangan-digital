/** Semua URL publik (isi sitemap) + status indeks per mesin pencari dari public.seo_urls, untuk halaman Admin → Indeks SEO. */
type SeoRow = Record<string, string | number | null> & { path: string }

const typeOf = (p: string) => p === '/'
  ? 'beranda'
  : p.startsWith('/katalog') ? 'katalog' : p.startsWith('/tema/') ? 'tema' : p === '/blog' || p.startsWith('/blog/') ? 'blog' : 'halaman'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdmin(event)
  const origin = siteOrigin(event)

  // PostgREST membatasi 1.000 baris per permintaan
  const rows: SeoRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from('seo_urls').select('*').order('path').range(from, from + 999)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    rows.push(...(data as SeoRow[]))
    if ((data?.length ?? 0) < 1000) break
  }
  const byPath = new Map(rows.map(r => [r.path, r]))
  const [urls, settings] = await Promise.all([
    sitemapUrls(event),
    client.rpc('admin_seo_settings' as never).then(r => r.data as { bing_api_set: boolean, google_set: boolean, google_email: string | null, gsc_property: string | null } | null),
  ])

  return {
    origin,
    engines: {
      bing: !!settings?.bing_api_set,
      google: settings?.google_set ? { email: settings.google_email, property: settings.gsc_property } : null,
    },
    urls: urls.map((u) => {
      const path = sitePath(origin, u.loc) ?? u.loc
      const { path: _, updated_at: __, ...status } = byPath.get(path) ?? { path }
      return { path, type: typeOf(path), lastmod: u.lastmod ?? null, ...status }
    }),
  }
})
