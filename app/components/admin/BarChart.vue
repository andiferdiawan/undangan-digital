<script setup lang="ts">
/**
 * Bar chart satu seri (inline SVG). Satu hue, baseline di nol, ujung atas membulat 4px,
 * jarak 2px antar batang, tooltip per batang (hover & fokus keyboard), serta tampilan tabel.
 */
const props = defineProps<{
  title: string
  data: { label: string, value: number }[]
  format: (n: number) => string
  compact?: (n: number) => string
}>()

const W = 640
const H = 220
const PAD = { top: 16, right: 8, bottom: 28, left: 48 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

const max = computed(() => {
  const m = Math.max(0, ...props.data.map(d => d.value))
  if (m === 0) return 1
  const pow = 10 ** Math.floor(Math.log10(m))
  return Math.ceil(m / pow) * pow
})
const ticks = computed(() => [0, 0.5, 1].map(t => t * max.value))
const band = computed(() => innerW / Math.max(1, props.data.length))
const barW = computed(() => Math.max(4, band.value - 2 - band.value * 0.28))
const y = (v: number) => PAD.top + innerH - (v / max.value) * innerH
const x = (i: number) => PAD.left + i * band.value + (band.value - barW.value) / 2
const short = (n: number) => (props.compact ?? props.format)(n)

// Label langsung hanya untuk nilai tertinggi & bulan terakhir (selektif)
const labelled = computed(() => {
  const s = new Set<number>()
  let hi = -1
  props.data.forEach((d, i) => { if (d.value > 0 && (hi < 0 || d.value > props.data[hi]!.value)) hi = i })
  if (hi >= 0) s.add(hi)
  if (props.data.length && props.data.at(-1)!.value > 0) s.add(props.data.length - 1)
  return s
})

const active = ref<number | null>(null)
const activeItem = computed(() => (active.value === null ? null : props.data[active.value] ?? null))
const showTable = ref(false)
function barPath(i: number, v: number) {
  const x0 = x(i)
  const y0 = y(v)
  const h = PAD.top + innerH - y0
  if (h <= 0) return ''
  const r = Math.min(4, barW.value / 2, h)
  return `M${x0},${PAD.top + innerH} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + barW.value - r} Q${x0 + barW.value},${y0} ${x0 + barW.value},${y0 + r} V${PAD.top + innerH} Z`
}
</script>

<template>
  <figure class="card p-4">
    <figcaption class="flex items-center justify-between gap-2">
      <span class="font-semibold text-brand-900">{{ title }}</span>
      <button class="text-xs font-medium text-brand-500 hover:text-brand" @click="showTable = !showTable">{{ showTable ? 'Lihat grafik' : 'Lihat tabel' }}</button>
    </figcaption>

    <div v-if="!showTable" class="relative mt-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" :aria-label="title">
        <g class="text-[11px]" fill="#6e7a70">
          <g v-for="t in ticks" :key="t">
            <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)" stroke="#e4ede1" :stroke-dasharray="t === 0 ? '' : '3 4'" />
            <text :x="PAD.left - 8" :y="y(t) + 4" text-anchor="end">{{ short(t) }}</text>
          </g>
          <text v-for="(d, i) in data" :key="d.label" :x="x(i) + barW / 2" :y="H - 8" text-anchor="middle">{{ d.label }}</text>
        </g>
        <g>
          <path
            v-for="(d, i) in data" :key="`b-${d.label}`"
            :d="barPath(i, d.value)"
            :fill="active === i ? '#7fa07f' : '#5f8666'"
          />
          <template v-for="i in labelled" :key="`l-${i}`">
            <text v-if="active !== i" :x="x(i) + barW / 2" :y="y(data[i]!.value) - 6" text-anchor="middle" class="text-[11px] font-semibold" fill="#2f4a3a">{{ short(data[i]!.value) }}</text>
          </template>
          <!-- Area sentuh lebih besar dari batang -->
          <rect
            v-for="(d, i) in data" :key="`h-${d.label}`"
            :x="PAD.left + i * band" :y="PAD.top" :width="band" :height="innerH"
            fill="transparent" tabindex="0" class="cursor-pointer outline-none"
            :aria-label="`${d.label}: ${format(d.value)}`"
            @pointerenter="active = i" @pointerleave="active = null" @focus="active = i" @blur="active = null"
          />
        </g>
      </svg>
      <div
        v-if="active !== null && activeItem"
        class="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-brand-900 px-2.5 py-1.5 text-center text-white shadow-lg"
        :style="{ left: `${((x(active) + barW / 2) / W) * 100}%`, top: `${(y(activeItem.value) / H) * 100}%` }"
      >
        <b class="block text-sm">{{ format(activeItem.value) }}</b>
        <span class="text-[11px] opacity-75">{{ activeItem.label }}</span>
      </div>
    </div>

    <table v-else class="mt-3 w-full text-sm">
      <thead><tr class="text-left text-xs text-brand-500"><th class="py-1.5 font-medium">Bulan</th><th class="py-1.5 text-right font-medium">Nilai</th></tr></thead>
      <tbody>
        <tr v-for="d in data" :key="d.label" class="border-t border-brand-50"><td class="py-1.5">{{ d.label }}</td><td class="py-1.5 text-right font-medium">{{ format(d.value) }}</td></tr>
      </tbody>
    </table>
  </figure>
</template>
