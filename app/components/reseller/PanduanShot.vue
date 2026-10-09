<script setup lang="ts">
/** Screenshot panduan reseller berbingkai ponsel (gambar dari scripts/panduan/screenshots.ts). */
const props = defineProps<{ name: PanduanGambar, caption?: string, alt?: string }>()
const size = computed(() => PANDUAN_GAMBAR[props.name])
</script>

<template>
  <figure class="mx-auto w-full max-w-[300px]">
    <a :href="`/panduan/reseller/${name}.webp`" target="_blank" rel="noopener" class="block overflow-hidden rounded-[22px] border-[5px] border-brand-900 bg-white shadow-[0_18px_40px_-24px_rgba(36,58,45,0.7)]" :aria-label="`Perbesar gambar: ${alt ?? caption ?? name}`">
      <img :src="`/panduan/reseller/${name}.webp`" :width="size.w / 2" :height="size.h / 2" :alt="alt ?? caption ?? ''" loading="lazy" decoding="async" class="block h-auto w-full">
    </a>
    <figcaption v-if="caption" class="mt-2 text-center text-xs text-brand-500">{{ caption }}</figcaption>
  </figure>
</template>
