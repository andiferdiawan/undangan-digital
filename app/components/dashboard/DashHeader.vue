<script setup lang="ts">
const props = defineProps<{ id: string, slug: string, themeName: string }>()
const route = useRoute()
const tabs = computed(() => [
  { to: `/dashboard/${props.id}`, label: 'Editor' },
  { to: `/dashboard/${props.id}/tamu`, label: 'Buku Tamu' },
  { to: `/dashboard/${props.id}/rsvp`, label: 'RSVP & Ucapan' },
])
const url = computed(() => inviteUrl(props.slug))
</script>

<template>
  <div class="border-b border-brand-100 bg-white">
    <div class="mx-auto max-w-6xl px-4 pt-4">
      <NuxtLink to="/dashboard" class="text-xs text-brand-500 hover:text-brand">← Semua undangan</NuxtLink>
      <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0">
          <h1 class="truncate font-display text-2xl text-brand">/{{ slug }}</h1>
          <p class="text-xs text-brand-500">Tema {{ themeName }}</p>
        </div>
        <a :href="url" target="_blank" rel="noopener" class="btn-ghost btn-sm">Buka undangan ↗</a>
      </div>
      <nav class="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
        <NuxtLink
          v-for="t in tabs" :key="t.to" :to="t.to"
          class="shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition"
          :class="route.path === t.to ? 'border-clay text-brand' : 'border-transparent text-brand-500 hover:text-brand'"
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
