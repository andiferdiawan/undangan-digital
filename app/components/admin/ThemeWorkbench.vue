<script setup lang="ts">
import type { ThemeDefinition } from '#shared/theme/schema'

/** Editor JSON tema + validasi server + pratinjau di bingkai ponsel. */
const props = defineProps<{ slug: string }>()
const definition = defineModel<ThemeDefinition | null>('definition', { required: true })
const css = defineModel<string>('css', { required: true })
const errors = defineModel<string[]>('errors', { default: () => [] })
const warnings = defineModel<string[]>('warnings', { default: () => [] })

const json = ref(definition.value ? JSON.stringify(definition.value, null, 2) : '')
watch(definition, (d) => {
  const next = d ? JSON.stringify(d, null, 2) : ''
  try {
    if (JSON.stringify(JSON.parse(json.value)) === JSON.stringify(d)) return
  }
  catch { /* teks lama tidak valid */ }
  json.value = next
})

const checking = ref(false)
async function validate() {
  let parsed: unknown
  try {
    parsed = JSON.parse(json.value)
  }
  catch (e) {
    errors.value = [`JSON tidak valid: ${(e as Error).message}`]
    return
  }
  checking.value = true
  try {
    const r = await $fetch<{ ok: boolean, errors: string[], warnings: string[], definition: ThemeDefinition | null, css: string }>('/api/admin/themes/compile', { method: 'POST', body: { definition: parsed } })
    errors.value = r.errors
    warnings.value = r.warnings
    if (r.ok) {
      definition.value = r.definition
      css.value = r.css
    }
  }
  catch (e: any) {
    errors.value = [e?.data?.statusMessage || e?.message || 'Gagal memvalidasi']
  }
  finally {
    checking.value = false
  }
}

const tab = ref<'preview' | 'json'>('preview')
const frameKey = ref(0)
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center justify-between gap-2">
      <div class="grid grid-cols-2 rounded-full bg-white p-1 text-xs font-semibold ring-1 ring-brand-100">
        <button class="rounded-full px-4 py-1.5" :class="tab === 'preview' ? 'bg-brand text-white' : 'text-brand-600'" @click="tab = 'preview'">Pratinjau</button>
        <button class="rounded-full px-4 py-1.5" :class="tab === 'json' ? 'bg-brand text-white' : 'text-brand-600'" @click="tab = 'json'">JSON</button>
      </div>
      <button v-if="tab === 'json'" class="btn-primary btn-sm" :disabled="checking" @click="validate">{{ checking ? 'Memvalidasi…' : 'Validasi & terapkan' }}</button>
      <button v-else class="text-xs text-brand-500 underline" @click="frameKey++">Ulang dari sampul</button>
    </div>

    <div v-if="errors.length" class="rounded-xl bg-red-50 p-3 text-xs text-red-700">
      <p class="font-semibold">{{ errors.length }} error validasi</p>
      <ul class="mt-1 list-disc space-y-0.5 pl-4"><li v-for="e in errors" :key="e">{{ e }}</li></ul>
    </div>
    <div v-if="warnings.length" class="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
      <ul class="list-disc space-y-0.5 pl-4"><li v-for="w in warnings" :key="w">{{ w }}</li></ul>
    </div>

    <div v-show="tab === 'preview'">
      <PhoneFrame v-if="definition" :key="frameKey">
        <InviteRenderer :definition="definition" :css="css" :theme-slug="props.slug || 'draft'" guest-name="Bapak Fulan & Keluarga" mode="frame" preview />
      </PhoneFrame>
      <p v-else class="card p-10 text-center text-sm text-brand-500">Belum ada tema untuk dipratinjau.</p>
    </div>
    <textarea v-show="tab === 'json'" v-model="json" spellcheck="false" class="input h-[70vh] font-mono text-xs leading-relaxed" />
  </div>
</template>
