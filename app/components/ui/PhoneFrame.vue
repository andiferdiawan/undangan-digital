<script setup lang="ts">
defineProps<{ scale?: number }>()
</script>

<template>
  <div class="relative mx-auto w-[390px] max-w-full rounded-[44px] bg-brand-900 p-3 shadow-2xl shadow-brand-900/30">
    <div class="absolute left-1/2 top-3 z-40 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-brand-900" />
    <div class="relative h-[760px] max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden rounded-[34px] bg-white [scrollbar-width:none]">
      <slot />
    </div>
  </div>
</template>
