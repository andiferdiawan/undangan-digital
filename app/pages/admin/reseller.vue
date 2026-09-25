<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Reseller' })

interface Row {
  id: string, code: string, business_name: string, email: string, whatsapp: string, status: string,
  commission_rate: number | null, effective_rate: number, bank_name: string, bank_account_number: string, bank_account_holder: string,
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
async function save() {
  if (!editing.value) return
  err.value = ''
  busy.value = true
  const { error } = await supabase.rpc('admin_review_reseller', {
    p_reseller: editing.value.id, p_status: form.status,
    p_commission_rate: form.custom ? form.rate : null, p_use_default_rate: !form.custom, p_note: form.note || null,
  } as never)
  busy.value = false
  if (error) {
    err.value = friendlyError(error)
    return
  }
  editing.value = null
  await refresh()
}
const STATUS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700', active: 'bg-green-50 text-green-700', suspended: 'bg-gray-100 text-gray-600', rejected: 'bg-red-50 text-red-600' }
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-3xl text-brand">Reseller</h1>
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
                <p class="text-xs text-brand-400">{{ r.bank_name }} {{ r.bank_account_number }} a.n. {{ r.bank_account_holder }}</p>
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
