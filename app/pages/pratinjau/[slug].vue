<script setup lang="ts">
/** Pratinjau layar penuh: tema tampil persis seperti undangan asli yang dibuka tamu (data & foto contoh). */
definePageMeta({ layout: false })

const route = useRoute()
const { data } = await useCatalog()
const theme = computed(() => data.value?.themes.find(t => t.slug === route.params.slug))
if (!theme.value) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan', fatal: true })

useSeoMeta({
  title: () => `Pratinjau ${theme.value?.name}`,
  robots: 'noindex, nofollow',
})
useHead({ meta: [{ name: 'theme-color', content: theme.value.definition.globals.background_color }] })
</script>

<template>
  <div v-if="theme" class="min-h-screen" :style="{ background: theme.definition.globals.background_color }">
    <InviteRenderer
      :definition="theme.definition"
      :css="theme.compiled_css"
      :theme-slug="theme.slug"
      :theme-music="theme.music_url"
      guest-name="Bapak Fulan & Keluarga"
      mode="page"
      preview
    />
    <!-- Kontrol mengambang di atas sampul (z-50) -->
    <div class="fixed left-1/2 top-3 z-[60] flex w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 items-center justify-between gap-2">
      <NuxtLink :to="`/tema/${theme.slug}`" class="rounded-full bg-black/55 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md">
        ← {{ theme.name }}
      </NuxtLink>
      <span class="rounded-full bg-black/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">Pratinjau</span>
    </div>
  </div>
</template>
