<script setup lang="ts">
/** Tombol hati untuk menyukai tema. `overlay`: bulat di atas thumbnail; `inline`: tombol berlabel. */
const props = withDefaults(defineProps<{ themeId: string, themeName: string, variant?: 'overlay' | 'inline' }>(), { variant: 'overlay' })
const { isLiked, toggle } = useThemeLikes()
const liked = computed(() => isLiked(props.themeId))
const pop = ref(false)

async function onClick() {
  const on = await toggle(props.themeId)
  if (on) {
    pop.value = true
    setTimeout(() => (pop.value = false), 350)
  }
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="liked"
    :aria-label="liked ? `Hapus ${themeName} dari favorit` : `Sukai tema ${themeName}`"
    :title="liked ? 'Hapus dari favorit' : 'Simpan ke favorit'"
    :class="variant === 'overlay'
      ? 'grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-700 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105'
      : 'btn-ghost w-full gap-2 md:w-auto'"
    @click.prevent.stop="onClick"
  >
    <svg viewBox="0 0 24 24" class="h-5 w-5 transition-transform duration-300" :class="pop && 'scale-125'" aria-hidden="true">
      <path
        d="M12 20.5s-7.3-4.4-9.7-9C.7 8.4 2.6 4.5 6.3 4.5c2.1 0 3.6 1.2 4.5 2.5L12 8.6l1.2-1.6c.9-1.3 2.4-2.5 4.5-2.5 3.7 0 5.6 3.9 4 7-2.4 4.6-9.7 9-9.7 9z"
        :fill="liked ? '#d9475f' : 'none'"
        :stroke="liked ? '#d9475f' : 'currentColor'"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="variant === 'inline'">{{ liked ? 'Tersimpan di Favorit' : 'Simpan ke Favorit' }}</span>
  </button>
</template>
