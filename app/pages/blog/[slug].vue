<script setup lang="ts">
import type { BlogPost, BlogSummary } from '~/composables/useBlog'
import { ownLinkPath } from '#shared/blog-links'

const route = useRoute()
const slug = String(route.params.slug)
const supabase = useSupabaseClient()
const AUTHOR_COLS = 'id, slug, name, job_title, bio, same_as'

const { data: post } = await useAsyncData(`blog-post-${slug}`, async () => {
  const { data } = await supabase.from('blog_posts')
    .select(`*, category:blog_categories(name), author:blog_authors!blog_posts_author_id_fkey(${AUTHOR_COLS}), editor:blog_authors!blog_posts_editor_id_fkey(${AUTHOR_COLS})`)
    .eq('slug', slug).eq('status', 'published').maybeSingle()
  return data as unknown as BlogPost | null
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan', fatal: true })

// Artikel terkait (kategori sama → tag sama → terbaru) + sebelumnya/berikutnya: memperkuat internal link antarartikel
const { data: more } = await useAsyncData(`blog-related-${slug}`, async () => {
  const p = post.value!
  const [same, tagged, recent, prev, next] = await Promise.all([
    p.category_slug
      ? supabase.from('blog_posts').select(BLOG_CARD_COLS).eq('status', 'published').eq('category_slug', p.category_slug).neq('slug', slug).order('published_at', { ascending: false }).limit(6)
      : Promise.resolve({ data: [] }),
    p.tags.length
      ? supabase.from('blog_posts').select(BLOG_CARD_COLS).eq('status', 'published').overlaps('tags', p.tags).neq('slug', slug).order('published_at', { ascending: false }).limit(6)
      : Promise.resolve({ data: [] }),
    supabase.from('blog_posts').select(BLOG_CARD_COLS).eq('status', 'published').neq('slug', slug).order('published_at', { ascending: false }).limit(6),
    supabase.from('blog_posts').select('slug, title').eq('status', 'published').lt('published_at', p.published_at).order('published_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('blog_posts').select('slug, title').eq('status', 'published').gt('published_at', p.published_at).order('published_at', { ascending: true }).limit(1).maybeSingle(),
  ])
  const seen = new Set<string>()
  const related = [...(same.data ?? []), ...(tagged.data ?? []), ...(recent.data ?? [])]
    .filter((x) => { const s = (x as BlogSummary).slug; if (seen.has(s)) return false; seen.add(s); return true })
    .slice(0, 3) as unknown as BlogSummary[]
  return { related, prev: prev.data as { slug: string, title: string } | null, next: next.data as { slug: string, title: string } | null }
})

const article = computed(() => renderArticle(post.value?.body ?? ''))
// Referensi hanya situs eksternal (bukan domain sendiri/tiruan merek yang terlanjur tersimpan)
const sources = computed(() => (post.value?.sources ?? []).filter(s => /^https:\/\//i.test(s.url) && !ownLinkPath(s.url)))
const toc = computed(() => article.value.toc.filter(t => t.level === 2))

const origin = useSiteOrigin()
const url = `${origin}/blog/${slug}`
const ogImage = computed(() => `${origin}/og/blog/${slug}.png?v=${shortHash(`${post.value?.title}|${post.value?.category?.name}`)}`)
const authorUrl = (a: { slug: string } | null) => (a ? `${origin}/blog/penulis/${a.slug}` : undefined)
const metaTitle = computed(() => post.value?.meta_title || post.value?.title || '')
const metaDesc = computed(() => post.value?.meta_description || post.value?.excerpt || '')

useSeoMeta({
  title: metaTitle,
  description: metaDesc,
  ogType: 'article',
  ogTitle: () => post.value?.title,
  ogDescription: metaDesc,
  ogImage,
  ogImageAlt: () => post.value?.title,
  twitterTitle: () => post.value?.title,
  twitterDescription: metaDesc,
  twitterImage: ogImage,
  articlePublishedTime: () => post.value?.published_at,
  articleModifiedTime: () => post.value?.content_updated_at,
  articleSection: () => post.value?.category?.name,
  articleTag: () => post.value?.tags,
  articleAuthor: () => (post.value?.author ? [authorUrl(post.value.author)!] : undefined),
  author: () => post.value?.author?.name,
  publisher: BRAND.name,
})
useHead({
  meta: [
    { key: 'keywords', name: 'keywords', content: () => [post.value?.focus_keyword, ...(post.value?.tags ?? [])].filter(Boolean).join(', ') },
  ],
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: `Blog ${BRAND.name}`, href: `${origin}/blog/rss.xml` }],
})

const person = (a: BlogPost['author']) => a
  ? { '@type': 'Person', '@id': `${authorUrl(a)}#person`, 'name': a.name, 'url': authorUrl(a), 'jobTitle': a.job_title || undefined, 'sameAs': a.same_as.length ? a.same_as : undefined }
  : undefined
useJsonLd('blog-post', () => {
  const p = post.value
  if (!p) return null
  const org = { '@type': 'Organization', '@id': `${origin}/#org`, 'name': BRAND.name, 'url': `${origin}/`, 'logo': { '@type': 'ImageObject', 'url': `${origin}/icon-512.png` } }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
        'url': url,
        'headline': p.title,
        'alternativeHeadline': p.meta_title && p.meta_title !== p.title ? p.meta_title : undefined,
        'description': metaDesc.value,
        'image': { '@type': 'ImageObject', 'url': ogImage.value, 'width': 1200, 'height': 630 },
        'datePublished': p.published_at,
        'dateModified': p.content_updated_at > p.published_at ? p.content_updated_at : p.published_at,
        'author': person(p.author) ?? org,
        'editor': person(p.editor),
        'publisher': org,
        'articleSection': p.category?.name,
        'keywords': [p.focus_keyword, ...p.tags].filter(Boolean).join(', '),
        'wordCount': p.word_count,
        'timeRequired': `PT${p.reading_minutes}M`,
        'inLanguage': 'id-ID',
        'isAccessibleForFree': true,
        'isPartOf': { '@type': 'Blog', '@id': `${origin}/blog#blog`, 'name': `Blog ${BRAND.name}`, 'url': `${origin}/blog` },
        'citation': sources.value.length ? sources.value.map(s => ({ '@type': 'CreativeWork', 'name': s.title, 'url': s.url })) : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': `${origin}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${origin}/blog` },
          ...(p.category ? [{ '@type': 'ListItem', 'position': 3, 'name': p.category.name, 'item': `${origin}/blog/kategori/${p.category_slug}` }] : []),
          { '@type': 'ListItem', 'position': p.category ? 4 : 3, 'name': p.title, 'item': url },
        ],
      },
      ...(p.faq.length
        ? [{
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            'mainEntity': p.faq.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } })),
          }]
        : []),
    ],
  }
})

