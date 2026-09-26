<script setup lang="ts">
/** Foto untuk slider sampul: unggah beberapa, urutkan, hapus. Maks. 8 foto. */
const MAX = 8
const props = defineProps<{ invitationId: string }>()
const photos = defineModel<{ url: string }[]>({ required: true })
const { upload, uploading, error } = useUpload(props.invitationId)

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])].slice(0, MAX - photos.value.length)
  input.value = ''
  for (const f of files) {
    const url = await upload(f)
    if (url) photos.value.push({ url })
  }
}
function move(i: number, d: -1 | 1) {
  const j = i + d
  if (j < 0 || j >= photos.value.length) return
  const list = photos.value
  ;[list[i], list[j]] = [list[j]!, list[i]!]
}
</script>

<template>
  <div class="grid gap-3">
    <p class="text-xs text-brand-500">
      Foto tampil bergantian di sampul dan halaman depan undangan. Pilih foto <b>portrait (tegak)</b> agar pas di layar ponsel.
      Bila kosong, foto galeri yang dipakai.
    </p>
    <div v-if="photos.length" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
      <div v-for="(ph, i) in photos" :key="ph.url + i" class="group relative overflow-hidden rounded-xl bg-brand-50">
        <img :src="ph.url" alt="" class="aspect-[3/4] w-full object-cover">
        <span class="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 text-[10px] font-bold text-white">{{ i + 1 }}</span>
        <div class="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1">
          <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs text-brand-800 disabled:opacity-30" :disabled="i === 0" aria-label="Geser ke kiri" @click="move(i, -1)">←</button>
          <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs text-red-600" aria-label="Hapus foto" @click="photos.splice(i, 1)">✕</button>
          <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs text-brand-800 disabled:opacity-30" :disabled="i === photos.length - 1" aria-label="Geser ke kanan" @click="move(i, 1)">→</button>
        </div>
      </div>
    </div>
    <label v-if="photos.length < MAX" class="btn-ghost btn-sm cursor-pointer justify-self-start" :class="{ 'pointer-events-none opacity-60': uploading }">
      {{ uploading ? 'Mengunggah…' : `+ Tambah foto (${photos.length}/${MAX})` }}
      <input type="file" accept="image/*" multiple class="sr-only" :disabled="uploading" @change="onFiles">
    </label>
    <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
  </div>
</template>
