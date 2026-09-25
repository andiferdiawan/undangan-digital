<script setup lang="ts">
const props = defineProps<{ value?: string, label?: string, button_class?: string }>()
const copied = ref(false)

async function copy() {
  const text = props.value ?? ''
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <button type="button" :class="props.button_class || 'rounded-full bg-primary px-5 py-2 text-sm font-semibold text-surface'" @click="copy">
    {{ copied ? 'Tersalin ✓' : (props.label || 'Salin') }}
  </button>
</template>
