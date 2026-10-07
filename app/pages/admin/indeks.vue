<script setup lang="ts">
/**
 * Indeks SEO: semua URL publik (isi sitemap) dengan status per mesin pencari, dan aksi massal:
 * kirim ke IndexNow (Bing, Yandex, Seznam, Naver, Yep) & Bing Webmaster API, cek status indeks Google
 * (URL Inspection) & Bing, kirim ulang sitemap ke Google, serta kirim manual satu per satu ke Brave.
 * Google & Brave tidak menyediakan API "minta indeks" untuk halaman biasa: Google lewat tombol di GSC
 * (tautan per URL), Brave lewat form search.brave.com/submit-url.
 */
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Indeks SEO' })

type UrlType = 'beranda' | 'katalog' | 'tema' | 'blog' | 'halaman'
interface Row {
  path: string, type: UrlType, lastmod: string | null
  indexnow_at?: string | null, bing_submitted_at?: string | null, bing_crawled_at?: string | null, bing_http_status?: number | null, bing_checked_at?: string | null
  google_verdict?: string | null, google_coverage?: string | null, google_last_crawl?: string | null, google_link?: string | null, google_checked_at?: string | null
  brave_submitted_at?: string | null
}
interface Data { origin: string, engines: { bing: boolean, google: { email: string | null, property: string | null } | null }, urls: Row[] }
type CheckResult = { path: string, ok: boolean, status?: number, error?: string } & Record<string, unknown>

const { data, error: loadError } = await useAsyncData('admin-seo-urls', () => $fetch<Data>('/api/admin/seo/urls'), { server: false })
const rows = ref<Row[]>([])
watch(data, (d) => { rows.value = d?.urls ?? [] }, { immediate: true })
const origin = computed(() => data.value?.origin ?? '')
const google = computed(() => data.value?.engines.google ?? null)
const googleReady = computed(() => !!google.value?.property)
const bingReady = computed(() => !!data.value?.engines.bing)
const urlOf = (r: Row) => `${origin.value}${r.path}`

// ── Status ──
type GState = 'terindeks' | 'belum' | 'belum-dicek'
const gState = (r: Row): GState => !r.google_checked_at ? 'belum-dicek' : r.google_verdict === 'PASS' || r.google_verdict === 'PARTIAL' ? 'terindeks' : 'belum'
const gscLink = (r: Row) => r.google_link
  || (google.value?.property
    ? `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(google.value.property)}&id=${encodeURIComponent(urlOf(r))}`
    : 'https://search.google.com/search-console')
const summary = computed(() => {
  const s = { total: rows.value.length, terindeks: 0, belum: 0, belumDicek: 0, bingCrawled: 0, indexnow: 0, brave: 0 }
  for (const r of rows.value) {
    const g = gState(r)
    if (g === 'terindeks') s.terindeks++
    else if (g === 'belum') s.belum++
    else s.belumDicek++
    if (r.bing_crawled_at) s.bingCrawled++
    if (r.indexnow_at) s.indexnow++
    if (r.brave_submitted_at) s.brave++
  }
  return s
})
const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' }) : ''

// ── Filter, pencarian & halaman ──
const TYPES = [
  { key: '', label: 'Semua' }, { key: 'tema', label: 'Tema' }, { key: 'blog', label: 'Blog' },
  { key: 'katalog', label: 'Katalog' }, { key: 'lain', label: 'Lainnya' },
] as const
const filter = reactive({ type: '' as string, google: '' as '' | GState, send: '' as '' | 'indexnow' | 'bing' | 'brave', q: '' })
const filtered = computed(() => {
  const q = filter.q.trim().toLowerCase()
  return rows.value.filter(r =>
    (!filter.type || (filter.type === 'lain' ? r.type === 'beranda' || r.type === 'halaman' : r.type === filter.type))
    && (!filter.google || gState(r) === filter.google)
    && (!filter.send || (filter.send === 'indexnow' ? !r.indexnow_at : filter.send === 'bing' ? !r.bing_submitted_at : !r.brave_submitted_at))
    && (!q || r.path.toLowerCase().includes(q)))
})
const typeCount = (key: string) => rows.value.filter(r => !key || (key === 'lain' ? r.type === 'beranda' || r.type === 'halaman' : r.type === key)).length
const PER_PAGE = 50
const page = ref(1)
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const visible = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(() => [filter.type, filter.google, filter.send, filter.q], () => { page.value = 1 })
watch(pages, (n) => { if (page.value > n) page.value = n })

