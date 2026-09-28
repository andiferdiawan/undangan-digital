<script setup lang="ts">
import type { PublicInvitation } from '#shared/types/models'
import { withDefaults as contentWithDefaults, inviteNames, inviteTitle } from '#shared/theme/content'
import { dateParts } from '#shared/theme/context'

definePageMeta({ layout: false })

const route = useRoute()
const supabase = useSupabaseClient()
const slug = String(route.params.slug).toLowerCase()
const guest = computed(() => String(route.query.to ?? route.query.kepada ?? '').trim().slice(0, 100))

const { data: inv } = await useAsyncData(`inv-${slug}`, async () => {
  const { data } = await supabase.rpc('get_public_invitation', { p_slug: slug } as never)
  return (data as PublicInvitation | null) ?? null
})
if (!inv.value) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan', fatal: true })

const eventKind = computed(() => inv.value?.theme.definition.kind ?? 'wedding')
const content = computed(() => contentWithDefaults(inv.value?.content, eventKind.value, inv.value?.theme.definition.demo))
const names = computed(() => inviteNames(content.value, eventKind.value))
const title = computed(() => inviteTitle(content.value, eventKind.value))
const when = computed(() => {
  const e = content.value.events[0]
  return [dateParts(e?.date ?? '')?.full, e?.venue].filter(Boolean).join(' · ')
})
// Gambar pratinjau WhatsApp dibuat server sesuai tema & nama mempelai; ?v= berubah bila isi berubah
const origin = useSiteOrigin()
const ogImage = computed(() => {
  const c = content.value
  const v = shortHash(JSON.stringify(['brand1', names.value, c.events[0]?.date]))
  return `${origin}/og/${slug}.png?v=${v}`
})
useSeoMeta({
  title,
  titleTemplate: '%s',
  ogTitle: title,
  description: () => guest.value ? `Kepada Yth. ${guest.value} — ${when.value}` : when.value || 'Kami mengundang Anda di hari bahagia kami.',
  ogDescription: () => guest.value ? `Kepada Yth. ${guest.value} · ${when.value}` : when.value || content.value.opening.text,
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => title.value,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
  robots: 'noindex, nofollow',
})
useHead({ meta: [{ name: 'theme-color', content: inv.value.theme.definition.globals.background_color }] })

onMounted(() => {
  if (guest.value) supabase.rpc('mark_guest_opened', { p_slug: slug, p_guest: guest.value } as never).then(() => {})
})
</script>

<template>
  <div v-if="inv" class="min-h-screen" :style="{ background: inv.theme.definition.globals.background_color }">
    <InviteRenderer
      :definition="inv.theme.definition"
      :css="inv.theme.compiled_css"
      :theme-slug="inv.theme.slug"
      :content="inv.content"
      :style-override="inv.style"
      :asset-override="inv.assets"
      :theme-music="inv.theme.music_url"
      :guest-name="guest"
      :slug="inv.slug"
      mode="page"
    />
  </div>
</template>
