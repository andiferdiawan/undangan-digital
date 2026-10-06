<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.halaman ?? '1')) || 1))
const { data: categories } = await useBlogCategories()
const cat = computed(() => categories.value?.find(c => c.slug === slug))
if (!cat.value) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan', fatal: true })
const { data } = await useBlogList({ page, category: slug })
if (page.value > 1 && !data.value?.posts.length) throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })

const origin = useSiteOrigin()
const title = computed(() => `${cat.value?.name}: Artikel & Inspirasi${page.value > 1 ? ` — Halaman ${page.value}` : ''}`)
const description = computed(() => cat.value?.description || `Kumpulan artikel ${cat.value?.name} dari ${BRAND.name}.`)
useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
useJsonLd('blog-cat', () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      'name': cat.value?.name,
      'description': description.value,
      'url': `${origin}/blog/kategori/${slug}`,
      'inLanguage': 'id-ID',
      'isPartOf': { '@id': `${origin}/blog#blog` },
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': `${origin}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${origin}/blog` },
        { '@type': 'ListItem', 'position': 3, 'name': cat.value?.name, 'item': `${origin}/blog/kategori/${slug}` },
      ],
    },
  ],
}))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="text-xs text-brand-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-brand">Beranda</NuxtLink> › <NuxtLink to="/blog" class="hover:text-brand">Blog</NuxtLink> › <span>{{ cat?.name }}</span>
    </nav>
    <h1 class="mt-3 font-display text-3xl text-brand md:text-4xl">{{ cat?.name }}</h1>
    <p v-if="cat?.description" class="mt-2 max-w-2xl text-brand-700">{{ cat.description }}</p>
    <div class="mt-6">
      <BlogListing :posts="data?.posts ?? []" :total="data?.total ?? 0" :page="page" :base-path="`/blog/kategori/${slug}`" :active="slug" />
    </div>
  </div>
</template>
