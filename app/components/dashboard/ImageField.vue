<script setup lang="ts">
const props = defineProps<{ label: string, invitationId: string, hint?: string }>()
const model = defineModel<string>({ default: '' })
const { upload, uploading, error } = useUpload(props.invitationId)

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = await upload(file)
  if (url) model.value = url
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="label">
    {{ label }}
    <div class="flex items-center gap-3">
      <div class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-50 ring-1 ring-brand-100">
        <img v-if="model" :src="model" alt="" class="h-full w-full object-cover">
        <span v-else class="text-xs text-brand-400">Kosong</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <label class="btn-ghost btn-sm cursor-pointer">
          {{ uploading ? 'Mengunggah…' : model ? 'Ganti' : 'Unggah' }}
          <input type="file" accept="image/*" class="sr-only" :disabled="uploading" @change="onFile">
        </label>
        <button v-if="model" type="button" class="btn-sm btn text-red-600" @click="model = ''">Hapus</button>
      </div>
    </div>
    <span v-if="hint" class="text-xs font-normal text-brand-500">{{ hint }}</span>
    <span v-if="error" class="text-xs font-normal text-red-600">{{ error }}</span>
  </div>
</template>
