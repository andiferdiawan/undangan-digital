<script setup lang="ts">
import type { CatalogTheme } from '~/composables/useCatalog'

defineProps<{ theme: CatalogTheme, categoryName?: string }>()
defineEmits<{ order: [] }>()
</script>

<template>
  <article class="card group overflow-hidden">
    <NuxtLink :to="`/tema/${theme.slug}`" class="block">
      <ThemeThumb :definition="theme.definition" :css="theme.compiled_css" :slug="theme.slug" />
      <span class="sr-only">Preview tema undangan {{ theme.name }}</span>
    </NuxtLink>
    <div class="p-3 sm:p-4">
      <div class="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span class="truncate text-clay-600">{{ categoryName }}</span>
        <span class="shrink-0 text-brand-400">{{ theme.code }}</span>
      </div>
      <h3 class="mt-1 truncate font-semibold text-brand-900">
        <NuxtLink :to="`/tema/${theme.slug}`" class="hover:underline">{{ theme.name }}</NuxtLink>
      </h3>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <NuxtLink :to="`/tema/${theme.slug}`" class="btn-ghost btn-sm px-2">Preview</NuxtLink>
        <button type="button" class="btn-accent btn-sm px-2" @click="$emit('order')">Pesan</button>
      </div>
    </div>
  </article>
</template>
