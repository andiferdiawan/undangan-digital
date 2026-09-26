<script setup lang="ts">
interface PublicOrder {
  id: string
  merchant_ref: string
  status: 'pending' | 'unpaid' | 'paid' | 'expired' | 'failed' | 'refunded'
  customer_name: string
  amount: number
  fee_customer: number
  total_amount: number | null
  payment_name: string | null
  checkout_url: string | null
  pay_code: string | null
  qr_url: string | null
  instructions: { title: string, steps: string[] }[] | null
  expires_at: string | null
  paid_at: string | null
  theme: { name: string, code: string, slug: string }
  package: { name: string, guest_limit: number }
  reseller: { business_name: string, whatsapp: string } | null
  token: string | null
  token_redeemed: boolean
}

useSeoMeta({ title: 'Status Pesanan', robots: 'noindex' })
const route = useRoute()
const config = useRuntimeConfig()
const supabase = useSupabaseClient()
const id = String(route.params.id)
const key = String(route.query.k ?? '')

const { data: order, refresh } = await useAsyncData(`order-${id}`, async () => {
  const { data } = await supabase.rpc('get_order_public', { p_order_id: id, p_key: key } as never)
  return (data as PublicOrder | null) ?? null
})
if (!order.value) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan', fatal: true })

// Cek status berkala (callback biasanya masuk dalam hitungan detik)
const checking = ref(false)
async function sync() {
  checking.value = true
  try {
    await $fetch(`/api/orders/${id}/sync`, { method: 'POST', body: { key } })
  }
  catch { /* status tetap dibaca dari database */ }
  await refresh()
  checking.value = false
}
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (order.value?.status === 'unpaid') refresh()
    else clearInterval(timer)
  }, 8000)
})
onBeforeUnmount(() => clearInterval(timer))

const copied = ref('')
async function copy(text: string, k: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* diabaikan */ }
  copied.value = k
  setTimeout(() => (copied.value = ''), 1500)
}

const contactWa = computed(() => order.value?.reseller?.whatsapp || String(config.public.adminWhatsapp))
const openInstr = ref(0)
</script>

