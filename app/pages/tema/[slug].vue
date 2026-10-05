<script setup lang="ts">
import type { CatalogTheme } from '~/composables/useCatalog'

const route = useRoute()
const [{ data }, { data: theme }] = await Promise.all([useCatalog(), useTheme(String(route.params.slug))])
if (!theme.value) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan', fatal: true })

const category = computed(() => data.value?.categories.find(c => c.id === theme.value?.category_id))
const groupSlug = computed(() => groupOfCategory(data.value?.categories ?? [], theme.value?.category_id ?? null))
const group = computed(() => data.value?.groups.find(g => g.slug === groupSlug.value))
const ordering = ref(false)
const relatedOrder = ref<CatalogTheme | null>(null)

// Tema lain dalam kategori yang sama (lalu jenis acara yang sama) — tautan internal untuk tamu & mesin pencari
const supabase = useSupabaseClient()
const { data: related } = await useAsyncData(`related-${route.params.slug}`, () => {
  const all = data.value?.themes ?? []
  const cats = data.value?.categories ?? []
  const others = all.filter(t => t.slug !== theme.value?.slug)
  const same = others.filter(t => t.category_id === theme.value?.category_id)
  const sameGroup = others.filter(t => t.category_id !== theme.value?.category_id && groupOfCategory(cats, t.category_id) === groupSlug.value)
  return fetchThemesByIds(supabase, [...same, ...sameGroup].slice(0, 4).map(t => t.id))
})
const frameKey = ref(0)

const desc = computed(() => `Tema undangan ${(group.value?.name ?? 'pernikahan').toLowerCase()} digital ${theme.value?.name}${category.value ? ` (${category.value.name})` : ''}. ${theme.value?.description ?? ''} Lihat preview langsung, isi sendiri dari ponsel, dan bagikan link personal ke setiap tamu.`.replace(/\s+/g, ' ').trim())
const origin = useSiteOrigin()
useSeoMeta({
  title: () => `Tema ${theme.value?.name}${category.value ? ` — Undangan ${category.value.name}` : ''}`,
  description: desc,
  ogTitle: () => `Tema Undangan ${theme.value?.name} · ${BRAND.name}`,
  ogDescription: desc,
  ogImage: () => `${origin}/og/tema/${theme.value?.slug}.png?v=brand1`,
  twitterCard: 'summary_large_image',
})
useJsonLd('theme', () => !theme.value ? null : ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      'name': `Undangan Digital ${theme.value.name}`,
      'sku': theme.value.code,
      'description': desc.value,
      'category': category.value?.name,
      'brand': { '@type': 'Brand', 'name': BRAND.name },
      'image': `${origin}/og-image.png`,
      'url': `${origin}/tema/${theme.value.slug}`,
      'offers': data.value?.packages.length
        ? {
            '@type': 'AggregateOffer',
            'priceCurrency': 'IDR',
            'lowPrice': Math.min(...data.value.packages.map(p => p.price)),
            'highPrice': Math.max(...data.value.packages.map(p => p.price)),
            'offerCount': data.value.packages.length,
            'availability': 'https://schema.org/InStock',
          }
        : undefined,
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': `${origin}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Katalog Tema', 'item': `${origin}/katalog` },
        ...(group.value ? [{ '@type': 'ListItem', 'position': 3, 'name': `Undangan ${group.value.name}`, 'item': `${origin}/katalog/${group.value.slug}` }] : []),
        ...(group.value && category.value ? [{ '@type': 'ListItem', 'position': 4, 'name': category.value.name, 'item': `${origin}/katalog/${group.value.slug}/${category.value.slug}` }] : []),
        { '@type': 'ListItem', 'position': group.value ? (category.value ? 5 : 4) : 3, 'name': theme.value.name, 'item': `${origin}/tema/${theme.value.slug}` },
      ],
    },
  ],
}))
</script>

