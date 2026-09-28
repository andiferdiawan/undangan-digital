<script setup lang="ts">
import type { Category, EventGroup } from '#shared/types/models'
import type { FeatureIconName } from '~/components/ui/FeatureIcon.vue'

/** Daftar filter jenis acara & sub-kategori (dipakai sidebar desktop dan lembar filter mobile). Semua berupa tautan. */
defineProps<{
  groups: EventGroup[]
  categories: Category[]
  group: string
  category: string
  total: number
  groupCount: (slug: string) => number
  catCount: (id: number) => number
  link: (path: string) => string
}>()
</script>

<template>
  <div class="grid gap-6">
    <div>
      <p class="text-xs font-bold uppercase tracking-wider text-brand-500">Jenis acara</p>
      <ul class="mt-2 grid gap-1">
        <li>
          <NuxtLink :to="link('/katalog')" class="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition" :class="!group ? 'bg-brand text-white' : 'text-brand-800 hover:bg-brand-50'">
            <span class="font-semibold">Semua jenis</span>
            <span class="text-xs opacity-70">{{ total }}</span>
          </NuxtLink>
        </li>
        <li v-for="g in groups" :key="g.slug">
          <NuxtLink :to="link(`/katalog/${g.slug}`)" class="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 text-sm transition" :class="group === g.slug ? 'bg-brand text-white' : 'text-brand-800 hover:bg-brand-50'">
            <FeatureIcon :name="g.icon as FeatureIconName" size="sm" />
            <span class="min-w-0 flex-1 truncate font-semibold">{{ g.name }}</span>
            <span class="text-xs opacity-70">{{ groupCount(g.slug) || '—' }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="group && categories.length">
      <p class="text-xs font-bold uppercase tracking-wider text-brand-500">Kategori</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <NuxtLink :to="link(`/katalog/${group}`)" class="chip px-3 py-1.5 text-sm ring-1 transition" :class="!category ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100 hover:ring-brand-300'">
          Semua
        </NuxtLink>
        <NuxtLink
          v-for="c in categories" :key="c.id" :to="link(`/katalog/${group}/${c.slug}`)"
          class="chip gap-1.5 px-3 py-1.5 text-sm ring-1 transition"
          :class="category === c.slug ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100 hover:ring-brand-300'"
        >
          {{ c.name }}<span class="opacity-60">{{ catCount(c.id) }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
