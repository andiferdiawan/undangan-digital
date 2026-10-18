<script setup lang="ts">
const route = useRoute()
const origin = useSiteOrigin()

// URL kanonik tanpa query/hash, agar ?ref= atau ?kategori= tidak dianggap halaman ganda.
// Pengecualian: halaman katalog berpaginasi (?halaman=N) punya kanonik sendiri per halaman.
const canonical = computed(() => {
  const base = `${origin}${route.path === '/' ? '' : route.path.replace(/\/$/, '')}` || origin
  const page = Number.parseInt(String(route.query.halaman ?? '')) || 1
  return (route.path.startsWith('/katalog') || route.path.startsWith('/blog')) && page > 1 ? `${base}?halaman=${page}` : base
})
const noindex = computed(() => NOINDEX_PREFIXES.some(p => route.path === p || route.path.startsWith(p.endsWith('/') ? p : `${p}/`)))

// Google tag (gtag.js) dari Admin → Pengaturan, dipasang di <head> semua halaman kecuali admin.
// Gagal dibaca (mis. kolom belum ada) → tanpa tag, halaman tetap jalan.
const { data: googleTag } = await useAsyncData('google-tag', async () => {
  const { data, error } = await useSupabaseClient().from('app_settings').select('google_tag_ids, google_ads_purchase').maybeSingle()
  return error ? null : (data as GoogleTagSettings | null)
})
const tagIds = computed(() => (isGoogleTagExcluded(route.path) ? [] : activeTagIds(googleTag.value)))
useHead(() => ({
  script: tagIds.value.length
    ? [
        { key: 'gtag-js', src: `https://www.googletagmanager.com/gtag/js?id=${tagIds.value[0]}`, async: true },
        { key: 'gtag-init', innerHTML: gtagInline(tagIds.value) },
      ]
    : [],
}))

useHead({
  titleTemplate: t => (t ? `${t} · ${BRAND.name}` : `${BRAND.name} — ${BRAND.tagline}`),
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ name: 'keywords', content: BRAND.keywords }],
})
useSeoMeta({
  description: BRAND.description,
  applicationName: BRAND.name,
  ogSiteName: BRAND.name,
  ogType: 'website',
  ogLocale: 'id_ID',
  ogUrl: canonical,
  ogImage: `${origin}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${BRAND.name} — ${BRAND.tagline}`,
  twitterCard: 'summary_large_image',
  twitterImage: `${origin}/og-image.png`,
  robots: () => (noindex.value ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
