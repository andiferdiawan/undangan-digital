<script setup lang="ts">
const route = useRoute()
const origin = useSiteOrigin()

// URL kanonik tanpa query/hash, agar ?ref= atau ?kategori= tidak dianggap halaman ganda
const canonical = computed(() => `${origin}${route.path === '/' ? '' : route.path.replace(/\/$/, '')}` || origin)
const noindex = computed(() => NOINDEX_PREFIXES.some(p => route.path === p || route.path.startsWith(p.endsWith('/') ? p : `${p}/`)))

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
