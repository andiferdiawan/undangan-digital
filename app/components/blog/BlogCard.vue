<script setup lang="ts">
import type { BlogSummary } from '~/composables/useBlog'

defineProps<{ post: BlogSummary }>()
</script>

<template>
  <article class="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="flex flex-wrap items-center gap-2 text-xs text-brand-500">
      <NuxtLink v-if="post.category" :to="`/blog/kategori/${post.category_slug}`" class="chip bg-clay-50 text-clay-700 hover:bg-clay-100">{{ post.category.name }}</NuxtLink>
      <time :datetime="post.published_at">{{ blogDate(post.published_at) }}</time>
      <span>· {{ post.reading_minutes }} menit baca</span>
    </div>
    <h2 class="mt-3 font-display text-xl leading-snug text-brand">
      <NuxtLink :to="`/blog/${post.slug}`" class="hover:text-clay-700">{{ post.title }}</NuxtLink>
    </h2>
    <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-700">{{ post.excerpt }}</p>
    <NuxtLink :to="`/blog/${post.slug}`" class="mt-auto pt-4 text-sm font-semibold text-clay-700" :aria-label="`Baca: ${post.title}`">Baca selengkapnya →</NuxtLink>
  </article>
</template>
