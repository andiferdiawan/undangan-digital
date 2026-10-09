import type { H3Event } from 'h3'

export interface SitemapUrl { loc: string, lastmod?: string, priority: string, freq: string }

/**
 * Semua URL publik untuk sitemap.xml & IndexNow: beranda, katalog (jenis acara & sub-kategori yang punya tema),
 * reseller, blog (indeks, kategori, penulis, artikel tayang), halaman statis, dan semua tema tayang.
 * Undangan pribadi tidak dimasukkan.
 */
export async function sitemapUrls(event: H3Event): Promise<SitemapUrl[]> {
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
  // Blog: indeks, kategori yang berisi artikel, penulis, dan semua artikel tayang
  const [{ data: postRows }, { data: authorRows }] = await Promise.all([
    publicDb(event).from('blog_posts').select('slug, category_slug, author_id, content_updated_at, published_at')
      .eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(5000),
    publicDb(event).from('blog_authors').select('id, slug'),
  ])
  const posts = (postRows ?? []) as { slug: string, category_slug: string | null, author_id: string | null, content_updated_at: string, published_at: string }[]
  const postMod = (p: typeof posts[number]) => (p.content_updated_at > p.published_at ? p.content_updated_at : p.published_at)
  const blogUrls = posts.length
    ? [
        { loc: `${origin}/blog`, lastmod: postMod(posts[0]!), priority: '0.8', freq: 'daily' },
        ...[...new Set(posts.map(p => p.category_slug).filter(Boolean))].map(c => ({
          loc: `${origin}/blog/kategori/${c}`, lastmod: postMod(posts.find(p => p.category_slug === c)!), priority: '0.6', freq: 'weekly',
        })),
        ...((authorRows ?? []) as { id: string, slug: string }[]).filter(a => posts.some(p => p.author_id === a.id)).map(a => ({
          loc: `${origin}/blog/penulis/${a.slug}`, lastmod: undefined, priority: '0.3', freq: 'monthly',
        })),
        ...posts.map(p => ({ loc: `${origin}/blog/${p.slug}`, lastmod: postMod(p), priority: '0.7', freq: 'monthly' })),
      ]
    : []
  const urls: SitemapUrl[] = [
    { loc: `${origin}/`, lastmod: latest, priority: '1.0', freq: 'daily' },
    { loc: `${origin}/katalog`, lastmod: latest, priority: '0.9', freq: 'daily' },
    ...catalogUrls,
    { loc: `${origin}/reseller`, priority: '0.6', freq: 'monthly' },
    { loc: `${origin}/reseller/panduan`, priority: '0.5', freq: 'monthly' },
    ...blogUrls,
    ...pages.map(p => ({ loc: `${origin}/${encodeURIComponent(p.slug)}`, lastmod: p.updated_at, priority: '0.4', freq: 'monthly' })),
    ...themes.map(t => ({ loc: `${origin}/tema/${encodeURIComponent(t.slug)}`, lastmod: t.updated_at, priority: '0.8', freq: 'weekly' })),
  ]
  return urls
}
