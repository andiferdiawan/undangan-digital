<script setup lang="ts">
import type { ThemeDefinition } from '#shared/theme/schema'

/** Cuplikan sampul tema, dirender langsung dari definisi (tanpa gambar thumbnail). */
defineProps<{ definition: ThemeDefinition, css: string, slug: string }>()

const box = ref<HTMLElement | null>(null)
const scale = ref(0.7)
let ro: ResizeObserver | undefined
onMounted(() => {
  const update = () => { if (box.value) scale.value = box.value.clientWidth / 390 }
  update()
  ro = new ResizeObserver(update)
  if (box.value) ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="box" class="relative aspect-[9/14] overflow-hidden bg-brand-50">
    <div
      class="pointer-events-none absolute left-0 top-0 w-[390px] origin-top-left select-none"
      :style="{ transform: `scale(${scale})` }"
      aria-hidden="true"
      inert
    >
      <InviteRenderer :definition="definition" :css="css" :theme-slug="slug" mode="thumb" preview />
    </div>
  </div>
</template>
