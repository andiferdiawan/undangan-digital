<script setup lang="ts">
useSeoMeta({ title: 'Dashboard Reseller', robots: 'noindex' })

interface Summary {
  reseller: { id: string, code: string, business_name: string, whatsapp: string, bank_name: string, bank_account_number: string, bank_account_holder: string, status: string }
  effective_rate: number
  balance: number
  pending_payout: number
  paid_out: number
  commission_total: number
  sales_count: number
  sales_amount: number
  min_payout: number
  payout_days: number[]
  next_payout_date: string
}
interface OrderRow {
  id: string, merchant_ref: string, access_key: string, status: string, customer_name: string, customer_phone: string,
  amount: number, reseller_share: number, commission_rate: number, created_at: string, paid_at: string | null,
  theme: { name: string } | null, package: { name: string } | null, token: { code: string, redeemed_at: string | null } | null
}
interface PayoutRow { id: string, amount: number, status: string, scheduled_for: string, requested_at: string, transfer_reference: string | null, admin_note: string | null }

const supabase = useSupabaseClient()
const { data: summary, refresh: refreshSummary } = await useAsyncData('reseller-summary', async () => {
  const { data } = await supabase.rpc('reseller_summary')
  return data as Summary | null
})
const active = computed(() => summary.value?.reseller.status === 'active')

const { data: orders, refresh: refreshOrders } = await useAsyncData('reseller-orders', async () => {
  const { data } = await supabase.from('orders')
    .select('id, merchant_ref, access_key, status, customer_name, customer_phone, amount, reseller_share, commission_rate, created_at, paid_at, theme:themes(name), package:packages(name), token:access_tokens!orders_token_id_fkey(code, redeemed_at)')
    .order('created_at', { ascending: false }).limit(100)
  return (data ?? []) as unknown as OrderRow[]
})
const { data: payouts, refresh: refreshPayouts } = await useAsyncData('reseller-payouts', async () => {
  const { data } = await supabase.from('payouts').select('*').order('requested_at', { ascending: false }).limit(50)
  return (data ?? []) as PayoutRow[]
})
const { data: catalog } = await useCatalog()

const origin = computed(() => useRuntimeConfig().public.siteUrl || (import.meta.client ? window.location.origin : ''))
const refLink = computed(() => `${origin.value}/r/${summary.value?.reseller.code ?? ''}`)
const orderLink = (o: OrderRow) => `${origin.value}/pesanan/${o.id}?k=${o.access_key}`

const copied = ref('')
async function copy(text: string, k: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* diabaikan */ }
  copied.value = k
  setTimeout(() => (copied.value = ''), 1500)
}

// ---------- Buat pesanan untuk pelanggan ----------
const newOrder = reactive({ theme_id: '', package_id: 0, name: '', email: '', phone: '' })
const method = ref('')
watch(catalog, (c) => {
  if (!c) return
  newOrder.theme_id ||= c.themes[0]?.id ?? ''
  newOrder.package_id ||= c.packages[1]?.id ?? c.packages[0]?.id ?? 0
}, { immediate: true })
const selectedPkg = computed(() => catalog.value?.packages.find(p => p.id === newOrder.package_id))
const creating = ref(false)
const createError = ref('')
const created = ref<{ url: string, name: string, phone: string } | null>(null)

async function createOrder() {
  createError.value = ''
  creating.value = true
  try {
    const r = await $fetch<{ url: string }>('/api/checkout', {
      method: 'POST',
      body: {
        theme_id: newOrder.theme_id, package_id: newOrder.package_id, method: method.value,
        customer_name: newOrder.name, customer_email: newOrder.email, customer_phone: newOrder.phone, as_reseller: true,
      },
    })
    created.value = { url: r.url, name: newOrder.name, phone: newOrder.phone }
    newOrder.name = ''
    newOrder.email = ''
    newOrder.phone = ''
    await refreshOrders()
  }
  catch (e: any) {
    createError.value = e?.data?.statusMessage || e?.message || 'Gagal membuat pesanan'
  }
  finally {
    creating.value = false
  }
}

