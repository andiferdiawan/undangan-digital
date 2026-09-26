<script setup lang="ts">
import type { MediaItem } from '~/composables/useMediaLibrary'

/** Pilih media dari pustaka (atau unggah baru yang langsung masuk pustaka). */
const props = defineProps<{ kind: 'image' | 'audio', current?: string | null }>()
const emit = defineEmits<{ select: [item: MediaItem], close: [] }>()
const lib = useMediaLibrary()
const items = ref<MediaItem[]>([])
const loading = ref(true)
const q = ref('')

onMounted(async () => {
  try { items.value = await lib.list(props.kind) }
  finally { loading.value = false }
})
const shown = computed(() => items.value.filter(m => !q.value.trim() || m.name.toLowerCase().includes(q.value.trim().toLowerCase())))

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const item = await lib.upload(file)
  if (item && item.kind === props.kind) emit('select', item)
  else if (item) lib.error.value = 'Jenis file tidak sesuai.'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 md:items-center" @click.self="emit('close')">
    <div class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl" role="dialog" aria-modal="true" :aria-label="`Pilih ${kind === 'audio' ? 'audio' : 'gambar'}`">
      <div class="flex items-center justify-between gap-3">
        <h3 class="font-semibold text-brand-900">Pilih {{ kind === 'audio' ? 'audio' : 'gambar' }} dari pustaka</h3>
        <button class="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand" aria-label="Tutup" @click="emit('close')">✕</button>
      </div>
      <div class="mt-3 flex gap-2">
        <input v-model="q" type="search" class="input py-2 text-sm" placeholder="Cari nama…">
        <label class="btn-primary btn-sm shrink-0 cursor-pointer" :class="{ 'pointer-events-none opacity-60': lib.uploading.value }">
          {{ lib.uploading.value ? 'Mengunggah…' : '+ Unggah' }}
          <input type="file" :accept="MEDIA_ACCEPT[kind]" class="sr-only" @change="onFile">
        </label>
      </div>
      <p v-if="lib.error.value" class="mt-2 text-xs text-red-600">{{ lib.error.value }}</p>

      <div class="mt-3 flex-1 overflow-y-auto">
        <p v-if="loading" class="p-6 text-center text-sm text-brand-500">Memuat…</p>
        <p v-else-if="!shown.length" class="p-6 text-center text-sm text-brand-500">Belum ada {{ kind === 'audio' ? 'audio' : 'gambar' }} di pustaka. Unggah yang pertama.</p>
        <div v-else-if="kind === 'audio'" class="grid gap-2">
          <div v-for="m in shown" :key="m.id" class="rounded-2xl p-3 ring-1" :class="m.url === current ? 'bg-brand-50 ring-brand' : 'ring-brand-100'">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-semibold text-brand-900">♪ {{ m.name }}</p>
              <button class="btn-primary btn-sm shrink-0" :disabled="m.url === current" @click="emit('select', m)">{{ m.url === current ? 'Dipakai' : 'Pilih' }}</button>
            </div>
            <audio :src="m.url" controls preload="none" class="mt-2 w-full" />
          </div>
        </div>
        <div v-else class="grid grid-cols-3 gap-2">
          <button v-for="m in shown" :key="m.id" class="overflow-hidden rounded-xl ring-2" :class="m.url === current ? 'ring-brand' : 'ring-transparent'" :title="m.name" @click="emit('select', m)">
            <img :src="m.url" :alt="m.name" class="aspect-square w-full bg-brand-50 object-contain" loading="lazy">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
