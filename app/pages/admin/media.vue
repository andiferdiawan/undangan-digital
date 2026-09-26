<script setup lang="ts">
import type { MediaItem } from '~/composables/useMediaLibrary'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Media' })

const supabase = useSupabaseClient()
const lib = useMediaLibrary()
const filter = ref<'all' | 'image' | 'audio'>('all')
const q = ref('')

const { data, refresh } = await useAsyncData('admin-media', async () => {
  const [items, themes] = await Promise.all([
    lib.list(),
    supabase.from('themes').select('id, name, music_url, assets:definition->assets, demo:definition->demo'),
  ])
  return { items, themes: (themes.data ?? []) as { id: string, name: string, music_url: string | null, assets: Record<string, string> | null, demo: unknown }[] }
})

/** Tema yang memakai media ini (musik, aset, atau foto contoh). */
function usage(item: MediaItem) {
  return (data.value?.themes ?? []).filter(t =>
    t.music_url === item.url
    || Object.values(t.assets ?? {}).includes(item.url)
    || JSON.stringify(t.demo ?? '').includes(item.url),
  ).map(t => t.name)
}

const shown = computed(() => (data.value?.items ?? []).filter(m =>
  (filter.value === 'all' || m.kind === filter.value)
  && (!q.value.trim() || m.name.toLowerCase().includes(q.value.trim().toLowerCase())),
))
const counts = computed(() => ({
  all: data.value?.items.length ?? 0,
  image: data.value?.items.filter(m => m.kind === 'image').length ?? 0,
  audio: data.value?.items.filter(m => m.kind === 'audio').length ?? 0,
}))

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  for (const f of files) await lib.upload(f)
  await refresh()
}

const copied = ref('')
async function copy(item: MediaItem) {
  try { await navigator.clipboard.writeText(item.url) }
  catch { /* diabaikan */ }
  copied.value = item.id
  setTimeout(() => (copied.value = ''), 1500)
}

const editing = ref<string | null>(null)
const draft = ref('')
async function saveName(item: MediaItem) {
  const name = draft.value.trim().slice(0, 120)
  if (name && name !== item.name) {
    await lib.rename(item, name)
    item.name = name
  }
  editing.value = null
}

async function del(item: MediaItem) {
  const used = usage(item)
  const msg = used.length
    ? `"${item.name}" masih dipakai di: ${used.join(', ')}.\nTema tersebut akan kehilangan file ini. Tetap hapus?`
    : `Hapus "${item.name}" dari pustaka?`
  if (!confirm(msg)) return
  try {
    await lib.remove(item)
    await refresh()
  }
  catch (e) { alert(friendlyError(e as { message?: string })) }
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl text-brand">Pustaka Media</h1>
          <p class="mt-1 text-sm text-brand-600">Gambar & audio untuk tema katalog. Unggah sekali, pakai di banyak tema.</p>
        </div>
        <label class="btn-primary cursor-pointer" :class="{ 'pointer-events-none opacity-60': lib.uploading.value }">
          {{ lib.uploading.value ? 'Mengunggah…' : '+ Unggah Media' }}
          <input type="file" multiple :accept="`${MEDIA_ACCEPT.image},${MEDIA_ACCEPT.audio}`" class="sr-only" @change="onFiles">
        </label>
      </div>
      <p v-if="lib.error.value" class="mt-3 text-sm text-red-600" role="alert">{{ lib.error.value }}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <button
          v-for="f in (['all', 'image', 'audio'] as const)" :key="f"
          class="chip px-4 py-2 text-sm ring-1"
          :class="filter === f ? 'bg-brand text-white ring-brand' : 'bg-white text-brand-700 ring-brand-100'"
          @click="filter = f"
        >
          {{ { all: 'Semua', image: 'Gambar', audio: 'Audio' }[f] }} <span class="ml-1 opacity-60">{{ counts[f] }}</span>
        </button>
        <input v-model="q" type="search" class="input ml-auto max-w-60" placeholder="Cari nama…">
      </div>

      <div v-if="shown.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <article v-for="m in shown" :key="m.id" class="card flex flex-col overflow-hidden">
          <div class="grid aspect-[4/3] place-items-center bg-[repeating-conic-gradient(#f3f4f2_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
            <img v-if="m.kind === 'image'" :src="m.url" :alt="m.name" loading="lazy" class="h-full w-full object-contain">
            <div v-else class="grid w-full gap-2 p-3 text-center">
              <FeatureIcon name="music" class="mx-auto" />
              <audio :src="m.url" controls preload="none" class="w-full" />
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-1 p-3">
            <input
              v-if="editing === m.id" v-model="draft" class="input py-1.5 text-sm" maxlength="120"
              @keydown.enter="saveName(m)" @blur="saveName(m)"
            >
            <button v-else class="truncate text-left text-sm font-semibold text-brand-900" title="Ubah nama" @click="editing = m.id; draft = m.name">{{ m.name }}</button>
            <p class="text-xs text-brand-500">{{ m.kind === 'image' ? 'Gambar' : 'Audio' }} · {{ formatBytes(m.size_bytes) }}</p>
            <p v-if="usage(m).length" class="text-xs text-brand-600">Dipakai: {{ usage(m).join(', ') }}</p>
            <p v-else class="text-xs text-brand-400">Belum dipakai</p>
            <div class="mt-auto flex gap-2 pt-2">
              <button class="btn-ghost btn-sm flex-1 px-2" @click="copy(m)">{{ copied === m.id ? '✓ Disalin' : 'Salin URL' }}</button>
              <button class="btn-ghost btn-sm px-3 text-red-600" aria-label="Hapus" @click="del(m)">✕</button>
            </div>
          </div>
        </article>
      </div>
      <p v-else class="card mt-5 p-10 text-center text-sm text-brand-600">Belum ada media{{ filter !== 'all' ? ' untuk jenis ini' : '' }}.</p>
    </div>
  </div>
</template>
