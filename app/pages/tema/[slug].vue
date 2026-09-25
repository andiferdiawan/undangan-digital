<script setup lang="ts">
const route = useRoute()
const { data } = await useCatalog()
const theme = computed(() => data.value?.themes.find(t => t.slug === route.params.slug))
if (!theme.value) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan', fatal: true })

const category = computed(() => data.value?.categories.find(c => c.id === theme.value?.category_id))
const ordering = ref(false)
const frameKey = ref(0)

const desc = computed(() => `Tema undangan pernikahan digital ${theme.value?.name}${category.value ? ` (${category.value.name})` : ''}. ${theme.value?.description ?? ''} Lihat preview langsung, isi sendiri dari ponsel, dan bagikan link personal ke setiap tamu.`.replace(/\s+/g, ' ').trim())
useSeoMeta({
  title: () => `Tema ${theme.value?.name}${category.value ? ` — Undangan ${category.value.name}` : ''}`,
  description: desc,
  ogTitle: () => `Tema Undangan ${theme.value?.name} · ${BRAND.name}`,
  ogDescription: desc,
})
const origin = useSiteOrigin()
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
        { '@type': 'ListItem', 'position': 2, 'name': 'Katalog Tema', 'item': `${origin}/#katalog` },
        { '@type': 'ListItem', 'position': 3, 'name': theme.value.name, 'item': `${origin}/tema/${theme.value.slug}` },
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
      <p class="mt-3 text-center text-xs text-brand-500">
        Data di atas contoh.
        <button class="underline" @click="frameKey++">Ulangi dari sampul</button>
      </p>
    </div>

    <div class="md:order-1 md:pt-10">
      <NuxtLink to="/#katalog" class="text-sm text-brand-600 hover:text-brand">← Kembali ke katalog</NuxtLink>
      <p class="mt-6 text-xs font-semibold uppercase tracking-wider text-clay-600">{{ category?.name }} · {{ theme.code }}</p>
      <h1 class="mt-1 font-display text-4xl text-brand">{{ theme.name }}</h1>
      <p class="mt-1 text-sm text-brand-500">Tema undangan pernikahan digital{{ category ? ` ${category.name.toLowerCase()}` : '' }}</p>
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

      <button class="btn-accent mt-8 w-full md:w-auto" @click="ordering = true">Pesan Tema Ini</button>
    </div>

    <OrderSheet :theme="ordering ? theme : null" :packages="data?.packages ?? []" @close="ordering = false" />
  </div>
</template>
