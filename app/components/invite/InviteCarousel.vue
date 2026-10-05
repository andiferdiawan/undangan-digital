<script setup lang="ts">
/**
 * Galeri foto yang digeser satu per satu: swipe / scroll-snap, tombol ‹ ›, titik & penanda "1 / n".
 * Foto di samping miring 3D (kelas uv-coverflow di InviteRenderer) bila browser mendukung.
 * Props kelas dari tema: item_class (bingkai foto; warna teksnya dipakai keterangan), image_class, text_class (penanda 1/n),
 * button_class (tombol ‹ ›), dot_class (titik).
 */
const props = withDefaults(defineProps<{ item_class?: string, image_class?: string, text_class?: string, button_class?: string, dot_class?: string }>(), {
  item_class: '', image_class: '', text_class: '', button_class: '', dot_class: '',
})
const rt = useInvite()
const items = computed(() => rt.ctx.value.lists.gallery as { url: string, caption?: string }[])
const track = ref<HTMLElement | null>(null)
const active = ref(0)

function onScroll() {
  const el = track.value
  if (!el) return
  const mid = el.scrollLeft + el.clientWidth / 2
  let best = 0
  let dist = Infinity
  Array.from(el.children).forEach((k, i) => {
    const c = (k as HTMLElement).offsetLeft + (k as HTMLElement).offsetWidth / 2
    if (Math.abs(c - mid) < dist) { dist = Math.abs(c - mid); best = i }
  })
  active.value = best
}

function go(i: number) {
  const el = track.value
  const n = items.value.length
  if (!el || !n) return
  const k = el.children[(i + n) % n] as HTMLElement | undefined
  if (!k) return
  const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left: k.offsetLeft - (el.clientWidth - k.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' })
}
</script>

<template>
  <div v-if="items.length" class="invite-carousel relative">
    <div
      ref="track"
      class="uv-coverflow flex snap-x snap-mandatory gap-3 overflow-x-auto px-[14%] pb-4 pt-2"
      role="region" aria-roledescription="carousel" aria-label="Galeri foto" tabindex="0"
      @scroll.passive="onScroll"
    >
      <figure
        v-for="(it, i) in items" :key="it.url + i"
        class="uv-coverflow-item w-[72%] shrink-0 snap-center snap-always"
        :aria-label="`Foto ${i + 1} dari ${items.length}`"
      >
        <div :class="props.item_class">
          <img :src="it.url" :alt="it.caption || `Foto ${i + 1}`" :loading="i < 2 ? 'eager' : 'lazy'" class="block w-full" :class="props.image_class">
          <figcaption v-if="it.caption" class="px-1 pt-2 text-left text-[12px] opacity-80">{{ it.caption }}</figcaption>
        </div>
      </figure>
    </div>

    <template v-if="items.length > 1">
      <button type="button" class="invite-carousel-nav left-2" :class="props.button_class" aria-label="Foto sebelumnya" @click="go(active - 1)">‹</button>
      <button type="button" class="invite-carousel-nav right-2" :class="props.button_class" aria-label="Foto berikutnya" @click="go(active + 1)">›</button>
      <div class="mt-3 flex items-center justify-center gap-1.5">
        <button
          v-for="(_, i) in items" :key="i" type="button"
          class="h-1.5 rounded-full bg-current transition-all"
          :class="[props.dot_class, i === active ? 'w-5 opacity-100' : 'w-1.5 opacity-45']"
          :aria-label="`Ke foto ${i + 1}`" :aria-current="i === active"
          @click="go(i)"
        />
      </div>
      <p class="mt-2 text-center text-[11px] tracking-[0.25em]" :class="props.text_class" aria-live="polite">{{ active + 1 }} / {{ items.length }}</p>
    </template>
  </div>
</template>

<style>
.invite-carousel .uv-coverflow { scrollbar-width: none; overscroll-behavior-x: contain; }
.invite-carousel .uv-coverflow::-webkit-scrollbar { display: none; }
.invite-carousel-nav {
  position: absolute; top: calc(50% - 2.25rem); z-index: 5;
  display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px;
  font-size: 1.6rem; line-height: 1; background: rgb(255 255 255 / 0.85); color: #222;
  box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.6);
}
</style>