// ---------- Pencairan ----------
const payoutAmount = ref<number | null>(null)
const payoutBusy = ref(false)
const payoutMsg = ref<{ ok: boolean, text: string } | null>(null)
async function requestPayout() {
  payoutMsg.value = null
  payoutBusy.value = true
  const { error } = await supabase.rpc('request_payout', { p_amount: Math.floor(payoutAmount.value ?? 0) } as never)
  payoutBusy.value = false
  if (error) {
    payoutMsg.value = { ok: false, text: error.hint || friendlyError(error) }
    return
  }
  payoutMsg.value = { ok: true, text: 'Pengajuan pencairan tercatat.' }
  payoutAmount.value = null
  await Promise.all([refreshSummary(), refreshPayouts()])
}
async function cancelPayout(p: PayoutRow) {
  if (!confirm(`Batalkan pengajuan ${rupiah(p.amount)}?`)) return
  const { error } = await supabase.rpc('cancel_payout', { p_payout: p.id } as never)
  if (error) alert(friendlyError(error))
  await Promise.all([refreshSummary(), refreshPayouts()])
}

// ---------- Rekening ----------
const bank = reactive({ business_name: '', whatsapp: '', bank_name: '', bank_account_number: '', bank_account_holder: '' })
watch(summary, (s) => {
  if (!s) return
  Object.assign(bank, {
    business_name: s.reseller.business_name, whatsapp: s.reseller.whatsapp, bank_name: s.reseller.bank_name,
    bank_account_number: s.reseller.bank_account_number, bank_account_holder: s.reseller.bank_account_holder,
  })
}, { immediate: true })
const bankMsg = ref('')
async function saveBank() {
  bankMsg.value = ''
  const { error } = await supabase.from('resellers').update({ ...bank } as never).eq('id', summary.value!.reseller.id)
  bankMsg.value = error ? `Gagal: ${friendlyError(error)}` : 'Tersimpan. Rekening baru dipakai untuk pengajuan berikutnya.'
  await refreshSummary()
}

