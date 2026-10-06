<script setup lang="ts">
import type { BlogSummary } from '~/composables/useBlog'

/** Grid artikel + navigasi kategori + pagination (?halaman=N, tautan rel prev/next). */
const props = defineProps<{ posts: BlogSummary[], total: number, page: number, basePath: string, active?: string }>()
const { data: categories } = await useBlogCategories()
const pages = computed(() => Math.max(1, Math.ceil(props.total / BLOG_PER_PAGE)))
const href = (n: number) => (n <= 1 ? props.basePath : `${props.basePath}?halaman=${n}`)
const origin = useSiteOrigin()
useHead(() => ({
  link: [
    ...(props.page > 1 ? [{ rel: 'prev' as const, href: `${origin}${href(props.page - 1)}` }] : []),
    ...(props.page < pages.value ? [{ rel: 'next' as const, href: `${origin}${href(props.page + 1)}` }] : []),
  ],
}))
</script>

<template>
  <div>
    <nav class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Kategori blog">
      <NuxtLink to="/blog" class="chip shrink-0 ring-1" :class="!active ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100 hover:bg-brand-50'">Semua</NuxtLink>
      <NuxtLink
        v-for="c in categories" :key="c.slug" :to="`/blog/kategori/${c.slug}`"
        class="chip shrink-0 ring-1" :class="active === c.slug ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100 hover:bg-brand-50'"
      >
        {{ c.name }}
      </NuxtLink>
    </nav>
    <div v-if="posts.length" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <BlogCard v-for="p in posts" :key="p.slug" :post="p" />
    </div>
    <p v-else class="mt-10 text-center text-brand-500">Belum ada artikel di sini. Segera hadir!</p>
    <nav v-if="pages > 1" class="mt-8 flex flex-wrap justify-center gap-2" aria-label="Halaman">
      <NuxtLink
        v-for="n in pages" :key="n" :to="href(n)"
        class="grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold ring-1"
        :class="n === page ? 'bg-brand text-white ring-brand' : 'bg-white text-brand ring-brand-100 hover:bg-brand-50'"
        :aria-current="n === page ? 'page' : undefined"
      >
        {{ n }}
      </NuxtLink>
    </nav>
  </div>
</template>
