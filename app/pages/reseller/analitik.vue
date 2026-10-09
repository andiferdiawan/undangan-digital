<script setup lang="ts">
useSeoMeta({ title: 'Analitik Link Reseller', robots: 'noindex' })

interface LinkStat { clicks: number, visitors: number, orders: number, paid: number, revenue: number, commission: number }
interface LinkRow extends LinkStat { id: string, slug: string, label: string, target_path: string, is_active: boolean, created_at: string }
interface Stats {
  days: number
  code: string
  totals: LinkStat
  daily: { day: string, clicks: number, paid: number }[]
  links: LinkRow[]
  main: LinkStat
  sources: { source: string, clicks: number }[]
  referrers: { host: string, clicks: number }[]
  landings: { path: string, clicks: number }[]
  devices: Record<string, number>
  recent_sales: { at: string, amount: number, commission: number, link: string, theme: string | null }[]
}

const supabase = useSupabaseClient()
const days = ref(30)
const { data, error, refresh, pending } = await useAsyncData('reseller-link-stats', async () => {
  const { data, error } = await supabase.rpc('reseller_link_stats', { p_days: days.value } as never)
  if (error) throw createError({ statusCode: 403, statusMessage: error.message })
  return data as Stats
}, { watch: [days], server: false })

const origin = computed(() => String(useRuntimeConfig().public.siteUrl || (import.meta.client ? window.location.origin : '')).replace(/\/$/, ''))
const linkUrl = (slug?: string) => `${origin.value}/r/${data.value?.code ?? ''}${slug ? `/${slug}` : ''}`
const num = (n: number) => (n ?? 0).toLocaleString('id-ID')
const cr = (s: LinkStat) => (s.visitors ? `${((s.paid / s.visitors) * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%` : '—')
const t = computed(() => data.value?.totals ?? { clicks: 0, visitors: 0, orders: 0, paid: 0, revenue: 0, commission: 0 })

/** Semua baris link: link utama + link pelacakan, urut klik terbanyak. */
const rows = computed(() => {
  if (!data.value) return []
  const main = { id: '', slug: '', label: 'Link utama', target_path: '/', is_active: true, created_at: '', ...data.value.main }
  return [main, ...data.value.links].sort((a, b) => b.paid - a.paid || b.clicks - a.clicks)
})
const best = computed(() => rows.value.find(r => r.paid > 0))

// ── Grafik klik harian (batang) ──
const daily = computed(() => data.value?.daily ?? [])
const maxClicks = computed(() => Math.max(1, ...daily.value.map(d => d.clicks)))
const hover = ref<number | null>(null)
const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

// ── Sumber ──
const SOURCE_META: Record<string, { label: string, color: string }> = {
  organik: { label: 'Google / mesin pencari', color: '#1baf7a' },
  iklan: { label: 'Iklan', color: '#eb6834' },
  sosial: { label: 'Media sosial & WhatsApp', color: '#2a78d6' },
  referral: { label: 'Situs lain', color: '#eda100' },
  langsung: { label: 'Langsung / chat / tanpa referrer', color: '#e87ba4' },
}
const maxSource = computed(() => Math.max(1, ...(data.value?.sources ?? []).map(s => s.clicks)))

// ── Buat link ──
const { data: catalog } = await useCatalog()
const { data: posts } = await useAsyncData('reseller-blog-targets', async () => {
  const { data } = await supabase.from('blog_posts').select('slug, title').eq('status', 'published').order('published_at', { ascending: false }).limit(100)
  return (data ?? []) as { slug: string, title: string }[]
}, { server: false })
type Kind = 'beranda' | 'katalog' | 'jenis' | 'tema' | 'artikel'
const form = reactive({ label: '', slug: '', kind: 'beranda' as Kind, value: '' })
const slugTouched = ref(false)
watch(() => form.label, (l) => { if (!slugTouched.value) form.slug = slugify(l).slice(0, 40).replace(/-+$/, '') })
watch(() => form.kind, () => { form.value = '' })
const targetPath = computed(() => {
  switch (form.kind) {
    case 'katalog': return '/katalog'
    case 'jenis': return form.value ? `/katalog/${form.value}` : ''
    case 'tema': return form.value ? `/tema/${form.value}` : ''
    case 'artikel': return form.value ? `/blog/${form.value}` : ''
    default: return '/'
  }
})
const saving = ref(false)
const msg = ref<{ ok: boolean, text: string } | null>(null)
async function createLink() {
  if (!targetPath.value) return
  saving.value = true
  msg.value = null
  const uid = (useSupabaseUser().value as { sub?: string } | null)?.sub
  const { error } = await supabase.from('reseller_links').insert({
    reseller_id: uid, label: form.label.trim(), slug: form.slug, target_path: targetPath.value,
  } as never)
  saving.value = false
  if (error) {
    msg.value = { ok: false, text: error.message.includes('duplicate') ? 'Nama link (slug) sudah dipakai. Ganti dengan yang lain.' : friendlyError(error) }
    return
  }
  msg.value = { ok: true, text: `Link dibuat: ${linkUrl(form.slug)}` }
  Object.assign(form, { label: '', slug: '', kind: 'beranda', value: '' })
  slugTouched.value = false
  await refresh()
}
async function toggle(r: LinkRow) {
  await supabase.from('reseller_links').update({ is_active: !r.is_active } as never).eq('id', r.id)
  await refresh()
}

