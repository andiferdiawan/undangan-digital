<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Pengaturan' })
const supabase = useSupabaseClient()

const { data } = await useAsyncData('admin-settings', async () => {
  const { data } = await supabase.from('app_settings').select('*').single()
  return data as unknown as {
    default_reseller_rate: number, payout_days: number[], min_payout: number, order_expiry_hours: number
    bing_site_verification: string | null, google_site_verification: string | null
  } | null
})
const form = reactive({
  rate: Number(data.value?.default_reseller_rate ?? 30),
  days: (data.value?.payout_days ?? [5, 25]).join(', '),
  min: data.value?.min_payout ?? 50000,
  expiry: data.value?.order_expiry_hours ?? 24,
})
const msg = ref<{ ok: boolean, text: string } | null>(null)

async function save() {
  msg.value = null
  const days = [...new Set(form.days.split(/[,\s]+/).map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 28))].sort((a, b) => a - b)
  if (!days.length) {
    msg.value = { ok: false, text: 'Isi minimal satu tanggal pencairan (1–28).' }
    return
  }
  const { error } = await supabase.from('app_settings').update({
    default_reseller_rate: form.rate, payout_days: days, min_payout: form.min, order_expiry_hours: form.expiry,
  } as never).eq('id', true)
  msg.value = error ? { ok: false, text: friendlyError(error) } : { ok: true, text: 'Pengaturan tersimpan.' }
  if (!error) form.days = days.join(', ')
}

// ── Mesin pencari: kode verifikasi Bing/Google (dipasang sebagai meta di beranda) & IndexNow
const seo = reactive({ bing: data.value?.bing_site_verification ?? '', google: data.value?.google_site_verification ?? '' })
const seoMsg = ref<{ ok: boolean, text: string } | null>(null)
const seoBusy = ref(false)
const pinging = ref(false)
/** Terima kode saja atau seluruh tag meta yang ditempel dari Bing/Google, ambil isi atribut content-nya. */
function verificationCode(v: string) {
  const s = v.trim()
  return (s.match(/content\s*=\s*["']([^"']*)["']/i)?.[1] ?? s).trim()
}
async function saveSeo() {
  seoMsg.value = null
  const bing = verificationCode(seo.bing)
  const google = verificationCode(seo.google)
  if ([bing, google].some(c => c && !/^[A-Za-z0-9_-]{1,100}$/.test(c))) {
    seoMsg.value = { ok: false, text: 'Kode verifikasi hanya berisi huruf, angka, - dan _. Tempel kodenya saja atau seluruh tag meta.' }
    return
  }
  seoBusy.value = true
  const { error } = await supabase.from('app_settings').update({
    bing_site_verification: bing || null, google_site_verification: google || null,
  } as never).eq('id', true)
  seoBusy.value = false
  if (error) {
    seoMsg.value = { ok: false, text: friendlyError(error) }
    return
  }
  Object.assign(seo, { bing, google })
  seoMsg.value = { ok: true, text: 'Kode verifikasi tersimpan dan langsung terpasang di beranda. Silakan klik Verify di Bing Webmaster.' }
}
async function pingIndexNow() {
  seoMsg.value = null
  seoBusy.value = pinging.value = true
  try {
    const r = await $fetch<{ sent: number, status: number | null, skipped?: string, error?: string }>('/api/admin/indexnow', { method: 'POST', body: { all: true } })
    seoMsg.value = r.status === 200 || r.status === 202
      ? { ok: true, text: `${r.sent} URL terkirim ke Bing lewat IndexNow (status ${r.status}). Bing akan merayapi halaman-halaman ini dalam beberapa hari.` }
      : { ok: false, text: r.skipped || r.error || `IndexNow menolak (status ${r.status}). Coba lagi beberapa menit lagi.` }
  }
  catch (e: any) {
    seoMsg.value = { ok: false, text: e?.data?.statusMessage || 'Gagal menghubungi IndexNow.' }
  }
  seoBusy.value = pinging.value = false
}

// ── Integrasi AI (Gemini & OpenRouter). Key disimpan terenkripsi di Supabase Vault; halaman ini hanya melihat petunjuk tersamar.
type AiSettings = {
  openrouter_set: boolean, openrouter_hint: string | null, openrouter_model: string
  gemini_set: boolean, gemini_hint: string | null, gemini_model: string
  default_provider: '' | 'openrouter' | 'gemini', updated_at: string
}
type GeminiModel = { id: string, name: string, context: number }
type FreeModel = { id: string, name: string, context: number, structured: boolean }
const ai = ref<AiSettings | null>(null)
const aiModels = ref<FreeModel[]>([])
const aiKey = ref('')
const aiModel = ref('')
const aiBusy = ref(false)
const aiMsg = ref<{ ok: boolean, text: string } | null>(null)

