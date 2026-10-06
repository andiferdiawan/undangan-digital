<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Blog' })

type Intent = 'informasional' | 'komersial' | 'transaksional' | 'navigasional'
type Provider = 'openrouter' | 'gemini'
interface PostRow { id: string, slug: string, title: string, status: 'draft' | 'published' | 'archived', category_slug: string | null, published_at: string | null, updated_at: string, word_count: number, origin: string, focus_keyword: string }
interface TopicRow { id: number, topic: string, focus_keyword: string, category_slug: string | null, intent: Intent, status: 'queued' | 'done' | 'failed', post_id: string | null, note: string | null }
interface Cat { slug: string, name: string }
interface Author { id: string, slug: string, name: string, job_title: string, bio: string, same_as: string[] }
interface Settings { auto_enabled: boolean, auto_publish: boolean, default_author_id: string | null, default_editor_id: string | null, last_auto_at: string | null, last_auto_status: string | null }

const supabase = useSupabaseClient()
const { data, refresh } = await useAsyncData('admin-blog', async () => {
  const [p, t, c, a, s] = await Promise.all([
    supabase.from('blog_posts').select('id, slug, title, status, category_slug, published_at, updated_at, word_count, origin, focus_keyword').order('created_at', { ascending: false }).limit(500),
    supabase.from('blog_topics').select('*').order('id'),
    supabase.from('blog_categories').select('slug, name').order('sort'),
    supabase.from('blog_authors').select('*').order('created_at'),
    supabase.from('blog_settings').select('*').maybeSingle(),
  ])
  return {
    posts: (p.data ?? []) as PostRow[],
    topics: (t.data ?? []) as TopicRow[],
    categories: (c.data ?? []) as Cat[],
    authors: (a.data ?? []) as Author[],
    settings: (s.data ?? null) as Settings | null,
  }
})
const catName = (slug: string | null) => data.value?.categories.find(c => c.slug === slug)?.name ?? '—'
const INTENTS: Intent[] = ['informasional', 'komersial', 'transaksional', 'navigasional']

// ── Penyedia AI ──
const { data: ai } = await useAsyncData('admin-ai-models', () => $fetch<{
  providers: Record<'anthropic' | Provider, boolean>
  defaultProvider: string | null
  openrouter: { defaultModel: string, models: { id: string, name: string }[] }
  gemini: { defaultModel: string, models: { id: string, name: string }[] }
}>('/api/admin/themes/ai-models'), { server: false })
const providers = computed(() => (['gemini', 'openrouter'] as Provider[]).filter(p => ai.value?.providers[p]))
const provider = ref<Provider | null>(null)
const model = ref('')
watch(ai, (v) => {
  if (!v) return
  const d = v.defaultProvider
  provider.value ??= d === 'gemini' || d === 'openrouter' ? d : providers.value[0] ?? null
}, { immediate: true })
watch(provider, (p) => { model.value = p ? ai.value?.[p].defaultModel ?? '' : '' }, { immediate: true })
const aiBody = () => ({ provider: provider.value ?? undefined, model: model.value || undefined })

const msg = ref<{ ok: boolean, text: string } | null>(null)
const busy = ref<string | null>(null)
async function run<T>(key: string, fn: () => Promise<T>, ok?: (r: T) => string) {
  busy.value = key
  msg.value = null
  try {
    const r = await fn()
    if (ok) msg.value = { ok: true, text: ok(r) }
    await refresh()
    return r
  }
  catch (e) {
    msg.value = { ok: false, text: friendlyError(apiError(e)) }
  }
  finally { busy.value = null }
}

