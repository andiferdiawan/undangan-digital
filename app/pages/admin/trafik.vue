<script setup lang="ts">
import type { PageType, TrafficSource } from '#shared/traffic'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Trafik' })

interface PageRow {
  path: string, title: string | null, page_type: PageType, views: number, visitors: number, entries: number
  organik: number, iklan: number, sosial: number, referral: number, langsung: number, organik_entries: number, last_at: string
}
interface Traffic {
  from: string, days: number
  totals: { views: number, visitors: number, sessions: number }
  sources: Partial<Record<TrafficSource, { views: number, visitors: number, entries: number }>>
  daily: { day: string, views: number, organik: number, iklan: number, visitors: number }[]
  types: { page_type: PageType, views: number, visitors: number, organik: number, iklan: number }[]
  pages: PageRow[]
  engines: { name: string, views: number }[]
  referrers: { host: string, source: TrafficSource, sessions: number }[]
  campaigns: { source: string | null, medium: string | null, campaign: string | null, sessions: number, views: number }[]
  devices: Record<string, number>
  countries: { country: string, views: number }[]
}

const supabase = useSupabaseClient()
const days = ref(30)
const { data, error, pending } = await useAsyncData('admin-traffic', async () => {
  const { data, error } = await supabase.rpc('admin_traffic', { p_days: days.value } as never)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as Traffic
}, { watch: [days], server: false })

// Warna kategori tetap per sumber (lolos validasi CVD); teks selalu memakai tinta netral
const SOURCES: { key: TrafficSource, label: string, color: string, hint: string }[] = [
  { key: 'organik', label: 'Organik', color: '#1baf7a', hint: 'Google, Bing, dll.' },
  { key: 'iklan', label: 'Iklan', color: '#eb6834', hint: 'gclid/fbclid/ttclid atau utm_medium=cpc' },
  { key: 'sosial', label: 'Sosial', color: '#2a78d6', hint: 'WhatsApp, Instagram, Facebook, TikTok…' },
  { key: 'referral', label: 'Referral', color: '#eda100', hint: 'Tautan dari situs lain' },
  { key: 'langsung', label: 'Langsung', color: '#e87ba4', hint: 'Ketik URL / bookmark / tanpa referrer' },
]
const TYPES: Record<PageType, string> = {
  beranda: 'Beranda', katalog: 'Katalog', tema: 'Detail tema', pratinjau: 'Pratinjau undangan', blog: 'Blog (daftar)', artikel: 'Artikel',
  undangan: 'Undangan pelanggan', reseller: 'Reseller', halaman: 'Halaman info', lainnya: 'Lainnya',
}
const num = (n: number) => (n ?? 0).toLocaleString('id-ID')
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
const t = computed(() => data.value?.totals ?? { views: 0, visitors: 0, sessions: 0 })
const src = (k: TrafficSource) => data.value?.sources[k] ?? { views: 0, visitors: 0, entries: 0 }
const maxSrc = computed(() => Math.max(1, ...SOURCES.map(s => src(s.key).views)))

// ── Grafik harian (garis, satu sumbu) ──
const W = 720
const H = 200
const PAD = { l: 36, r: 12, t: 12, b: 24 }
const SERIES = [
  { key: 'views' as const, label: 'Semua kunjungan', color: '#2f4a3a' },
  { key: 'organik' as const, label: 'Organik', color: '#1baf7a' },
  { key: 'iklan' as const, label: 'Iklan', color: '#eb6834' },
]
const daily = computed(() => data.value?.daily ?? [])
const yMax = computed(() => {
  const m = Math.max(1, ...daily.value.map(d => d.views))
  const step = 10 ** Math.floor(Math.log10(m))
  return Math.ceil(m / step) * step
})
const x = (i: number) => PAD.l + (daily.value.length <= 1 ? 0 : (i / (daily.value.length - 1)) * (W - PAD.l - PAD.r))
const y = (v: number) => H - PAD.b - (v / yMax.value) * (H - PAD.t - PAD.b)
const line = (k: 'views' | 'organik' | 'iklan') => daily.value.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join('')
const ticks = computed(() => [0, 0.5, 1].map(f => Math.round(yMax.value * f)))
const hover = ref<number | null>(null)
function onMove(e: PointerEvent) {
  const svg = e.currentTarget as SVGSVGElement
  const r = svg.getBoundingClientRect()
  const px = ((e.clientX - r.left) / r.width) * W
  const n = daily.value.length
  if (!n) return
  hover.value = Math.max(0, Math.min(n - 1, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1))))
}
const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
const xLabels = computed(() => {
  const n = daily.value.length
  if (!n) return []
  const idx = [...new Set([0, Math.floor((n - 1) / 2), n - 1])]
  return idx.map(i => ({ i, label: dayLabel(daily.value[i]!.day) }))
})

