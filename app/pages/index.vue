<script setup lang="ts">
import type { CatalogTheme } from '~/composables/useCatalog'

const config = useRuntimeConfig()
useSeoMeta({
  title: `${config.public.siteName} — Marketplace Undangan Digital`,
  description: 'Pilih tema undangan pernikahan digital: syar\'i, minimalis, floral, dan lainnya. Isi sendiri, bagikan link personal ke setiap tamu.',
})

const { data } = await useCatalog()
const route = useRoute()
const router = useRouter()

const category = computed({
  get: () => (route.query.kategori as string) || '',
  set: v => router.replace({ query: { ...route.query, kategori: v || undefined }, hash: '#katalog' }),
})
const search = ref('')

const filtered = computed(() => {
  const list = data.value?.themes ?? []
  const cat = data.value?.categories.find(c => c.slug === category.value)
  const q = search.value.trim().toLowerCase()
  return list.filter(t =>
    (!cat || t.category_id === cat.id)
    && (!q || `${t.name} ${t.code} ${t.description ?? ''}`.toLowerCase().includes(q)),
  )
})
const catName = (id: number | null) => data.value?.categories.find(c => c.id === id)?.name ?? ''
const counts = computed(() => {
  const m = new Map<number, number>()
  for (const t of data.value?.themes ?? []) if (t.category_id) m.set(t.category_id, (m.get(t.category_id) ?? 0) + 1)
  return m
})

const ordering = ref<CatalogTheme | null>(null)

const steps = [
  { t: 'Pilih tema', d: 'Jelajahi katalog dan lihat pratinjau langsung di layar ponsel.' },
  { t: 'Pesan via WhatsApp', d: 'Pilih paket kuota tamu, selesaikan pembayaran dengan admin.' },
  { t: 'Terima token', d: 'Masukkan token 6 karakter untuk membuat akun dan workspace.' },
  { t: 'Isi & bagikan', d: 'Isi data di dashboard, lalu kirim link personal ke setiap tamu.' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 md:grid-cols-2 md:pb-20 md:pt-16">
        <div>
          <span class="chip bg-clay-100 text-clay-700">✦ Syar'i · Minimalis · Floral · Modern</span>
          <h1 class="mt-4 font-display text-4xl leading-tight text-brand md:text-5xl">
            Undangan digital yang indah, <span class="text-clay">mudah diisi sendiri</span>.
          </h1>
          <p class="mt-4 max-w-md text-brand-600">
            Pilih tema, isi data mempelai dan acara dari ponsel, lalu bagikan link undangan personal ke setiap tamu, lengkap dengan RSVP dan buku ucapan.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="#katalog" class="btn-primary">Lihat Katalog Tema</a>
            <NuxtLink to="/daftar" class="btn-ghost">Saya punya token</NuxtLink>
          </div>
        </div>
        <div v-if="data?.themes[0]" class="relative mx-auto w-64 md:w-72">
          <div class="absolute -inset-6 rounded-full bg-brand-100 blur-3xl" />
          <div class="relative overflow-hidden rounded-[36px] border-8 border-brand-900 shadow-2xl">
            <ThemeThumb :definition="data.themes[0].definition" :css="data.themes[0].compiled_css" :slug="data.themes[0].slug" />
          </div>
        </div>
      </div>
    </section>

    <!-- Cara kerja -->
    <section class="mx-auto max-w-6xl px-4">
      <ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(s, i) in steps" :key="s.t" class="card p-5">
          <span class="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">{{ i + 1 }}</span>
          <h3 class="mt-3 font-semibold text-brand-900">{{ s.t }}</h3>
          <p class="mt-1 text-sm text-brand-600">{{ s.d }}</p>
        </li>
      </ol>
    </section>

    <!-- Katalog -->
    <section id="katalog" class="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="font-display text-3xl text-brand">Katalog Tema</h2>
          <p class="mt-1 text-sm text-brand-600">{{ filtered.length }} tema tersedia</p>
        </div>
        <label class="relative md:w-72">
          <span class="sr-only">Cari tema</span>
          <svg viewBox="0 0 24 24" class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" aria-hidden="true"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" /></svg>
          <input v-model="search" type="search" class="input pl-10" placeholder="Cari nama atau ID tema…">
        </label>
      </div>

      <div class="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <button class="chip shrink-0 px-4 py-2 text-sm ring-1 transition" :class="!category ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'" @click="category = ''">
          Semua
        </button>
        <button
          v-for="c in data?.categories" :key="c.id"
          class="chip shrink-0 px-4 py-2 text-sm ring-1 transition"
          :class="category === c.slug ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'"
          @click="category = c.slug"
        >
          {{ c.name }}<span v-if="counts.get(c.id)" class="ml-1.5 opacity-60">{{ counts.get(c.id) }}</span>
        </button>
      </div>

      <div v-if="filtered.length" class="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        <article v-for="t in filtered" :key="t.id" class="card group overflow-hidden">
          <NuxtLink :to="`/tema/${t.slug}`" class="block">
            <ThemeThumb :definition="t.definition" :css="t.compiled_css" :slug="t.slug" />
          </NuxtLink>
          <div class="p-3 sm:p-4">
            <div class="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span class="text-clay-600">{{ catName(t.category_id) }}</span>
              <span class="text-brand-400">{{ t.code }}</span>
            </div>
            <h3 class="mt-1 truncate font-semibold text-brand-900">{{ t.name }}</h3>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <NuxtLink :to="`/tema/${t.slug}`" class="btn-ghost btn-sm px-2">Preview</NuxtLink>
              <button class="btn-accent btn-sm px-2" @click="ordering = t">Pesan</button>
            </div>
          </div>
        </article>
      </div>
      <p v-else class="card mt-6 p-10 text-center text-sm text-brand-600">Tema tidak ditemukan. Coba kategori atau kata kunci lain.</p>
    </section>

    <!-- Harga -->
    <section id="harga" class="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16">
      <h2 class="font-display text-3xl text-brand">Paket Harga</h2>
      <p class="mt-1 text-sm text-brand-600">Semua tema bisa dipilih di paket mana pun. Bedanya hanya kuota nama tamu.</p>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <div v-for="(p, i) in data?.packages" :key="p.id" class="card relative p-6" :class="i === 1 ? 'ring-2 ring-clay' : ''">
          <span v-if="i === 1" class="chip absolute -top-3 left-6 bg-clay text-white">Terlaris</span>
          <h3 class="font-semibold text-brand-900">{{ p.name }}</h3>
          <p class="mt-2 font-display text-3xl text-brand">{{ rupiah(p.price) }}</p>
          <ul class="mt-4 grid gap-2 text-sm text-brand-700">
            <li>✓ Hingga <b>{{ p.guest_limit }}</b> link tamu personal</li>
            <li>✓ Editor konten + live preview</li>
            <li>✓ RSVP & buku ucapan</li>
            <li>✓ Amplop digital & galeri</li>
          </ul>
        </div>
      </div>
    </section>

    <OrderSheet :theme="ordering" :packages="data?.packages ?? []" @close="ordering = null" />
  </div>
</template>
