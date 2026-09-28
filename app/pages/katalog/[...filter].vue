<script setup lang="ts">
/**
 * Katalog lengkap tema dengan URL yang bisa diindeks mesin pencari:
 *   /katalog                         → semua tema
 *   /katalog/<jenis>                 → per jenis acara (induk)
 *   /katalog/<jenis>/<kategori>      → per sub-kategori
 *   ?halaman=N  ?q=kata  ?urut=nama|terbaru
 * Hanya tema di halaman aktif yang dimuat lengkap (definisi + CSS); filter & hitungan memakai indeks ringan.
 */
import type { CatalogTheme } from '~/composables/useCatalog'
import type { FeatureIconName } from '~/components/ui/FeatureIcon.vue'

const PER_PAGE = 12
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { data: cat } = await useCatalog()
const { whatsapp } = await useReferral()

const parts = computed(() => ([] as string[]).concat(route.params.filter ?? []).filter(Boolean))
const groupSlug = computed(() => parts.value[0] ?? '')
const catSlug = computed(() => parts.value[1] ?? '')
const group = computed(() => cat.value?.groups.find(g => g.slug === groupSlug.value))
const category = computed(() => cat.value?.categories.find(c => c.slug === catSlug.value && c.group_slug === groupSlug.value))
if (parts.value.length > 2 || (groupSlug.value && !group.value) || (catSlug.value && !category.value))
  throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan', fatal: true })

const q = computed(() => String(route.query.q ?? '').trim())
const sort = computed(() => (route.query.urut === 'nama' ? 'nama' : 'terbaru'))
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.halaman ?? '1')) || 1))

const groupOf = (id: number | null) => groupOfCategory(cat.value?.categories ?? [], id)
const catName = (id: number | null) => cat.value?.categories.find(c => c.id === id)?.name ?? ''
/** Tema yang cocok dengan pencarian (dipakai untuk hitungan per jenis & kategori). */
const searched = computed(() => {
  const needle = q.value.toLowerCase()
  return (cat.value?.themes ?? []).filter(t => !needle || `${t.name} ${t.code} ${t.description ?? ''}`.toLowerCase().includes(needle))
})
const groupCount = (slug: string) => searched.value.filter(t => groupOf(t.category_id) === slug).length
const catCount = (id: number) => searched.value.filter(t => t.category_id === id).length
const groupCats = computed(() => (cat.value?.categories ?? []).filter(c => c.group_slug === (groupSlug.value || '')))

const matched = computed(() => {
  const list = searched.value.filter(t =>
    (!group.value || groupOf(t.category_id) === group.value.slug)
    && (!category.value || t.category_id === category.value.id))
  return sort.value === 'nama' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'id')) : list
})
const total = computed(() => matched.value.length)
const pages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))
if (page.value > pages.value && total.value > 0)
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
const pageIds = computed(() => matched.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE).map(t => t.id))

const { data: themes, status } = await useAsyncData(
  () => `katalog-${pageIds.value.join(',')}`,
  () => fetchThemesByIds(supabase, pageIds.value),
  { watch: [pageIds] },
)

// ---------- URL ----------
const basePath = computed(() => ['/katalog', groupSlug.value, catSlug.value].filter(Boolean).join('/'))
function withQuery(path: string, over: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams()
  const merged: Record<string, string | number | undefined> = { q: q.value || undefined, urut: sort.value === 'nama' ? 'nama' : undefined, ...over }
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && !(k === 'halaman' && Number(v) <= 1)) params.set(k, String(v))
  const s = params.toString()
  return s ? `${path}?${s}` : path
}
const pageLink = (n: number) => withQuery(basePath.value, { halaman: n })
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

// Pencarian: perbarui URL setelah berhenti mengetik
const searchInput = ref(q.value)
let debounce: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (v) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => router.replace(withQuery(basePath.value, { q: v.trim() || undefined, halaman: undefined })), 350)
})
watch(q, (v) => { if (v !== searchInput.value.trim()) searchInput.value = v })
function setSort(v: string) {
  router.replace(withQuery(basePath.value, { urut: v === 'nama' ? 'nama' : undefined, halaman: undefined }))
}