// ── Tabel halaman ──
const typeFilter = ref<PageType | ''>('')
const sortBy = ref<'views' | 'organik' | 'iklan' | 'entries' | 'visitors'>('views')
const q = ref('')
const pages = computed(() => (data.value?.pages ?? [])
  .filter(p => !typeFilter.value || p.page_type === typeFilter.value)
  .filter(p => !q.value || `${p.path} ${p.title ?? ''}`.toLowerCase().includes(q.value.toLowerCase()))
  .sort((a, b) => b[sortBy.value] - a[sortBy.value])
  .slice(0, 100))
const devices = computed(() => Object.entries(data.value?.devices ?? {}).sort((a, b) => b[1] - a[1]))
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl text-brand">Trafik Halaman</h1>
          <p class="mt-1 text-sm text-brand-600">Kunjungan halaman publik dari Google, iklan, media sosial, dan lainnya. Tanpa cookie; kunjungan admin tidak dihitung.</p>
        </div>
        <div class="flex gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold" role="group" aria-label="Rentang waktu">
          <button v-for="d in [7, 30, 90, 365]" :key="d" class="rounded-full px-3 py-1.5" :class="days === d ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="days = d">
            {{ d === 365 ? '1 tahun' : `${d} hari` }}
          </button>
        </div>
      </div>
      <p v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error.message }}</p>
      <p v-else-if="pending && !data" class="mt-6 text-sm text-brand-500">Memuat…</p>

      <template v-if="data">
        <!-- KPI -->
        <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="card p-4">
            <p class="text-xs text-brand-500">Total dilihat</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(t.views) }}</p>
            <p class="mt-1 text-xs text-brand-400">{{ num(t.sessions) }} sesi · {{ data.days }} hari</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">Pengunjung unik</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(t.visitors) }}</p>
            <p class="mt-1 text-xs text-brand-400">dihitung per hari</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">Dilihat dari organik</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(src('organik').views) }}</p>
            <p class="mt-1 text-xs text-brand-400">{{ pct(src('organik').views, t.views) }}% · {{ num(src('organik').entries) }} sesi dari mesin pencari</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">Dilihat dari iklan</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(src('iklan').views) }}</p>
            <p class="mt-1 text-xs text-brand-400">{{ pct(src('iklan').views, t.views) }}% · {{ num(src('iklan').entries) }} sesi iklan</p>
          </div>
        </div>

        <div class="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <!-- Harian -->
          <section class="card p-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h2 class="font-semibold text-brand">Kunjungan per hari</h2>
              <ul class="flex flex-wrap gap-3 text-xs text-brand-700">
                <li v-for="s in SERIES" :key="s.key" class="flex items-center gap-1.5"><span class="h-0.5 w-4 rounded" :style="{ background: s.color }" />{{ s.label }}</li>
              </ul>
            </div>
            <div class="relative mt-3">
              <svg :viewBox="`0 0 ${W} ${H}`" class="w-full touch-none" role="img" :aria-label="`Grafik kunjungan ${data.days} hari terakhir`" @pointermove="onMove" @pointerleave="hover = null">
                <g class="text-brand-300">
                  <line v-for="tk in ticks" :key="tk" :x1="PAD.l" :x2="W - PAD.r" :y1="y(tk)" :y2="y(tk)" stroke="currentColor" stroke-opacity=".35" stroke-width="1" />
                </g>
                <text v-for="tk in ticks" :key="`l${tk}`" :x="PAD.l - 6" :y="y(tk) + 4" text-anchor="end" class="fill-brand-500 text-[10px]">{{ num(tk) }}</text>
                <text v-for="l in xLabels" :key="l.i" :x="x(l.i)" :y="H - 6" :text-anchor="l.i === 0 ? 'start' : l.i === daily.length - 1 ? 'end' : 'middle'" class="fill-brand-500 text-[10px]">{{ l.label }}</text>
                <path v-for="s in [...SERIES].reverse()" :key="s.key" :d="line(s.key)" fill="none" :stroke="s.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                <template v-if="hover !== null && daily[hover]">
                  <line :x1="x(hover)" :x2="x(hover)" :y1="PAD.t" :y2="H - PAD.b" stroke="#2f4a3a" stroke-opacity=".3" />
                  <circle v-for="s in SERIES" :key="s.key" :cx="x(hover)" :cy="y(daily[hover]![s.key])" r="4" :fill="s.color" stroke="#fff" stroke-width="2" />
                </template>
              </svg>
              <div
                v-if="hover !== null && daily[hover]"
                class="pointer-events-none absolute top-0 rounded-xl bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-brand-100"
                :style="{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > daily.length / 2 ? '-105%' : '5%'})` }"
              >
                <p class="font-semibold text-brand-900">{{ dayLabel(daily[hover]!.day) }}</p>
                <p v-for="s in SERIES" :key="s.key" class="mt-0.5 flex items-center gap-1.5 text-brand-700">
                  <span class="h-2 w-2 rounded-full" :style="{ background: s.color }" />{{ s.label }}: <b class="text-brand-900">{{ num(daily[hover]![s.key]) }}</b>
                </p>
                <p class="mt-0.5 text-brand-500">{{ num(daily[hover]!.visitors) }} pengunjung</p>
              </div>
            </div>
          </section>

          <!-- Sumber -->
          <section class="card p-5">
            <h2 class="font-semibold text-brand">Sumber trafik</h2>
            <ul class="mt-4 grid gap-3">
              <li v-for="s in SOURCES" :key="s.key" :title="s.hint">
                <div class="flex items-baseline justify-between gap-2 text-sm">
                  <span class="flex items-center gap-2 font-medium text-brand-900"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: s.color }" />{{ s.label }}</span>
                  <span class="text-brand-700"><b class="text-brand-900">{{ num(src(s.key).views) }}</b> · {{ pct(src(s.key).views, t.views) }}%</span>
                </div>
                <div class="mt-1.5 h-2 rounded-full bg-brand-50">
                  <div class="h-2 rounded-full" :style="{ width: `${(src(s.key).views / maxSrc) * 100}%`, background: s.color }" />
                </div>
                <p class="mt-1 text-[11px] text-brand-500">{{ num(src(s.key).entries) }} sesi · {{ num(src(s.key).visitors) }} pengunjung · {{ s.hint }}</p>
              </li>
            </ul>
          </section>
        </div>

        <!-- Jenis halaman -->
        <section class="card mt-5 overflow-x-auto p-5">
          <h2 class="font-semibold text-brand">Per jenis halaman</h2>
          <table class="mt-3 w-full min-w-[520px] text-sm">
            <thead class="text-left text-xs text-brand-500">
              <tr><th class="py-2 font-medium">Jenis</th><th class="py-2 text-right font-medium">Dilihat</th><th class="py-2 text-right font-medium">Pengunjung</th><th class="py-2 text-right font-medium">Organik</th><th class="py-2 text-right font-medium">Iklan</th></tr>
            </thead>
            <tbody class="divide-y divide-brand-100">
              <tr v-for="r in data.types" :key="r.page_type" class="cursor-pointer hover:bg-brand-50/60" @click="typeFilter = r.page_type">
                <td class="py-2 font-medium text-brand-900">{{ TYPES[r.page_type] }}</td>
                <td class="py-2 text-right tabular-nums">{{ num(r.views) }}</td>
                <td class="py-2 text-right tabular-nums">{{ num(r.visitors) }}</td>
                <td class="py-2 text-right tabular-nums">{{ num(r.organik) }} <span class="text-xs text-brand-400">{{ pct(r.organik, r.views) }}%</span></td>
                <td class="py-2 text-right tabular-nums">{{ num(r.iklan) }}</td>
              </tr>
              <tr v-if="!data.types.length"><td colspan="5" class="py-4 text-brand-500">Belum ada kunjungan tercatat di rentang ini.</td></tr>
            </tbody>
          </table>
        </section>

        <!-- Halaman teratas -->
        <section class="card mt-5 p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold text-brand">Halaman paling sering dilihat</h2>
            <div class="flex flex-wrap gap-2">
              <input v-model="q" class="input !w-44 !py-1.5 text-sm" placeholder="Cari halaman…">
              <select v-model="typeFilter" class="input !w-auto !py-1.5 text-sm">
                <option value="">Semua jenis</option>
                <option v-for="(label, k) in TYPES" :key="k" :value="k">{{ label }}</option>
              </select>
              <select v-model="sortBy" class="input !w-auto !py-1.5 text-sm">
                <option value="views">Urut: dilihat</option>
                <option value="organik">Urut: organik</option>
                <option value="iklan">Urut: iklan</option>
                <option value="entries">Urut: halaman masuk</option>
                <option value="visitors">Urut: pengunjung</option>
              </select>
            </div>
          </div>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full min-w-[760px] text-sm">
              <thead class="text-left text-xs text-brand-500">
                <tr>
                  <th class="py-2 font-medium">Halaman</th>
                  <th class="py-2 text-right font-medium">Dilihat</th>
                  <th class="py-2 text-right font-medium">Pengunjung</th>
                  <th class="py-2 text-right font-medium" title="Sesi yang masuk pertama kali lewat halaman ini">Halaman masuk</th>
                  <th v-for="s in SOURCES" :key="s.key" class="py-2 text-right font-medium">
                    <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-sm" :style="{ background: s.color }" />{{ s.label }}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-100">
                <tr v-for="p in pages" :key="p.path">
                  <td class="max-w-[280px] py-2">
                    <a :href="p.path" target="_blank" rel="noopener" class="block truncate font-medium text-brand-900 hover:underline">{{ p.title || p.path }}</a>
                    <span class="block truncate text-xs text-brand-500">{{ TYPES[p.page_type] }} · {{ p.path }}</span>
                  </td>
                  <td class="py-2 text-right font-semibold tabular-nums">{{ num(p.views) }}</td>
                  <td class="py-2 text-right tabular-nums">{{ num(p.visitors) }}</td>
                  <td class="py-2 text-right tabular-nums">{{ num(p.entries) }}</td>
                  <td v-for="s in SOURCES" :key="s.key" class="py-2 text-right tabular-nums" :class="p[s.key] ? 'text-brand-900' : 'text-brand-300'">{{ num(p[s.key]) }}</td>
                </tr>
                <tr v-if="!pages.length"><td colspan="9" class="py-4 text-brand-500">Tidak ada data.</td></tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-xs text-brand-500">Kolom sumber = jumlah dilihat dari sesi yang datang lewat sumber tersebut. Klik baris "Per jenis halaman" untuk menyaring.</p>
        </section>

        <div class="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <section class="card p-5">
            <h2 class="text-sm font-semibold text-brand">Mesin pencari & iklan</h2>
            <ul class="mt-3 grid gap-1.5 text-sm">
              <li v-for="e in data.engines" :key="e.name" class="flex justify-between"><span>{{ e.name }}</span><b class="tabular-nums">{{ num(e.views) }}</b></li>
              <li v-if="!data.engines.length" class="text-brand-500">Belum ada.</li>
            </ul>
            <p class="mt-2 text-[11px] text-brand-500">Jumlah sesi masuk.</p>
          </section>
          <section class="card p-5">
            <h2 class="text-sm font-semibold text-brand">Situs perujuk</h2>
            <ul class="mt-3 grid gap-1.5 text-sm">
              <li v-for="r in data.referrers.slice(0, 12)" :key="r.host" class="flex justify-between gap-2"><span class="truncate">{{ r.host }}</span><b class="tabular-nums">{{ num(r.sessions) }}</b></li>
              <li v-if="!data.referrers.length" class="text-brand-500">Belum ada.</li>
            </ul>
          </section>
          <section class="card p-5">
            <h2 class="text-sm font-semibold text-brand">Kampanye (UTM)</h2>
            <ul class="mt-3 grid gap-1.5 text-sm">
              <li v-for="(c, i) in data.campaigns.slice(0, 12)" :key="i" class="flex justify-between gap-2">
                <span class="min-w-0 truncate" :title="`${c.source ?? '-'} / ${c.medium ?? '-'}`">{{ c.campaign || c.source }}<span class="block truncate text-[11px] text-brand-500">{{ c.source ?? '-' }} / {{ c.medium ?? '-' }}</span></span>
                <b class="tabular-nums">{{ num(c.sessions) }}</b>
              </li>
              <li v-if="!data.campaigns.length" class="text-brand-500">Belum ada. Tambahkan ?utm_source=…&amp;utm_medium=cpc&amp;utm_campaign=… di link iklan.</li>
            </ul>
          </section>
          <section class="card p-5">
            <h2 class="text-sm font-semibold text-brand">Perangkat & negara</h2>
            <ul class="mt-3 grid gap-1.5 text-sm">
              <li v-for="[d, n] in devices" :key="d" class="flex justify-between"><span class="capitalize">{{ d }}</span><b class="tabular-nums">{{ num(n) }} <span class="font-normal text-brand-400">{{ pct(n, t.views) }}%</span></b></li>
            </ul>
            <ul class="mt-3 grid gap-1.5 border-t border-brand-100 pt-3 text-sm">
              <li v-for="c in data.countries" :key="c.country" class="flex justify-between"><span>{{ c.country }}</span><b class="tabular-nums">{{ num(c.views) }}</b></li>
            </ul>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>
