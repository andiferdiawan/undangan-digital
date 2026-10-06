<script setup lang="ts">
import type { BlogAuthor } from '~/composables/useBlog'

const route = useRoute()
const slug = String(route.params.slug)
const supabase = useSupabaseClient()
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.halaman ?? '1')) || 1))
const { data: author } = await useAsyncData(`blog-author-${slug}`, async () => {
  const { data } = await supabase.from('blog_authors').select('*').eq('slug', slug).maybeSingle()
  return data as BlogAuthor | null
})
if (!author.value) throw createError({ statusCode: 404, statusMessage: 'Penulis tidak ditemukan', fatal: true })
const { data } = await useBlogList({ page, authorId: author.value.id })

const origin = useSiteOrigin()
const url = `${origin}/blog/penulis/${slug}`
const description = computed(() => author.value?.bio || `Artikel yang ditulis oleh ${author.value?.name} di blog ${BRAND.name}.`)
useSeoMeta({ title: () => `${author.value?.name} — Penulis`, description, ogType: 'profile' })
useJsonLd('blog-author', () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  'url': url,
  'mainEntity': {
    '@type': 'Person',
    '@id': `${url}#person`,
    'name': author.value?.name,
    'jobTitle': author.value?.job_title || undefined,
    'description': author.value?.bio || undefined,
    'url': url,
    'sameAs': author.value?.same_as.length ? author.value.same_as : undefined,
    'worksFor': { '@type': 'Organization', 'name': BRAND.name, 'url': `${origin}/` },
  },
}))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="text-xs text-brand-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-brand">Beranda</NuxtLink> › <NuxtLink to="/blog" class="hover:text-brand">Blog</NuxtLink> › <span>Penulis</span>
    </nav>
    <div class="card mt-4 flex gap-4 p-5">
      <div class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-xl font-semibold text-white">{{ author?.name.charAt(0) }}</div>
      <div>
        <h1 class="font-display text-2xl text-brand">{{ author?.name }}</h1>
        <p v-if="author?.job_title" class="text-sm text-brand-600">{{ author.job_title }} · {{ BRAND.name }}</p>
        <p v-if="author?.bio" class="mt-2 text-sm leading-relaxed text-brand-700">{{ author.bio }}</p>
        <p v-if="author?.same_as.length" class="mt-2 flex flex-wrap gap-3 text-xs">
          <a v-for="u in author.same_as" :key="u" :href="u" target="_blank" rel="noopener me" class="text-clay-700 underline">{{ u.replace(/^https:\/\/(www\.)?/, '') }}</a>
        </p>
      </div>
    </div>
    <h2 class="mt-8 font-semibold text-brand">Artikel oleh {{ author?.name }}</h2>
    <div class="mt-4">
      <BlogListing :posts="data?.posts ?? []" :total="data?.total ?? 0" :page="page" :base-path="`/blog/penulis/${slug}`" />
    </div>
  </div>
</template>
