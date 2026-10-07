<script setup lang="ts">
/**
 * Kartu pemutar musik latar (komponen tema "music_player"): label, judul lagu, bar progres dengan waktu,
 * dan tombol putar/jeda. Tersambung ke audio yang sama dengan tombol musik mengambang; tidak tampil bila
 * musik undangan nonaktif (atau di cuplikan katalog).
 */
const props = defineProps<{
  label?: string
  item_class?: string
  button_class?: string
  text_class?: string
  label_class?: string
  bar_class?: string
  fill_class?: string
}>()
const { music } = useInvite()
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
</script>

<template>
  <div v-if="music.enabled.value" :class="props.item_class || 'rounded-2xl bg-surface p-4 text-center'">
    <p v-if="props.label" :class="props.label_class || 'text-[12px] uppercase tracking-[0.2em] opacity-70'">{{ props.label }}</p>
    <p v-if="music.title.value" :class="props.text_class || 'mt-1 text-[15px] font-semibold'">{{ music.title.value }}</p>
    <div class="mt-3 flex items-center gap-2 text-[11px] opacity-70 [font-variant-numeric:lining-nums_tabular-nums]">
      <span>{{ clock(music.time.value) }}</span>
      <div
        class="relative flex-1" :class="props.bar_class || 'h-1 overflow-hidden rounded-full bg-black/10'"
        role="progressbar" aria-label="Posisi lagu" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(music.progress.value * 100)"
      >
        <div class="absolute inset-y-0 left-0" :class="props.fill_class || 'bg-primary'" :style="{ width: `${music.progress.value * 100}%` }" />
      </div>
      <span>{{ music.duration.value ? clock(music.duration.value) : '–:––' }}</span>
    </div>
    <button
      type="button" class="mt-3 inline-grid place-items-center" :class="props.button_class || 'h-12 w-12 rounded-full bg-primary text-white'"
      :aria-label="music.playing.value ? 'Jeda musik' : 'Putar musik'" :aria-pressed="music.playing.value" @click="music.toggle()"
    >
      <svg v-if="music.playing.value" viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
      <svg v-else viewBox="0 0 24 24" class="ml-0.5 h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
    </button>
  </div>
</template>
