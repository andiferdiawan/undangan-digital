<script setup lang="ts">
/**
 * Periksa tautan semua artikel blog: domain internal yang salah, halaman internal yang tidak ada, dan tautan
 * eksternal yang rusak. "Perbaiki otomatis" mengubah domain salah ke tautan internal yang benar dan melepas tautan
 * rusak (teksnya tetap); isi lama dicadangkan di database.
 */
interface Change { kind: 'domain' | 'internal' | 'external' | 'moved' | 'source', label: string, from: string, to: string | null, reason?: string }
interface Issue { id: string, slug: string, title: string, status: string, changes: Change[], saved: boolean | null }
interface Result {
  checkedAt: string, fix: boolean, posts: number, internalLinks: number
  external: { total: number, ok: number, broken: number, unchecked: number }
  brokenUrls: { url: string, reason: string }[], uncheckedUrls: string[]
  fixed: number, skipped: number, issues: Issue[]
}

const KIND: Record<Change['kind'], { label: string, cls: string }> = {
  domain: { label: 'Domain salah', cls: 'bg-red-50 text-red-700' },
  internal: { label: 'Halaman tidak ada', cls: 'bg-amber-50 text-amber-800' },
  external: { label: 'Tautan rusak', cls: 'bg-red-50 text-red-700' },
  moved: { label: 'Situs pindah domain', cls: 'bg-amber-50 text-amber-800' },
  source: { label: 'Referensi', cls: 'bg-brand-50 text-brand-700' },
}

const result = ref<Result | null>(null)
const busy = ref<'check' | 'fix' | null>(null)
const error = ref('')
const open = ref<string | null>(null)

const pending = computed(() => result.value?.issues.filter(i => i.saved !== true) ?? [])
const totalChanges = computed(() => pending.value.reduce((n, i) => n + i.changes.length, 0))

async function run(fix: boolean) {
  if (fix && !confirm(`Perbaiki ${totalChanges.value} tautan di ${pending.value.length} artikel? Domain salah diarahkan ke halaman yang benar, situs yang pindah domain dialihkan, tautan rusak dilepas (teksnya tetap). Isi lama dicadangkan.`)) return
  busy.value = fix ? 'fix' : 'check'
  error.value = ''
  try {
    result.value = await $fetch<Result>('/api/admin/blog/link-audit', { method: 'POST', body: { fix }, timeout: 300_000 })
  }
  catch (e) {
    error.value = friendlyError(apiError(e))
  }
  finally { busy.value = null }
}
const fmt = (d: string) => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <section class="card mt-5 p-5" aria-labelledby="audit-tautan">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 id="audit-tautan" class="font-semibold text-brand">Periksa tautan artikel</h2>
        <p class="mt-1 max-w-2xl text-sm text-brand-600">
          Cek semua tautan di artikel: internal harus ke halaman situs ini yang benar-benar ada, eksternal harus bisa dibuka.
          Artikel baru dari AI sudah diperiksa otomatis sebelum disimpan; jalankan ini sesekali karena situs luar bisa berubah.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-ghost btn-sm" :disabled="!!busy" @click="run(false)">{{ busy === 'check' ? 'Memeriksa… (±1 menit)' : 'Periksa' }}</button>
        <button v-if="result && pending.length" type="button" class="btn-primary btn-sm" :disabled="!!busy" @click="run(true)">
          {{ busy === 'fix' ? 'Memperbaiki…' : `Perbaiki otomatis (${totalChanges})` }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

    <div v-if="result" class="mt-4 grid gap-3">
      <p
        class="rounded-xl px-4 py-3 text-sm"
        :class="pending.length ? 'bg-amber-50 text-amber-900' : 'bg-green-50 text-green-800'"
      >
        <template v-if="result.fix">
          {{ result.fixed }} artikel diperbaiki<template v-if="result.skipped">, {{ result.skipped }} dilewati karena sedang/baru diubah (periksa lagi)</template>.
        </template>
        <template v-else-if="pending.length">Ditemukan {{ totalChanges }} tautan bermasalah di {{ pending.length }} artikel.</template>
        <template v-else>Semua tautan aman.</template>
        <span class="block text-xs opacity-80">
          {{ result.posts }} artikel · {{ result.internalLinks }} tautan internal · {{ result.external.total }} URL eksternal
          ({{ result.external.ok }} bisa dibuka, {{ result.external.broken }} rusak<template v-if="result.external.unchecked">, {{ result.external.unchecked }} belum sempat diperiksa</template>)
          · {{ fmt(result.checkedAt) }}
        </span>
      </p>

      <details v-if="result.brokenUrls.length" class="rounded-xl bg-brand-50/60 px-4 py-2 text-sm">
        <summary class="cursor-pointer font-semibold text-brand-700">URL eksternal rusak ({{ result.brokenUrls.length }})</summary>
        <ul class="mt-2 grid gap-1 pb-1">
          <li v-for="b in result.brokenUrls" :key="b.url" class="min-w-0 break-all text-xs text-brand-700">
            <a :href="b.url" target="_blank" rel="noopener" class="underline">{{ b.url }}</a> — <span class="text-red-700">{{ b.reason }}</span>
          </li>
        </ul>
      </details>
      <p v-if="result.uncheckedUrls.length" class="text-xs text-brand-500">
        {{ result.uncheckedUrls.length }} URL belum sempat diperiksa (batas waktu proses) dan tidak diubah — tekan Periksa lagi.
      </p>

      <ul v-if="result.issues.length" class="divide-y divide-brand-100 text-sm">
        <li v-for="i in result.issues" :key="i.id" class="py-2">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="min-w-0 flex-1 text-left" :aria-expanded="open === i.id" @click="open = open === i.id ? null : i.id">
              <span class="font-medium text-brand-900">{{ i.title }}</span>
              <span class="block text-xs text-brand-500">
                /blog/{{ i.slug }} · {{ i.status === 'published' ? 'tayang' : 'draf' }} · {{ i.changes.length }} tautan
                <template v-if="i.saved === true"> · <b class="text-green-700">sudah diperbaiki</b></template>
                <template v-else-if="i.saved === false"> · <b class="text-amber-700">dilewati</b></template>
              </span>
            </button>
            <NuxtLink :to="`/admin/blog/${i.id}`" class="text-xs font-semibold text-brand-600 underline">Buka editor</NuxtLink>
          </div>
          <ul v-if="open === i.id" class="mt-2 grid gap-1.5 rounded-xl bg-brand-50/60 p-3">
            <li v-for="(c, k) in i.changes" :key="k" class="grid gap-0.5 text-xs">
              <span><span class="chip" :class="KIND[c.kind].cls">{{ KIND[c.kind].label }}</span> <span class="text-brand-800">“{{ c.label }}”</span></span>
              <span class="min-w-0 break-all text-brand-600">
                {{ c.from }} →
                <b v-if="c.to" class="text-green-700">{{ c.to }}</b>
                <b v-else class="text-brand-800">{{ c.kind === 'source' ? 'dihapus dari referensi' : 'tautan dilepas (teks tetap)' }}</b>
                <span v-if="c.reason" class="text-brand-500"> · {{ c.reason }}</span>
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>