async function loadAi() {
  const { data, error } = await supabase.rpc('admin_ai_settings' as never)
  if (error) {
    aiMsg.value = { ok: false, text: friendlyError(error) }
    return
  }
  ai.value = data as unknown as AiSettings
  aiModel.value = ai.value.openrouter_model
  gmModel.value = ai.value.gemini_model
  defaultProvider.value = ai.value.default_provider
}
const gmModels = ref<GeminiModel[]>([])
const gmModelsError = ref('')
async function loadModels() {
  try {
    const r = await $fetch<{ openrouter: { models: FreeModel[] }, gemini: { models: GeminiModel[], error: string } }>('/api/admin/themes/ai-models')
    aiModels.value = r.openrouter.models
    gmModels.value = r.gemini.models
    gmModelsError.value = r.gemini.error
  }
  catch { /* daftar model opsional */ }
}
onMounted(async () => {
  await loadAi()
  await loadModels()
})

async function aiCall(fn: string, args: Record<string, unknown>, ok: string) {
  aiBusy.value = true
  aiMsg.value = null
  const { data, error } = await supabase.rpc(fn as never, args as never)
  aiBusy.value = false
  if (error) {
    aiMsg.value = { ok: false, text: friendlyError(error) }
    return
  }
  ai.value = data as unknown as AiSettings
  aiMsg.value = { ok: true, text: ok }
}
async function saveKey() {
  const k = aiKey.value.trim()
  if (!/^[A-Za-z0-9_.-]{20,300}$/.test(k)) {
    aiMsg.value = { ok: false, text: 'Format API key tidak valid. Salin key dari openrouter.ai/keys (diawali sk-or-).' }
    return
  }
  await aiCall('admin_set_openrouter_key', { p_key: k }, 'API key OpenRouter tersimpan (terenkripsi).')
  if (aiMsg.value?.ok) aiKey.value = ''
}
async function removeKey() {
  if (!confirm('Hapus API key OpenRouter? Generator tema AI tidak bisa dipakai sampai key diisi lagi.')) return
  await aiCall('admin_set_openrouter_key', { p_key: '' }, 'API key OpenRouter dihapus.')
}
async function saveModel() {
  await aiCall('admin_set_openrouter_model', { p_model: aiModel.value }, 'Model default tersimpan.')
}

// Gemini (Google AI Studio)
const gmKey = ref('')
const gmModel = ref('')
const defaultProvider = ref<'' | 'openrouter' | 'gemini'>('')
async function saveGeminiKey() {
  const k = gmKey.value.trim()
  if (!/^[A-Za-z0-9_.-]{20,300}$/.test(k)) {
    aiMsg.value = { ok: false, text: 'Format API key tidak valid. Salin key dari aistudio.google.com/apikey (biasanya diawali AIza).' }
    return
  }
  await aiCall('admin_set_gemini_key', { p_key: k }, 'API key Gemini tersimpan (terenkripsi).')
  if (aiMsg.value?.ok) {
    gmKey.value = ''
    await loadModels()
  }
}
async function removeGeminiKey() {
  if (!confirm('Hapus API key Gemini?')) return
  await aiCall('admin_set_gemini_key', { p_key: '' }, 'API key Gemini dihapus.')
  gmModels.value = []
}
async function saveAiOptions() {
  await aiCall('admin_set_ai_options', { p_default_provider: defaultProvider.value, p_gemini_model: gmModel.value }, 'Pilihan AI tersimpan.')
}
</script>

