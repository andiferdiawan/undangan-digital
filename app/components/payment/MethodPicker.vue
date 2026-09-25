<script setup lang="ts">
interface Channel {
  code: string
  name: string
  group: string
  icon_url: string
  fee_customer: { flat: number, percent: number }
}
const props = defineProps<{ amount: number }>()
const model = defineModel<string>({ default: '' })

const { data: channels, error, pending } = await useFetch<Channel[]>('/api/payments/channels', { server: false, lazy: true })
const groups = computed(() => {
  const m = new Map<string, Channel[]>()
  for (const c of channels.value ?? []) m.set(c.group, [...(m.get(c.group) ?? []), c])
  return [...m.entries()]
})
const fee = (c: Channel) => Math.ceil(c.fee_customer.flat + (props.amount * c.fee_customer.percent) / 100)
watch(channels, (list) => {
  if (!model.value && list?.length) model.value = (list.find(c => c.code === 'QRIS') ?? list[0])!.code
})
defineExpose({ fee: (code: string) => { const c = channels.value?.find(x => x.code === code); return c ? fee(c) : 0 } })
</script>

<template>
  <div>
    <p v-if="pending" class="rounded-2xl bg-brand-50 p-4 text-sm text-brand-600">Memuat metode pembayaran…</p>
    <p v-else-if="error" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Metode pembayaran belum tersedia. Coba muat ulang halaman.</p>
    <div v-else class="grid gap-4">
      <div v-for="[group, list] in groups" :key="group">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-500">{{ group }}</p>
        <div class="grid gap-2">
          <label
            v-for="c in list" :key="c.code"
            class="flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-3 py-2.5 transition"
            :class="model === c.code ? 'border-brand' : 'border-brand-100'"
          >
            <input v-model="model" type="radio" :value="c.code" class="sr-only">
            <img :src="c.icon_url" :alt="c.name" class="h-7 w-14 shrink-0 object-contain" loading="lazy">
            <span class="flex-1 text-sm font-medium text-brand-900">{{ c.name }}</span>
            <span class="text-xs text-brand-500">{{ fee(c) ? `+${rupiah(fee(c))}` : 'Tanpa biaya' }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
