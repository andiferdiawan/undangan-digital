<script setup lang="ts">
defineProps<{ title: string, hint?: string }>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <section class="card overflow-hidden">
    <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left" :aria-expanded="open" @click="open = !open">
      <span>
        <span class="block font-semibold text-brand-900">{{ title }}</span>
        <span v-if="hint" class="block text-xs text-brand-500">{{ hint }}</span>
      </span>
      <span class="text-brand-400 transition" :class="open && 'rotate-180'">⌄</span>
    </button>
    <div v-show="open" class="grid gap-4 border-t border-brand-50 px-4 pb-5 pt-4">
      <slot />
    </div>
  </section>
</template>
