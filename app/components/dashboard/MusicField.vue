<script setup lang="ts">
/** Unggah musik latar undangan (MP3/M4A/AAC/OGG, maks. 10 MB). */
const props = defineProps<{ invitationId: string, themeMusic?: string | null }>()
const music = defineModel<{ enabled: boolean, url: string, title: string }>({ required: true })
const { uploadAudio, uploading, error } = useUpload(props.invitationId)

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const url = await uploadAudio(file)
  if (url) {
    music.value.url = url
    music.value.title ||= file.name.replace(/\.[^.]+$/, '').slice(0, 80)
    music.value.enabled = true
  }
}
function remove() {
  music.value.url = ''
  music.value.title = ''
}
const accept = AUDIO_ACCEPT
const maxMb = AUDIO_MAX_MB
const current = computed(() => music.value.url || props.themeMusic || '')
</script>

<template>
  <div class="grid gap-3">
    <label class="flex items-center justify-between gap-3 text-sm font-medium text-brand-800">
      Putar musik saat undangan dibuka
      <input v-model="music.enabled" type="checkbox" class="h-5 w-5 accent-[#2f4a3a]">
    </label>

    <template v-if="music.enabled">
      <div class="rounded-2xl bg-brand-50/60 p-3">
        <p class="text-xs text-brand-500">
          {{ music.url ? 'Musik Anda' : themeMusic ? 'Musik bawaan tema' : 'Belum ada musik' }}
        </p>
        <p v-if="music.url && music.title" class="mt-0.5 truncate text-sm font-medium text-brand-900">♪ {{ music.title }}</p>
        <audio v-if="current" :key="current" :src="current" controls preload="none" class="mt-2 w-full" />
        <div class="mt-3 flex flex-wrap gap-2">
          <label class="btn-primary btn-sm cursor-pointer" :class="{ 'pointer-events-none opacity-60': uploading }">
            {{ uploading ? 'Mengunggah…' : music.url ? 'Ganti musik' : 'Unggah musik' }}
            <input type="file" :accept="accept" class="sr-only" :disabled="uploading" @change="onFile">
          </label>
          <button v-if="music.url" type="button" class="btn-ghost btn-sm" @click="remove">
            {{ themeMusic ? 'Pakai musik tema' : 'Hapus musik' }}
          </button>
        </div>
      </div>
      <label v-if="music.url" class="label">Judul lagu (opsional)
        <input v-model="music.title" class="input" maxlength="80">
      </label>
      <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
      <p class="text-xs text-brand-500">
        Format MP3, M4A, AAC, atau OGG, maksimal {{ maxMb }} MB. Musik mulai diputar saat tamu menekan tombol buka undangan, dan bisa dijeda lewat tombol ♪ di pojok layar. Pastikan Anda berhak memakai lagu tersebut.
      </p>
    </template>
  </div>
</template>
