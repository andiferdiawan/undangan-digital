<script setup lang="ts">
import { withDefaults as contentWithDefaults } from '#shared/theme/content'

useSeoMeta({ title: 'Dashboard' })
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { profile, refresh } = useProfile()
await refresh()

const { data: list } = await useAsyncData('my-invitations', async () => {
  const { data } = await supabase
    .from('invitations')
    .select('id, slug, guest_limit, content, is_published, updated_at, theme:themes(name, code), guests(count), rsvps(count)')
    // Admin bisa membaca semua undangan (RLS); dashboard pribadi hanya milik akun ini.
    .eq('owner_id', (user.value as { sub?: string } | null)?.sub ?? '')
    .order('created_at', { ascending: false })
  return (data ?? []) as any[]
})

const { data: isReseller } = await useAsyncData('is-reseller', async () => {
  const { data } = await supabase.from('resellers').select('status').maybeSingle()
  return !!data
})

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/')
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm text-brand-500">Assalamu'alaikum,</p>
        <h1 class="font-display text-3xl text-brand">{{ profile?.full_name || profile?.email || 'Pengguna' }}</h1>
      </div>
      <button class="btn-ghost btn-sm" @click="logout">Keluar</button>
    </div>

    <NuxtLink v-if="isReseller" to="/reseller/dashboard" class="card mt-6 flex items-center justify-between p-4 hover:ring-brand-300">
      <span><b class="text-brand-900">Dashboard Reseller</b><span class="block text-xs text-brand-500">Penjualan, komisi, dan pencairan saldo</span></span>
      <span class="text-brand-300">›</span>
    </NuxtLink>

    <div class="mt-8 flex items-center justify-between">
      <h2 class="font-semibold text-brand-900">Undangan Saya</h2>
      <NuxtLink to="/daftar" class="btn-accent btn-sm">+ Aktifkan token</NuxtLink>
    </div>

    <div v-if="list?.length" class="mt-4 grid gap-3">
      <NuxtLink v-for="inv in list" :key="inv.id" :to="`/dashboard/${inv.id}`" class="card flex items-center gap-4 p-4 transition hover:ring-brand-300">
        <div class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display text-lg text-brand">
          {{ contentWithDefaults(inv.content).groom.nickname.charAt(0) }}&amp;{{ contentWithDefaults(inv.content).bride.nickname.charAt(0) }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-brand-900">
            {{ contentWithDefaults(inv.content).groom.nickname }} &amp; {{ contentWithDefaults(inv.content).bride.nickname }}
          </p>
          <p class="truncate text-xs text-brand-500">/{{ inv.slug }} · {{ inv.theme?.name }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span class="chip bg-brand-50 text-brand-700">{{ inv.guests?.[0]?.count ?? 0 }}/{{ inv.guest_limit }} tamu</span>
            <span class="chip bg-clay-50 text-clay-700">{{ inv.rsvps?.[0]?.count ?? 0 }} RSVP</span>
            <span v-if="!inv.is_published" class="chip bg-gray-100 text-gray-600">Draf</span>
          </div>
        </div>
        <span class="text-brand-300">›</span>
      </NuxtLink>
    </div>

    <div v-else class="card mt-4 p-8 text-center">
      <p class="font-semibold text-brand-900">Belum ada undangan</p>
      <p class="mt-1 text-sm text-brand-600">Aktifkan token dari admin untuk membuat workspace undangan pertama Anda.</p>
      <NuxtLink to="/daftar" class="btn-primary mt-5">Aktifkan Token</NuxtLink>
    </div>
  </div>
</template>
