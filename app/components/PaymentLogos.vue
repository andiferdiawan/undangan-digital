<script setup lang="ts">
/** Logo metode pembayaran yang aktif (Tripay): transfer bank/VA, QRIS, dan e-wallet. */
interface Channel { code: string, name: string, group: string, icon_url: string }
const { data } = useFetch<Channel[]>('/api/payments/channels', { server: false, lazy: true, key: 'payment-channels' })
const channels = computed(() => (data.value ?? []).filter(c => c.icon_url))
const FALLBACK = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'QRIS', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja']
</script>

<template>
  <div class="mx-auto mt-8 max-w-3xl px-4">
    <p class="text-[11px] font-semibold uppercase tracking-widest text-brand-400">Pembayaran aman & otomatis via</p>
    <ul v-if="channels.length" class="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="Metode pembayaran yang diterima">
      <li v-for="c in channels" :key="c.code" class="grid h-9 w-[72px] place-items-center rounded-lg bg-white px-2 ring-1 ring-brand-100">
        <img :src="c.icon_url" :alt="c.name" :title="c.name" width="56" height="24" class="max-h-6 w-auto object-contain" loading="lazy" decoding="async">
      </li>
    </ul>
    <ul v-else class="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-brand-600" aria-label="Metode pembayaran yang diterima">
      <li v-for="n in FALLBACK" :key="n" class="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-brand-100">{{ n }}</li>
    </ul>
    <p class="mt-2 text-[11px] text-brand-400">Transfer bank (Virtual Account), QRIS, dan e-wallet — konfirmasi otomatis.</p>
  </div>
</template>
