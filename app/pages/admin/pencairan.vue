<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Pencairan' })

interface Payout {
  id: string, amount: number, status: string, scheduled_for: string, requested_at: string, processed_at: string | null,
  bank_name: string, bank_account_number: string, bank_account_holder: string, transfer_reference: string | null, admin_note: string | null,
  reseller: { business_name: string, code: string, whatsapp: string } | null
}
const supabase = useSupabaseClient()
const tab = ref<'requested' | 'history'>('requested')
const { data: payouts, refresh } = await useAsyncData('admin-payouts', async () => {
  const { data } = await supabase.from('payouts')
    .select('*, reseller:resellers(business_name, code, whatsapp)')
    .order('scheduled_for', { ascending: true }).order('requested_at', { ascending: true }).limit(300)
  return (data ?? []) as unknown as Payout[]
})
const today = new Date().toISOString().slice(0, 10)
const groups = computed(() => {
  const m = new Map<string, Payout[]>()
  for (const p of (payouts.value ?? []).filter(p => p.status === 'requested')) m.set(p.scheduled_for, [...(m.get(p.scheduled_for) ?? []), p])
  return [...m.entries()]
})
const history = computed(() => (payouts.value ?? []).filter(p => p.status !== 'requested').reverse())

const acting = ref<{ p: Payout, action: 'paid' | 'rejected' } | null>(null)
const form = reactive({ reference: '', note: '' })
const err = ref('')
function open(p: Payout, action: 'paid' | 'rejected') {
  acting.value = { p, action }
  form.reference = ''
  form.note = ''
  err.value = ''
}
async function submit() {
  if (!acting.value) return
  try {
    // Lewat server agar reseller & admin menerima email hasil pemrosesan
    await $fetch(`/api/admin/payouts/${acting.value.p.id}/process`, {
      method: 'POST',
      body: { action: acting.value.action, reference: form.reference || null, note: form.note || null },
    })
  }
  catch (e) {
    const error = apiError(e)
    err.value = error.message.includes('REFERENCE_REQUIRED') ? 'Isi nomor/bukti referensi transfer.' : friendlyError(error)
    return
  }
  acting.value = null
  await refresh()
}
function exportCsv(date: string, list: Payout[]) {
  const rows = [['Reseller', 'Kode', 'Bank', 'No Rekening', 'Atas Nama', 'Nominal'], ...list.map(p => [p.reseller?.business_name ?? '', p.reseller?.code ?? '', p.bank_name, p.bank_account_number, p.bank_account_holder, p.amount])]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv' }))
  a.download = `pencairan-${date}.csv`
  a.click()
}
const STATUS: Record<string, string> = { paid: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-600', cancelled: 'bg-gray-100 text-gray-500' }
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-5xl px-4 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-3xl text-brand">Pencairan Saldo Reseller</h1>
        <div class="grid grid-cols-2 rounded-full bg-white p-1 text-xs font-semibold ring-1 ring-brand-100">
          <button class="rounded-full px-4 py-1.5" :class="tab === 'requested' ? 'bg-brand text-white' : 'text-brand-600'" @click="tab = 'requested'">Antrian</button>
          <button class="rounded-full px-4 py-1.5" :class="tab === 'history' ? 'bg-brand text-white' : 'text-brand-600'" @click="tab = 'history'">Riwayat</button>
        </div>
      </div>
      <p class="mt-1 text-sm text-brand-600">Transfer manual ke rekening reseller, lalu tandai "Sudah ditransfer" dengan nomor referensi. Saldo sudah dikunci sejak pengajuan.</p>

      <template v-if="tab === 'requested'">
        <div v-for="[date, list] in groups" :key="date" class="card mt-4 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-brand-50 p-4">
            <div>
              <p class="font-semibold text-brand-900">Jadwal {{ tanggal(date) }}
                <span v-if="date <= today" class="chip ml-1 bg-clay-100 text-clay-700">Jatuh tempo</span>
              </p>
              <p class="text-xs text-brand-500">{{ list.length }} pengajuan · total {{ rupiah(list.reduce((s, p) => s + p.amount, 0)) }}</p>
            </div>
            <button class="btn-ghost btn-sm" @click="exportCsv(date, list)">Export CSV</button>
          </div>
          <ul class="divide-y divide-brand-50">
            <li v-for="p in list" :key="p.id" class="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p class="font-medium text-brand-900">{{ p.reseller?.business_name }} <span class="font-mono text-xs text-brand-500">{{ p.reseller?.code }}</span></p>
                <p class="text-sm text-brand-700">{{ p.bank_name }} · <span class="font-mono">{{ p.bank_account_number }}</span> · a.n. {{ p.bank_account_holder }}</p>
                <p class="text-xs text-brand-500">Diajukan {{ tanggal(p.requested_at, true) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <b class="text-lg text-brand">{{ rupiah(p.amount) }}</b>
                <button class="btn-primary btn-sm" @click="open(p, 'paid')">Sudah ditransfer</button>
                <button class="btn-sm btn text-red-600" @click="open(p, 'rejected')">Tolak</button>
              </div>
            </li>
          </ul>
        </div>
        <p v-if="!groups.length" class="card mt-4 p-8 text-center text-sm text-brand-500">Tidak ada pengajuan pencairan.</p>
      </template>

      <div v-else class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-[640px] text-sm">
          <thead><tr class="border-b border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500"><th class="px-4 py-2">Reseller</th><th class="px-4 py-2">Nominal</th><th class="px-4 py-2">Status</th><th class="px-4 py-2">Referensi / catatan</th><th class="px-4 py-2">Diproses</th></tr></thead>
          <tbody>
            <tr v-for="p in history" :key="p.id" class="border-b border-brand-50 last:border-0">
              <td class="px-4 py-2.5">{{ p.reseller?.business_name }}</td>
              <td class="px-4 py-2.5 font-medium">{{ rupiah(p.amount) }}</td>
              <td class="px-4 py-2.5"><span class="chip" :class="STATUS[p.status]">{{ p.status }}</span></td>
              <td class="px-4 py-2.5 text-xs">{{ p.transfer_reference || '' }} {{ p.admin_note || '' }}</td>
              <td class="px-4 py-2.5 text-xs">{{ tanggal(p.processed_at, true) }}</td>
            </tr>
            <tr v-if="!history.length"><td colspan="5" class="p-8 text-center text-brand-500">Belum ada riwayat.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="acting" class="fixed inset-0 z-50 grid place-items-center bg-brand-900/40 p-4" @click.self="acting = null">
      <form class="card grid w-full max-w-md gap-3 p-5" @submit.prevent="submit">
        <h2 class="font-display text-2xl text-brand">{{ acting.action === 'paid' ? 'Konfirmasi transfer' : 'Tolak pencairan' }}</h2>
        <p class="text-sm text-brand-700">{{ acting.p.reseller?.business_name }} · <b>{{ rupiah(acting.p.amount) }}</b><br>{{ acting.p.bank_name }} {{ acting.p.bank_account_number }} a.n. {{ acting.p.bank_account_holder }}</p>
        <label v-if="acting.action === 'paid'" class="label">Nomor referensi transfer
          <input v-model="form.reference" class="input" required>
        </label>
        <label class="label">{{ acting.action === 'paid' ? 'Catatan (opsional)' : 'Alasan penolakan' }}
          <input v-model="form.note" class="input" maxlength="200">
        </label>
        <p v-if="acting.action === 'rejected'" class="text-xs text-brand-500">Saldo otomatis dikembalikan ke reseller.</p>
        <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn-ghost" @click="acting = null">Batal</button>
          <button class="btn-primary">{{ acting.action === 'paid' ? 'Tandai Ditransfer' : 'Tolak' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