const STATUS: Record<string, [string, string]> = {
  pending: ['Menyiapkan', 'bg-gray-100 text-gray-600'],
  unpaid: ['Menunggu bayar', 'bg-amber-50 text-amber-700'],
  paid: ['Lunas', 'bg-green-50 text-green-700'],
  expired: ['Kedaluwarsa', 'bg-gray-100 text-gray-500'],
  failed: ['Gagal', 'bg-red-50 text-red-600'],
  refunded: ['Refund', 'bg-red-50 text-red-600'],
  requested: ['Diajukan', 'bg-amber-50 text-amber-700'],
  rejected: ['Ditolak', 'bg-red-50 text-red-600'],
  cancelled: ['Dibatalkan', 'bg-gray-100 text-gray-500'],
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div v-if="!summary" class="card p-8 text-center">
      <p class="font-semibold text-brand-900">Anda belum terdaftar sebagai reseller.</p>
      <NuxtLink to="/reseller" class="btn-primary mt-4">Daftar Reseller</NuxtLink>
    </div>

    <div v-else-if="!active" class="card p-8 text-center">
      <FeatureIcon name="pending" class="mx-auto" />
      <p class="mt-2 font-semibold text-brand-900">Status akun: {{ summary.reseller.status === 'pending' ? 'menunggu persetujuan admin' : summary.reseller.status }}</p>
      <p class="mt-1 text-sm text-brand-600">Fitur penjualan aktif setelah akun disetujui.</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-sm text-brand-500">Reseller · {{ summary.reseller.code }}</p>
          <h1 class="font-display text-3xl text-brand">{{ summary.reseller.business_name }}</h1>
        </div>
        <span class="chip bg-clay-100 text-clay-700">Bagi hasil {{ Number(summary.effective_rate) }}%</span>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="card p-4"><p class="text-xs text-brand-500">Saldo tersedia</p><p class="mt-1 text-2xl font-semibold text-brand-900">{{ rupiah(summary.balance) }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Dalam proses cair</p><p class="mt-1 text-2xl font-semibold text-brand-900">{{ rupiah(summary.pending_payout) }}</p><p class="text-xs text-brand-400">Jadwal {{ tanggal(summary.next_payout_date) }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Total komisi</p><p class="mt-1 text-2xl font-semibold text-brand-900">{{ rupiah(summary.commission_total) }}</p><p class="text-xs text-brand-400">Sudah cair {{ rupiah(summary.paid_out) }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Penjualan lunas</p><p class="mt-1 text-2xl font-semibold text-brand-900">{{ summary.sales_count }}</p><p class="text-xs text-brand-400">{{ rupiah(summary.sales_amount) }}</p></div>
      </div>

      <div class="card mt-4 flex flex-wrap items-center gap-3 p-4">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Link referral Anda</p>
          <p class="truncate font-mono text-sm text-brand-900">{{ refLink }}</p>
          <p class="text-xs text-brand-500">Pembeli lewat link ini tercatat sebagai penjualan Anda (30 hari).</p>
        </div>
        <button class="btn-ghost btn-sm" @click="copy(refLink, 'ref')">{{ copied === 'ref' ? '✓ Disalin' : 'Salin link' }}</button>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <!-- Pesanan -->
        <div class="card overflow-hidden">
          <div class="p-4"><h2 class="font-semibold text-brand-900">Pesanan pelanggan</h2></div>
          <ul class="divide-y divide-brand-50">
            <li v-for="o in orders" :key="o.id" class="grid gap-2 p-4">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-brand-900">{{ o.customer_name }} <span class="font-normal text-brand-500">· {{ o.theme?.name }} · {{ o.package?.name }}</span></p>
                  <p class="text-xs text-brand-500">{{ o.merchant_ref }} · {{ tanggal(o.created_at, true) }}</p>
                </div>
                <span class="chip shrink-0" :class="STATUS[o.status]?.[1]">{{ STATUS[o.status]?.[0] }}</span>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span class="text-brand-700">{{ rupiah(o.amount) }} · komisi <b>{{ rupiah(o.reseller_share) }}</b></span>
                <div class="flex flex-wrap gap-2">
                  <template v-if="o.status === 'paid' && o.token">
                    <span class="rounded-lg bg-brand-50 px-2 py-1 font-mono text-sm font-bold tracking-widest text-brand">{{ o.token.code }}</span>
                    <a :href="waLink(o.customer_phone, `Assalamu'alaikum ${o.customer_name}, pembayaran sudah diterima. Token undangan Anda: ${o.token.code}\nAktifkan di: ${origin}/daftar?token=${o.token.code}`)" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] text-white">Kirim token</a>
                  </template>
                  <template v-else-if="o.status === 'unpaid'">
                    <button class="btn-ghost btn-sm" @click="copy(orderLink(o), o.id)">{{ copied === o.id ? '✓ Disalin' : 'Salin link bayar' }}</button>
                    <a :href="waLink(o.customer_phone, `Assalamu'alaikum ${o.customer_name}, berikut link pembayaran undangan digital Anda:\n${orderLink(o)}`)" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] text-white">WhatsApp</a>
                  </template>
                </div>
              </div>
            </li>
            <li v-if="!orders?.length" class="p-8 text-center text-sm text-brand-500">Belum ada pesanan. Bagikan link referral atau buat pesanan untuk pelanggan.</li>
          </ul>
        </div>

        <div class="grid content-start gap-4">
          <!-- Buat pesanan -->
          <form class="card grid gap-3 p-4" @submit.prevent="createOrder">
            <h2 class="font-semibold text-brand-900">Buat link pembayaran pelanggan</h2>
            <label class="label">Tema
              <select v-model="newOrder.theme_id" class="input">
                <option v-for="t in catalog?.themes" :key="t.id" :value="t.id">{{ t.code }} — {{ t.name }}</option>
              </select>
            </label>
            <label class="label">Paket
              <select v-model.number="newOrder.package_id" class="input">
                <option v-for="p in catalog?.packages" :key="p.id" :value="p.id">{{ p.name }} · {{ rupiah(p.price) }}</option>
              </select>
            </label>
            <input v-model="newOrder.name" class="input" placeholder="Nama pelanggan" required>
            <input v-model="newOrder.email" type="email" class="input" placeholder="Email pelanggan" required>
            <input v-model="newOrder.phone" type="tel" class="input" placeholder="WhatsApp pelanggan (08…)" required>
            <details class="rounded-xl bg-brand-50/60 p-3">
              <summary class="cursor-pointer text-sm font-medium text-brand-800">Metode pembayaran</summary>
              <div class="mt-3"><MethodPicker v-model="method" :amount="selectedPkg?.price ?? 0" /></div>
            </details>
            <p class="text-xs text-brand-500">Komisi Anda: <b>{{ rupiah(Math.floor((selectedPkg?.price ?? 0) * Number(summary.effective_rate) / 100)) }}</b></p>
            <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
            <button class="btn-primary" :disabled="creating || !method">{{ creating ? 'Membuat…' : 'Buat Link Pembayaran' }}</button>
            <div v-if="created" class="grid gap-2 rounded-xl bg-green-50 p-3 text-sm">
              <p class="font-semibold text-green-800">Link pembayaran untuk {{ created.name }} siap:</p>
              <p class="break-all font-mono text-xs text-green-900">{{ created.url }}</p>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-ghost btn-sm" @click="copy(created.url, 'new')">{{ copied === 'new' ? '✓ Disalin' : 'Salin' }}</button>
                <a :href="waLink(created.phone.replace(/^0/, '62'), `Assalamu'alaikum ${created.name}, berikut link pembayaran undangan digital Anda:\n${created.url}`)" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] text-white">WhatsApp</a>
              </div>
            </div>
          </form>

          <!-- Pencairan -->
          <form class="card grid gap-3 p-4" @submit.prevent="requestPayout">
            <h2 class="font-semibold text-brand-900">Cairkan saldo</h2>
            <p class="text-xs text-brand-500">Pencairan diproses tanggal {{ summary.payout_days.join(' & ') }} setiap bulan ke {{ summary.reseller.bank_name }} {{ summary.reseller.bank_account_number }} a.n. {{ summary.reseller.bank_account_holder }}. Minimal {{ rupiah(summary.min_payout) }}.</p>
            <input v-model.number="payoutAmount" type="number" inputmode="numeric" :min="summary.min_payout" :max="summary.balance" step="1000" class="input" placeholder="Nominal">
            <button type="button" class="justify-self-start text-xs font-semibold text-clay-600" @click="payoutAmount = summary.balance">Cairkan semua ({{ rupiah(summary.balance) }})</button>
            <p v-if="payoutMsg" class="text-sm" :class="payoutMsg.ok ? 'text-green-700' : 'text-red-600'">{{ payoutMsg.text }}</p>
            <button class="btn-primary" :disabled="payoutBusy || !payoutAmount || summary.balance < summary.min_payout">{{ payoutBusy ? 'Mengajukan…' : 'Ajukan Pencairan' }}</button>
            <ul v-if="payouts?.length" class="divide-y divide-brand-50 text-sm">
              <li v-for="p in payouts" :key="p.id" class="flex items-center justify-between gap-2 py-2">
                <div>
                  <p class="font-medium text-brand-900">{{ rupiah(p.amount) }}</p>
                  <p class="text-xs text-brand-500">{{ p.status === 'paid' ? `Ditransfer · ${p.transfer_reference}` : `Jadwal ${tanggal(p.scheduled_for)}` }}<span v-if="p.admin_note"> · {{ p.admin_note }}</span></p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="chip" :class="STATUS[p.status]?.[1]">{{ STATUS[p.status]?.[0] }}</span>
                  <button v-if="p.status === 'requested'" type="button" class="text-xs text-red-600" @click="cancelPayout(p)">Batal</button>
                </div>
              </li>
            </ul>
          </form>

          <!-- Profil & rekening -->
          <details class="card p-4">
            <summary class="cursor-pointer font-semibold text-brand-900">Profil & rekening</summary>
            <form class="mt-3 grid gap-3" @submit.prevent="saveBank">
              <label class="label">Nama usaha <input v-model="bank.business_name" class="input"></label>
              <label class="label">WhatsApp (62…) <input v-model="bank.whatsapp" class="input"></label>
              <label class="label">Bank <input v-model="bank.bank_name" class="input"></label>
              <label class="label">No. rekening <input v-model="bank.bank_account_number" inputmode="numeric" class="input"></label>
              <label class="label">Atas nama <input v-model="bank.bank_account_holder" class="input"></label>
              <p v-if="bankMsg" class="text-xs text-brand-600">{{ bankMsg }}</p>
              <button class="btn-ghost btn-sm">Simpan</button>
            </form>
          </details>
        </div>
      </div>
    </template>
  </div>
</template>
