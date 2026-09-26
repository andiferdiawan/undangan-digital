<script setup lang="ts">
import type { ThemeDefinition } from '#shared/theme/schema'
import { withDefaults as contentWithDefaults, type InvitationContent } from '#shared/theme/content'
import { buildContext, interpolate, resolveAssets, safeUrl } from '#shared/theme/context'
import { globalsToCssVars, googleFontsHref, mergeGlobals } from '#shared/theme/style'
import InviteNode from './InviteNode'

const props = withDefaults(defineProps<{
  definition: ThemeDefinition
  css: string
  themeSlug: string
  content?: unknown
  styleOverride?: Record<string, string>
  assetOverride?: Record<string, string>
  guestName?: string
  slug?: string | null
  preview?: boolean
  /** Musik bawaan tema; dipakai bila user tidak mengunggah musik sendiri. */
  themeMusic?: string | null
  /** page: halaman penuh; frame: di dalam bingkai ponsel; thumb: hanya section pertama (katalog) */
  mode?: 'page' | 'frame' | 'thumb'
}>(), {
  content: undefined,
  styleOverride: () => ({}),
  assetOverride: () => ({}),
  guestName: '',
  slug: null,
  preview: false,
  themeMusic: null,
  mode: 'page',
})

const config = useRuntimeConfig()
const storageBase = (config.public.supabase as { url?: string } | undefined)?.url ?? ''

const globals = computed(() => mergeGlobals(props.definition.globals, props.styleOverride))
const cssVars = computed(() => globalsToCssVars(globals.value))
const assets = computed(() =>
  resolveAssets(props.definition.assets ?? {}, props.assetOverride ?? {}, props.themeSlug, storageBase),
)
// Pratinjau katalog (tanpa konten user): pakai data contoh tema (foto model) bila ada.
// Data contoh tidak pernah dipakai di undangan pelanggan karena konten selalu dikirim.
const effectiveContent = computed<InvitationContent>(() => {
  const c = contentWithDefaults(props.content)
  const demo = props.content === undefined ? props.definition.demo : undefined
  if (!demo) return c
  return {
    ...c,
    cover_photos: demo.cover_photos?.map(url => ({ url })) ?? c.cover_photos,
    gallery: demo.gallery?.map(url => ({ url, caption: '' })) ?? c.gallery,
    groom: { ...c.groom, photo: demo.groom_photo ?? c.groom.photo },
    bride: { ...c.bride, photo: demo.bride_photo ?? c.bride.photo },
  }
})
const ctx = computed(() =>
  buildContext(effectiveContent.value, { guestName: props.guestName, assets: assets.value }),
)

// Section RSVP & ucapan disembunyikan bila user menonaktifkan RSVP
const sections = computed(() => {
  const rsvpOn = contentWithDefaults(props.content).rsvp.enabled
  return props.definition.sections.filter(s => rsvpOn || (s.type !== 'rsvp' && s.type !== 'wishes'))
})
const cover = computed(() => (sections.value[0]?.type === 'cover' ? sections.value[0] : null))
const body = computed(() => {
  const list = cover.value ? sections.value.slice(1) : sections.value
  return props.mode === 'thumb' && !cover.value ? list.slice(0, 1) : list
})

// ---------- Musik latar ----------
const musicSrc = computed(() => {
  if (props.mode === 'thumb') return ''
  const m = contentWithDefaults(props.content).music
  if (!m.enabled) return ''
  return safeUrl(m.url) || safeUrl(props.themeMusic) || ''
})
const music = ref<{ play: () => void } | null>(null)

// ---------- Motion (reveal saat scroll, kartu 3D) ----------
const rootEl = ref<HTMLElement | null>(null)
const motion = useInviteMotion(rootEl, () => props.mode !== 'thumb')

const coverOpen = ref(!cover.value)
const wishesVersion = ref(0)
function openCover() {
  coverOpen.value = true
  // Diputar langsung di dalam handler klik agar tidak diblokir kebijakan autoplay
  music.value?.play()
  motion.enableGyro()
  if (props.mode === 'page' && import.meta.client) window.scrollTo({ top: 0 })
}
watch(cover, (c) => { if (!c) coverOpen.value = true })

// Tema tanpa sampul: musik mulai pada sentuhan pertama tamu
if (import.meta.client && props.mode === 'page') {
  const start = () => {
    if (!cover.value) music.value?.play()
    window.removeEventListener('pointerdown', start)
  }
  onMounted(() => window.addEventListener('pointerdown', start, { once: true }))
  onBeforeUnmount(() => window.removeEventListener('pointerdown', start))
}

provide(INVITE_KEY, {
  ctx,
  slug: props.slug,
  preview: props.preview,
  mode: props.mode,
  coverOpen,
  openCover,
  wishesVersion,
})

// CSS hasil kompilasi dibuat server dari kelas Tailwind yang sudah divalidasi
const safeCss = computed(() => (props.css || '').replace(/<\/?style/gi, ''))
useHead(() => ({
  style: [{ key: `theme-css-${props.themeSlug}`, innerHTML: safeCss.value }],
  link: [{ key: `font-${props.themeSlug}`, rel: 'stylesheet', href: googleFontsHref(globals.value) }],
  bodyAttrs: props.mode === 'page' && !coverOpen.value ? { style: 'overflow:hidden' } : {},
}))

const bgUrl = (bg?: string) => {
  const url = bg ? safeUrl(interpolate(bg, ctx.value)) : ''
  return url ? { backgroundImage: `url("${encodeURI(url).replace(/"/g, '%22')}")` } : undefined
}
</script>

