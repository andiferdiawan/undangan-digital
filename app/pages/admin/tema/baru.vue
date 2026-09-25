<script setup lang="ts">
import type { Category } from '#shared/types/models'
import type { ThemeDefinition } from '#shared/theme/schema'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Generate Tema AI' })
const supabase = useSupabaseClient()
const { data: categories } = await useAsyncData('admin-cats', async () => {
  const { data } = await supabase.from('categories').select('*').order('sort')
  return (data ?? []) as Category[]
})

const EXAMPLES = [
  'Tema syar\'i minimalis dengan aksen sage green dan font serif elegan, ornamen geometri islami, tanpa foto mempelai.',
  'Undangan rustic hangat bernuansa kayu dan terakota, cover memakai foto prewedding penuh layar, font script untuk nama.',
  'Tema elegan navy dan emas lembut bergaya art deco, kartu acara berbentuk kubah, cocok untuk resepsi malam.',
]

const prompt = ref('')
const generating = ref(false)
const genError = ref('')
const definition = ref<ThemeDefinition | null>(null)
const css = ref('')
const errors = ref<string[]>([])
const warnings = ref<string[]>([])
const generationId = ref<string | null>(null)
const attempts = ref(0)

const meta = reactive({ name: '', slug: '', description: '', category_id: 0, status: 'draft' as 'draft' | 'published' })
watch(() => meta.name, (n) => { meta.slug = slugify(n) })

async function generate() {
  genError.value = ''
  generating.value = true
  try {
    const r = await $fetch<any>('/api/admin/themes/generate', { method: 'POST', body: { prompt: prompt.value }, timeout: 300_000 })
    definition.value = r.definition
    css.value = r.css
    errors.value = r.errors
    warnings.value = r.warnings
    generationId.value = r.generation_id
    attempts.value = r.attempts
    if (r.meta) {
      meta.name = r.meta.name
      meta.description = r.meta.description
      meta.category_id = categories.value?.find(c => c.slug === r.meta.category)?.id ?? categories.value?.[0]?.id ?? 0
    }
  }
  catch (e: any) {
    genError.value = e?.data?.statusMessage || e?.message || 'Gagal membuat tema'
  }
  finally {
    generating.value = false
  }
}

const saving = ref(false)
const saveError = ref('')
async function save() {
  saveError.value = ''
  if (!definition.value || errors.value.length) {
    saveError.value = 'Perbaiki error validasi terlebih dahulu.'
    return
  }
  saving.value = true
  try {
    const r = await $fetch<{ id: string }>('/api/admin/themes', {
      method: 'POST',
      body: { ...meta, source: 'ai', definition: definition.value, generation_id: generationId.value },
    })
    await navigateTo(`/admin/tema/${r.id}`)
  }
  catch (e: any) {
    saveError.value = e?.data?.data?.errors?.join('; ') || e?.data?.statusMessage || 'Gagal menyimpan'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_440px]">
      <div class="grid content-start gap-4">
        <form class="card grid gap-3 p-5" @submit.prevent="generate">
          <h1 class="font-display text-2xl text-brand">Generate Tema dengan AI</h1>
          <p class="text-sm text-brand-600">
            Tulis brief desain. AI menghasilkan tema dalam format standar (section bertag, placeholder, variabel warna/font),
            lalu sistem memvalidasi dan mengompilasi CSS-nya secara otomatis.
          </p>
          <textarea v-model="prompt" rows="5" class="input" placeholder="Buatkan layout undangan pernikahan minimalis dengan aksen warna sage green dan font serif elegan…" maxlength="2000" />
          <div class="flex flex-wrap gap-2">
            <button v-for="ex in EXAMPLES" :key="ex" type="button" class="chip bg-brand-50 text-left text-brand-700 hover:bg-brand-100" @click="prompt = ex">{{ ex.slice(0, 48) }}…</button>
          </div>
          <p v-if="genError" class="text-sm text-red-600">{{ genError }}</p>
          <button class="btn-accent" :disabled="generating || prompt.trim().length < 10">
            {{ generating ? 'AI sedang mendesain… (1–3 menit)' : '✦ Generate Tema' }}
          </button>
        </form>

        <form v-if="definition" class="card grid gap-3 p-5" @submit.prevent="save">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-brand-900">Simpan sebagai produk</h2>
            <span class="chip" :class="errors.length ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
              {{ errors.length ? 'Belum valid' : `Valid · percobaan ${attempts}` }}
            </span>
          </div>
          <label class="label">Nama tema
            <input v-model="meta.name" class="input" required maxlength="60">
          </label>
          <label class="label">Slug
            <input v-model="meta.slug" class="input font-mono text-sm" required pattern="[a-z0-9]+(-[a-z0-9]+)*">
          </label>
          <label class="label">Deskripsi
            <textarea v-model="meta.description" rows="2" class="input" maxlength="300" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="label">Kategori
              <select v-model.number="meta.category_id" class="input">
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </label>
            <label class="label">Status
              <select v-model="meta.status" class="input">
                <option value="draft">Draf</option>
                <option value="published">Tayang</option>
              </select>
            </label>
          </div>
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          <button class="btn-primary" :disabled="saving || !!errors.length">{{ saving ? 'Menyimpan…' : 'Simpan Tema' }}</button>
        </form>
      </div>

      <ThemeWorkbench v-model:definition="definition" v-model:css="css" v-model:errors="errors" v-model:warnings="warnings" :slug="meta.slug" />
    </div>
  </div>
</template>
