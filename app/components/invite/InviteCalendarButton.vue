<script setup lang="ts">
const props = defineProps<{ label?: string, button_class?: string }>()
const { ctx } = useInvite()
const href = computed(() => {
  const c = ctx.value.calendar
  if (!c) return ''
  const q = new URLSearchParams({ action: 'TEMPLATE', text: c.title, dates: `${c.start}/${c.end}`, location: c.location })
  return `https://calendar.google.com/calendar/render?${q}`
})
</script>

<template>
  <a v-if="href" :href="href" target="_blank" rel="noopener" :class="props.button_class || 'inline-flex rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary'">
    {{ props.label || 'Simpan ke Kalender' }}
  </a>
</template>
