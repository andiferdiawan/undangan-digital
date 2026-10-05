<script setup lang="ts">
import type { CatalogTheme } from '~/composables/useCatalog'

useSeoMeta({ title: 'Tema Favorit', robots: 'noindex, follow' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { liked, ready } = useThemeLikes()
const { data: cat } = await useCatalog()

// Tema yang sudah dimuat; yang baru disukai dimuat menyusul, yang batal disukai cukup disembunyikan
const loaded = ref<CatalogTheme[]>([])
const loading = ref(true)
watch([liked, ready], async () => {
  if (!ready.value) return
  const missing = liked.value.filter(id => !loaded.value.some(t => t.id === id))
  if (missing.length) loaded.value = [...loaded.value, ...await fetchThemesByIds(supabase, missing)]
  loading.value = false
}, { immediate: true })

// Terbaru disukai tampil paling depan
const themes = computed(() => [...liked.value].reverse()
  .map(id => loaded.value.find(t => t.id === id))
  .filter((t): t is CatalogTheme => !!t))

const catName = (id: number | null) => cat.value?.categories.find(c => c.id === id)?.name
const ordering = ref<CatalogTheme | null>(null)
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="text-xs text-brand-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:underline">Beranda</NuxtLink> / <span>Tema Favorit</span>
    </nav>
    <h1 class="mt-2 font-display text-4xl text-brand">Tema Favorit</h1>
    <p class="mt-2 max-w-2xl text-sm text-brand-600">Tema yang Anda tandai dengan ikon hati. Bandingkan dengan tenang, lalu pesan yang paling cocok untuk acara Anda.</p>

    <div v-if="ready && !user" class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-brand-700">
      <p>Favorit ini tersimpan di perangkat ini saja. Masuk agar tersimpan di akun dan bisa dibuka dari perangkat lain.</p>
      <NuxtLink to="/masuk" class="btn-primary btn-sm">Masuk</NuxtLink>
    </div>

    <div v-if="!ready || loading" class="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3" aria-busy="true">
      <div v-for="i in 3" :key="i" class="card aspect-[3/4] animate-pulse bg-brand-50" />
    </div>
    <div v-else-if="themes.length" class="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
      <ThemeCard v-for="t in themes" :key="t.id" :theme="t" :category-name="catName(t.category_id)" @order="ordering = t" />
    </div>
    <div v-else class="card mt-8 grid place-items-center gap-3 p-10 text-center">
      <svg viewBox="0 0 24 24" class="h-10 w-10 text-[#d9475f]" aria-hidden="true"><path d="M12 20.5s-7.3-4.4-9.7-9C.7 8.4 2.6 4.5 6.3 4.5c2.1 0 3.6 1.2 4.5 2.5L12 8.6l1.2-1.6c.9-1.3 2.4-2.5 4.5-2.5 3.7 0 5.6 3.9 4 7-2.4 4.6-9.7 9-9.7 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
      <h2 class="font-display text-2xl text-brand">Belum ada tema favorit</h2>
      <p class="max-w-md text-sm text-brand-600">Tekan ikon hati pada tema yang Anda suka di katalog, nanti semuanya terkumpul di sini.</p>
      <NuxtLink to="/katalog" class="btn-accent">Jelajahi Katalog</NuxtLink>
    </div>

    <OrderSheet :theme="ordering" :packages="cat?.packages ?? []" @close="ordering = null" />
  </div>
</template>
