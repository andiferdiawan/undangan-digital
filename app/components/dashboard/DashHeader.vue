<script setup lang="ts">
const props = defineProps<{ id: string, slug: string, themeName: string }>()
const route = useRoute()
const tabs = computed(() => [
  { to: `/dashboard/${props.id}`, label: 'Editor' },
  { to: `/dashboard/${props.id}/tamu`, label: 'Buku Tamu' },
  { to: `/dashboard/${props.id}/rsvp`, label: 'RSVP & Ucapan' },
])
const url = computed(() => inviteUrl(props.slug))

// Siapa yang membuka: pemilik, admin (undangan milik orang lain), atau customer (editor lewat kode token).
const supabase = useSupabaseClient()
const user = useSupabaseUser()
type Share = { slug: string, code: string | null, editors: number }
const { data: access, refresh: refreshAccess } = await useAsyncData(`inv-access-${props.id}`, async () => {
  const uid = (user.value as { sub?: string } | null)?.sub
  const { data: inv } = await supabase.from('invitations').select('owner_id').eq('id', props.id).maybeSingle()
  const owner = (inv as { owner_id: string } | null)?.owner_id
  // Info berbagi hanya bisa dibaca pemilik & admin (kode token tidak terlihat oleh customer)
  const { data: share } = await supabase.rpc('invitation_share_info', { p_invitation: props.id } as never)
  let foreignOwner: string | null = null
  if (owner && owner !== uid && share) {
    const { data: p } = await supabase.from('profiles').select('email, full_name').eq('id', owner).maybeSingle()
    const prof = p as { email: string | null, full_name: string | null } | null
    foreignOwner = prof?.email || prof?.full_name || 'pelanggan'
  }
  return { foreignOwner, isEditor: !!owner && owner !== uid && !share, share: (share as Share | null) ?? null }
})

// Bagikan ke customer: link kelola + kode token, customer bisa mengedit tanpa login
const shareOpen = ref(false)
const kelolaUrl = computed(() => `${useSiteOrigin()}/kelola/${props.slug}`)
const shareText = computed(() => access.value?.share?.code
  ? `Assalamu'alaikum, undangan digital Anda sudah siap di ${inviteUrl(props.slug)}\n\nUntuk mengedit undangan, menambah daftar tamu, dan melihat RSVP, buka:\n${kelolaUrl.value}\nlalu masukkan kode token: ${access.value.share.code}\n\nKode ini rahasia, mohon tidak dibagikan ke orang lain.`
  : '')
const copied = ref(false)
async function copyShare() {
  try {
    await navigator.clipboard.writeText(shareText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  }
  catch { /* clipboard tidak tersedia */ }
}
const revoking = ref(false)
async function revokeAll() {
  if (!confirm('Cabut akses semua customer yang masuk dengan kode token? Mereka perlu memasukkan kode lagi untuk mengakses.')) return
  revoking.value = true
  await supabase.from('invitation_editors').delete().eq('invitation_id', props.id)
  revoking.value = false
  await refreshAccess()
}
</script>

<template>
  <div class="border-b border-brand-100 bg-white">
    <div v-if="access?.foreignOwner" class="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900" role="note">
      <strong>Mode admin:</strong> Anda mengelola undangan milik <strong>{{ access.foreignOwner }}</strong>. Perubahan langsung terlihat oleh pemiliknya.
    </div>
    <div v-else-if="access?.isEditor" class="bg-brand-50 px-4 py-2 text-center text-xs text-brand-700" role="note">
      Anda mengelola undangan ini dengan kode token. Perubahan langsung tersimpan dan terlihat oleh reseller/pemesan.
    </div>
    <div class="mx-auto max-w-6xl px-4 pt-4">
      <NuxtLink to="/dashboard" class="text-xs text-brand-500 hover:text-brand">← Semua undangan</NuxtLink>
      <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0">
          <h1 class="truncate font-display text-2xl text-brand">/{{ slug }}</h1>
          <p class="text-xs text-brand-500">Tema {{ themeName }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-if="access?.share?.code" type="button" class="btn-ghost btn-sm" @click="shareOpen = !shareOpen">Bagikan ke customer</button>
          <a :href="url" target="_blank" rel="noopener" class="btn-ghost btn-sm">Buka undangan ↗</a>
        </div>
      </div>
      <div v-if="shareOpen && access?.share?.code" class="mt-3 grid gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm">
        <p class="text-brand-700">
          Customer bisa mengedit undangan, menambah buku tamu, dan melihat RSVP <b>tanpa login</b>: kirim link di bawah
          beserta kode tokennya. Hasil edit Anda tetap; customer melanjutkan dari undangan yang sama.
        </p>
        <div class="grid gap-1">
          <span class="text-xs font-semibold text-brand-500">Link kelola</span>
          <code class="break-all rounded-lg bg-white px-3 py-2 text-brand-900">{{ kelolaUrl }}</code>
        </div>
        <div class="grid gap-1">
          <span class="text-xs font-semibold text-brand-500">Kode token</span>
          <code class="rounded-lg bg-white px-3 py-2 font-mono text-lg tracking-[0.3em] text-brand-900">{{ access.share.code }}</code>
        </div>
        <div class="flex flex-wrap gap-2">
          <a :href="`https://wa.me/?text=${encodeURIComponent(shareText)}`" target="_blank" rel="noopener" class="btn-primary btn-sm">Kirim via WhatsApp</a>
          <button type="button" class="btn-ghost btn-sm" @click="copyShare">{{ copied ? 'Pesan tersalin' : 'Salin pesan' }}</button>
        </div>
        <p class="text-xs text-brand-500">
          {{ access.share.editors ? `${access.share.editors} perangkat customer sudah memiliki akses.` : 'Belum ada customer yang masuk.' }}
          <button v-if="access.share.editors" type="button" class="ml-1 text-red-600 underline" :disabled="revoking" @click="revokeAll">Cabut semua akses</button>
        </p>
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
