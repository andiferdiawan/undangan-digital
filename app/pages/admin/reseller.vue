<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Reseller' })

interface Row {
  id: string, code: string, business_name: string, email: string, whatsapp: string, status: string,
  commission_rate: number | null, effective_rate: number, bank_name: string | null, bank_account_number: string | null, bank_account_holder: string | null,
  sales_count: number, sales_amount: number, commission_total: number, balance: number, pending_payout: number, paid_out: number,
  created_at: string, approved_at: string | null, admin_note: string | null
}
const supabase = useSupabaseClient()
const { data: rows, refresh } = await useAsyncData('admin-resellers', async () => {
  const { data, error } = await supabase.rpc('admin_resellers')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as Row[]
})

const filter = ref<'semua' | 'pending' | 'active' | 'suspended'>('semua')
const shown = computed(() => (rows.value ?? []).filter(r => filter.value === 'semua' || r.status === filter.value))

const editing = ref<Row | null>(null)
const form = reactive({ status: 'active', custom: false, rate: 30, note: '' })
function edit(r: Row) {
  editing.value = r
  Object.assign(form, { status: r.status === 'pending' ? 'active' : r.status, custom: r.commission_rate !== null, rate: Number(r.commission_rate ?? r.effective_rate), note: r.admin_note ?? '' })
}
const busy = ref(false)
const err = ref('')
const notice = ref('')
async function save() {
  if (!editing.value) return
  err.value = ''
  busy.value = true
  const name = editing.value.business_name
  try {
    const res = await $fetch<{ ok: boolean, email: { sent: boolean, reason?: string } | null }>(`/api/admin/resellers/${editing.value.id}/review`, {
      method: 'POST',
      body: { status: form.status, commission_rate: form.custom ? form.rate : null, use_default_rate: !form.custom, note: form.note || null },
    })
    notice.value = res.email?.sent
      ? `${name} disetujui. Email pemberitahuan terkirim.`
      : res.email ? `${name} disetujui, tetapi email tidak terkirim: ${res.email.reason}` : ''
  }
  catch (e) {
    busy.value = false
    err.value = friendlyError({ message: (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? (e as Error).message })
    return
  }
  busy.value = false
  editing.value = null
  await refresh()
}
// ---------- Tambah reseller langsung (tanpa formulir pendaftaran) ----------
const adding = ref(false)
const addErr = ref('')
const blank = () => ({ email: '', password: '', business_name: '', whatsapp: '', code: '', bank_name: '', account_number: '', account_holder: '', custom: false, rate: 30, note: '', send_email: true })
const add = reactive(blank())
function openAdd() {
  Object.assign(add, blank())
  addErr.value = ''
  adding.value = true
}
async function create() {
  addErr.value = ''
  busy.value = true
  try {
    const res = await $fetch<{ code: string, account_created: boolean, email: { sent: boolean, reason?: string } | null }>('/api/admin/resellers', {
      method: 'POST',
      body: {
        email: add.email, password: add.password || undefined, business_name: add.business_name, whatsapp: add.whatsapp,
        code: add.code || undefined, bank_name: add.bank_name || undefined, account_number: add.account_number || undefined,
        account_holder: add.account_holder || undefined, commission_rate: add.custom ? add.rate : null,
        note: add.note || undefined, send_email: add.send_email,
      },
    })
    notice.value = [
      `${add.business_name} ditambahkan sebagai reseller aktif (kode ${res.code}).`,
      res.account_created ? `Akun baru dibuat untuk ${add.email}; pemilik perlu konfirmasi email lalu masuk dengan kata sandi sementara.` : '',
      res.email ? (res.email.sent ? 'Email pemberitahuan terkirim.' : `Email tidak terkirim: ${res.email.reason}`) : '',
    ].filter(Boolean).join(' ')
    adding.value = false
    await refresh()
  }
  catch (e) {
    addErr.value = friendlyError({ message: (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? (e as Error).message })
  }
  finally {
    busy.value = false
  }
}

const STATUS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', active: 'bg-green-50 text-green-700', suspended: 'bg-gray-100 text-gray-600', rejected: 'bg-red-50 text-red-600' }
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <p v-if="notice" class="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{{ notice }}</p>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h1 class="font-display text-3xl text-brand">Reseller</h1>
          <button class="btn-primary btn-sm" @click="openAdd">+ Tambah Reseller</button>
        </div>
        <div class="flex gap-1 text-xs font-semibold">
          <button v-for="f in (['semua', 'pending', 'active', 'suspended'] as const)" :key="f" class="rounded-full px-3 py-1.5" :class="filter === f ? 'bg-brand text-white' : 'bg-white text-brand-600 ring-1 ring-brand-100'" @click="filter = f">
            {{ { semua: 'Semua', pending: 'Menunggu', active: 'Aktif', suspended: 'Nonaktif' }[f] }}
            <span v-if="f === 'pending'">({{ rows?.filter(r => r.status === 'pending').length }})</span>
          </button>
        </div>
      </div>

      <div class="card mt-5 overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead>
            <tr class="border-b border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500">
              <th class="px-4 py-2 font-medium">Reseller</th>
              <th class="px-4 py-2 font-medium">Status</th>
              <th class="px-4 py-2 font-medium">Tarif</th>
              <th class="px-4 py-2 text-right font-medium">Penjualan</th>
              <th class="px-4 py-2 text-right font-medium">Komisi</th>
              <th class="px-4 py-2 text-right font-medium">Saldo</th>
              <th class="px-4 py-2 text-right font-medium">Sudah cair</th>
              <th class="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in shown" :key="r.id" class="border-b border-brand-50 last:border-0">
              <td class="px-4 py-3">
                <p class="font-medium text-brand-900">{{ r.business_name }} <span class="font-mono text-xs text-brand-500">{{ r.code }}</span></p>
                <p class="text-xs text-brand-500">{{ r.email }} · {{ r.whatsapp }}</p>
                <p v-if="r.bank_account_number" class="text-xs text-brand-400">{{ r.bank_name }} {{ r.bank_account_number }} a.n. {{ r.bank_account_holder }}</p>
                <p v-else class="text-xs text-amber-700">Rekening belum diisi</p>
              </td>
              <td class="px-4 py-3"><span class="chip" :class="STATUS[r.status]">{{ r.status }}</span></td>
              <td class="px-4 py-3">{{ Number(r.effective_rate) }}% <span v-if="r.commission_rate !== null" class="chip bg-clay-50 text-clay-700">khusus</span></td>
              <td class="px-4 py-3 text-right">{{ r.sales_count }}<br><span class="text-xs text-brand-500">{{ rupiah(r.sales_amount) }}</span></td>
              <td class="px-4 py-3 text-right">{{ rupiah(r.commission_total) }}</td>
              <td class="px-4 py-3 text-right font-medium">{{ rupiah(r.balance) }}<br><span v-if="r.pending_payout" class="text-xs text-amber-700">+{{ rupiah(r.pending_payout) }} diajukan</span></td>
              <td class="px-4 py-3 text-right">{{ rupiah(r.paid_out) }}</td>
              <td class="px-4 py-3 text-right"><button class="text-xs font-semibold text-brand" @click="edit(r)">{{ r.status === 'pending' ? 'Tinjau' : 'Atur' }}</button></td>
            </tr>
            <tr v-if="!shown.length"><td colspan="8" class="p-8 text-center text-brand-500">Belum ada reseller.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="adding" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-900/40 p-4" @click.self="adding = false">
      <form class="card my-6 grid w-full max-w-lg gap-3 p-5" @submit.prevent="create">
        <div>
          <h2 class="font-display text-2xl text-brand">Tambah Reseller</h2>
          <p class="mt-1 text-xs text-brand-500">Langsung aktif tanpa formulir pendaftaran. Jika email sudah punya akun, akun itu yang dijadikan reseller.</p>
        </div>
        <label class="label">Email akun
          <input v-model="add.email" type="email" class="input" required autocomplete="off" placeholder="nama@email.com">
        </label>
        <label class="label">Kata sandi sementara <span class="font-normal text-brand-500">(hanya jika email belum punya akun)</span>
          <input v-model="add.password" type="text" minlength="8" class="input" autocomplete="off" placeholder="min. 8 karakter">
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="label">Nama usaha
            <input v-model="add.business_name" class="input" required maxlength="60">
          </label>
          <label class="label">WhatsApp
            <input v-model="add.whatsapp" inputmode="tel" class="input" required placeholder="08…">
          </label>
        </div>
        <label class="label">Kode reseller <span class="font-normal text-brand-500">(opsional, otomatis dari nama usaha)</span>
          <input v-model="add.code" class="input font-mono uppercase" maxlength="12" placeholder="4–12 huruf/angka">
        </label>
        <details class="rounded-xl bg-brand-50 p-3">
          <summary class="cursor-pointer text-sm font-semibold text-brand-800">Data rekening (opsional — reseller bisa melengkapinya sendiri)</summary>
          <div class="mt-3 grid gap-3">
            <label class="label">Bank <input v-model="add.bank_name" class="input" maxlength="40"></label>
            <label class="label">No. rekening <input v-model="add.account_number" inputmode="numeric" class="input" maxlength="30"></label>
            <label class="label">Atas nama <input v-model="add.account_holder" class="input" maxlength="60"></label>
          </div>
        </details>
        <label class="flex items-center gap-2 text-sm font-medium text-brand-800">
          <input v-model="add.custom" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Tarif khusus
        </label>
        <label v-if="add.custom" class="label">Tarif reseller (%)
          <input v-model.number="add.rate" type="number" min="0" max="90" step="0.5" class="input">
        </label>
        <label class="label">Catatan admin <input v-model="add.note" class="input" maxlength="200"></label>
        <label class="flex items-center gap-2 text-sm font-medium text-brand-800">
          <input v-model="add.send_email" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Kirim email pemberitahuan ke reseller
        </label>
        <p v-if="addErr" class="text-sm text-red-600">{{ addErr }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn-ghost" @click="adding = false">Batal</button>
          <button class="btn-primary" :disabled="busy">{{ busy ? 'Menyimpan…' : 'Tambah' }}</button>
        </div>
      </form>
    </div>

    <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-brand-900/40 p-4" @click.self="editing = null">
      <form class="card grid w-full max-w-md gap-3 p-5" @submit.prevent="save">
        <h2 class="font-display text-2xl text-brand">{{ editing.business_name }}</h2>
        <label class="label">Status
          <select v-model="form.status" class="input">
            <option value="active">Aktif (setujui)</option>
            <option value="suspended">Nonaktifkan</option>
            <option value="rejected">Tolak</option>
            <option value="pending">Menunggu</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm font-medium text-brand-800">
          <input v-model="form.custom" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Tarif khusus untuk reseller ini
        </label>
        <label v-if="form.custom" class="label">Tarif reseller (%)
          <input v-model.number="form.rate" type="number" min="0" max="90" step="0.5" class="input">
          <span class="text-xs font-normal text-brand-500">Berlaku untuk pesanan baru. Pesanan lama tetap memakai tarif saat dibuat.</span>
        </label>
        <label class="label">Catatan admin
          <input v-model="form.note" class="input" maxlength="200">
        </label>
        <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn-ghost" @click="editing = null">Batal</button>
          <button class="btn-primary" :disabled="busy">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</template>