<template>
  <div v-if="theme" class="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1fr_auto] md:py-12">
    <div class="md:order-2">
      <PhoneFrame :key="frameKey">
        <InviteRenderer :definition="theme.definition" :css="theme.compiled_css" :theme-slug="theme.slug" :theme-music="theme.music_url" guest-name="Bapak Fulan & Keluarga" mode="frame" preview />
      </PhoneFrame>
      <div class="mt-3 flex items-center justify-center gap-3">
        <NuxtLink :to="`/pratinjau/${theme.slug}`" class="btn-primary btn-sm">⛶ Lihat Layar Penuh</NuxtLink>
        <button class="btn-ghost btn-sm" @click="frameKey++">↺ Ulangi dari sampul</button>
      </div>
      <p class="mt-2 text-center text-xs text-brand-500">Data & foto di atas hanya contoh.</p>
    </div>

    <div class="md:order-1 md:pt-10">
      <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-sm text-brand-500">
        <NuxtLink to="/katalog" class="hover:text-brand">Katalog</NuxtLink>
        <template v-if="group">
          <span aria-hidden="true">›</span>
          <NuxtLink :to="`/katalog/${group.slug}`" class="hover:text-brand">{{ group.name }}</NuxtLink>
        </template>
        <template v-if="group && category">
          <span aria-hidden="true">›</span>
          <NuxtLink :to="`/katalog/${group.slug}/${category.slug}`" class="hover:text-brand">{{ category.name }}</NuxtLink>
        </template>
      </nav>
      <p class="mt-6 text-xs font-semibold uppercase tracking-wider text-clay-600">{{ category?.name }} · {{ theme.code }}</p>
      <h1 class="mt-1 font-display text-4xl text-brand">{{ theme.name }}</h1>
      <p class="mt-1 text-sm text-brand-500">Tema undangan {{ (group?.name ?? 'pernikahan').toLowerCase() }} digital{{ category ? ` · ${category.name}` : '' }}</p>
      <p class="mt-3 max-w-md text-brand-600">{{ theme.description }}</p>

      <div class="mt-6 flex flex-wrap gap-2">
        <span v-for="c in ['primary_color', 'secondary_color', 'accent_color', 'background_color']" :key="c" class="h-8 w-8 rounded-full ring-2 ring-white shadow" :style="{ background: (theme.definition.globals as any)[c] }" />
      </div>
      <p class="mt-2 text-xs text-brand-500">Font: {{ theme.definition.globals.font_heading }} · {{ theme.definition.globals.font_body }} · {{ theme.definition.globals.font_script }}</p>

      <ul class="mt-6 grid gap-2 text-sm text-brand-700">
        <li>✓ Warna & font bisa disesuaikan dari dashboard</li>
        <li>✓ Section: {{ theme.definition.sections.map(s => s.type).join(', ') }}</li>
        <li>✓ Link personal untuk setiap tamu</li>
        <li>✓ Musik latar: {{ theme.music_url ? 'sudah termasuk, bisa diganti lagu pilihan Anda' : 'unggah lagu pilihan Anda' }}</li>
      </ul>

      <div class="mt-8 flex flex-wrap gap-2">
        <button class="btn-accent w-full md:w-auto" @click="ordering = true">Pesan Tema Ini</button>
        <NuxtLink :to="`/pratinjau/${theme.slug}`" class="btn-ghost w-full md:w-auto">Lihat seperti tamu (layar penuh)</NuxtLink>
        <LikeButton :theme-id="theme.id" :theme-name="theme.name" variant="inline" />
      </div>
    </div>

    <section v-if="related?.length" class="md:order-3 md:col-span-2" aria-labelledby="tema-lain">
      <div class="flex items-end justify-between gap-3">
        <h2 id="tema-lain" class="font-display text-2xl text-brand">Tema {{ group?.name ?? '' }} lainnya</h2>
        <NuxtLink v-if="group" :to="category ? `/katalog/${group.slug}/${category.slug}` : `/katalog/${group.slug}`" class="shrink-0 text-sm font-semibold text-clay-700 hover:underline">Lihat semua →</NuxtLink>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        <ThemeCard v-for="t in related" :key="t.id" :theme="t" :category-name="data?.categories.find(c => c.id === t.category_id)?.name ?? ''" @order="ordering = true; relatedOrder = t" />
      </div>
    </section>

    <OrderSheet :theme="ordering ? (relatedOrder ?? theme) : null" :packages="data?.packages ?? []" @close="ordering = false; relatedOrder = null" />
  </div>
</template>
