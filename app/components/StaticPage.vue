<script setup lang="ts">
/** Halaman statis (Tentang Kami, Kebijakan Privasi, dll.) dari tabel `pages`, diedit admin. */
const props = defineProps<{ slug: string }>()
const supabase = useSupabaseClient()

const { data: page } = await useAsyncData(`page-${props.slug}`, async () => {
  const { data } = await supabase.from('pages').select('slug, title, description, body, updated_at').eq('slug', props.slug).eq('is_published', true).maybeSingle()
  return data as { slug: string, title: string, description: string | null, body: string, updated_at: string } | null
})
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })

useSeoMeta({
  title: () => page.value?.title ?? '',
  description: () => page.value?.description || undefined,
  ogTitle: () => `${page.value?.title} · ${BRAND.name}`,
  ogDescription: () => page.value?.description || undefined,
})
const html = computed(() => renderMarkdown(page.value?.body ?? ''))

const links = [
  { to: '/tentang-kami', label: 'Tentang Kami' },
  { to: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
  { to: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
  { to: '/kebijakan-pengembalian', label: 'Kebijakan Pengembalian Dana' },
  { to: '/kontak', label: 'Kontak' },
]
</script>

<template>
  <div v-if="page" class="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
    <nav class="order-2 md:order-1" aria-label="Informasi">
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Informasi</p>
      <ul class="mt-3 grid gap-1 text-sm">
        <li v-for="l in links" :key="l.to">
          <NuxtLink :to="l.to" class="block rounded-lg px-3 py-2 text-brand-700 hover:bg-brand-50" :class="{ 'bg-brand-50 font-semibold text-brand': l.to === `/${slug}` }">{{ l.label }}</NuxtLink>
        </li>
      </ul>
    </nav>
    <article class="order-1 md:order-2">
      <h1 class="font-display text-4xl text-brand">{{ page.title }}</h1>
      <p class="mt-2 text-xs text-brand-500">Terakhir diperbarui {{ tanggal(page.updated_at) }}</p>
      <!-- Aman: renderMarkdown meng-escape seluruh HTML dan hanya membuat tag yang diizinkan -->
      <div class="prose-page mt-6" v-html="html" />
    </article>
  </div>
</template>

