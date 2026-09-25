<script setup lang="ts">
import type { Category, ThemeRow } from '#shared/types/models'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Tema' })
const supabase = useSupabaseClient()

const { data, refresh } = await useAsyncData('admin-themes', async () => {
  const [themes, cats] = await Promise.all([
    supabase.from('themes').select('id, code, slug, name, status, source, category_id, updated_at').order('code'),
    supabase.from('categories').select('*').order('sort'),
  ])
  return {
    themes: (themes.data ?? []) as Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'status' | 'source' | 'category_id' | 'updated_at'>[],
    categories: (cats.data ?? []) as Category[],
  }
})

const catName = (id: number | null) => data.value?.categories.find(c => c.id === id)?.name ?? '-'
const STATUS = { draft: 'bg-gray-100 text-gray-600', published: 'bg-green-50 text-green-700', archived: 'bg-amber-50 text-amber-700' } as const

async function setStatus(id: string, status: 'draft' | 'published' | 'archived') {
  try {
    await $fetch(`/api/admin/themes/${id}`, { method: 'PUT', body: { status } })
    await refresh()
  }
  catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal mengubah status')
  }
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex items-center justify-between gap-3">
        <h1 class="font-display text-3xl text-brand">Tema</h1>
        <NuxtLink to="/admin/tema/baru" class="btn-accent btn-sm">✦ Generate dengan AI</NuxtLink>
      </div>
      <div class="card mt-5 overflow-x-auto">
        <table class="w-full min-w-[640px] text-sm">
          <thead>
            <tr class="border-b border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500">
              <th class="px-4 py-2 font-medium">Kode</th>
              <th class="px-4 py-2 font-medium">Nama</th>
              <th class="px-4 py-2 font-medium">Kategori</th>
              <th class="px-4 py-2 font-medium">Sumber</th>
              <th class="px-4 py-2 font-medium">Status</th>
              <th class="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in data?.themes" :key="t.id" class="border-b border-brand-50 last:border-0">
              <td class="px-4 py-3 font-mono text-xs text-brand-600">{{ t.code }}</td>
              <td class="px-4 py-3 font-medium text-brand-900">{{ t.name }}</td>
              <td class="px-4 py-3 text-brand-700">{{ catName(t.category_id) }}</td>
              <td class="px-4 py-3"><span class="chip" :class="t.source === 'ai' ? 'bg-clay-50 text-clay-700' : 'bg-brand-50 text-brand-700'">{{ t.source === 'ai' ? 'AI' : 'Manual' }}</span></td>
              <td class="px-4 py-3"><span class="chip" :class="STATUS[t.status]">{{ t.status }}</span></td>
              <td class="whitespace-nowrap px-4 py-3 text-right text-xs">
                <button v-if="t.status !== 'published'" class="font-semibold text-green-700" @click="setStatus(t.id, 'published')">Tayangkan</button>
                <button v-else class="text-brand-500" @click="setStatus(t.id, 'draft')">Jadikan draf</button>
                <NuxtLink :to="`/admin/tema/${t.id}`" class="ml-3 font-semibold text-brand">Edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
