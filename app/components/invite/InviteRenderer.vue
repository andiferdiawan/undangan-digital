<script setup lang="ts">
import type { ThemeDefinition } from '#shared/theme/schema'
import { withDefaults as contentWithDefaults } from '#shared/theme/content'
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
  /** page: halaman penuh; frame: di dalam bingkai ponsel; thumb: hanya section pertama (katalog) */
  mode?: 'page' | 'frame' | 'thumb'
}>(), {
  content: undefined,
  styleOverride: () => ({}),
  assetOverride: () => ({}),
  guestName: '',
  slug: null,
  preview: false,
  mode: 'page',
})

const config = useRuntimeConfig()
const storageBase = (config.public.supabase as { url?: string } | undefined)?.url ?? ''

const globals = computed(() => mergeGlobals(props.definition.globals, props.styleOverride))
const cssVars = computed(() => globalsToCssVars(globals.value))
const assets = computed(() =>
  resolveAssets(props.definition.assets ?? {}, props.assetOverride ?? {}, props.themeSlug, storageBase),
)
const ctx = computed(() =>
  buildContext(contentWithDefaults(props.content), { guestName: props.guestName, assets: assets.value }),
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

const coverOpen = ref(!cover.value)
const wishesVersion = ref(0)
function openCover() {
  coverOpen.value = true
  if (props.mode === 'page' && import.meta.client) window.scrollTo({ top: 0 })
}
watch(cover, (c) => { if (!c) coverOpen.value = true })

provide(INVITE_KEY, {
  ctx,
  slug: props.slug,
  preview: props.preview,
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
  <div
    class="invite-root relative isolate overflow-x-hidden bg-base font-body text-ink"
    :class="`invite-${mode}`"
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
          <InviteNode v-for="(n, i) in cover.children" :key="i" :node="n" />
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
          <InviteNode v-for="(n, i) in s.children" :key="i" :node="n" />
        </section>
      </template>
    </div>
  </div>
</template>

<style>
.invite-root { min-height: 100%; }
.invite-page { max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgb(0 0 0 / 0.08); }
.invite-cover-leave-active { transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.8s; }
.invite-cover-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
