<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Editor Artikel' })

type Intent = 'informasional' | 'komersial' | 'transaksional' | 'navigasional'
type Status = 'draft' | 'published' | 'archived'
interface Post {
  id: string, slug: string, title: string, meta_title: string, meta_description: string, excerpt: string, body: string
  category_slug: string | null, tags: string[], focus_keyword: string, search_intent: Intent
  faq: { q: string, a: string }[], sources: { title: string, url: string }[]
  author_id: string | null, editor_id: string | null, status: Status, published_at: string | null
  word_count: number, reading_minutes: number, origin: string, ai_model: string | null
}

const route = useRoute()
const supabase = useSupabaseClient()
const isNew = computed(() => route.params.id === 'baru')
const { data } = await useAsyncData(`admin-blog-${route.params.id}`, async () => {
  const [p, c, a, s] = await Promise.all([
    isNew.value ? Promise.resolve({ data: null }) : supabase.from('blog_posts').select('*').eq('id', String(route.params.id)).maybeSingle(),
    supabase.from('blog_categories').select('slug, name').order('sort'),
    supabase.from('blog_authors').select('id, name').order('created_at'),
    supabase.from('blog_settings').select('default_author_id, default_editor_id').maybeSingle(),
  ])
  return {
    post: p.data as Post | null,
    categories: (c.data ?? []) as { slug: string, name: string }[],
    authors: (a.data ?? []) as { id: string, name: string }[],
    settings: s.data as { default_author_id: string | null, default_editor_id: string | null } | null,
  }
})
if (!isNew.value && !data.value?.post) throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan', fatal: true })

const form = reactive({
  title: '', slug: '', meta_title: '', meta_description: '', excerpt: '', body: '',
  category_slug: '', tags: '', focus_keyword: '', search_intent: 'informasional' as Intent,
  faq: [] as { q: string, a: string }[], sources: [] as { title: string, url: string }[],
  author_id: '', editor_id: '', status: 'draft' as Status,
})
function load(p: Post | null) {
  if (!p) {
    Object.assign(form, { author_id: data.value?.settings?.default_author_id ?? '', editor_id: data.value?.settings?.default_editor_id ?? '' })
    return
  }
  Object.assign(form, {
    title: p.title, slug: p.slug, meta_title: p.meta_title, meta_description: p.meta_description, excerpt: p.excerpt, body: p.body,
    category_slug: p.category_slug ?? '', tags: p.tags.join(', '), focus_keyword: p.focus_keyword, search_intent: p.search_intent,
    faq: p.faq.map(f => ({ ...f })), sources: p.sources.map(s => ({ ...s })),
    author_id: p.author_id ?? '', editor_id: p.editor_id ?? '', status: p.status,
  })
}
load(data.value?.post ?? null)
const slugTouched = ref(!isNew.value)
watch(() => form.title, (t) => { if (!slugTouched.value) form.slug = slugify(t).slice(0, 80) })

const rendered = computed(() => renderArticle(form.body))
const view = ref<'edit' | 'preview'>('edit')

