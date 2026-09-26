<script setup lang="ts">
/**
 * Slider foto latar (crossfade + zoom perlahan). Sumber: Foto Sampul user, lalu galeri.
 * Diam di pratinjau katalog & saat pengguna meminta gerak dikurangi.
 */
const props = withDefaults(defineProps<{ interval?: string, image_class?: string, dots?: string, dot_class?: string }>(), {
  interval: '5000',
  image_class: '',
  dots: 'true',
  dot_class: '',
})
const rt = useInvite()
const slides = computed(() => rt.ctx.value.slides)
const active = ref(0)
const still = computed(() => rt.mode === 'thumb')

let timer: ReturnType<typeof setInterval> | undefined
function start() {
  stop()
  if (still.value || slides.value.length < 2) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const ms = Math.min(Math.max(Number(props.interval) || 5000, 2500), 15000)
  timer = setInterval(() => { if (!document.hidden) active.value = (active.value + 1) % slides.value.length }, ms)
}
function stop() { clearInterval(timer) }
onMounted(start)
onBeforeUnmount(stop)
watch(() => slides.value.length, () => { active.value = 0; if (import.meta.client) start() })
</script>

<template>
  <div v-if="slides.length" class="invite-slider pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <img
      v-for="(src, i) in slides" :key="src + i"
      :src="src" alt=""
      :loading="i === 0 ? 'eager' : 'lazy'"
      class="invite-slide absolute inset-0 h-full w-full object-cover"
      :class="[image_class, { 'is-active': i === active, 'is-still': still }]"
    >
    <div v-if="dots !== 'false' && slides.length > 1 && !still" class="pointer-events-auto absolute bottom-3 right-4 z-10 flex gap-1.5">
      <button
        v-for="(_, i) in slides" :key="i" type="button"
        class="h-1.5 rounded-full bg-white/60 transition-all"
        :class="[dot_class, i === active ? 'w-5 !bg-white' : 'w-1.5']"
        :aria-label="`Foto ${i + 1}`"
        @click="active = i; start()"
      />
    </div>
  </div>
</template>

<style>
.invite-slide { opacity: 0; transform: scale(1.08); transition: opacity 1.4s ease, transform 7s ease-out; }
.invite-slide.is-active { opacity: 1; transform: scale(1); }
.invite-slide.is-still { transition: none; transform: none; }
@media (prefers-reduced-motion: reduce) { .invite-slide { transition: opacity .6s; transform: none; } }
</style>