<template>
  <div>
    <AdminNav />
    <form class="mx-auto grid max-w-xl gap-4 px-4 py-6" @submit.prevent="save">
      <h1 class="font-display text-3xl text-brand">Pengaturan</h1>
      <div class="card grid gap-4 p-5">
        <h2 class="font-semibold text-brand-900">Bagi hasil reseller</h2>
        <label class="label">Tarif default reseller (%)
          <input v-model.number="form.rate" type="number" min="0" max="90" step="0.5" class="input">
          <span class="text-xs font-normal text-brand-500">Reseller {{ form.rate }}% · Platform {{ 100 - form.rate }}%. Reseller dengan tarif khusus diatur di menu Reseller. Tarif dikunci per pesanan saat dibuat.</span>
        </label>
      </div>
      <div class="card grid gap-4 p-5">
        <h2 class="font-semibold text-brand-900">Pencairan saldo</h2>
        <label class="label">Tanggal pencairan tiap bulan
          <input v-model="form.days" class="input" placeholder="5, 25">
          <span class="text-xs font-normal text-brand-500">Pisahkan dengan koma, tanggal 1–28. Pengajuan dijadwalkan ke tanggal terdekat setelah hari pengajuan.</span>
        </label>
        <label class="label">Minimal pencairan (Rp)
          <input v-model.number="form.min" type="number" min="10000" step="1000" class="input">
        </label>
      </div>
      <div class="card grid gap-4 p-5">
        <h2 class="font-semibold text-brand-900">Pembayaran</h2>
        <label class="label">Batas waktu bayar (jam)
          <input v-model.number="form.expiry" type="number" min="1" max="72" class="input">
        </label>
      </div>
      <p v-if="msg" class="text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'">{{ msg.text }}</p>
      <button class="btn-primary">Simpan</button>
    </form>

    <section class="mx-auto grid max-w-xl gap-4 px-4 pb-4">
      <form class="card grid gap-4 p-5" @submit.prevent="saveSeo">
        <div>
          <h2 class="font-semibold text-brand-900">Mesin pencari (SEO)</h2>
          <p class="mt-1 text-xs text-brand-500">
            Daftarkan situs di
            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" class="underline">Bing Webmaster Tools</a>
            dan <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" class="underline">Google Search Console</a>,
            pilih verifikasi lewat <b>meta tag</b>, lalu tempel kodenya di sini (boleh seluruh tag). Setelah terverifikasi, kirim sitemap
            <code class="text-brand-700">/sitemap.xml</code> dari dashboard masing-masing.
          </p>
        </div>
        <label class="label">Kode verifikasi Bing (msvalidate.01)
          <input v-model="seo.bing" class="input font-mono" placeholder="mis. 1A2B3C4D5E6F…" autocomplete="off" spellcheck="false">
        </label>
        <label class="label">Kode verifikasi Google (google-site-verification)
          <input v-model="seo.google" class="input font-mono" placeholder="mis. abcDEF123…" autocomplete="off" spellcheck="false">
        </label>
        <button class="btn-primary justify-self-start" :disabled="seoBusy">Simpan kode verifikasi</button>
        <div class="grid gap-2 border-t border-brand-100 pt-4">
          <p class="text-xs text-brand-500">
            <b>IndexNow</b> memberi tahu Bing (juga Yandex, Seznam, Naver) semua halaman publik sekaligus: katalog, tema, dan artikel blog.
            Tema yang ditayangkan dan artikel yang diterbitkan dikirim otomatis; tombol ini untuk dorongan awal atau setelah perubahan besar.
          </p>
          <button type="button" class="btn-ghost justify-self-start" :disabled="seoBusy" @click="pingIndexNow">
            {{ pinging ? 'Mengirim…' : 'Kirim semua URL ke Bing (IndexNow)' }}
          </button>
        </div>
        <p v-if="seoMsg" class="text-sm" :class="seoMsg.ok ? 'text-green-700' : 'text-red-600'">{{ seoMsg.text }}</p>
      </form>
    </section>

    <section class="mx-auto grid max-w-xl gap-4 px-4 pb-10">
      <p v-if="aiMsg" class="rounded-xl px-4 py-3 text-sm" :class="aiMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">{{ aiMsg.text }}</p>
      <div class="card grid gap-4 p-5">
        <div>
          <h2 class="font-semibold text-brand-900">Penyedia AI</h2>
          <p class="mt-1 text-xs text-brand-500">Dipakai generator tema dan generator artikel blog (termasuk artikel harian otomatis).</p>
        </div>
        <form class="grid gap-2" @submit.prevent="saveAiOptions">
          <label class="label">Penyedia utama
            <select v-model="defaultProvider" class="input">
              <option value="">Otomatis (Gemini bila key terisi, lalu OpenRouter)</option>
              <option value="gemini">Gemini · Google AI Studio</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </label>
          <label class="label">Model Gemini
            <select v-model="gmModel" class="input">
              <option value="">Otomatis (Flash terbaru)</option>
              <option v-for="m in gmModels" :key="m.id" :value="m.id">{{ m.name }}</option>
              <option v-if="gmModel && !gmModels.some(m => m.id === gmModel)" :value="gmModel">{{ gmModel }}</option>
            </select>
            <span v-if="!ai?.gemini_set" class="text-xs font-normal text-brand-500">Daftar model muncul setelah API key Gemini diisi.</span>
            <span v-else-if="gmModelsError" class="text-xs font-normal text-red-600">{{ gmModelsError }}</span>
          </label>
          <button class="btn-ghost justify-self-start" :disabled="aiBusy || (defaultProvider === (ai?.default_provider ?? '') && gmModel === (ai?.gemini_model ?? ''))">Simpan pilihan</button>
        </form>
      </div>

      <div class="card grid gap-4 p-5">
        <div>
          <h2 class="font-semibold text-brand-900">Google Gemini (AI Studio)</h2>
          <p class="mt-1 text-xs text-brand-500">
            Buat API key gratis di
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" class="underline">aistudio.google.com/apikey</a>.
            Tier gratis punya batas permintaan per menit/hari, cukup untuk generate tema dan 1 artikel per hari.
          </p>
        </div>
        <div v-if="ai" class="flex flex-wrap items-center gap-2 text-sm">
          <span class="chip" :class="ai.gemini_set ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
            {{ ai.gemini_set ? 'Terpasang' : 'Belum diisi' }}
          </span>
          <code v-if="ai.gemini_hint" class="text-brand-700">{{ ai.gemini_hint }}</code>
          <button v-if="ai.gemini_set" type="button" class="ml-auto text-xs text-red-600 underline" :disabled="aiBusy" @click="removeGeminiKey">Hapus key</button>
        </div>
        <form class="grid gap-2" @submit.prevent="saveGeminiKey">
          <label class="label">{{ ai?.gemini_set ? 'Ganti API key' : 'API key' }}
            <input v-model="gmKey" type="text" name="gemini-api-key" class="input font-mono [-webkit-text-security:disc]" placeholder="AIza…" autocomplete="off" autocapitalize="off" spellcheck="false" data-1p-ignore data-lpignore="true">
            <span class="text-xs font-normal text-brand-500">Disimpan terenkripsi di Supabase Vault; hanya server yang membacanya.</span>
          </label>
          <button class="btn-primary justify-self-start" :disabled="aiBusy || !gmKey.trim()">Simpan key</button>
        </form>
      </div>

      <div class="card grid gap-4 p-5">
        <div>
          <h2 class="font-semibold text-brand-900">OpenRouter</h2>
          <p class="mt-1 text-xs text-brand-500">
            Alternatif gratis. Buat key di
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" class="underline">openrouter.ai/keys</a>;
            hanya model gratis (<code>:free</code>) yang dipakai, jadi tidak ada tagihan.
          </p>
        </div>
        <div v-if="ai" class="flex flex-wrap items-center gap-2 text-sm">
          <span class="chip" :class="ai.openrouter_set ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
            {{ ai.openrouter_set ? 'Terpasang' : 'Belum diisi' }}
          </span>
          <code v-if="ai.openrouter_hint" class="text-brand-700">{{ ai.openrouter_hint }}</code>
          <button v-if="ai.openrouter_set" type="button" class="ml-auto text-xs text-red-600 underline" :disabled="aiBusy" @click="removeKey">Hapus key</button>
        </div>
        <form class="grid gap-2" @submit.prevent="saveKey">
          <label class="label">{{ ai?.openrouter_set ? 'Ganti API key' : 'API key' }}
            <input v-model="aiKey" type="text" name="openrouter-api-key" class="input font-mono [-webkit-text-security:disc]" placeholder="sk-or-v1-…" autocomplete="off" autocapitalize="off" spellcheck="false" data-1p-ignore data-lpignore="true">
            <span class="text-xs font-normal text-brand-500">Disimpan terenkripsi di Supabase Vault dan tidak bisa dilihat lagi dari browser; hanya server yang membacanya saat generate.</span>
          </label>
          <button class="btn-primary justify-self-start" :disabled="aiBusy || !aiKey.trim()">Simpan key</button>
        </form>
        <form class="grid gap-2" @submit.prevent="saveModel">
          <label class="label">Model default
            <select v-model="aiModel" class="input">
              <option value="">Otomatis (router model gratis OpenRouter)</option>
              <option v-for="m in aiModels.filter(m => m.id !== 'openrouter/free')" :key="m.id" :value="m.id">
                {{ m.name }}{{ m.structured ? ' · JSON terstruktur' : '' }}
              </option>
              <option v-if="aiModel && !aiModels.some(m => m.id === aiModel)" :value="aiModel">{{ aiModel }}</option>
            </select>
          </label>
          <button class="btn-ghost justify-self-start" :disabled="aiBusy || aiModel === (ai?.openrouter_model ?? '')">Simpan model</button>
        </form>
      </div>
    </section>
  </div>
</template>