// ── Tulis dengan AI ──
const brief = reactive({ topic: '', focus_keyword: '', category_slug: '', intent: 'informasional' as Intent })
async function generate(topicId?: number) {
  const r = await run(`gen-${topicId ?? 'new'}`, () => $fetch<{ id: string, title: string, stats: { words: number, internalLinks: number, externalLinks: number } }>('/api/admin/blog/generate', {
    method: 'POST',
    timeout: 300_000,
    body: topicId
      ? { topic_id: topicId, ...aiBody() }
      : { topic: brief.topic, focus_keyword: brief.focus_keyword || undefined, category_slug: brief.category_slug || null, intent: brief.intent, ...aiBody() },
  }))
  if (r) await navigateTo(`/admin/blog/${r.id}?baru=1`)
}

// ── Antrean topik ──
const newTopic = reactive({ topic: '', focus_keyword: '', category_slug: '', intent: 'informasional' as Intent })
const queued = computed(() => (data.value?.topics ?? []).filter(t => t.status === 'queued'))
const otherTopics = computed(() => (data.value?.topics ?? []).filter(t => t.status !== 'queued').reverse().slice(0, 30))
async function addTopic() {
  await run('add-topic', async () => {
    const { error } = await supabase.from('blog_topics').insert({
      topic: newTopic.topic.trim(), focus_keyword: newTopic.focus_keyword.trim(), category_slug: newTopic.category_slug || null, intent: newTopic.intent,
    } as never)
    if (error) throw error
    Object.assign(newTopic, { topic: '', focus_keyword: '' })
  })
}
async function removeTopic(id: number) {
  await run(`del-${id}`, async () => { const { error } = await supabase.from('blog_topics').delete().eq('id', id); if (error) throw error })
}
async function requeue(id: number) {
  await run(`rq-${id}`, async () => { const { error } = await supabase.from('blog_topics').update({ status: 'queued', note: null } as never).eq('id', id); if (error) throw error })
}
const suggest = () => run('suggest', () => $fetch<{ added: number }>('/api/admin/blog/topics/suggest', { method: 'POST', timeout: 120_000, body: { count: 10, provider: provider.value ?? undefined } }), r => `${r.added} topik baru ditambahkan ke antrean.`)

// ── Otomatisasi ──
const auto = reactive({ auto_enabled: false, auto_publish: false, default_author_id: '', default_editor_id: '' })
watch(() => data.value?.settings, (s) => {
  if (s) Object.assign(auto, { auto_enabled: s.auto_enabled, auto_publish: s.auto_publish, default_author_id: s.default_author_id ?? '', default_editor_id: s.default_editor_id ?? '' })
}, { immediate: true })
const saveAuto = () => run('auto', async () => {
  const { error } = await supabase.from('blog_settings').update({
    auto_enabled: auto.auto_enabled, auto_publish: auto.auto_publish,
    default_author_id: auto.default_author_id || null, default_editor_id: auto.default_editor_id || null, updated_at: new Date().toISOString(),
  } as never).eq('id', true)
  if (error) throw error
}, () => 'Pengaturan otomatis tersimpan.')
const runNow = () => run('run', () => $fetch<{ slug: string, title: string, status: string }>('/api/admin/blog/run-auto', { method: 'POST', timeout: 300_000, body: { provider: provider.value ?? undefined } }),
  r => `Artikel “${r.title}” dibuat (${r.status === 'published' ? 'langsung tayang' : 'draf'}).`)

