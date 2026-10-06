<script setup lang="ts">
import { monthGrid, WEEKDAYS_SHORT } from '#shared/theme/context'

/** Kalender sebulan penuh dari tanggal acara utama; hari H diberi penanda hati/lingkaran di belakang angkanya. */
const props = withDefaults(defineProps<{
  head_class?: string
  day_class?: string
  active_class?: string
  marker?: string
  marker_class?: string
}>(), { marker: 'heart' })
const { ctx } = useInvite()
const grid = computed(() => monthGrid(ctx.value.eventDate))
const label = computed(() => `Kalender ${ctx.value.values.event_month} ${ctx.value.values.event_year}, hari acara tanggal ${grid.value?.active}`)
</script>

<template>
  <div v-if="grid" class="grid grid-cols-7 gap-y-2 text-center" role="img" :aria-label="label">
    <span v-for="d in WEEKDAYS_SHORT" :key="d" :class="props.head_class || 'text-[11px] uppercase tracking-wider opacity-70'">{{ d }}</span>
    <span v-for="i in grid.blanks" :key="`k${i}`" />
    <span
      v-for="d in grid.days" :key="d"
      class="relative isolate grid h-8 place-items-center"
      :class="d === grid.active ? (props.active_class || 'font-bold') : props.day_class"
    >
      <template v-if="d === grid.active">
        <svg v-if="props.marker === 'heart'" viewBox="0 0 48 44" class="absolute left-1/2 top-1/2 -z-1 h-9 w-9 -translate-x-1/2 -translate-y-1/2" :class="props.marker_class || 'text-accent'" aria-hidden="true">
          <path fill="currentColor" d="M24 42S3 29.5 3 15.5C3 8.6 8.4 3 15 3c3.9 0 7.2 1.9 9 5 1.8-3.1 5.1-5 9-5 6.6 0 12 5.6 12 12.5C45 29.5 24 42 24 42z" />
        </svg>
        <span v-else-if="props.marker === 'circle'" class="absolute left-1/2 top-1/2 -z-1 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full" :class="props.marker_class || 'bg-accent'" aria-hidden="true" />
      </template>
      {{ d }}
    </span>
  </div>
</template>
