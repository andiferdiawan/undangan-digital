<script setup lang="ts">
/**
 * Musik latar undangan: diputar saat tamu menekan "Buka Undangan" (butuh interaksi
 * agar tidak diblokir browser), tombol mengambang untuk jeda/putar, dan otomatis
 * berhenti sementara saat tab disembunyikan.
 */
const props = defineProps<{ src: string, color: string, surface: string, show: boolean }>()

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
let resumeOnVisible = false

function play() {
  const el = audio.value
  if (!el || !props.src) return
  el.play().then(() => (playing.value = true)).catch(() => (playing.value = false))
}
function pause() {
  audio.value?.pause()
  playing.value = false
}
const toggle = () => (playing.value ? pause() : play())

function onVisibility() {
  if (document.hidden) {
    resumeOnVisible = playing.value
    if (playing.value) audio.value?.pause()
  }
  else if (resumeOnVisible) {
    play()
  }
}
onMounted(() => document.addEventListener('visibilitychange', onVisibility))
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  audio.value?.pause()
})
watch(() => props.src, () => pause())

defineExpose({ play, pause })
</script>

<template>
  <div v-if="src" class="invite-music">
    <audio ref="audio" :src="src" loop preload="none" @pause="playing = false" @play="playing = true" />
    <button
      v-if="show"
      type="button"
      class="invite-music-btn"
      :class="{ 'is-playing': playing }"
      :style="{ background: surface, color, borderColor: color }"
      :aria-label="playing ? 'Jeda musik' : 'Putar musik'"
      :aria-pressed="playing"
      @click="toggle"
    >
      <svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" /><path d="M4 4l16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>

<style>
/* Wadah sticky setinggi 0: tombol menempel di bawah layar/bingkai tanpa menggeser konten */
.invite-music { position: sticky; bottom: 16px; z-index: 45; height: 0; width: 100%; max-width: 480px; margin: 0 auto; pointer-events: none; }
.invite-music-btn {
  position: absolute; right: 16px; bottom: 0; width: 44px; height: 44px; border-radius: 9999px;
  display: grid; place-items: center; border: 1.5px solid; box-shadow: 0 6px 20px rgb(0 0 0 / 0.18);
  pointer-events: auto; cursor: pointer;
}
.invite-music-btn svg { width: 20px; height: 20px; }
.invite-music-btn.is-playing { animation: invite-music-spin 4s linear infinite; }
@keyframes invite-music-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .invite-music-btn.is-playing { animation: none; } }
</style>
