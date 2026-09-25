<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Pengaturan' })
const supabase = useSupabaseClient()

const { data } = await useAsyncData('admin-settings', async () => {
  const { data } = await supabase.from('app_settings').select('*').single()
  return data as unknown as { default_reseller_rate: number, payout_days: number[], min_payout: number, order_expiry_hours: number } | null
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
  </div>
</template>