// ── Pemeriksaan SEO ──
const words = computed(() => form.body.split(/\s+/).filter(Boolean).length)
const links = computed(() => [...form.body.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]!))
const kw = computed(() => form.focus_keyword.trim().toLowerCase())
const has = (s: string) => !!kw.value && s.toLowerCase().includes(kw.value)
const checks = computed(() => {
  const mt = form.meta_title || form.title
  return [
    { ok: !!kw.value, text: 'Kata kunci utama diisi' },
    { ok: has(form.title), text: 'Kata kunci ada di judul' },
    { ok: mt.length >= 30 && mt.length <= 60, text: `Meta title 30–60 karakter (${mt.length})` },
    { ok: form.meta_description.length >= 120 && form.meta_description.length <= 160, text: `Meta description 120–160 karakter (${form.meta_description.length})` },
    { ok: has(form.meta_description), text: 'Kata kunci ada di meta description' },
    { ok: has(form.body.split(/\s+/).slice(0, 120).join(' ')), text: 'Kata kunci muncul di 100 kata pertama' },
    { ok: rendered.value.toc.some(t => has(t.text)), text: 'Kata kunci/variasinya ada di subjudul' },
    { ok: rendered.value.toc.filter(t => t.level === 2).length >= 3, text: `Minimal 3 subjudul H2 (${rendered.value.toc.filter(t => t.level === 2).length})` },
    { ok: words.value >= 900, text: `Panjang ≥ 900 kata (${words.value})` },
    { ok: links.value.filter(l => l.startsWith('/')).length >= 3, text: `Internal link ≥ 3 (${links.value.filter(l => l.startsWith('/')).length})` },
    { ok: links.value.some(l => l.startsWith('/katalog') || l.startsWith('/#harga')), text: 'Ada tautan ke katalog/harga (konversi)' },
    { ok: links.value.some(l => /^https:\/\//.test(l)) || form.sources.length > 0, text: 'Ada sumber/eksternal link tepercaya' },
    { ok: form.faq.filter(f => f.q && f.a).length >= 3, text: `FAQ ≥ 3 (${form.faq.filter(f => f.q && f.a).length})` },
    { ok: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug) && form.slug.length <= 60, text: 'Slug rapi & ≤ 60 karakter' },
    { ok: !!form.author_id, text: 'Penulis diisi (E-E-A-T)' },
  ]
})
const score = computed(() => Math.round(checks.value.filter(c => c.ok).length / checks.value.length * 100))

// ── Simpan ──
const saving = ref(false)
const msg = ref<{ ok: boolean, text: string } | null>(null)
async function save(status?: Status) {
  saving.value = true
  msg.value = null
  const row = {
    title: form.title.trim(), slug: form.slug.trim(), meta_title: form.meta_title.trim(), meta_description: form.meta_description.trim(),
    excerpt: form.excerpt.trim(), body: form.body, category_slug: form.category_slug || null,
    tags: [...new Set(form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10),
    focus_keyword: form.focus_keyword.trim(), search_intent: form.search_intent,
    faq: form.faq.filter(f => f.q.trim() && f.a.trim()), sources: form.sources.filter(s => /^https:\/\//.test(s.url.trim())),
    author_id: form.author_id || null, editor_id: form.editor_id || null, status: status ?? form.status,
  }
  const res = isNew.value
    ? await supabase.from('blog_posts').insert(row as never).select('id').single()
    : await supabase.from('blog_posts').update(row as never).eq('id', String(route.params.id)).select('id').single()
  saving.value = false
  if (res.error) {
    msg.value = { ok: false, text: res.error.message.includes('duplicate key') ? 'Slug sudah dipakai artikel lain.' : friendlyError(res.error) }
    return
  }
  form.status = row.status
  msg.value = { ok: true, text: row.status === 'published' ? 'Tersimpan & tayang.' : 'Tersimpan.' }
  if (isNew.value) await navigateTo(`/admin/blog/${(res.data as { id: string }).id}`, { replace: true })
}
async function remove() {
  if (!confirm('Hapus artikel ini secara permanen?')) return
  const { error } = await supabase.from('blog_posts').delete().eq('id', String(route.params.id))
  if (error) { msg.value = { ok: false, text: friendlyError(error) }; return }
  await navigateTo('/admin/blog')
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <NuxtLink to="/admin/blog" class="text-sm text-brand-600 underline">← Semua artikel</NuxtLink>
        <a v-if="!isNew && form.status === 'published'" :href="`/blog/${form.slug}`" target="_blank" rel="noopener" class="text-sm text-brand-600 underline">Lihat artikel ↗</a>
      </div>
      <p v-if="route.query.baru" class="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Artikel AI selesai ditulis ({{ data?.post?.ai_model }}). Tinjau isi & fakta, lalu klik <b>Tayangkan</b>.</p>

      <div class="mt-4 grid gap-5 lg:grid-cols-[1fr_300px]">
        <form class="card grid gap-3 p-5" @submit.prevent="save()">
          <label class="label">Judul (H1)
            <input v-model="form.title" class="input" minlength="10" maxlength="120" required>
          </label>
          <label class="label">Slug URL
            <div class="flex items-center gap-1 text-sm text-brand-500">/blog/<input v-model="form.slug" class="input" pattern="[a-z0-9]+(-[a-z0-9]+)*" minlength="3" maxlength="90" required @input="slugTouched = true"></div>
          </label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="label">Meta title <span class="text-xs font-normal text-brand-500">{{ (form.meta_title || form.title).length }}/60</span>
              <input v-model="form.meta_title" class="input" maxlength="70" :placeholder="form.title">
            </label>
            <label class="label">Kata kunci utama
              <input v-model="form.focus_keyword" class="input" maxlength="80">
            </label>
          </div>
          <label class="label">Meta description <span class="text-xs font-normal text-brand-500">{{ form.meta_description.length }}/160</span>
            <textarea v-model="form.meta_description" class="input" rows="2" maxlength="170" />
          </label>
          <label class="label">Ringkasan (excerpt)
            <textarea v-model="form.excerpt" class="input" rows="2" maxlength="400" />
          </label>
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="label">Kategori
              <select v-model="form.category_slug" class="input">
                <option value="">—</option>
                <option v-for="c in data?.categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
              </select>
            </label>
            <label class="label">Search intent
              <select v-model="form.search_intent" class="input">
                <option v-for="i in ['informasional', 'komersial', 'transaksional', 'navigasional']" :key="i" :value="i">{{ i }}</option>
              </select>
            </label>
            <label class="label">Tag (pisahkan koma)
              <input v-model="form.tags" class="input">
            </label>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="label">Penulis
              <select v-model="form.author_id" class="input">
                <option value="">—</option>
                <option v-for="a in data?.authors" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </label>
            <label class="label">Editor
              <select v-model="form.editor_id" class="input">
                <option value="">—</option>
                <option v-for="a in data?.authors" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </label>
          </div>

          <div class="flex gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold lg:hidden">
            <button type="button" class="flex-1 rounded-full py-1.5" :class="view === 'edit' ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="view = 'edit'">Tulis</button>
            <button type="button" class="flex-1 rounded-full py-1.5" :class="view === 'preview' ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="view = 'preview'">Pratinjau</button>
          </div>
          <div class="grid gap-3 xl:grid-cols-2">
            <label class="label" :class="view === 'preview' && 'hidden lg:grid'">Isi artikel (Markdown) <span class="text-xs font-normal text-brand-500">{{ words }} kata</span>
              <textarea v-model="form.body" rows="28" class="input font-mono text-[13px] leading-relaxed" />
            </label>
            <div :class="view === 'edit' && 'hidden lg:block'">
              <p class="mb-1.5 text-sm font-medium text-brand-800">Pratinjau</p>
              <div class="max-h-[680px] overflow-y-auto rounded-xl border border-brand-100 bg-white p-4">
                <h1 class="font-display text-2xl text-brand">{{ form.title }}</h1>
                <div class="prose-page" v-html="rendered.html" />
              </div>
            </div>
          </div>

          <fieldset class="grid gap-2 rounded-xl bg-brand-50 p-4">
            <legend class="text-sm font-semibold text-brand-800">FAQ (JSON-LD FAQPage)</legend>
            <div v-for="(f, i) in form.faq" :key="i" class="grid gap-1.5 rounded-lg bg-white p-3">
              <input v-model="f.q" class="input" placeholder="Pertanyaan" maxlength="200">
              <textarea v-model="f.a" class="input" rows="2" placeholder="Jawaban" maxlength="700" />
              <button type="button" class="justify-self-end text-xs text-red-600 underline" @click="form.faq.splice(i, 1)">hapus</button>
            </div>
            <button type="button" class="btn-ghost btn-sm justify-self-start" @click="form.faq.push({ q: '', a: '' })">+ Pertanyaan</button>
          </fieldset>
          <fieldset class="grid gap-2 rounded-xl bg-brand-50 p-4">
            <legend class="text-sm font-semibold text-brand-800">Referensi / sumber eksternal</legend>
            <div v-for="(s, i) in form.sources" :key="i" class="grid gap-1.5 sm:grid-cols-[1fr_1.4fr_auto]">
              <input v-model="s.title" class="input" placeholder="Judul sumber" maxlength="120">
              <input v-model="s.url" class="input" type="url" placeholder="https://…">
              <button type="button" class="text-xs text-red-600 underline" @click="form.sources.splice(i, 1)">hapus</button>
            </div>
            <button type="button" class="btn-ghost btn-sm justify-self-start" @click="form.sources.push({ title: '', url: '' })">+ Sumber</button>
          </fieldset>

          <div class="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-brand-100 bg-white/95 px-5 py-3 backdrop-blur">
            <button class="btn-ghost btn-sm" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
            <button v-if="form.status !== 'published'" type="button" class="btn-primary btn-sm" :disabled="saving" @click="save('published')">Tayangkan</button>
            <button v-else type="button" class="btn-ghost btn-sm" :disabled="saving" @click="save('draft')">Jadikan draf</button>
            <button v-if="!isNew && form.status !== 'archived'" type="button" class="text-xs text-brand-600 underline" @click="save('archived')">Arsipkan</button>
            <button v-if="!isNew" type="button" class="ml-auto text-xs text-red-600 underline" @click="remove">Hapus</button>
            <span v-if="msg" class="w-full text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'">{{ msg.text }}</span>
          </div>
        </form>

        <aside class="grid h-max gap-4 lg:sticky lg:top-4">
          <div class="card p-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-brand">Skor SEO</h2>
              <span class="text-2xl font-bold" :class="score >= 80 ? 'text-green-700' : score >= 60 ? 'text-amber-600' : 'text-red-600'">{{ score }}</span>
            </div>
            <ul class="mt-3 grid gap-1.5 text-xs">
              <li v-for="c in checks" :key="c.text" class="flex gap-2" :class="c.ok ? 'text-green-800' : 'text-brand-500'">
                <span>{{ c.ok ? '✓' : '○' }}</span><span>{{ c.text }}</span>
              </li>
            </ul>
          </div>
          <div class="card p-4 text-xs">
            <h2 class="text-sm font-semibold text-brand">Pratinjau Google</h2>
            <p class="mt-2 truncate text-[#1a0dab] text-base">{{ form.meta_title || form.title }}</p>
            <p class="text-green-800">undanganvirtual.com › blog › {{ form.slug }}</p>
            <p class="mt-1 line-clamp-2 text-brand-700">{{ form.meta_description || form.excerpt }}</p>
          </div>
          <details class="card p-4 text-xs text-brand-700">
            <summary class="cursor-pointer font-semibold">Panduan format</summary>
            <ul class="mt-2 grid gap-1 font-mono">
              <li>## Subjudul (H2) · ### H3</li>
              <li>- daftar · 1. bernomor</li>
              <li>**tebal** · *miring*</li>
              <li>&gt; kutipan / contoh teks</li>
              <li>[anchor](/katalog/pernikahan)</li>
              <li>[sumber](https://kemenag.go.id)</li>
            </ul>
          </details>
        </aside>
      </div>
    </div>
  </div>
</template>