<template>
  <div v-if="order" class="mx-auto max-w-lg px-4 py-8">
    <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Pesanan {{ order.merchant_ref }}</p>
    <h1 class="mt-1 font-display text-3xl text-brand">
      {{ { pending: 'Menyiapkan pembayaran', unpaid: 'Menunggu pembayaran', paid: 'Pembayaran berhasil', expired: 'Pembayaran kedaluwarsa', failed: 'Pembayaran gagal', refunded: 'Dana dikembalikan' }[order.status] }}
    </h1>

    <div class="card mt-5 grid gap-2 p-5 text-sm">
      <div class="flex justify-between"><span class="text-brand-600">Tema</span><b class="text-brand-900">{{ order.theme.name }}</b></div>
      <div class="flex justify-between"><span class="text-brand-600">Paket</span><b class="text-brand-900">{{ order.package.name }}</b></div>
      <div class="flex justify-between"><span class="text-brand-600">Harga</span><span>{{ rupiah(order.amount) }}</span></div>
      <div v-if="order.fee_customer" class="flex justify-between"><span class="text-brand-600">Biaya pembayaran</span><span>{{ rupiah(order.fee_customer) }}</span></div>
      <div class="flex justify-between border-t border-brand-50 pt-2"><span class="font-semibold">Total</span><b class="text-brand">{{ rupiah(order.total_amount ?? order.amount) }}</b></div>
      <div v-if="order.reseller" class="flex justify-between text-xs text-brand-500"><span>Dilayani oleh</span><span>{{ order.reseller.business_name }}</span></div>
    </div>

    <!-- Menunggu pembayaran -->
    <div v-if="order.status === 'unpaid'" class="mt-4 grid gap-4">
      <div class="card grid gap-3 p-5 text-center">
        <p class="text-sm text-brand-600">Bayar dengan <b>{{ order.payment_name }}</b></p>
        <img v-if="order.qr_url" :src="order.qr_url" alt="Kode QR pembayaran" class="mx-auto w-56 rounded-xl ring-1 ring-brand-100">
        <div v-if="order.pay_code" class="rounded-2xl bg-brand-50 p-4">
          <p class="text-xs text-brand-500">Kode bayar / nomor VA</p>
          <p class="mt-1 font-mono text-2xl font-bold tracking-wider text-brand">{{ order.pay_code }}</p>
          <button class="mt-2 text-xs font-semibold text-clay-600" @click="copy(order.pay_code!, 'code')">{{ copied === 'code' ? '✓ Disalin' : 'Salin kode' }}</button>
          <div class="mt-3 border-t border-brand-100 pt-3">
            <p class="text-xs text-brand-500">Jumlah yang harus dibayar</p>
            <p class="mt-1 font-mono text-2xl font-bold text-brand">{{ rupiah(order.total_amount ?? order.amount) }}</p>
            <button class="mt-2 text-xs font-semibold text-clay-600" @click="copy(String(order.total_amount ?? order.amount), 'amount')">{{ copied === 'amount' ? '✓ Disalin' : 'Salin nominal' }}</button>
            <p class="mt-2 text-[11px] leading-snug text-brand-600">Jika aplikasi bank meminta nominal, masukkan <b>tepat</b> angka di atas (tanpa titik). Nominal berbeda akan ditolak bank.</p>
          </div>
        </div>
        <p v-if="order.expires_at" class="text-xs text-brand-500">Bayar sebelum {{ tanggal(order.expires_at, true) }}</p>
        <a v-if="order.checkout_url" :href="order.checkout_url" class="btn-accent w-full">Buka Halaman Pembayaran</a>
        <button class="btn-ghost w-full" :disabled="checking" @click="sync">{{ checking ? 'Memeriksa…' : 'Saya sudah bayar, cek status' }}</button>
      </div>
      <div v-if="order.instructions?.length" class="card divide-y divide-brand-50">
        <div v-for="(ins, i) in order.instructions" :key="i" class="p-4">
          <button class="flex w-full items-center justify-between text-left text-sm font-semibold text-brand-900" @click="openInstr = openInstr === i ? -1 : i">
            {{ ins.title }} <span class="text-brand-400">{{ openInstr === i ? '−' : '+' }}</span>
          </button>
          <!-- Langkah dari Tripay bisa berisi tag <b>; ditampilkan sebagai teks biasa -->
          <ol v-if="openInstr === i" class="mt-2 list-decimal space-y-1 pl-5 text-sm text-brand-700">
            <li v-for="(s, j) in ins.steps" :key="j">{{ s.replace(/<[^>]*>/g, '') }}</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Lunas: token -->
    <div v-else-if="order.status === 'paid'" class="card mt-4 grid gap-3 p-5 text-center ring-2 ring-brand-300">
      <p class="text-sm text-brand-600">Alhamdulillah, pembayaran diterima. Ini token aktivasi Anda:</p>
      <p class="font-mono text-4xl font-bold tracking-[0.3em] text-brand">{{ order.token }}</p>
      <button class="text-xs font-semibold text-clay-600" @click="copy(order.token!, 'tok')">{{ copied === 'tok' ? '✓ Disalin' : 'Salin token' }}</button>
      <NuxtLink v-if="!order.token_redeemed" :to="`/daftar?token=${order.token}`" class="btn-primary w-full">Aktifkan & Buat Undangan</NuxtLink>
      <NuxtLink v-else to="/masuk" class="btn-primary w-full">Token sudah dipakai · Masuk</NuxtLink>
      <p class="text-xs text-brand-500">Simpan halaman ini. Token juga bisa dibagikan ke pasangan Anda.</p>
    </div>

    <!-- Gagal / kedaluwarsa -->
    <div v-else-if="order.status === 'expired' || order.status === 'failed'" class="card mt-4 grid gap-3 p-5 text-center">
      <p class="text-sm text-brand-600">Pesanan ini tidak dapat dibayar lagi. Silakan buat pesanan baru.</p>
      <NuxtLink :to="`/checkout/${order.theme.slug}`" class="btn-primary w-full">Pesan Ulang</NuxtLink>
    </div>

    <a :href="waLink(contactWa, `Assalamu'alaikum, saya ingin bertanya tentang pesanan ${order.merchant_ref}.`)" target="_blank" rel="noopener" class="mt-4 block text-center text-sm text-brand-600 underline">
      Butuh bantuan? Hubungi via WhatsApp
    </a>
  </div>
</template>
