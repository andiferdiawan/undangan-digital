/** Feed RSS 2.0 blog (50 artikel terbaru) — membantu penemuan konten baru oleh agregator & mesin pencari. */
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
  const { data } = await publicDb(event).from('blog_posts')
    .select('slug, title, excerpt, meta_description, published_at, category:blog_categories(name), author:blog_authors!blog_posts_author_id_fkey(name)')
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false }).limit(50)
  const posts = (data ?? []) as unknown as { slug: string, title: string, excerpt: string, meta_description: string, published_at: string, category: { name: string } | null, author: { name: string } | null }[]
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=1800, s-maxage=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>Blog Undangan Virtual</title>
  <link>${origin}/blog</link>
  <atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <description>Inspirasi undangan pernikahan, undangan digital, persiapan nikah, adat &amp; budaya, serta acara keluarga dan resmi.</description>
  <language>id-ID</language>${posts[0] ? `\n  <lastBuildDate>${new Date(posts[0].published_at).toUTCString()}</lastBuildDate>` : ''}
${posts.map(p => `  <item>
    <title>${esc(p.title)}</title>
    <link>${origin}/blog/${p.slug}</link>
    <guid isPermaLink="true">${origin}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>${p.author ? `\n    <dc:creator>${esc(p.author.name)}</dc:creator>` : ''}${p.category ? `\n    <category>${esc(p.category.name)}</category>` : ''}
    <description>${esc(p.excerpt || p.meta_description)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`
})
