<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Halaman' })

interface PageRow { slug: string, title: string, description: string | null, body: string, sort: number, is_published: boolean, updated_at: string }

const supabase = useSupabaseClient()
const { data: pages, refresh } = await useAsyncData('admin-pages', async () => {
  const { data } = await supabase.from('pages').select('*').order('sort')
  return (data ?? []) as PageRow[]
})

const selected = ref<string>(pages.value?.[0]?.slug ?? '')
const form = reactive({ title: '', description: '', body: '', is_published: true })
function load(slug: string) {
  const p = pages.value?.find(x => x.slug === slug)
  if (!p) return
  selected.value = slug
  Object.assign(form, { title: p.title, description: p.description ?? '', body: p.body, is_published: p.is_published })
  msg.value = null
}
const current = computed(() => pages.value?.find(x => x.slug === selected.value))
const dirty = computed(() => !!current.value && (current.value.title !== form.title || (current.value.description ?? '') !== form.description || current.value.body !== form.body || current.value.is_published !== form.is_published))
const preview = computed(() => renderMarkdown(form.body))
const view = ref<'edit' | 'preview'>('edit')

const saving = ref(false)
const msg = ref<{ ok: boolean, text: string } | null>(null)
async function save() {
  if (!current.value) return
  saving.value = true
  msg.value = null
  const { error } = await supabase.from('pages').update({
    title: form.title.trim(), description: form.description.trim() || null, body: form.body, is_published: form.is_published,
  } as never).eq('slug', current.value.slug)
  saving.value = false
  if (error) { msg.value = { ok: false, text: friendlyError(error) }; return }
  await refresh()
  msg.value = { ok: true, text: 'Tersimpan. Perubahan langsung tampil di website.' }
}

onMounted(() => { if (selected.value) load(selected.value) })
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <h1 class="font-display text-3xl text-brand">Halaman Informasi</h1>
      <p class="mt-1 text-sm text-brand-600">Tentang kami, kebijakan privasi, syarat & ketentuan, dan lainnya. Tautannya ada di footer semua halaman.</p>

      <div class="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
        <nav class="card h-max p-2">
          <button
            v-for="p in pages" :key="p.slug"
            class="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm"
            :class="p.slug === selected ? 'bg-brand text-white' : 'text-brand-800 hover:bg-brand-50'"
            @click="load(p.slug)"
          >
            <span class="truncate">{{ p.title }}</span>
            <span v-if="!p.is_published" class="text-[10px] opacity-70">draf</span>
          </button>
        </nav>

        <form v-if="current" class="card grid gap-3 p-5" @submit.prevent="save">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <a :href="`/${current.slug}`" target="_blank" rel="noopener" class="font-mono text-xs text-brand-600 underline">undanganvirtual.com/{{ current.slug }} ↗</a>
            <label class="flex items-center gap-2 text-sm font-medium text-brand-800">
              <input v-model="form.is_published" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Tayang
            </label>
          </div>
          <label class="label">Judul
            <input v-model="form.title" class="input" maxlength="120" required>
          </label>
          <label class="label">Deskripsi singkat (untuk Google & pratinjau link)
            <input v-model="form.description" class="input" maxlength="300">
          </label>

          <div class="flex gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold lg:hidden">
            <button type="button" class="flex-1 rounded-full py-1.5" :class="view === 'edit' ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="view = 'edit'">Tulis</button>
            <button type="button" class="flex-1 rounded-full py-1.5" :class="view === 'preview' ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="view = 'preview'">Pratinjau</button>
          </div>
          <div class="grid gap-3 lg:grid-cols-2">
            <label class="label" :class="view === 'preview' && 'hidden lg:grid'">Isi halaman
              <textarea v-model="form.body" rows="22" class="input font-mono text-[13px] leading-relaxed" />
            </label>
            <div :class="view === 'edit' && 'hidden lg:block'">
              <p class="mb-1.5 text-sm font-medium text-brand-800">Pratinjau</p>
              <div class="max-h-[560px] overflow-y-auto rounded-xl border border-brand-100 bg-white p-4">
                <div class="prose-page" v-html="preview" />
              </div>
            </div>
          </div>
          <details class="rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
            <summary class="cursor-pointer font-semibold">Panduan format</summary>
            <ul class="mt-2 grid gap-1 font-mono">
              <li>## Judul bagian &nbsp;·&nbsp; ### Sub-judul</li>
              <li>- butir daftar &nbsp;·&nbsp; 1. daftar bernomor</li>
              <li>**tebal** &nbsp;·&nbsp; *miring*</li>
              <li>[teks tautan](https://alamat) atau [Kontak](/kontak)</li>
              <li>Baris kosong = paragraf baru</li>
            </ul>
          </details>
          <div class="flex flex-wrap items-center gap-3">
            <button class="btn-primary" :disabled="saving || !dirty">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
            <span v-if="msg" class="text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'">{{ msg.text }}</span>
            <span v-else-if="dirty" class="text-xs text-brand-500">Ada perubahan yang belum disimpan</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
