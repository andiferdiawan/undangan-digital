<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Pesanan' })

interface Order {
  id: string, merchant_ref: string, status: string, channel: string, customer_name: string, customer_email: string, customer_phone: string,
  amount: number, total_amount: number | null, fee_merchant: number, reseller_share: number, platform_share: number, commission_rate: number,
  payment_name: string | null, created_at: string, paid_at: string | null,
  theme: { name: string } | null, package: { name: string } | null, reseller: { business_name: string, code: string } | null,
  token: { code: string, redeemed_at: string | null } | null
}
const supabase = useSupabaseClient()
const status = ref('semua')
const channel = ref('semua')
const { data: orders } = await useAsyncData('admin-orders', async () => {
  let q = supabase.from('orders')
    .select('*, theme:themes(name), package:packages(name), reseller:resellers(business_name, code), token:access_tokens!orders_token_id_fkey(code, redeemed_at)')
    .order('created_at', { ascending: false }).limit(300)
  if (status.value !== 'semua') q = q.eq('status', status.value)
  if (channel.value !== 'semua') q = q.eq('channel', channel.value)
  const { data } = await q
  return (data ?? []) as unknown as Order[]
}, { watch: [status, channel] })

const paid = computed(() => (orders.value ?? []).filter(o => o.status === 'paid'))
const sum = (f: (o: Order) => number) => paid.value.reduce((s, o) => s + f(o), 0)
const STATUS: Record<string, string> = { unpaid: 'bg-amber-50 text-amber-700', paid: 'bg-green-50 text-green-700', expired: 'bg-gray-100 text-gray-500', failed: 'bg-red-50 text-red-600', refunded: 'bg-red-50 text-red-600', pending: 'bg-gray-100 text-gray-500' }
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-3xl text-brand">Pesanan</h1>
        <div class="flex gap-2">
          <select v-model="channel" class="input w-auto py-2 text-sm">
            <option value="semua">Semua kanal</option><option value="platform">Langsung platform</option><option value="reseller">Via reseller</option>
          </select>
          <select v-model="status" class="input w-auto py-2 text-sm">
            <option value="semua">Semua status</option><option value="paid">Lunas</option><option value="unpaid">Menunggu bayar</option><option value="expired">Kedaluwarsa</option><option value="failed">Gagal</option><option value="refunded">Refund</option>
          </select>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="card p-4"><p class="text-xs text-brand-500">Pesanan lunas (filter ini)</p><p class="mt-1 text-2xl font-semibold">{{ paid.length }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Penjualan kotor</p><p class="mt-1 text-2xl font-semibold">{{ rupiah(sum(o => o.amount)) }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Bagian platform</p><p class="mt-1 text-2xl font-semibold">{{ rupiah(sum(o => o.platform_share)) }}</p><p class="text-xs text-brand-400">Biaya gateway {{ rupiah(sum(o => o.fee_merchant)) }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Komisi reseller</p><p class="mt-1 text-2xl font-semibold">{{ rupiah(sum(o => o.reseller_share)) }}</p></div>
      </div>

      <div class="card mt-4 overflow-x-auto">
        <table class="w-full min-w-[980px] text-sm">
          <thead>
            <tr class="border-b border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500">
              <th class="px-4 py-2">Pesanan</th><th class="px-4 py-2">Pelanggan</th><th class="px-4 py-2">Kanal</th>
              <th class="px-4 py-2 text-right">Harga</th><th class="px-4 py-2 text-right">Platform</th><th class="px-4 py-2 text-right">Reseller</th>
              <th class="px-4 py-2">Status</th><th class="px-4 py-2">Token</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-b border-brand-50 last:border-0">
              <td class="px-4 py-2.5"><p class="font-mono text-xs">{{ o.merchant_ref }}</p><p class="text-xs text-brand-500">{{ o.theme?.name }} · {{ o.package?.name }} · {{ tanggal(o.created_at, true) }}</p></td>
              <td class="px-4 py-2.5"><p>{{ o.customer_name }}</p><p class="text-xs text-brand-500">{{ o.customer_phone }} · {{ o.customer_email }}</p></td>
              <td class="px-4 py-2.5">
                <span v-if="o.channel === 'reseller'" class="chip bg-clay-50 text-clay-700">{{ o.reseller?.business_name ?? 'Reseller' }} · {{ Number(o.commission_rate) }}%</span>
                <span v-else class="chip bg-brand-50 text-brand-700">Platform</span>
              </td>
              <td class="px-4 py-2.5 text-right">{{ rupiah(o.amount) }}<p v-if="o.payment_name" class="text-xs text-brand-400">{{ o.payment_name }}</p></td>
              <td class="px-4 py-2.5 text-right">{{ rupiah(o.platform_share) }}</td>
              <td class="px-4 py-2.5 text-right">{{ o.reseller_share ? rupiah(o.reseller_share) : '—' }}</td>
              <td class="px-4 py-2.5"><span class="chip" :class="STATUS[o.status]">{{ o.status }}</span></td>
              <td class="px-4 py-2.5 font-mono text-xs">{{ o.token?.code ?? '—' }}<span v-if="o.token?.redeemed_at" class="ml-1 text-green-700">✓</span></td>
            </tr>
            <tr v-if="!orders?.length"><td colspan="8" class="p-8 text-center text-brand-500">Belum ada pesanan.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