<template>
  <div class="invite-wrap">
    <div
      ref="rootEl"
      class="invite-root relative isolate overflow-x-hidden bg-base font-body text-ink"
      :class="[`invite-${mode}`, { 'uv-motion': motion.active.value }]"
      :style="cssVars"
    >
      <!-- CSS tema di-scope ke .invite-root, jadi root_class dipasang di pembungkus dalam -->
      <div :class="definition.root_class">
        <!-- Cover (dibuka dengan tombol open_button) -->
        <Transition name="invite-cover">
          <section
            v-if="cover && (!coverOpen || mode === 'thumb')"
            data-section="cover"
            :class="[cover.class, mode === 'page' ? 'fixed inset-0 z-50 mx-auto max-w-[480px]' : mode === 'frame' ? 'relative min-h-[736px]' : 'relative min-h-[606px]']"
            :style="bgUrl(cover.bg)"
          >
            <InviteNode v-for="(n, i) in cover.children" :key="i" :node="n" :headings="mode === 'page' ? 'h1' : 'none'" />
          </section>
        </Transition>

        <template v-if="(mode !== 'thumb' || !cover) && (mode !== 'frame' || coverOpen)">
          <section
            v-for="(s, si) in body"
            :key="si"
            :data-section="s.type"
            :id="`s-${s.type}`"
            :class="s.class"
            :style="bgUrl(s.bg)"
          >
            <InviteNode v-for="(n, i) in s.children" :key="i" :node="n" :headings="mode !== 'page' ? 'none' : si === 0 && !cover ? 'h1' : 'h2'" />
          </section>
        </template>
      </div>
    </div>
    <InviteMusic
      v-if="musicSrc"
      ref="music"
      :src="musicSrc"
      :show="coverOpen"
      :color="globals.primary_color"
      :surface="globals.surface_color"
    />
  </div>
</template>

<style>
.invite-wrap { min-height: 100%; display: flex; flex-direction: column; }
.invite-root { min-height: 100%; flex: 1 0 auto; }
.invite-page { max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgb(0 0 0 / 0.08); }
.invite-cover-leave-active { transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.8s; }
.invite-cover-leave-to { transform: translateY(-100%); opacity: 0; }

/* ---------- Motion tema (lihat useInviteMotion) ---------- */
.invite-root { --uv-rx: 0deg; --uv-ry: 0deg; }
.invite-root.uv-motion [class*="uv-reveal"]:not(.uv-in) { opacity: 0; }
.invite-root .uv-in.uv-reveal { animation: uv-up 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
.invite-root .uv-in.uv-reveal-zoom { animation: uv-zoom 1s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
.invite-root .uv-in.uv-reveal-left { animation: uv-left 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
.invite-root .uv-in.uv-reveal-right { animation: uv-right 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
.invite-root .uv-in.uv-reveal-flip { animation: uv-flip 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
.invite-root .uv-in.uv-d1 { animation-delay: 0.12s; }
.invite-root .uv-in.uv-d2 { animation-delay: 0.24s; }
.invite-root .uv-in.uv-d3 { animation-delay: 0.36s; }
.invite-root .uv-in.uv-d4 { animation-delay: 0.5s; }
.invite-root .uv-in.uv-d5 { animation-delay: 0.7s; }
.invite-root .uv-tilt {
  transform: perspective(1000px) rotateX(var(--uv-rx)) rotateY(var(--uv-ry));
  transform-style: preserve-3d;
  will-change: transform;
}
.invite-root .uv-tilt .uv-depth-1 { transform: translateZ(24px); }
.invite-root .uv-tilt .uv-depth-2 { transform: translateZ(48px); }
.invite-root .uv-tilt .uv-depth-3 { transform: translateZ(80px); }
.invite-root .uv-float3d { animation: uv-float3d 7s ease-in-out infinite; transform-style: preserve-3d; }
.invite-root .uv-spin3d { animation: uv-spin3d 14s linear infinite; transform-style: preserve-3d; }
.invite-root .uv-shine { position: relative; overflow: hidden; }
.invite-root .uv-shine::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(115deg, transparent 35%, rgb(255 255 255 / 0.45) 50%, transparent 65%);
  transform: translateX(-120%); animation: uv-shine 5.5s ease-in-out infinite;
}
@keyframes uv-up { from { opacity: 0; transform: translateY(28px); filter: blur(4px); } }
@keyframes uv-zoom { from { opacity: 0; transform: scale(0.86); filter: blur(6px); } }
@keyframes uv-left { from { opacity: 0; transform: translateX(-40px); } }
@keyframes uv-right { from { opacity: 0; transform: translateX(40px); } }
@keyframes uv-flip { from { opacity: 0; transform: perspective(900px) rotateX(55deg) translateY(30px); } }
@keyframes uv-float3d {
  0%, 100% { transform: perspective(700px) translateY(0) rotateY(-14deg) rotateX(4deg); }
  50% { transform: perspective(700px) translateY(-10px) rotateY(14deg) rotateX(-4deg); }
}
@keyframes uv-spin3d { from { transform: perspective(700px) rotateY(0deg); } to { transform: perspective(700px) rotateY(360deg); } }
@keyframes uv-shine { 0%, 55% { transform: translateX(-120%); } 85%, 100% { transform: translateX(120%); } }
@media (prefers-reduced-motion: reduce) {
  .invite-root .uv-float3d, .invite-root .uv-spin3d, .invite-root .uv-shine::after { animation: none; }
  .invite-root .uv-tilt { transform: none; }
}
</style>