const filterOpen = ref(false)
watch(() => route.fullPath, () => { filterOpen.value = false })
const ordering = ref<CatalogTheme | null>(null)

// ---------- SEO ----------
const heading = computed(() => category.value && group.value
  ? `Tema Undangan ${group.value.name}: ${category.value.name}`
  : group.value ? `Tema Undangan ${group.value.name}` : 'Katalog Tema Undangan Digital')
const pageSuffix = computed(() => (page.value > 1 ? ` — Halaman ${page.value}` : ''))
const intro = computed(() => group.value
  ? `${total.value} tema undangan digital ${group.value.name.toLowerCase()}${category.value ? ` kategori ${category.value.name.toLowerCase()}` : ''}. ${group.value.description ?? ''}. Lihat preview langsung, isi sendiri dari ponsel, dan bagikan link personal ke setiap tamu.`
  : `${total.value} tema undangan digital syar'i & modern untuk pernikahan, aqiqah, khitanan, ulang tahun, acara kantor, hingga kegiatan sekolah dan kampus. Lihat preview langsung dan pilih yang paling cocok.`)
const origin = useSiteOrigin()
useSeoMeta({
  title: () => `${heading.value}${pageSuffix.value}`,
  description: () => intro.value.replace(/\.\./g, '.').slice(0, 300),
  ogTitle: () => `${heading.value} · ${BRAND.name}`,
  ogDescription: () => intro.value.replace(/\.\./g, '.').slice(0, 300),
  // Hasil pencarian bebas tidak perlu diindeks (hindari halaman ganda), tapi tautannya tetap diikuti
  robots: () => (q.value ? 'noindex, follow' : 'index, follow, max-image-preview:large'),
})
useHead({
  link: () => [
    ...(page.value > 1 ? [{ rel: 'prev' as const, href: `${origin}${pageLink(page.value - 1)}` }] : []),
    ...(page.value < pages.value ? [{ rel: 'next' as const, href: `${origin}${pageLink(page.value + 1)}` }] : []),
  ],
})
useJsonLd('katalog', () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      'name': `${heading.value}${pageSuffix.value}`,
      'url': `${origin}${pageLink(page.value)}`,
      'mainEntity': {
        '@type': 'ItemList',
        'numberOfItems': total.value,
        'itemListElement': (themes.value ?? []).map((t, i) => ({
          '@type': 'ListItem', 'position': (page.value - 1) * PER_PAGE + i + 1, 'name': t.name, 'url': `${origin}/tema/${t.slug}`,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Beranda', 'item': `${origin}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Katalog Tema', 'item': `${origin}/katalog` },
        ...(group.value ? [{ '@type': 'ListItem', 'position': 3, 'name': `Undangan ${group.value.name}`, 'item': `${origin}/katalog/${group.value.slug}` }] : []),
        ...(group.value && category.value ? [{ '@type': 'ListItem', 'position': 4, 'name': category.value.name, 'item': `${origin}/katalog/${group.value.slug}/${category.value.slug}` }] : []),
      ],
    },
  ],
}))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pt-10">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-sm text-brand-500">
      <NuxtLink to="/" class="hover:text-brand">Beranda</NuxtLink>
      <span aria-hidden="true">›</span>
      <NuxtLink to="/katalog" class="hover:text-brand" :class="!group && 'font-semibold text-brand-800'">Katalog</NuxtLink>
      <template v-if="group">
        <span aria-hidden="true">›</span>
        <NuxtLink :to="`/katalog/${group.slug}`" class="hover:text-brand" :class="!category && 'font-semibold text-brand-800'">{{ group.name }}</NuxtLink>
      </template>
      <template v-if="category && group">
        <span aria-hidden="true">›</span>
        <span class="font-semibold text-brand-800">{{ category.name }}</span>
      </template>
    </nav>

    <header class="mt-3">
      <h1 class="font-display text-3xl leading-tight text-brand md:text-4xl">{{ heading }}</h1>
      <p class="mt-2 max-w-3xl text-sm text-brand-600 md:text-base">{{ intro.replace(/\.\./g, '.') }}</p>
    </header>

    <!-- Bar filter (mobile) -->
    <div class="sticky top-16 z-20 -mx-4 mt-5 border-b border-brand-100 bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
      <div class="flex gap-2">
        <label class="relative flex-1">
          <span class="sr-only">Cari tema</span>
          <svg viewBox="0 0 24 24" class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" aria-hidden="true"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" /></svg>
          <input v-model="searchInput" type="search" class="input pl-10" placeholder="Cari tema…">
        </label>
        <button type="button" class="btn-ghost relative shrink-0 px-4" :aria-expanded="filterOpen" @click="filterOpen = true">
          <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2H3zm4 6h10v2H7zm3 6h4v2h-4z" /></svg>
          Filter
          <span v-if="group" class="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-clay text-[11px] font-bold text-white">{{ category ? 2 : 1 }}</span>
        </button>
      </div>
      <!-- Chip cepat: jenis acara, atau sub-kategori bila jenis sudah dipilih -->
      <div class="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <template v-if="group">
          <NuxtLink
            :to="withQuery(`/katalog/${group.slug}`)" class="chip shrink-0 px-3 py-2 text-sm ring-1 transition"
            :class="!category ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'"
          >
            Semua {{ group.name }}
          </NuxtLink>
          <NuxtLink
            v-for="c in groupCats.filter(c => catCount(c.id))" :key="c.id" :to="withQuery(`/katalog/${group.slug}/${c.slug}`)"
            class="chip shrink-0 gap-1.5 px-3 py-2 text-sm ring-1 transition"
            :class="category?.slug === c.slug ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'"
          >
            {{ c.name }}<span class="opacity-60">{{ catCount(c.id) }}</span>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink
            v-for="g in cat?.groups" :key="g.slug" :to="withQuery(`/katalog/${g.slug}`)"
            class="chip shrink-0 gap-1.5 bg-white px-3 py-2 text-sm text-brand-700 ring-1 ring-brand-100 transition"
          >
            {{ g.name }}<span class="opacity-60">{{ groupCount(g.slug) }}</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <div class="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
      <!-- Sidebar filter (desktop) -->
      <aside class="hidden lg:block" aria-label="Filter katalog">
        <div class="sticky top-24 grid gap-6">
          <label class="relative">
            <span class="sr-only">Cari tema</span>
            <svg viewBox="0 0 24 24" class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" aria-hidden="true"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" /></svg>
            <input v-model="searchInput" type="search" class="input pl-10" placeholder="Cari nama atau ID tema…">
          </label>
          <CatalogFilters :groups="cat?.groups ?? []" :categories="groupCats" :group="group?.slug ?? ''" :category="category?.slug ?? ''" :group-count="groupCount" :cat-count="catCount" :total="searched.length" :link="withQuery" />
        </div>
      </aside>

      <div class="min-w-0">
        <!-- Ringkasan + urutkan + filter aktif -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-brand-600">
            <b class="text-brand-900">{{ total }}</b> tema
            <template v-if="total > PER_PAGE"> · halaman {{ page }} dari {{ pages }}</template>
          </p>
          <label class="flex items-center gap-2 text-sm text-brand-600">
            Urutkan
            <select class="input w-auto py-2 pr-8 text-sm" :value="sort" @change="setSort(($event.target as HTMLSelectElement).value)">
              <option value="terbaru">Terbaru</option>
              <option value="nama">Nama A–Z</option>
            </select>
          </label>
        </div>
        <div v-if="group || q" class="mt-3 flex flex-wrap gap-2">
          <NuxtLink v-if="group" :to="withQuery('/katalog')" class="chip gap-1.5 bg-brand-50 px-3 py-1.5 text-sm text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100">
            {{ group.name }} <span aria-hidden="true">✕</span><span class="sr-only">hapus filter jenis acara</span>
          </NuxtLink>
          <NuxtLink v-if="category && group" :to="withQuery(`/katalog/${group.slug}`)" class="chip gap-1.5 bg-brand-50 px-3 py-1.5 text-sm text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100">
            {{ category.name }} <span aria-hidden="true">✕</span><span class="sr-only">hapus filter kategori</span>
          </NuxtLink>
          <NuxtLink v-if="q" :to="withQuery(basePath, { q: undefined })" class="chip gap-1.5 bg-brand-50 px-3 py-1.5 text-sm text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100">
            “{{ q }}” <span aria-hidden="true">✕</span><span class="sr-only">hapus pencarian</span>
          </NuxtLink>
        </div>

        <!-- Grid tema -->
        <div v-if="themes?.length" class="mt-5 grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3" :class="status === 'pending' && 'opacity-60'">
          <ThemeCard v-for="t in themes" :key="t.id" :theme="t" :category-name="catName(t.category_id)" @order="ordering = t" />
        </div>
        <div v-else-if="group && !groupCount(group.slug) && !q" class="card mt-5 grid place-items-center gap-3 p-10 text-center">
          <FeatureIcon :name="group.icon as FeatureIconName" size="lg" />
          <h2 class="font-display text-2xl text-brand">Tema {{ group.name }} segera hadir</h2>
          <p class="max-w-md text-sm text-brand-600">{{ group.description }}. Butuh sekarang? Kami bisa buatkan desain khusus untuk acara Anda.</p>
          <a :href="waLink(whatsapp, `Assalamu'alaikum, saya ingin memesan undangan digital untuk ${group.name}.`)" target="_blank" rel="noopener" class="btn-primary">Pesan Desain Khusus via WhatsApp</a>
        </div>
        <div v-else-if="status !== 'pending'" class="card mt-5 grid place-items-center gap-3 p-10 text-center">
          <p class="text-sm text-brand-600">Tema tidak ditemukan. Coba kata kunci atau kategori lain.</p>
          <NuxtLink to="/katalog" class="btn-ghost btn-sm">Lihat semua tema</NuxtLink>
        </div>

        <!-- Pagination: tautan biasa agar setiap halaman bisa dijelajahi mesin pencari -->
        <nav v-if="pages > 1" class="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Halaman katalog">
          <NuxtLink v-if="page > 1" :to="pageLink(page - 1)" class="btn-ghost btn-sm px-3" rel="prev">‹ <span class="hidden sm:inline">Sebelumnya</span></NuxtLink>
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
          <NuxtLink v-if="page < pages" :to="pageLink(page + 1)" class="btn-ghost btn-sm px-3" rel="next"><span class="hidden sm:inline">Berikutnya</span> ›</NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Lembar filter (mobile) -->
    <Teleport to="body">
      <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition" leave-active-class="transition">
        <div v-if="filterOpen" class="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" @click.self="filterOpen = false">
          <div class="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl" role="dialog" aria-modal="true" aria-label="Filter katalog">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-display text-2xl text-brand">Filter</h2>
              <button type="button" class="rounded-full px-3 py-1 text-2xl leading-none text-brand-500" aria-label="Tutup" @click="filterOpen = false">×</button>
            </div>
            <CatalogFilters :groups="cat?.groups ?? []" :categories="groupCats" :group="group?.slug ?? ''" :category="category?.slug ?? ''" :group-count="groupCount" :cat-count="catCount" :total="searched.length" :link="withQuery" />
            <div class="mt-6">
              <p class="text-xs font-bold uppercase tracking-wider text-brand-500">Urutkan</p>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button v-for="o in [['terbaru', 'Terbaru'], ['nama', 'Nama A–Z']]" :key="o[0]" type="button" class="rounded-xl px-3 py-2.5 text-sm font-semibold ring-1" :class="sort === o[0] ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'" @click="setSort(o[0]!); filterOpen = false">
                  {{ o[1] }}
                </button>
              </div>
            </div>
            <button type="button" class="btn-primary mt-6 w-full" @click="filterOpen = false">Tampilkan {{ total }} tema</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <OrderSheet :theme="ordering" :packages="cat?.packages ?? []" @close="ordering = null" />
  </div>
</template>
