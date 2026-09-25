<script setup lang="ts">
import type { Category, ThemeRow } from '#shared/types/models'
import type { ThemeDefinition } from '#shared/theme/schema'

definePageMeta({ middleware: 'admin' })
const route = useRoute()
const id = String(route.params.id)
const supabase = useSupabaseClient()

const { data } = await useAsyncData(`admin-theme-${id}`, async () => {
  const [theme, cats] = await Promise.all([
    supabase.from('themes').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('*').order('sort'),
  ])
  if (!theme.data) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan', fatal: true })
  return { theme: theme.data as ThemeRow, categories: (cats.data ?? []) as Category[] }
})
useSeoMeta({ title: () => `Admin — ${data.value?.theme.name}` })

const t = data.value!.theme
const meta = reactive({ name: t.name, description: t.description ?? '', category_id: t.category_id ?? 0, status: t.status })
const definition = ref<ThemeDefinition | null>(t.definition)
const css = ref(t.compiled_css)
const errors = ref<string[]>([])
const warnings = ref<string[]>([])

const saving = ref(false)
const msg = ref<{ ok: boolean, text: string } | null>(null)
async function save() {
  msg.value = null
  if (errors.value.length) {
    msg.value = { ok: false, text: 'Perbaiki error validasi terlebih dahulu.' }
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/admin/themes/${id}`, { method: 'PUT', body: { ...meta, definition: definition.value } })
    msg.value = { ok: true, text: 'Tersimpan.' }
  }
  catch (e: any) {
    msg.value = { ok: false, text: e?.data?.data?.errors?.join('; ') || e?.data?.statusMessage || 'Gagal menyimpan' }
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="data">
    <AdminNav />
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_440px]">
      <form class="card grid content-start gap-3 p-5" @submit.prevent="save">
        <NuxtLink to="/admin/tema" class="text-xs text-brand-500">← Semua tema</NuxtLink>
        <p class="font-mono text-xs text-brand-500">{{ data.theme.code }} · /tema/{{ data.theme.slug }} · {{ data.theme.source === 'ai' ? 'hasil AI' : 'manual' }}</p>
        <label class="label">Nama
          <input v-model="meta.name" class="input" required>
        </label>
        <label class="label">Deskripsi
          <textarea v-model="meta.description" rows="2" class="input" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="label">Kategori
            <select v-model.number="meta.category_id" class="input">
              <option v-for="c in data.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </label>
          <label class="label">Status
            <select v-model="meta.status" class="input">
              <option value="draft">Draf</option>
              <option value="published">Tayang</option>
              <option value="archived">Arsip</option>
            </select>
          </label>
        </div>
        <div class="rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
          <p class="font-semibold">Aset tema</p>
          <p class="mt-1">Unggah pengganti ke bucket <code>theme-assets/{{ data.theme.slug }}/</code>, lalu ubah path aset di JSON menjadi nama file relatif (mis. <code>"pattern": "pattern.webp"</code>).</p>
        </div>
        <p v-if="msg" class="text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'">{{ msg.text }}</p>
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan Perubahan' }}</button>
      </form>
      <ThemeWorkbench v-model:definition="definition" v-model:css="css" v-model:errors="errors" v-model:warnings="warnings" :slug="data.theme.slug" />
    </div>
  </div>
</template>