// ── Pilihan ──
const selected = ref(new Set<string>())
const allFilteredSelected = computed(() => filtered.value.length > 0 && filtered.value.every(r => selected.value.has(r.path)))
const allVisibleSelected = computed(() => visible.value.length > 0 && visible.value.every(r => selected.value.has(r.path)))
function toggle(path: string) {
  if (selected.value.has(path)) selected.value.delete(path)
  else selected.value.add(path)
}
function toggleVisible() {
  const on = !allVisibleSelected.value
  for (const r of visible.value) on ? selected.value.add(r.path) : selected.value.delete(r.path)
}
function selectFiltered() {
  if (allFilteredSelected.value) for (const r of filtered.value) selected.value.delete(r.path)
  else for (const r of filtered.value) selected.value.add(r.path)
}
const selectedPaths = () => rows.value.filter(r => selected.value.has(r.path)).map(r => r.path)

// ── Aksi massal ──
const msg = ref<{ ok: boolean, text: string } | null>(null)
const job = ref<{ label: string, done: number, total: number } | null>(null)
let cancelJob = false
const cancel = () => { cancelJob = true }
const errText = (e: unknown) => friendlyError(apiError(e))
function patchRows(updates: (Partial<Row> & { path: string })[]) {
  const byPath = new Map(rows.value.map(r => [r.path, r]))
  for (const u of updates) {
    const r = byPath.get(u.path)
    if (r) Object.assign(r, u)
  }
}

async function sendIndexNow(paths = selectedPaths()) {
  if (!paths.length || job.value) return
  job.value = { label: 'Mengirim ke IndexNow', done: 0, total: paths.length }
  msg.value = null
  try {
    const r = await $fetch<{ sent: number, status: number | null, skipped?: string, error?: string }>('/api/admin/indexnow', { method: 'POST', body: { paths } })
    if (r.status === 200 || r.status === 202) {
      const at = new Date().toISOString()
      patchRows(paths.map(path => ({ path, indexnow_at: at })))
      msg.value = { ok: true, text: `${r.sent} URL terkirim ke IndexNow (Bing, Yandex, Seznam, Naver, Yep). Status ${r.status}.` }
    }
    else {
      msg.value = { ok: false, text: r.skipped || r.error || `IndexNow menolak (status ${r.status}). Bila 403, file kunci belum ter-deploy; coba lagi setelah deploy selesai.` }
    }
  }
  catch (e) { msg.value = { ok: false, text: errText(e) } }
  job.value = null
}

async function sendBing(paths = selectedPaths()) {
  if (!paths.length || job.value) return
  if (!confirm(`Kirim ${paths.length} URL ke Bing Webmaster API? Ini memakai kuota kirim URL harian situs.`)) return
  job.value = { label: 'Mengirim ke Bing Webmaster', done: 0, total: paths.length }
  msg.value = null
  try {
    const r = await $fetch<{ sent: number, skipped: number, quotaLeft: number, error: string | null }>('/api/admin/seo/bing/submit', { method: 'POST', body: { paths } })
    const at = new Date().toISOString()
    patchRows(paths.slice(0, r.sent).map(path => ({ path, bing_submitted_at: at })))
    bingQuota.value = bingQuota.value ? { ...bingQuota.value, daily: r.quotaLeft } : bingQuota.value
    msg.value = {
      ok: !r.error && r.sent > 0,
      text: [
        `${r.sent} URL terkirim ke Bing.`,
        r.skipped ? `${r.skipped} URL dilewati karena kuota harian habis; kirim sisanya besok.` : '',
        `Sisa kuota hari ini: ${r.quotaLeft}.`,
        r.error ?? '',
      ].filter(Boolean).join(' '),
    }
  }
  catch (e) { msg.value = { ok: false, text: errText(e) } }
  job.value = null
}

