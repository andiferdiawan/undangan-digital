<script setup lang="ts">
import type { Category, EventGroup, ThemeRow } from '#shared/types/models'

/**
 * Daftar tema admin, dimuat per halaman dari database (range + count) agar tetap ringan saat tema bertambah.
 *   ?q=kata (nama/kode)  ?kategori=<id>  ?halaman=N
 * Filter & halaman ada di URL, jadi tetap sama saat kembali dari halaman Edit.
 */
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Tema' })
const PER_PAGE = 20
const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

type Row = Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'status' | 'source' | 'category_id' | 'updated_at'>

const q = computed(() => String(route.query.q ?? '').trim())
const cat = computed(() => Number.parseInt(String(route.query.kategori ?? '')) || null)
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.halaman ?? '1')) || 1))

const { data: meta } = await useAsyncData('admin-theme-categories', async () => {
  const [cats, groups] = await Promise.all([
    supabase.from('categories').select('*').order('sort'),
    supabase.from('event_groups').select('slug, name, sort').order('sort'),
  ])
  return {
    categories: (cats.data ?? []) as Category[],
    groups: (groups.data ?? []) as Pick<EventGroup, 'slug' | 'name' | 'sort'>[],
  }
})
/** Kategori dikelompokkan per jenis acara (nama kategori seperti "Ceria Anak" ambigu tanpa jenisnya). */
const groupedCats = computed(() => (meta.value?.groups ?? [])
  .map(g => ({ ...g, cats: (meta.value?.categories ?? []).filter(c => c.group_slug === g.slug) }))
  .filter(g => g.cats.length))

