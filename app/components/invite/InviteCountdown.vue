<script setup lang="ts">
const props = defineProps<{ item_class?: string, number_class?: string, label_class?: string }>()
const { ctx } = useInvite()

const parts = ref<{ label: string, value: string }[]>([
  { label: 'Hari', value: '--' }, { label: 'Jam', value: '--' },
  { label: 'Menit', value: '--' }, { label: 'Detik', value: '--' },
])

let timer: ReturnType<typeof setInterval> | undefined
function tick() {
  const target = ctx.value.countdownTarget ? new Date(ctx.value.countdownTarget).getTime() : 0
  const s = Math.max(0, Math.floor((target - Date.now()) / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  parts.value = [
    { label: 'Hari', value: pad(Math.floor(s / 86400)) },
    { label: 'Jam', value: pad(Math.floor((s % 86400) / 3600)) },
    { label: 'Menit', value: pad(Math.floor((s % 3600) / 60)) },
    { label: 'Detik', value: pad(s % 60) },
  ]
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="grid grid-cols-4 gap-2">
    <div v-for="p in parts" :key="p.label" :class="props.item_class || 'rounded-xl bg-surface py-3 text-center shadow-sm'">
      <b :class="props.number_class || 'block font-heading text-2xl text-primary'">{{ p.value }}</b>
      <span :class="props.label_class || 'text-[11px] uppercase tracking-wider text-muted'">{{ p.label }}</span>
    </div>
  </div>
</template>