/** Cek status per 20 URL (Google URL Inspection / Bing GetUrlInfo) dengan progres & tombol batal. */
async function check(engine: 'google' | 'bing', paths = selectedPaths()) {
  if (!paths.length || job.value) return
  job.value = { label: engine === 'google' ? 'Mengecek status Google' : 'Mengecek status Bing', done: 0, total: paths.length }
  msg.value = null
  cancelJob = false
  let ok = 0
  const failures: string[] = []
  try {
    for (let i = 0; i < paths.length && !cancelJob; i += 20) {
      const chunk = paths.slice(i, i + 20)
      const r = await $fetch<{ results: CheckResult[], checkedAt: string, stopped?: boolean }>(`/api/admin/seo/${engine}/${engine === 'google' ? 'inspect' : 'check'}`, { method: 'POST', body: { paths: chunk } })
      patchRows(r.results.filter(x => x.ok).map(x => engine === 'google'
        ? { path: x.path, google_verdict: x.verdict as string | null, google_coverage: x.coverage as string | null, google_last_crawl: x.lastCrawl as string | null, google_link: x.link as string | null, google_checked_at: r.checkedAt }
        : { path: x.path, bing_crawled_at: x.crawled as string | null, bing_http_status: x.http as number | null, bing_checked_at: r.checkedAt }))
      ok += r.results.filter(x => x.ok).length
      failures.push(...r.results.filter(x => !x.ok && x.error !== 'Dihentikan').map(x => x.error ?? 'Gagal'))
      if (job.value) job.value.done = Math.min(paths.length, i + chunk.length)
      if (r.stopped) break
    }
  }
  catch (e) { failures.push(errText(e)) }
  const text = [
    `${ok} dari ${paths.length} URL dicek${cancelJob ? ' (dibatalkan)' : ''}.`,
    failures.length ? `Gagal: ${[...new Set(failures)].slice(0, 2).join(' · ')}` : '',
  ].filter(Boolean).join(' ')
  msg.value = { ok: !failures.length, text }
  job.value = null
}

// ── Google: sitemap ──
type Sitemap = { path: string, lastSubmitted?: string, lastDownloaded?: string, isPending?: boolean, warnings?: string, errors?: string, contents?: { type: string, submitted?: string }[] }
const sitemaps = ref<Sitemap[] | null>(null)
const sitemapMsg = ref<{ ok: boolean, text: string } | null>(null)
const sitemapBusy = ref(false)
async function loadSitemaps(submit = false) {
  sitemapBusy.value = true
  sitemapMsg.value = null
  try {
    const r = await $fetch<{ sitemaps: Sitemap[] }>('/api/admin/seo/google/sitemap', { method: submit ? 'POST' : 'GET', body: submit ? {} : undefined })
    sitemaps.value = r.sitemaps
    if (submit) sitemapMsg.value = { ok: true, text: 'Sitemap terkirim ke Google. Google akan mengunduhnya dalam beberapa jam sampai hari.' }
  }
  catch (e) { sitemapMsg.value = { ok: false, text: errText(e) } }
  sitemapBusy.value = false
}
const ourSitemap = computed(() => sitemaps.value?.find(s => s.path === `${origin.value}/sitemap.xml`) ?? sitemaps.value?.[0] ?? null)

// ── Bing: kuota ──
const bingQuota = ref<{ daily: number, monthly: number } | null>(null)
const bingQuotaError = ref('')
async function loadBingQuota() {
  try { bingQuota.value = await $fetch<{ daily: number, monthly: number }>('/api/admin/seo/bing/quota') }
  catch (e) { bingQuotaError.value = errText(e) }
}
watch(data, (d) => {
  if (!d) return
  if (d.engines.google?.property && !sitemaps.value) loadSitemaps()
  if (d.engines.bing && !bingQuota.value) loadBingQuota()
}, { immediate: true })

