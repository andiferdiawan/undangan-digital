<script setup lang="ts">
const props = defineProps<{ id: string, slug: string, themeName: string }>()
const route = useRoute()
const tabs = computed(() => [
  { to: `/dashboard/${props.id}`, label: 'Editor' },
  { to: `/dashboard/${props.id}/tamu`, label: 'Buku Tamu' },
  { to: `/dashboard/${props.id}/rsvp`, label: 'RSVP & Ucapan' },
])
const url = computed(() => inviteUrl(props.slug))

// Admin yang membuka undangan milik pelanggan: tampilkan penanda agar jelas sedang mengelola akun orang lain.
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { data: foreignOwner } = await useAsyncData(`inv-owner-${props.id}`, async () => {
  const uid = (user.value as { sub?: string } | null)?.sub
  const { data: inv } = await supabase.from('invitations').select('owner_id').eq('id', props.id).maybeSingle()
  const owner = (inv as { owner_id: string } | null)?.owner_id
  if (!owner || owner === uid) return null
  const { data: p } = await supabase.from('profiles').select('email, full_name').eq('id', owner).maybeSingle()
  const prof = p as { email: string | null, full_name: string | null } | null
  return prof?.email || prof?.full_name || 'pelanggan'
})
</script>

<template>
  <div class="border-b border-brand-100 bg-white">
    <div v-if="foreignOwner" class="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900" role="note">
      <strong>Mode admin:</strong> Anda mengelola undangan milik <strong>{{ foreignOwner }}</strong>. Perubahan langsung terlihat oleh pemiliknya.
    </div>
    <div class="mx-auto max-w-6xl px-4 pt-4">
      <NuxtLink to="/dashboard" class="text-xs text-brand-500 hover:text-brand">← Semua undangan</NuxtLink>
      <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0">
          <h1 class="truncate font-display text-2xl text-brand">/{{ slug }}</h1>
          <p class="text-xs text-brand-500">Tema {{ themeName }}</p>
        </div>
        <a :href="url" target="_blank" rel="noopener" class="btn-ghost btn-sm">Buka undangan ↗</a>
      </div>
      <nav class="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
        <NuxtLink
          v-for="t in tabs" :key="t.to" :to="t.to"
          class="shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition"
          :class="route.path === t.to ? 'border-clay text-brand' : 'border-transparent text-brand-500 hover:text-brand'"
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
