<script setup lang="ts">
import type { Package, TokenRow } from '#shared/types/models'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Token' })

const supabase = useSupabaseClient()
const { data: refs } = await useAsyncData('admin-token-refs', async () => {
  const [themes, pkgs] = await Promise.all([
    supabase.from('themes').select('id, code, name').eq('status', 'published').order('code'),
    supabase.from('packages').select('*').eq('is_active', true).order('sort'),
  ])
  return { themes: (themes.data ?? []) as { id: string, code: string, name: string }[], packages: (pkgs.data ?? []) as Package[] }
})

const { data: tokens, refresh } = await useAsyncData('admin-tokens', async () => {
  const { data } = await supabase
    .from('access_tokens')
    .select('*, theme:themes(code, name), package:packages(name)')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as (TokenRow & { theme: { code: string, name: string }, package: { name: string } })[]
})

const form = reactive({ theme_id: '', package_id: 0, note: '', days: 30 })
watch(refs, (r) => {
  if (r && !form.theme_id) form.theme_id = r.themes[0]?.id ?? ''
  if (r && !form.package_id) form.package_id = r.packages[0]?.id ?? 0
}, { immediate: true })

const busy = ref(false)
const error = ref('')
const created = ref<(TokenRow & { themeName: string, packageName: string }) | null>(null)

async function generate() {
  error.value = ''
  busy.value = true
  const { data, error: err } = await supabase.rpc('admin_generate_token', {
    p_theme_id: form.theme_id, p_package_id: form.package_id,
    p_customer_note: form.note || null, p_valid_days: form.days,
  })
  busy.value = false
  if (err) {
    error.value = friendlyError(err)
    return
  }
  const row = data as TokenRow
  created.value = {
    ...row,
    themeName: refs.value?.themes.find(t => t.id === row.theme_id)?.name ?? '',
    packageName: refs.value?.packages.find(p => p.id === row.package_id)?.name ?? '',
  }
  form.note = ''
  await refresh()
}

const origin = computed(() => useRuntimeConfig().public.siteUrl || (import.meta.client ? window.location.origin : ''))
const message = computed(() => created.value
  ? `Assalamu'alaikum, terima kasih atas pembayarannya 🙏

Berikut token undangan digital Anda:
*${created.value.code}*

Tema: ${created.value.themeName}
Paket: ${created.value.packageName} (${created.value.guest_limit} tamu)

Aktifkan di: ${origin.value}/daftar?token=${created.value.code}
${created.value.expires_at ? `Berlaku hingga ${tanggal(created.value.expires_at)}.` : ''}`
  : '')

const copied = ref('')
async function copy(text: string, key: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* diabaikan */ }
  copied.value = key
  setTimeout(() => (copied.value = ''), 1500)
}

function status(t: TokenRow) {
  if (t.redeemed_at) return { label: 'Diaktifkan', cls: 'bg-green-50 text-green-700' }
  if (t.expires_at && new Date(t.expires_at) < new Date()) return { label: 'Kedaluwarsa', cls: 'bg-gray-100 text-gray-600' }
  return { label: 'Aktif', cls: 'bg-clay-50 text-clay-700' }
}

async function remove(t: TokenRow) {
  if (!confirm(`Hapus token ${t.code}?`)) return
  const { error: err } = await supabase.from('access_tokens').delete().eq('id', t.id)
  if (err) alert(friendlyError(err))
  await refresh()
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[380px_1fr]">
      <div class="grid content-start gap-4">
        <form class="card grid gap-4 p-5" @submit.prevent="generate">
          <h1 class="font-display text-2xl text-brand">Generate Token</h1>
          <label class="label">Tema
            <select v-model="form.theme_id" class="input" required>
              <option v-for="t in refs?.themes" :key="t.id" :value="t.id">{{ t.code }} — {{ t.name }}</option>
            </select>
          </label>
          <label class="label">Paket
            <select v-model.number="form.package_id" class="input" required>
              <option v-for="p in refs?.packages" :key="p.id" :value="p.id">{{ p.name }} · {{ rupiah(p.price) }}</option>
            </select>
          </label>
          <label class="label">Catatan pembeli (opsional)
            <input v-model="form.note" class="input" placeholder="Nama / no. WA pembeli" maxlength="120">
          </label>
          <label class="label">Masa berlaku token (hari)
            <input v-model.number="form.days" type="number" min="0" max="365" class="input">
            <span class="text-xs font-normal text-brand-500">0 = tanpa batas waktu</span>
          </label>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <button class="btn-primary" :disabled="busy || !form.theme_id">{{ busy ? 'Membuat…' : 'Generate Token' }}</button>
        </form>

        <div v-if="created" class="card grid gap-3 p-5 ring-2 ring-clay">
          <p class="text-xs font-semibold uppercase tracking-wider text-clay-600">Token baru</p>
          <p class="text-center font-mono text-4xl font-bold tracking-[0.3em] text-brand">{{ created.code }}</p>
          <p class="text-center text-xs text-brand-500">{{ created.themeName }} · {{ created.packageName }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn-ghost btn-sm" @click="copy(created.code, 'code')">{{ copied === 'code' ? '✓ Disalin' : 'Salin token' }}</button>
            <button class="btn-accent btn-sm" @click="copy(message, 'msg')">{{ copied === 'msg' ? '✓ Disalin' : 'Salin pesan WA' }}</button>
          </div>
          <pre class="whitespace-pre-wrap rounded-xl bg-brand-50 p-3 text-xs text-brand-800">{{ message }}</pre>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="p-4">
          <h2 class="font-semibold text-brand-900">Token terbaru</h2>
        </div>
        <ul class="divide-y divide-brand-50">
          <li v-for="t in tokens" :key="t.id" class="flex items-center gap-3 px-4 py-3">
            <span class="font-mono text-lg font-bold tracking-widest text-brand">{{ t.code }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-brand-900">{{ t.theme?.name }} · {{ t.package?.name }}</p>
              <p class="truncate text-xs text-brand-500">{{ tanggal(t.created_at, true) }}<span v-if="t.customer_note"> · {{ t.customer_note }}</span></p>
            </div>
            <span class="chip" :class="status(t).cls">{{ status(t).label }}</span>
            <button v-if="!t.redeemed_at" class="text-xs text-red-600" @click="remove(t)">Hapus</button>
          </li>
          <li v-if="!tokens?.length" class="p-8 text-center text-sm text-brand-500">Belum ada token.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