const { data, refresh, pending, error } = await useAsyncData('admin-themes', async () => {
  const from = (page.value - 1) * PER_PAGE
  let query = supabase.from('themes')
    .select('id, code, slug, name, status, source, category_id, updated_at', { count: 'exact' })
    .order('code')
    .range(from, from + PER_PAGE - 1)
  if (cat.value) query = query.eq('category_id', cat.value)
  // Hanya huruf, angka, spasi & strip: aman disisipkan ke filter or() PostgREST
  const term = q.value.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim()
  if (term) query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%`)
  const { data, count, error } = await query
  // Halaman melewati jumlah hasil (mis. ?halaman= lama setelah tema berkurang): kembali ke halaman 1
  if (error?.code === 'PGRST103' || (!error && !data?.length && (count ?? 0) > 0))
    return { themes: [] as Row[], total: 0, outOfRange: true }
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { themes: (data ?? []) as Row[], total: count ?? 0, outOfRange: false }
}, { watch: [q, cat, page] })

const total = computed(() => data.value?.total ?? 0)
const pages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))
const rangeText = computed(() => {
  if (!total.value) return ''
  const from = (page.value - 1) * PER_PAGE + 1
  return `${from}–${Math.min(total.value, from + PER_PAGE - 1)} dari ${total.value} tema`
})

// ---------- URL ----------
function withQuery(over: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams()
  const merged: Record<string, string | number | undefined> = { q: q.value || undefined, kategori: cat.value ?? undefined, halaman: page.value, ...over }
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && !(k === 'halaman' && Number(v) <= 1)) params.set(k, String(v))
  const s = params.toString()
  return s ? `${route.path}?${s}` : route.path
}
const pageLink = (n: number) => withQuery({ halaman: n })
const pageItems = computed(() => {
  const n = pages.value
  const cur = page.value
  const set = new Set([1, n, cur - 1, cur, cur + 1].filter(i => i >= 1 && i <= n))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((i, idx) => {
    if (idx && i - sorted[idx - 1]! > 1) out.push('…')
    out.push(i)
  })
  return out
})
watch(() => data.value?.outOfRange, (out) => { if (out && import.meta.client) router.replace(withQuery({ halaman: undefined })) }, { immediate: true })
watch(page, () => { if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' }) })

// Pencarian: perbarui URL setelah berhenti mengetik
const searchInput = ref(q.value)
let debounce: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (v) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => router.replace(withQuery({ q: v.trim() || undefined, halaman: undefined })), 350)
})
watch(q, (v) => { if (v !== searchInput.value.trim()) searchInput.value = v })
function setCategory(v: string) {
  router.replace(withQuery({ kategori: v || undefined, halaman: undefined }))
}
function resetFilter() {
  clearTimeout(debounce)
  searchInput.value = ''
  router.replace(route.path)
}

const catName = (id: number | null) => meta.value?.categories.find(c => c.id === id)?.name ?? '-'
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

      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input v-model="searchInput" type="search" class="input py-2 text-sm sm:max-w-xs" placeholder="Cari nama atau kode tema…" aria-label="Cari tema">
        <select :value="cat ?? ''" class="input py-2 text-sm sm:w-64" aria-label="Filter kategori" @change="setCategory(($event.target as HTMLSelectElement).value)">
          <option value="">Semua kategori</option>
          <optgroup v-for="g in groupedCats" :key="g.slug" :label="g.name">
            <option v-for="c in g.cats" :key="c.id" :value="c.id">{{ c.name }}</option>
          </optgroup>
        </select>
        <button v-if="q || cat" type="button" class="self-start text-sm font-semibold text-brand-600 underline sm:self-center" @click="resetFilter">Reset filter</button>
        <p class="text-xs text-brand-500 sm:ml-auto">{{ rangeText }}</p>
      </div>

      <div class="card mt-4 overflow-x-auto transition-opacity" :class="{ 'opacity-60': pending }">
        <table class="table-cards w-full text-sm sm:min-w-[640px]">
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
              <td data-label="Kode" class="px-4 py-3 font-mono text-xs text-brand-600">{{ t.code }}</td>
              <td class="tc-title px-4 py-3 font-medium text-brand-900 max-sm:order-first">{{ t.name }}</td>
              <td data-label="Kategori" class="px-4 py-3 text-brand-700">{{ catName(t.category_id) }}</td>
              <td data-label="Sumber" class="px-4 py-3"><span class="chip" :class="t.source === 'ai' ? 'bg-clay-50 text-clay-700' : 'bg-brand-50 text-brand-700'">{{ t.source === 'ai' ? 'AI' : 'Manual' }}</span></td>
              <td data-label="Status" class="px-4 py-3"><span class="chip" :class="STATUS[t.status]">{{ t.status }}</span></td>
              <td class="tc-actions whitespace-nowrap px-4 py-3 text-right text-xs max-sm:!flex max-sm:gap-4">
                <button v-if="t.status !== 'published'" class="font-semibold text-green-700" @click="setStatus(t.id, 'published')">Tayangkan</button>
                <button v-else class="text-brand-500" @click="setStatus(t.id, 'draft')">Jadikan draf</button>
                <NuxtLink :to="`/admin/tema/${t.id}`" class="ml-3 font-semibold text-brand">Edit</NuxtLink>
              </td>
            </tr>
            <tr v-if="error">
              <td colspan="6" class="p-8 text-center text-red-600">Gagal memuat tema: {{ error.statusMessage || error.message }}</td>
            </tr>
            <tr v-else-if="!pending && !data?.themes.length">
              <td colspan="6" class="p-8 text-center text-brand-500">{{ q || cat ? 'Tidak ada tema yang cocok dengan filter ini.' : 'Belum ada tema.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="pages > 1" class="mt-5 flex flex-wrap items-center justify-center gap-1.5" aria-label="Halaman tema">
        <NuxtLink v-if="page > 1" :to="pageLink(page - 1)" class="btn-ghost btn-sm px-3">‹ <span class="hidden sm:inline">Sebelumnya</span></NuxtLink>
        <template v-for="(it, i) in pageItems" :key="i">
          <span v-if="it === '…'" class="px-1.5 text-brand-400">…</span>
          <NuxtLink
            v-else :to="pageLink(it)"
            class="grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-semibold ring-1 transition"
            :class="it === page ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100 hover:ring-brand-300'"
            :aria-current="it === page ? 'page' : undefined"
          >
            {{ it }}
          </NuxtLink>
        </template>
        <NuxtLink v-if="page < pages" :to="pageLink(page + 1)" class="btn-ghost btn-sm px-3"><span class="hidden sm:inline">Berikutnya</span> ›</NuxtLink>
      </nav>
    </div>
  </div>
</template>
