<script setup lang="ts">
import type { PublicInvitation } from '#shared/types/models'
import { withDefaults as contentWithDefaults } from '#shared/theme/content'

definePageMeta({ layout: false })

const route = useRoute()
const supabase = useSupabaseClient()
const slug = String(route.params.slug).toLowerCase()
const guest = computed(() => String(route.query.to ?? route.query.kepada ?? '').trim().slice(0, 100))

const { data: inv } = await useAsyncData(`inv-${slug}`, async () => {
  const { data } = await supabase.rpc('get_public_invitation', { p_slug: slug })
  return (data as PublicInvitation | null) ?? null
})
if (!inv.value) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan', fatal: true })

const content = computed(() => contentWithDefaults(inv.value?.content))
const title = computed(() => `Undangan Pernikahan ${content.value.groom.nickname} & ${content.value.bride.nickname}`)
useSeoMeta({
  title,
  ogTitle: title,
  description: () => guest.value ? `Kepada Yth. ${guest.value} — kami mengundang Anda di hari bahagia kami.` : 'Kami mengundang Anda di hari bahagia kami.',
  ogDescription: () => content.value.opening.text,
  robots: 'noindex',
})
useHead({ meta: [{ name: 'theme-color', content: inv.value.theme.definition.globals.background_color }] })

onMounted(() => {
  if (guest.value) supabase.rpc('mark_guest_opened', { p_slug: slug, p_guest: guest.value }).then(() => {})
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
      :guest-name="guest"
      :slug="inv.slug"
      mode="page"
    />
  </div>
</template>