const copied = ref('')
async function copy(text: string, k: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* diabaikan */ }
  copied.value = k
  setTimeout(() => (copied.value = ''), 1500)
}
const targetLabel = (p: string) => {
  if (p === '/') return 'Beranda'
  if (p === '/katalog') return 'Katalog semua tema'
  const m = /^\/(katalog|tema|blog)\/(.+)$/.exec(p)
  if (!m) return p
  if (m[1] === 'tema') return `Tema: ${catalog.value?.themes.find(x => x.slug === m[2])?.name ?? m[2]}`
  if (m[1] === 'blog') return `Artikel: ${posts.value?.find(x => x.slug === m[2])?.title ?? m[2]}`
  return `Katalog: ${catalog.value?.groups.find(g => g.slug === m[2])?.name ?? m[2]}`
}
const devices = computed(() => Object.entries(data.value?.devices ?? {}).sort((a, b) => b[1] - a[1]))
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
      <NuxtLink to="/reseller/dashboard" class="text-brand-600 underline">← Dashboard reseller</NuxtLink>
      <NuxtLink to="/reseller/panduan#link-pelacakan" class="font-semibold text-brand-700 underline">📘 Panduan link & analitik</NuxtLink>
    </div>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-display text-3xl text-brand">Analitik Link</h1>
        <p class="mt-1 text-sm text-brand-600">Link mana yang paling banyak diklik dan menghasilkan penjualan. Pembeli tercatat dari link terakhir yang mereka klik (30 hari).</p>
      </div>
      <div class="flex gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold" role="group" aria-label="Rentang waktu">
        <button v-for="d in [7, 30, 90]" :key="d" class="rounded-full px-3 py-1.5" :class="days === d ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="days = d">{{ d }} hari</button>
      </div>
    </div>

    <div v-if="error" class="card mt-6 p-8 text-center">
      <p class="font-semibold text-brand-900">Analitik hanya untuk reseller aktif.</p>
      <NuxtLink to="/reseller" class="btn-primary mt-4">Daftar Reseller</NuxtLink>
    </div>
    <p v-else-if="pending && !data" class="mt-6 text-sm text-brand-500">Memuat…</p>

    <template v-if="data">
      <!-- KPI -->
      <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="card p-4">
          <p class="text-xs text-brand-500">Klik link</p>
          <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(t.clicks) }}</p>
          <p class="mt-1 text-xs text-brand-400">{{ num(t.visitors) }} pengunjung unik</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-brand-500">Pesanan dari link</p>
          <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(t.orders) }}</p>
          <p class="mt-1 text-xs text-brand-400">{{ num(t.paid) }} lunas</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-brand-500">Konversi</p>
          <p class="mt-1 text-2xl font-semibold text-brand-900">{{ cr(t) }}</p>
          <p class="mt-1 text-xs text-brand-400">lunas ÷ pengunjung unik</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-brand-500">Komisi dari link</p>
          <p class="mt-1 text-2xl font-semibold text-brand-900">{{ rupiah(t.commission) }}</p>
          <p class="mt-1 text-xs text-brand-400">penjualan {{ rupiah(t.revenue) }}</p>
        </div>
      </div>
      <p v-if="best" class="mt-3 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-800">
        🏆 Link terbaik: <b>{{ best.label }}</b> — {{ num(best.paid) }} penjualan dari {{ num(best.clicks) }} klik.
      </p>

      <!-- Grafik -->
      <section class="card mt-5 p-5">
        <h2 class="font-semibold text-brand">Klik per hari</h2>
        <div class="relative mt-4">
          <div class="flex h-36 items-end gap-[2px]" @pointerleave="hover = null">
            <div
              v-for="(d, i) in daily" :key="d.day" class="flex h-full flex-1 cursor-default items-end" :aria-label="`${dayLabel(d.day)}: ${d.clicks} klik, ${d.paid} terjual`"
              @pointerenter="hover = i"
            >
              <div class="w-full rounded-t" :class="hover === i ? 'bg-[#1c5cab]' : 'bg-[#2a78d6]'" :style="{ height: `${Math.max(d.clicks ? 3 : 1, (d.clicks / maxClicks) * 100)}%`, opacity: d.clicks ? 1 : 0.25 }" />
            </div>
          </div>
          <div class="mt-1.5 flex justify-between text-[10px] text-brand-500">
            <span>{{ daily[0] && dayLabel(daily[0].day) }}</span><span>{{ daily.at(-1) && dayLabel(daily.at(-1)!.day) }}</span>
          </div>
          <div
            v-if="hover !== null && daily[hover]" class="pointer-events-none absolute -top-2 rounded-xl bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-brand-100"
            :style="{ left: `${((hover + 0.5) / daily.length) * 100}%`, transform: `translateX(${hover > daily.length / 2 ? '-105%' : '5%'})` }"
          >
            <p class="font-semibold text-brand-900">{{ dayLabel(daily[hover]!.day) }}</p>
            <p class="text-brand-700">{{ num(daily[hover]!.clicks) }} klik · {{ num(daily[hover]!.paid) }} terjual</p>
          </div>
        </div>
      </section>

      <!-- Per link -->
      <section class="card mt-5 overflow-hidden">
        <div class="p-5 pb-0">
          <h2 class="font-semibold text-brand">Performa per link</h2>
          <p class="mt-1 text-xs text-brand-500">Konversi = penjualan lunas ÷ pengunjung unik. Link nonaktif tetap mengarah ke beranda dan kliknya masuk ke "Link utama".</p>
        </div>
        <div class="mt-3 overflow-x-auto">
          <table class="table-cards w-full text-sm sm:min-w-[820px]">
            <thead>
              <tr class="border-y border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500">
                <th class="px-4 py-2 font-medium">Link</th>
                <th class="px-3 py-2 text-right font-medium">Klik</th>
                <th class="px-3 py-2 text-right font-medium">Unik</th>
                <th class="px-3 py-2 text-right font-medium">Pesanan</th>
                <th class="px-3 py-2 text-right font-medium">Lunas</th>
                <th class="px-3 py-2 text-right font-medium">Konversi</th>
                <th class="px-3 py-2 text-right font-medium">Komisi</th>
                <th class="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id || 'main'" class="border-b border-brand-50 last:border-0" :class="!r.is_active && 'opacity-60'">
                <td class="tc-title px-4 py-3 sm:max-w-[300px]">
                  <p class="font-medium text-brand-900">{{ r.label }} <span v-if="!r.is_active" class="chip bg-brand-50 text-brand-500">nonaktif</span></p>
                  <p class="truncate font-mono text-xs text-brand-600">{{ linkUrl(r.slug) }}</p>
                  <p class="truncate text-xs text-brand-400">→ {{ targetLabel(r.target_path) }}</p>
                </td>
                <td data-label="Klik" class="px-3 py-3 text-right font-semibold tabular-nums">{{ num(r.clicks) }}</td>
                <td data-label="Pengunjung unik" class="px-3 py-3 text-right tabular-nums">{{ num(r.visitors) }}</td>
                <td data-label="Pesanan" class="px-3 py-3 text-right tabular-nums">{{ num(r.orders) }}</td>
                <td data-label="Lunas" class="px-3 py-3 text-right font-semibold tabular-nums" :class="r.paid ? 'text-green-700' : ''">{{ num(r.paid) }}</td>
                <td data-label="Konversi" class="px-3 py-3 text-right tabular-nums">{{ cr(r) }}</td>
                <td data-label="Komisi" class="px-3 py-3 text-right tabular-nums">{{ rupiah(r.commission) }}</td>
                <td class="tc-actions whitespace-nowrap px-4 py-3 text-right text-xs">
                  <button class="font-semibold text-brand" @click="copy(linkUrl(r.slug), r.id || 'main')">{{ copied === (r.id || 'main') ? '✓ Disalin' : 'Salin' }}</button>
                  <a :href="`https://wa.me/?text=${encodeURIComponent(linkUrl(r.slug))}`" target="_blank" rel="noopener" class="ml-3 font-semibold text-[#128c4a]">WA</a>
                  <button v-if="r.id" class="ml-3 text-brand-500" @click="toggle(r)">{{ r.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Buat link -->
      <form class="card mt-5 grid gap-3 p-5" @submit.prevent="createLink">
        <h2 class="font-semibold text-brand">Buat link pelacakan baru</h2>
        <p class="-mt-1 text-xs text-brand-500">Buat link berbeda untuk tiap tempat Anda berbagi (bio Instagram, status WA, grup Facebook, iklan) agar ketahuan mana yang paling menghasilkan.</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="label">Nama link
            <input v-model="form.label" class="input" minlength="2" maxlength="60" required placeholder="Contoh: Bio Instagram">
          </label>
          <label class="label">Alamat link
            <div class="flex min-w-0 items-center gap-1 text-sm text-brand-500">
              <span class="shrink-0">/r/{{ data.code }}/</span>
              <input v-model="form.slug" class="input min-w-0" pattern="[a-z0-9]+(-[a-z0-9]+)*" minlength="2" maxlength="40" required placeholder="bio-ig" @input="slugTouched = true">
            </div>
          </label>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="label">Arahkan ke
            <select v-model="form.kind" class="input">
              <option value="beranda">Beranda</option>
              <option value="katalog">Katalog semua tema</option>
              <option value="jenis">Katalog per jenis acara</option>
              <option value="tema">Tema tertentu</option>
              <option value="artikel">Artikel blog</option>
            </select>
          </label>
          <label v-if="form.kind === 'jenis'" class="label">Jenis acara
            <select v-model="form.value" class="input" required>
              <option value="" disabled>Pilih…</option>
              <option v-for="g in catalog?.groups" :key="g.slug" :value="g.slug">{{ g.name }}</option>
            </select>
          </label>
          <label v-else-if="form.kind === 'tema'" class="label">Tema
            <select v-model="form.value" class="input" required>
              <option value="" disabled>Pilih tema…</option>
              <option v-for="th in catalog?.themes" :key="th.id" :value="th.slug">{{ th.name }} ({{ th.code }})</option>
            </select>
          </label>
          <label v-else-if="form.kind === 'artikel'" class="label">Artikel
            <select v-model="form.value" class="input" required>
              <option value="" disabled>Pilih artikel…</option>
              <option v-for="p in posts" :key="p.slug" :value="p.slug">{{ p.title }}</option>
            </select>
          </label>
        </div>
        <p v-if="form.slug" class="break-all rounded-xl bg-brand-50 px-3 py-2 font-mono text-xs text-brand-700">{{ linkUrl(form.slug) }} → {{ targetPath || '…' }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <button class="btn-primary" :disabled="saving || !targetPath">{{ saving ? 'Menyimpan…' : 'Buat link' }}</button>
          <span v-if="msg" class="break-all text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'">{{ msg.text }}</span>
        </div>
      </form>

      <div class="mt-5 grid gap-5 md:grid-cols-2">
        <!-- Sumber klik -->
        <section class="card min-w-0 p-5">
          <h2 class="font-semibold text-brand">Asal klik</h2>
          <ul class="mt-3 grid gap-3">
            <li v-for="s in data.sources" :key="s.source">
              <div class="flex items-baseline justify-between gap-2 text-sm">
                <span class="flex items-center gap-2 text-brand-900"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: SOURCE_META[s.source]?.color }" />{{ SOURCE_META[s.source]?.label ?? s.source }}</span>
                <b class="tabular-nums text-brand-900">{{ num(s.clicks) }}</b>
              </div>
              <div class="mt-1 h-2 rounded-full bg-brand-50"><div class="h-2 rounded-full" :style="{ width: `${(s.clicks / maxSource) * 100}%`, background: SOURCE_META[s.source]?.color }" /></div>
            </li>
            <li v-if="!data.sources.length" class="text-sm text-brand-500">Belum ada klik di rentang ini. Bagikan link Anda!</li>
          </ul>
          <ul v-if="data.referrers.length" class="mt-4 grid gap-1.5 border-t border-brand-100 pt-3 text-sm">
            <li v-for="r in data.referrers" :key="r.host" class="flex min-w-0 justify-between gap-2"><span class="min-w-0 truncate" :title="r.host">{{ r.host }}</span><b class="tabular-nums">{{ num(r.clicks) }}</b></li>
          </ul>
        </section>

        <!-- Penjualan terbaru -->
        <section class="card min-w-0 p-5">
          <h2 class="font-semibold text-brand">Penjualan terbaru dari link</h2>
          <ul class="mt-3 divide-y divide-brand-100 text-sm">
            <li v-for="(s, i) in data.recent_sales" :key="i" class="flex items-start justify-between gap-3 py-2">
              <span class="min-w-0">
                <span class="block truncate font-medium text-brand-900">{{ s.theme ?? 'Undangan' }}</span>
                <span class="block truncate text-xs text-brand-500">{{ s.link }} · {{ tanggal(s.at, true) }}</span>
              </span>
              <span class="shrink-0 text-right"><b class="text-green-700">+{{ rupiah(s.commission) }}</b><span class="block text-xs text-brand-500">{{ rupiah(s.amount) }}</span></span>
            </li>
            <li v-if="!data.recent_sales.length" class="py-2 text-brand-500">Belum ada penjualan dari link di rentang ini.</li>
          </ul>
          <div v-if="devices.length" class="mt-4 border-t border-brand-100 pt-3 text-sm">
            <p class="text-xs font-semibold text-brand-500">Perangkat pengklik</p>
            <p class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-brand-800">
              <span v-for="[d, n] in devices" :key="d" class="capitalize">{{ d }} <b class="tabular-nums">{{ num(n) }}</b></span>
            </p>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
