/** Data blog publik (RLS: hanya artikel tayang). */
export interface BlogAuthor { id: string, slug: string, name: string, job_title: string, bio: string, same_as: string[] }
export interface BlogCategory { slug: string, name: string, description: string }
export interface BlogSummary {
  slug: string, title: string, excerpt: string, published_at: string, content_updated_at: string, reading_minutes: number
  category_slug: string | null, category: { name: string } | null
}
export interface BlogPost extends BlogSummary {
  id: string, meta_title: string, meta_description: string, body: string, tags: string[], focus_keyword: string
  faq: { q: string, a: string }[], sources: { title: string, url: string }[], word_count: number
  author: BlogAuthor | null, editor: BlogAuthor | null
}

export const BLOG_PER_PAGE = 12
export const BLOG_CARD_COLS = 'slug, title, excerpt, published_at, content_updated_at, reading_minutes, category_slug, category:blog_categories(name)'

export function useBlogCategories() {
  const supabase = useSupabaseClient()
  return useAsyncData('blog-categories', async () => {
    const { data } = await supabase.from('blog_categories').select('slug, name, description').order('sort')
    return (data ?? []) as BlogCategory[]
  })
}

/** Daftar artikel berhalaman, opsional per kategori/penulis. */
export function useBlogList(o: { page: Ref<number>, category?: string, authorId?: string }) {
  const supabase = useSupabaseClient()
  return useAsyncData(
    () => `blog-list-${o.category ?? ''}-${o.authorId ?? ''}-${o.page.value}`,
    async () => {
      const from = (o.page.value - 1) * BLOG_PER_PAGE
      let q = supabase.from('blog_posts').select(BLOG_CARD_COLS, { count: 'exact' }).eq('status', 'published')
      if (o.category) q = q.eq('category_slug', o.category)
      if (o.authorId) q = q.eq('author_id', o.authorId)
      const { data, count } = await q.order('published_at', { ascending: false }).range(from, from + BLOG_PER_PAGE - 1)
      return { posts: (data ?? []) as unknown as BlogSummary[], total: count ?? 0 }
    },
    { watch: [o.page] },
  )
}

export const blogDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
