<script setup lang="ts">
const route = useRoute()
const { data } = await useCatalog()
const theme = computed(() => data.value?.themes.find(t => t.slug === route.params.slug))
if (!theme.value) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan', fatal: true })
useSeoMeta({ title: () => `Checkout ${theme.value?.name}`, robots: 'noindex' })

const { reseller } = await useReferral()
const packageId = ref<number>(Number(route.query.paket) || data.value?.packages[1]?.id || data.value?.packages[0]?.id || 0)
const pkg = computed(() => data.value?.packages.find(p => p.id === packageId.value))

const form = reactive({ name: '', email: '', phone: '' })
const method = ref('')
const picker = ref<{ fee: (code: string) => number } | null>(null)
const fee = computed(() => (method.value && picker.value ? picker.value.fee(method.value) : 0))

const busy = ref(false)
const error = ref('')
async function pay() {
  error.value = ''
  if (!pkg.value || !theme.value) return
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
    error.value = 'Lengkapi nama, email, dan nomor WhatsApp.'
    return
  }
  if (!method.value) {
    error.value = 'Pilih metode pembayaran.'
    return
  }
  busy.value = true
  try {
    const r = await $fetch<{ order_id: string, key: string }>('/api/checkout', {
      method: 'POST',
      body: {
        theme_id: theme.value.id, package_id: pkg.value.id, method: method.value,
        customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
      },
    })
    await navigateTo(`/pesanan/${r.order_id}?k=${r.key}`)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Gagal membuat pesanan'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="theme" class="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
    <form class="grid content-start gap-5" @submit.prevent="pay">
      <div>
        <NuxtLink :to="`/tema/${theme.slug}`" class="text-sm text-brand-600">← Kembali ke tema</NuxtLink>
        <h1 class="mt-3 font-display text-3xl text-brand">Checkout</h1>
        <p v-if="reseller" class="mt-1 text-sm text-brand-600">Dilayani oleh <b>{{ reseller.business_name }}</b></p>
      </div>

      <section class="card grid gap-3 p-5">
        <h2 class="font-semibold text-brand-900">1. Paket</h2>
        <label v-for="p in data?.packages" :key="p.id" class="flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3" :class="packageId === p.id ? 'border-brand bg-brand-50' : 'border-brand-100'">
          <span class="flex items-center gap-3">
            <input v-model="packageId" type="radio" :value="p.id" class="h-4 w-4 accent-[#2f4a3a]">
            <span><b class="block text-sm text-brand-900">{{ p.name }}</b><span class="text-xs text-brand-500">Maks. {{ p.guest_limit }} nama tamu</span></span>
          </span>
          <b class="text-sm text-brand">{{ rupiah(p.price) }}</b>
        </label>
      </section>

      <section class="card grid gap-3 p-5">
        <h2 class="font-semibold text-brand-900">2. Data pemesan</h2>
        <label class="label">Nama lengkap
          <input v-model="form.name" class="input" autocomplete="name" maxlength="80" required>
        </label>
        <label class="label">Email
          <input v-model="form.email" type="email" class="input" autocomplete="email" required>
          <span class="text-xs font-normal text-brand-500">Dipakai untuk membuat akun setelah pembayaran.</span>
        </label>
        <label class="label">Nomor WhatsApp
          <input v-model="form.phone" type="tel" inputmode="tel" class="input" placeholder="08xxxxxxxxxx" autocomplete="tel" required>
        </label>
      </section>

      <section class="card grid gap-3 p-5">
        <h2 class="font-semibold text-brand-900">3. Metode pembayaran</h2>
        <MethodPicker ref="picker" v-model="method" :amount="pkg?.price ?? 0" />
      </section>
    </form>

    <aside class="md:pt-24">
      <div class="card sticky top-20 grid gap-3 p-5">
        <h2 class="font-semibold text-brand-900">Ringkasan</h2>
        <div class="flex items-center justify-between text-sm"><span class="text-brand-600">Tema</span><b class="text-brand-900">{{ theme.name }}</b></div>
        <div class="flex items-center justify-between text-sm"><span class="text-brand-600">{{ pkg?.name }}</span><b class="text-brand-900">{{ rupiah(pkg?.price ?? 0) }}</b></div>
        <div class="flex items-center justify-between text-sm"><span class="text-brand-600">Biaya pembayaran</span><span class="text-brand-900">{{ fee ? rupiah(fee) : '—' }}</span></div>
        <div class="flex items-center justify-between border-t border-brand-100 pt-3"><span class="font-semibold text-brand-900">Total</span><b class="text-lg text-brand">{{ rupiah((pkg?.price ?? 0) + fee) }}</b></div>
        <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
        <button class="btn-accent w-full" :disabled="busy" @click="pay">{{ busy ? 'Memproses…' : 'Bayar Sekarang' }}</button>
        <p class="text-center text-xs text-brand-500">Pembayaran diproses aman oleh Tripay. Biaya final tampil di halaman pembayaran.</p>
      </div>
    </aside>
  </div>
</template>