// ── Penulis & editor ──
const authorForm = reactive({ id: '', name: '', slug: '', job_title: '', bio: '', same_as: '' })
function editAuthor(a?: Author) {
  Object.assign(authorForm, a
    ? { id: a.id, name: a.name, slug: a.slug, job_title: a.job_title, bio: a.bio, same_as: a.same_as.join('\n') }
    : { id: '', name: '', slug: '', job_title: '', bio: '', same_as: '' })
  authorOpen.value = true
}
const authorOpen = ref(false)
const saveAuthor = () => run('author', async () => {
  const row = {
    name: authorForm.name.trim(), slug: (authorForm.slug.trim() || slugify(authorForm.name)), job_title: authorForm.job_title.trim(), bio: authorForm.bio.trim(),
    same_as: authorForm.same_as.split(/\s+/).map(s => s.trim()).filter(s => /^https:\/\//.test(s)),
  }
  const { error } = authorForm.id
    ? await supabase.from('blog_authors').update(row as never).eq('id', authorForm.id)
    : await supabase.from('blog_authors').insert(row as never)
  if (error) throw error
  authorOpen.value = false
}, () => 'Profil penulis tersimpan.')

// ── Daftar artikel ──
const filter = ref<'all' | 'published' | 'draft' | 'archived'>('all')
const posts = computed(() => (data.value?.posts ?? []).filter(p => filter.value === 'all' || p.status === filter.value))
const count = (s: string) => (data.value?.posts ?? []).filter(p => p.status === s).length
const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl text-brand">Blog SEO</h1>
          <p class="mt-1 text-sm text-brand-600">Artikel teks (tanpa gambar) dengan meta lengkap, JSON-LD, internal & eksternal link — untuk menarik trafik organik.</p>
        </div>
        <div class="flex gap-2">
          <a href="/blog" target="_blank" rel="noopener" class="btn-ghost btn-sm">Lihat blog ↗</a>
          <NuxtLink to="/admin/blog/baru" class="btn-primary btn-sm">+ Tulis manual</NuxtLink>
        </div>
      </div>

      <p v-if="msg" class="mt-4 rounded-xl px-4 py-3 text-sm" :class="msg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'">{{ msg.text }}</p>
      <p v-if="ai && !providers.length" class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Belum ada API key AI. Isi API key Gemini (gratis) atau OpenRouter di <NuxtLink to="/admin/pengaturan" class="font-semibold underline">Pengaturan</NuxtLink>.
      </p>

      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <!-- Tulis dengan AI -->
        <form class="card grid h-max gap-3 p-5" @submit.prevent="generate()">
          <h2 class="font-semibold text-brand">Tulis artikel dengan AI</h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="label">Penyedia AI
              <select v-model="provider" class="input" :disabled="!providers.length">
                <option v-for="p in providers" :key="p" :value="p">{{ p === 'gemini' ? 'Gemini (Google AI Studio)' : 'OpenRouter (gratis)' }}</option>
              </select>
            </label>
            <label v-if="provider" class="label">Model
              <select v-model="model" class="input">
                <option v-for="m in ai?.[provider].models ?? []" :key="m.id" :value="m.id">{{ m.name || m.id }}</option>
              </select>
            </label>
          </div>
          <label class="label">Topik / judul kerja
            <input v-model="brief.topic" class="input" minlength="5" maxlength="200" required placeholder="Contoh: Contoh kata-kata undangan pernikahan islami yang menyentuh">
          </label>
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="label">Kata kunci utama
              <input v-model="brief.focus_keyword" class="input" maxlength="80" placeholder="opsional">
            </label>
            <label class="label">Kategori
              <select v-model="brief.category_slug" class="input">
                <option value="">Otomatis</option>
                <option v-for="c in data?.categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
              </select>
            </label>
            <label class="label">Search intent
              <select v-model="brief.intent" class="input">
                <option v-for="i in INTENTS" :key="i" :value="i">{{ i }}</option>
              </select>
            </label>
          </div>
          <button class="btn-accent" :disabled="!!busy || !provider">{{ busy === 'gen-new' ? 'Menulis artikel… (±1–2 menit)' : '✦ Tulis artikel' }}</button>
          <p class="text-xs text-brand-500">Hasil disimpan sebagai draf. Tinjau, rapikan, lalu tayangkan dari editor.</p>
        </form>

        <!-- Otomatis -->
        <form class="card grid h-max gap-3 p-5" @submit.prevent="saveAuto">
          <h2 class="font-semibold text-brand">Artikel otomatis harian</h2>
          <p class="text-xs text-brand-600">Setiap hari pukul 08.00 WIB satu topik dari antrean ditulis AI (antrean diisi ulang otomatis bila hampir habis). Memakai penyedia AI utama di Pengaturan.</p>
          <label class="flex items-center gap-2 text-sm font-medium text-brand-800"><input v-model="auto.auto_enabled" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Aktifkan 1 artikel per hari</label>
          <label class="flex items-center gap-2 text-sm font-medium text-brand-800"><input v-model="auto.auto_publish" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Langsung tayang (tanpa tinjauan)</label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="label">Penulis default
              <select v-model="auto.default_author_id" class="input">
                <option value="">—</option>
                <option v-for="a in data?.authors" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </label>
            <label class="label">Editor default
              <select v-model="auto.default_editor_id" class="input">
                <option value="">—</option>
                <option v-for="a in data?.authors" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </label>
          </div>
          <p v-if="data?.settings?.last_auto_at" class="text-xs text-brand-600">Terakhir: {{ fmt(data.settings.last_auto_at) }} — {{ data.settings.last_auto_status }}</p>
          <div class="flex flex-wrap gap-2">
            <button class="btn-primary btn-sm" :disabled="!!busy">{{ busy === 'auto' ? 'Menyimpan…' : 'Simpan' }}</button>
            <button type="button" class="btn-ghost btn-sm" :disabled="!!busy || !provider" @click="runNow">{{ busy === 'run' ? 'Menulis… (±1–2 menit)' : 'Jalankan sekarang' }}</button>
          </div>
        </form>
      </div>

      <!-- Antrean topik -->
      <section class="card mt-5 p-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-brand">Antrean topik <span class="font-normal text-brand-500">({{ queued.length }})</span></h2>
          <button class="btn-ghost btn-sm" :disabled="!!busy || !provider" @click="suggest">{{ busy === 'suggest' ? 'Mencari topik…' : '✦ Usulkan 10 topik (AI)' }}</button>
        </div>
        <form class="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]" @submit.prevent="addTopic">
          <input v-model="newTopic.topic" class="input" minlength="5" maxlength="200" required placeholder="Topik baru">
          <input v-model="newTopic.focus_keyword" class="input" maxlength="80" placeholder="Kata kunci">
          <select v-model="newTopic.category_slug" class="input">
            <option value="">Kategori</option>
            <option v-for="c in data?.categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
          </select>
          <select v-model="newTopic.intent" class="input">
            <option v-for="i in INTENTS" :key="i" :value="i">{{ i }}</option>
          </select>
          <button class="btn-primary btn-sm" :disabled="!!busy">Tambah</button>
        </form>
        <ul class="mt-3 divide-y divide-brand-100 text-sm">
          <li v-for="t in queued" :key="t.id" class="flex flex-wrap items-center gap-2 py-2">
            <span class="min-w-0 flex-1">
              <span class="font-medium text-brand-900">{{ t.topic }}</span>
              <span class="block text-xs text-brand-500">{{ t.focus_keyword || '—' }} · {{ catName(t.category_slug) }} · {{ t.intent }}</span>
            </span>
            <button class="btn-ghost btn-sm" :disabled="!!busy || !provider" @click="generate(t.id)">{{ busy === `gen-${t.id}` ? 'Menulis…' : 'Tulis' }}</button>
            <button class="text-xs text-red-600 underline" :disabled="!!busy" @click="removeTopic(t.id)">hapus</button>
          </li>
          <li v-if="!queued.length" class="py-3 text-brand-500">Antrean kosong.</li>
        </ul>
        <details v-if="otherTopics.length" class="mt-2 text-sm">
          <summary class="cursor-pointer text-brand-600">Riwayat topik</summary>
          <ul class="mt-2 divide-y divide-brand-100">
            <li v-for="t in otherTopics" :key="t.id" class="flex flex-wrap items-center gap-2 py-2">
              <span class="chip" :class="t.status === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">{{ t.status === 'done' ? 'selesai' : 'gagal' }}</span>
              <span class="min-w-0 flex-1 text-brand-800">{{ t.topic }}<span v-if="t.note" class="block text-xs text-red-600">{{ t.note }}</span></span>
              <NuxtLink v-if="t.post_id" :to="`/admin/blog/${t.post_id}`" class="text-xs underline">artikel</NuxtLink>
              <button v-if="t.status === 'failed'" class="text-xs underline" @click="requeue(t.id)">antrekan lagi</button>
            </li>
          </ul>
        </details>
      </section>

      <!-- Artikel -->
      <section class="card mt-5 p-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-brand">Artikel</h2>
          <div class="flex gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold">
            <button v-for="f in (['all', 'published', 'draft', 'archived'] as const)" :key="f" class="rounded-full px-3 py-1.5" :class="filter === f ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="filter = f">
              {{ { all: 'Semua', published: `Tayang (${count('published')})`, draft: `Draf (${count('draft')})`, archived: 'Arsip' }[f] }}
            </button>
          </div>
        </div>
        <ul class="mt-3 divide-y divide-brand-100 text-sm">
          <li v-for="p in posts" :key="p.id">
            <NuxtLink :to="`/admin/blog/${p.id}`" class="flex flex-wrap items-center gap-2 py-2.5 hover:bg-brand-50/60">
              <span class="chip" :class="p.status === 'published' ? 'bg-green-50 text-green-700' : p.status === 'draft' ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-600'">{{ { published: 'tayang', draft: 'draf', archived: 'arsip' }[p.status] }}</span>
              <span class="min-w-0 flex-1">
                <span class="font-medium text-brand-900">{{ p.title }}</span>
                <span class="block text-xs text-brand-500">/blog/{{ p.slug }} · {{ catName(p.category_slug) }} · {{ p.word_count }} kata · {{ p.origin }} · {{ fmt(p.published_at ?? p.updated_at) }}</span>
              </span>
            </NuxtLink>
          </li>
          <li v-if="!posts.length" class="py-3 text-brand-500">Belum ada artikel.</li>
        </ul>
      </section>

      <!-- Penulis -->
      <section class="card mt-5 p-5">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-semibold text-brand">Penulis & editor <span class="font-normal text-brand-500 text-xs">(E-E-A-T: tampil di artikel & JSON-LD)</span></h2>
          <button class="btn-ghost btn-sm" @click="editAuthor()">+ Penulis</button>
        </div>
        <ul class="mt-3 divide-y divide-brand-100 text-sm">
          <li v-for="a in data?.authors" :key="a.id" class="flex items-center gap-2 py-2">
            <span class="min-w-0 flex-1"><span class="font-medium text-brand-900">{{ a.name }}</span> <span class="text-xs text-brand-500">· {{ a.job_title || 'tanpa jabatan' }} · /blog/penulis/{{ a.slug }}</span></span>
            <button class="text-xs underline" @click="editAuthor(a)">ubah</button>
          </li>
        </ul>
        <form v-if="authorOpen" class="mt-3 grid gap-3 rounded-xl bg-brand-50 p-4" @submit.prevent="saveAuthor">
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="label">Nama<input v-model="authorForm.name" class="input" minlength="2" maxlength="80" required></label>
            <label class="label">Slug<input v-model="authorForm.slug" class="input" pattern="[a-z0-9-]{2,60}" placeholder="otomatis"></label>
            <label class="label">Jabatan<input v-model="authorForm.job_title" class="input" maxlength="80" placeholder="Editor Konten"></label>
          </div>
          <label class="label">Bio singkat<textarea v-model="authorForm.bio" class="input" rows="3" maxlength="1000" /></label>
          <label class="label">Profil publik (satu URL https per baris: LinkedIn, Instagram…)<textarea v-model="authorForm.same_as" class="input font-mono text-xs" rows="2" /></label>
          <div class="flex gap-2">
            <button class="btn-primary btn-sm" :disabled="!!busy">Simpan</button>
            <button type="button" class="btn-ghost btn-sm" @click="authorOpen = false">Batal</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