const updated = computed(() => !!post.value && blogDate(post.value.content_updated_at) !== blogDate(post.value.published_at))
</script>

<template>
  <div v-if="post" class="mx-auto max-w-6xl px-4 py-8 md:py-12">
    <nav class="text-xs text-brand-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-brand">Beranda</NuxtLink> ›
      <NuxtLink to="/blog" class="hover:text-brand">Blog</NuxtLink>
      <template v-if="post.category"> › <NuxtLink :to="`/blog/kategori/${post.category_slug}`" class="hover:text-brand">{{ post.category.name }}</NuxtLink></template>
    </nav>

    <div class="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article class="min-w-0">
        <header>
          <NuxtLink v-if="post.category" :to="`/blog/kategori/${post.category_slug}`" class="chip bg-clay-50 text-clay-700">{{ post.category.name }}</NuxtLink>
          <h1 class="mt-3 font-display text-3xl leading-tight text-brand md:text-[2.6rem]">{{ post.title }}</h1>
          <p v-if="post.excerpt" class="mt-3 text-lg leading-relaxed text-brand-700">{{ post.excerpt }}</p>
          <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-brand-100 py-3 text-xs text-brand-600">
            <span v-if="post.author">Ditulis oleh <NuxtLink :to="`/blog/penulis/${post.author.slug}`" rel="author" class="font-semibold text-brand hover:underline">{{ post.author.name }}</NuxtLink></span>
            <span v-if="post.editor && post.editor.id !== post.author?.id">Disunting oleh <NuxtLink :to="`/blog/penulis/${post.editor.slug}`" class="font-semibold text-brand hover:underline">{{ post.editor.name }}</NuxtLink></span>
            <span>Terbit <time :datetime="post.published_at">{{ blogDate(post.published_at) }}</time></span>
            <span v-if="updated">Diperbarui <time :datetime="post.content_updated_at">{{ blogDate(post.content_updated_at) }}</time></span>
            <span>{{ post.reading_minutes }} menit baca</span>
          </div>
        </header>

        <details v-if="toc.length >= 3" class="mt-6 rounded-2xl bg-white p-4 ring-1 ring-brand-100 lg:hidden" open>
          <summary class="cursor-pointer text-sm font-semibold text-brand">Daftar isi</summary>
          <ol class="mt-2 grid list-decimal gap-1.5 pl-5 text-sm text-brand-700">
            <li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`" class="hover:text-clay-700">{{ t.text }}</a></li>
          </ol>
        </details>

        <div class="prose-page mt-6 text-base" v-html="article.html" />

        <section v-if="post.faq.length" class="mt-10" aria-labelledby="faq">
          <h2 id="faq" class="font-display text-2xl text-brand">Pertanyaan yang Sering Diajukan</h2>
          <div class="mt-4 grid gap-3">
            <details v-for="(f, i) in post.faq" :key="i" class="rounded-2xl bg-white p-4 ring-1 ring-brand-100" :open="i === 0">
              <summary class="cursor-pointer font-semibold text-brand-900">{{ f.q }}</summary>
              <p class="mt-2 text-sm leading-relaxed text-brand-700">{{ f.a }}</p>
            </details>
          </div>
        </section>

        <section v-if="sources.length" class="mt-10 rounded-2xl bg-brand-50 p-5" aria-labelledby="referensi">
          <h2 id="referensi" class="text-sm font-semibold text-brand">Referensi</h2>
          <ol class="mt-2 grid list-decimal gap-1 pl-5 text-sm text-brand-700">
            <li v-for="s in sources" :key="s.url"><a :href="s.url" target="_blank" rel="noopener" class="underline hover:text-clay-700">{{ s.title }}</a></li>
          </ol>
        </section>

        <div v-if="post.tags.length" class="mt-8 flex flex-wrap gap-2">
          <span v-for="t in post.tags" :key="t" class="chip bg-white text-brand-600 ring-1 ring-brand-100">#{{ t }}</span>
        </div>

        <!-- Di layar besar tombol bagikan ada di sidebar -->
        <div class="mt-8 flex flex-wrap items-center gap-3 lg:hidden">
          <p class="text-sm font-semibold text-brand">Bagikan artikel ini</p>
          <BlogShare :url="url" :title="post.title" />
        </div>

        <!-- CTA konversi -->
        <section class="mt-10 overflow-hidden rounded-3xl bg-brand p-6 text-white md:p-8">
          <p class="text-xs font-semibold uppercase tracking-widest text-clay-200">{{ BRAND.name }}</p>
          <h2 class="mt-2 font-display text-2xl md:text-3xl">Buat undangan digital Anda hari ini</h2>
          <p class="mt-2 max-w-xl text-sm text-brand-100">Puluhan tema syar'i & modern, musik latar, RSVP, amplop digital, dan link personal untuk setiap tamu — cukup isi dari ponsel.</p>
          <div class="mt-5 flex flex-wrap gap-3">
            <NuxtLink to="/katalog" class="btn-accent">Lihat Katalog Tema</NuxtLink>
            <NuxtLink to="/#harga" class="btn bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">Cek Harga</NuxtLink>
          </div>
        </section>

        <div v-if="post.author" class="card mt-8 flex gap-4 p-5">
          <div class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-semibold text-white">{{ post.author.name.charAt(0) }}</div>
          <div class="text-sm">
            <p class="text-xs text-brand-500">Tentang penulis</p>
            <NuxtLink :to="`/blog/penulis/${post.author.slug}`" class="font-semibold text-brand hover:underline">{{ post.author.name }}</NuxtLink>
            <span v-if="post.author.job_title" class="text-brand-500"> · {{ post.author.job_title }}</span>
            <p v-if="post.author.bio" class="mt-1 leading-relaxed text-brand-700">{{ post.author.bio }}</p>
          </div>
        </div>

        <nav v-if="more?.prev || more?.next" class="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Artikel lain">
          <NuxtLink v-if="more?.prev" :to="`/blog/${more.prev.slug}`" class="card p-4 text-sm hover:bg-brand-50">
            <span class="text-xs text-brand-500">← Sebelumnya</span><span class="mt-1 block font-semibold text-brand">{{ more.prev.title }}</span>
          </NuxtLink>
          <span v-else />
          <NuxtLink v-if="more?.next" :to="`/blog/${more.next.slug}`" class="card p-4 text-right text-sm hover:bg-brand-50">
            <span class="text-xs text-brand-500">Berikutnya →</span><span class="mt-1 block font-semibold text-brand">{{ more.next.title }}</span>
          </NuxtLink>
        </nav>
      </article>

      <aside class="hidden lg:block">
        <div class="sticky top-24 grid gap-5">
          <nav v-if="toc.length" class="card p-4" aria-label="Daftar isi">
            <p class="text-sm font-semibold text-brand">Daftar isi</p>
            <ol class="mt-2 grid gap-1.5 text-sm text-brand-700">
              <li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`" class="hover:text-clay-700">{{ t.text }}</a></li>
              <li v-if="post.faq.length"><a href="#faq" class="hover:text-clay-700">Pertanyaan yang Sering Diajukan</a></li>
            </ol>
          </nav>
          <div class="card p-4 text-sm">
            <p class="font-semibold text-brand">Bagikan</p>
            <BlogShare class="mt-3" :url="url" :title="post.title" />
          </div>
        </div>
      </aside>
    </div>

    <section v-if="more?.related.length" class="mt-14" aria-labelledby="terkait">
      <h2 id="terkait" class="font-display text-2xl text-brand">Artikel terkait</h2>
      <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard v-for="p in more.related" :key="p.slug" :post="p" />
      </div>
    </section>
  </div>
</template>