// ── Brave: form manual, satu per satu ──
const BRAVE_FORM = 'https://search.brave.com/submit-url'
const braveQueue = ref<string[] | null>(null)
const braveNext = computed(() => braveQueue.value?.find(p => !rows.value.find(r => r.path === p)?.brave_submitted_at) ?? null)
const braveDone = computed(() => braveQueue.value?.filter(p => rows.value.find(r => r.path === p)?.brave_submitted_at).length ?? 0)
const copied = ref<string | null>(null)
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    document.body.append(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = text
  setTimeout(() => { if (copied.value === text) copied.value = null }, 2000)
}
async function markBrave(paths: string[], sent: boolean) {
  try {
    const r = await $fetch<{ at: string | null }>('/api/admin/seo/brave', { method: 'POST', body: { paths, sent } })
    patchRows(paths.map(path => ({ path, brave_submitted_at: r.at })))
  }
  catch (e) { msg.value = { ok: false, text: errText(e) } }
}
/** Salin URL, buka (atau pakai ulang) tab form Brave, lalu tandai terkirim. Tab dibuka dulu agar tidak diblokir popup. */
function sendBrave(path: string) {
  window.open(BRAVE_FORM, 'brave-submit')
  copyText(`${origin.value}${path}`)
  markBrave([path], true)
}
function startBrave() {
  const paths = selectedPaths()
  braveQueue.value = paths.length ? paths : filtered.value.map(r => r.path)
  msg.value = { ok: true, text: 'Klik "Salin & buka Brave", tempel URL di form Brave (Ctrl/Cmd+V), kirim, lalu kembali ke sini untuk URL berikutnya.' }
}
</script>

