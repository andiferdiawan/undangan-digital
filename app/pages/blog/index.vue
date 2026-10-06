<script setup lang="ts">
const route = useRoute()
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.halaman ?? '1')) || 1))
const { data } = await useBlogList({ page })
if (page.value > 1 && !data.value?.posts.length) throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })

const origin = useSiteOrigin()
const title = computed(() => `Blog Undangan Digital: Inspirasi, Contoh Kata & Tips Acara${page.value > 1 ? ` — Halaman ${page.value}` : ''}`)
const description = 'Kumpulan artikel seputar undangan pernikahan, undangan digital, persiapan nikah, adat & budaya, serta acara keluarga dan resmi: contoh kata-kata, etika, dan tips praktis.'
useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'website' })
useHead({ link: [{ rel: 'alternate', type: 'application/rss+xml', title: `Blog ${BRAND.name}`, href: `${origin}/blog/rss.xml` }] })
useJsonLd('blog', () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': `${origin}/blog#blog`,
      'name': `Blog ${BRAND.name}`,
      'description': description,
      'url': `${origin}/blog`,
      'inLanguage': 'id-ID',
      'publisher': { '@type': 'Organization', 'name': BRAND.name, 'url': `${origin}/`, 'logo': { '@type': 'ImageObject', 'url': `${origin}/icon-512.png` } },
      'blogPost': (data.value?.posts ?? []).map(p => ({ '@type': 'BlogPosting', 'headline': p.title, 'url': `${origin}/blog/${p.slug}`, 'datePublished': p.published_at })),
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': `${origin}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${origin}/blog` },
      ],
    },
  ],
}))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="text-xs text-brand-500" aria-label="Breadcrumb"><NuxtLink to="/" class="hover:text-brand">Beranda</NuxtLink> › <span>Blog</span></nav>
    <h1 class="mt-3 font-display text-3xl text-brand md:text-4xl">Blog Undangan & Inspirasi Acara</h1>
    <p class="mt-2 max-w-2xl text-brand-700">Contoh kata-kata undangan, etika mengundang, panduan persiapan nikah, adat & budaya, hingga tips acara keluarga dan resmi.</p>
    <div class="mt-6">
      <BlogListing :posts="data?.posts ?? []" :total="data?.total ?? 0" :page="page" base-path="/blog" />
    </div>
  </div>
</template>