<template>
  <div :class="{ 'pb-28': selected.size || braveQueue }">
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl text-brand">Indeks SEO</h1>
          <p class="mt-1 max-w-2xl text-sm text-brand-600">
            Kirim halaman publik ke mesin pencari dan pantau status indeksnya. Bing (lewat IndexNow & API) bisa dikirim massal;
            Google dan Brave tidak menyediakan API minta-indeks untuk halaman biasa, jadi lewat tautan GSC dan form Brave per URL.
          </p>
        </div>
        <NuxtLink to="/admin/pengaturan#seo" class="btn-ghost btn-sm">Atur koneksi</NuxtLink>
      </div>

      <!-- Koneksi -->
      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-500">IndexNow</p>
          <p class="mt-1 font-semibold text-green-700">Siap</p>
          <p class="mt-1 text-xs text-brand-500">Bing, Yandex, Seznam, Naver, Yep · tanpa kuota ketat · {{ summary.indexnow }} URL pernah dikirim</p>
        </div>
        <div class="card p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-500">Bing Webmaster API</p>
          <template v-if="bingReady">
            <p class="mt-1 font-semibold text-green-700">Terhubung</p>
            <p class="mt-1 text-xs text-brand-500">
              <template v-if="bingQuota">Kuota kirim hari ini: <b>{{ bingQuota.daily }}</b> URL</template>
              <span v-else-if="bingQuotaError" class="text-red-600">{{ bingQuotaError }}</span>
              <template v-else>Memuat kuota…</template>
            </p>
          </template>
          <p v-else class="mt-1 text-sm text-amber-700">Belum diatur · <NuxtLink to="/admin/pengaturan#seo" class="underline">isi API key</NuxtLink></p>
        </div>
        <div class="card p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-500">Google Search Console</p>
          <template v-if="googleReady">
            <p class="mt-1 font-semibold text-green-700">Terhubung</p>
            <p class="mt-1 break-all text-xs text-brand-500">{{ google?.property }}</p>
          </template>
          <p v-else-if="google" class="mt-1 text-sm text-amber-700">Pilih properti di <NuxtLink to="/admin/pengaturan#seo" class="underline">Pengaturan</NuxtLink></p>
          <p v-else class="mt-1 text-sm text-amber-700">Belum diatur · <NuxtLink to="/admin/pengaturan#seo" class="underline">unggah service account</NuxtLink></p>
        </div>
        <div class="card p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-500">Brave Search</p>
          <p class="mt-1 font-semibold text-brand-800">Manual</p>
          <p class="mt-1 text-xs text-brand-500">Tanpa API · form per URL · {{ summary.brave }} URL ditandai terkirim</p>
        </div>
      </div>

      <!-- Ringkasan & sitemap Google -->
      <div class="mt-3 grid gap-3 lg:grid-cols-[2fr_3fr]">
        <div class="card grid grid-cols-3 gap-2 p-4 text-center">
          <button type="button" class="rounded-xl p-2 hover:bg-brand-50" @click="filter.google = 'terindeks'">
            <span class="block text-2xl font-semibold text-green-700">{{ summary.terindeks }}</span>
            <span class="text-xs text-brand-600">Terindeks Google</span>
          </button>
          <button type="button" class="rounded-xl p-2 hover:bg-brand-50" @click="filter.google = 'belum'">
            <span class="block text-2xl font-semibold text-amber-700">{{ summary.belum }}</span>
            <span class="text-xs text-brand-600">Belum terindeks</span>
          </button>
          <button type="button" class="rounded-xl p-2 hover:bg-brand-50" @click="filter.google = 'belum-dicek'">
            <span class="block text-2xl font-semibold text-brand-500">{{ summary.belumDicek }}</span>
            <span class="text-xs text-brand-600">Belum dicek</span>
          </button>
        </div>
        <div class="card flex flex-wrap items-center gap-3 p-4">
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-brand-900">Sitemap di Google</p>
            <p v-if="!googleReady" class="text-xs text-brand-500">Hubungkan Search Console untuk mengirim sitemap dari sini.</p>
            <p v-else-if="ourSitemap" class="text-xs text-brand-600">
              Dikirim {{ fmt(ourSitemap.lastSubmitted) || '—' }} · diunduh Google {{ fmt(ourSitemap.lastDownloaded) || 'belum' }}
              <template v-if="ourSitemap.contents?.[0]?.submitted"> · {{ ourSitemap.contents[0].submitted }} URL</template>
              <span v-if="Number(ourSitemap.errors)" class="text-red-600"> · {{ ourSitemap.errors }} galat</span>
              <span v-if="Number(ourSitemap.warnings)" class="text-amber-700"> · {{ ourSitemap.warnings }} peringatan</span>
              <template v-if="ourSitemap.isPending"> · menunggu diproses</template>
            </p>
            <p v-else-if="sitemaps" class="text-xs text-amber-700">Sitemap belum pernah dikirim ke Google.</p>
            <p v-if="sitemapMsg" class="mt-1 text-xs" :class="sitemapMsg.ok ? 'text-green-700' : 'text-red-600'">{{ sitemapMsg.text }}</p>
          </div>
          <button type="button" class="btn-primary btn-sm" :disabled="!googleReady || sitemapBusy" @click="loadSitemaps(true)">
            {{ sitemapBusy ? 'Memproses…' : 'Kirim ulang sitemap ke Google' }}
          </button>
        </div>
      </div>

      <p v-if="msg" class="mt-4 rounded-xl px-4 py-3 text-sm" :class="msg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'" role="status">{{ msg.text }}</p>
      <div v-if="job" class="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">
        <div class="flex items-center justify-between gap-3">
          <span>{{ job.label }}… {{ job.done }}/{{ job.total }}</span>
          <button v-if="job.label.startsWith('Mengecek')" type="button" class="text-xs font-semibold underline" @click="cancel">Batal</button>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div class="h-full bg-brand transition-all" :style="{ width: `${job.total ? Math.max(4, job.done / job.total * 100) : 0}%` }" />
        </div>
      </div>

      <!-- Daftar URL -->
      <section class="card mt-4 p-4 sm:p-5">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
          <input v-model="filter.q" type="search" class="input py-2 text-sm lg:max-w-xs" placeholder="Cari path, mis. /tema/…" aria-label="Cari URL">
          <div class="flex gap-1 overflow-x-auto rounded-full bg-brand-50 p-1 text-xs font-semibold [scrollbar-width:none] lg:w-max" role="tablist" aria-label="Jenis halaman">
            <button
              v-for="t in TYPES" :key="t.key" type="button" role="tab" :aria-selected="filter.type === t.key"
              class="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5" :class="filter.type === t.key ? 'bg-white text-brand shadow-sm' : 'text-brand-600'"
              @click="filter.type = t.key"
            >
              {{ t.label }} <span class="font-normal opacity-70">{{ typeCount(t.key) }}</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2 lg:flex">
            <select v-model="filter.google" class="input py-2 text-sm" aria-label="Status Google">
              <option value="">Google: semua</option>
              <option value="terindeks">Terindeks</option>
              <option value="belum">Belum terindeks</option>
              <option value="belum-dicek">Belum dicek</option>
            </select>
            <select v-model="filter.send" class="input py-2 text-sm" aria-label="Status kirim">
              <option value="">Kirim: semua</option>
              <option value="indexnow">Belum ke IndexNow</option>
              <option value="bing">Belum ke Bing API</option>
              <option value="brave">Belum ke Brave</option>
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-brand-100 pb-2 text-xs text-brand-600">
          <label class="flex items-center gap-2 font-semibold">
            <input type="checkbox" class="h-4 w-4 accent-[#2f4a3a]" :checked="allVisibleSelected" :disabled="!visible.length" @change="toggleVisible">
            Pilih halaman ini
          </label>
          <button type="button" class="font-semibold underline" :disabled="!filtered.length" @click="selectFiltered">
            {{ allFilteredSelected ? 'Batal pilih' : 'Pilih' }} semua hasil ({{ filtered.length }})
          </button>
          <span class="ml-auto">{{ filtered.length }} dari {{ rows.length }} URL</span>
        </div>

        <p v-if="loadError" class="py-4 text-sm text-red-600">Gagal memuat daftar URL: {{ loadError.statusMessage || loadError.message }}</p>
        <p v-else-if="!data" class="py-4 text-sm text-brand-500">Memuat URL…</p>
        <ul class="divide-y divide-brand-100">
          <li v-for="r in visible" :key="r.path" class="flex gap-3 py-3" :class="{ 'bg-brand-50/50': selected.has(r.path) }">
            <input type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-[#2f4a3a]" :checked="selected.has(r.path)" :aria-label="`Pilih ${r.path}`" @change="toggle(r.path)">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2">
                <a :href="urlOf(r)" target="_blank" rel="noopener" class="min-w-0 break-all font-medium text-brand-900 hover:underline">{{ r.path }}</a>
                <span class="text-[11px] uppercase tracking-wide text-brand-400">{{ r.type }}<template v-if="r.lastmod"> · diubah {{ fmt(r.lastmod) }}</template></span>
              </div>
              <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span
                  class="chip px-2 py-0.5 text-[11px]" :title="r.google_coverage ?? undefined"
                  :class="{ 'bg-green-50 text-green-700': gState(r) === 'terindeks', 'bg-amber-50 text-amber-800': gState(r) === 'belum', 'bg-gray-100 text-gray-600': gState(r) === 'belum-dicek' }"
                >
                  Google: {{ gState(r) === 'terindeks' ? 'terindeks' : gState(r) === 'belum' ? (r.google_coverage || 'belum terindeks') : 'belum dicek' }}
                </span>
                <a v-if="gState(r) !== 'terindeks'" :href="gscLink(r)" target="_blank" rel="noopener" class="font-semibold text-brand-700 underline" title="Buka Inspeksi URL di Search Console, lalu klik Minta pengindeksan">Minta indeks di GSC ↗</a>
                <span class="chip px-2 py-0.5 text-[11px]" :class="r.bing_crawled_at ? 'bg-green-50 text-green-700' : r.bing_submitted_at ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'">
                  Bing: {{ r.bing_crawled_at ? `dirayapi ${fmt(r.bing_crawled_at)}` : r.bing_submitted_at ? `dikirim ${fmt(r.bing_submitted_at)}` : r.bing_checked_at ? 'belum dirayapi' : '—' }}
                </span>
                <span class="chip px-2 py-0.5 text-[11px]" :class="r.indexnow_at ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'">IndexNow: {{ r.indexnow_at ? fmt(r.indexnow_at) : 'belum' }}</span>
                <span v-if="r.brave_submitted_at" class="chip gap-1 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700">
                  Brave ✓ {{ fmt(r.brave_submitted_at) }}
                  <button type="button" class="opacity-60 hover:opacity-100" :aria-label="`Batalkan tanda Brave untuk ${r.path}`" @click="markBrave([r.path], false)">×</button>
                </span>
                <button v-else type="button" class="chip bg-white px-2 py-0.5 text-[11px] text-orange-700 ring-1 ring-orange-200 hover:bg-orange-50" @click="sendBrave(r.path)">
                  {{ copied === urlOf(r) ? 'URL disalin ✓' : 'Kirim ke Brave ↗' }}
                </button>
              </div>
            </div>
          </li>
          <li v-if="!loadError && rows.length && !filtered.length" class="py-4 text-sm text-brand-500">Tidak ada URL yang cocok dengan filter.</li>
        </ul>

        <nav v-if="pages > 1" class="mt-4 flex flex-wrap items-center justify-center gap-1.5" aria-label="Halaman URL">
          <button type="button" class="btn-ghost btn-sm px-3" :disabled="page <= 1" @click="page--">‹ <span class="hidden sm:inline">Sebelumnya</span></button>
          <span class="px-2 text-sm text-brand-600">Halaman {{ page }} / {{ pages }}</span>
          <button type="button" class="btn-ghost btn-sm px-3" :disabled="page >= pages" @click="page++"><span class="hidden sm:inline">Berikutnya</span> ›</button>
        </nav>
      </section>

      <p class="mt-4 text-xs text-brand-500">
        Status Google berasal dari URL Inspection API (kuota 2.000 URL/hari). "Minta indeks di GSC" membuka Inspeksi URL; klik
        <b>Minta pengindeksan</b> di sana (Google membatasi ±10 permintaan per hari, dahulukan halaman terpenting).
        Halaman yang baru ditayangkan juga otomatis dikirim ke IndexNow.
      </p>
    </div>

    <!-- Brave: satu per satu -->
    <div v-if="braveQueue" class="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] text-brand-500">Brave · {{ braveDone }}/{{ braveQueue.length }} terkirim</p>
          <p class="truncate text-sm font-semibold text-brand-900">{{ braveNext ?? 'Semua URL pilihan sudah dikirim ke Brave' }}</p>
        </div>
        <button v-if="braveNext" type="button" class="btn btn-sm shrink-0 bg-[#fb542b] text-white" @click="sendBrave(braveNext)">Salin &amp; buka Brave</button>
        <button type="button" class="btn-ghost btn-sm shrink-0" @click="braveQueue = null">Selesai</button>
      </div>
    </div>
    <!-- Aksi untuk URL terpilih -->
    <div v-else-if="selected.size" class="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p class="mr-auto text-sm font-semibold text-brand-900">
          {{ selected.size }} URL dipilih
          <button type="button" class="ml-2 text-xs font-normal text-brand-600 underline" @click="selected.clear()">batal</button>
        </p>
        <div class="flex w-full gap-2 overflow-x-auto [scrollbar-width:none] sm:w-auto">
          <button type="button" class="btn-primary btn-sm shrink-0" :disabled="!!job" @click="sendIndexNow()">Kirim ke IndexNow</button>
          <button type="button" class="btn-ghost btn-sm shrink-0" :disabled="!!job || !bingReady" :title="bingReady ? undefined : 'Isi API key Bing di Pengaturan'" @click="sendBing()">Kirim ke Bing API</button>
          <button type="button" class="btn-ghost btn-sm shrink-0" :disabled="!!job || !googleReady" :title="googleReady ? undefined : 'Hubungkan Search Console di Pengaturan'" @click="check('google')">Cek status Google</button>
          <button type="button" class="btn-ghost btn-sm shrink-0" :disabled="!!job || !bingReady" @click="check('bing')">Cek status Bing</button>
          <button type="button" class="btn-ghost btn-sm shrink-0 text-orange-700" :disabled="!!job" @click="startBrave">Kirim ke Brave…</button>
        </div>
      </div>
    </div>
  </div>
</template>
