<script setup lang="ts">
const config = useRuntimeConfig()
const user = useSupabaseUser()
const { profile, refresh } = useProfile()
watch(user, () => refresh(), { immediate: true })
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <div class="min-h-screen bg-cream">
    <header class="sticky top-0 z-40 border-b border-brand-100/70 bg-cream/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <svg viewBox="0 0 100 100" class="h-5 w-5" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7"><rect x="22" y="22" width="56" height="56" /><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" /></g></svg>
          </span>
          <span class="font-display text-xl text-brand">{{ config.public.siteName }}</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-medium text-brand-700 md:flex">
          <NuxtLink to="/#katalog" class="hover:text-brand">Katalog Tema</NuxtLink>
          <NuxtLink to="/#harga" class="hover:text-brand">Harga</NuxtLink>
          <NuxtLink to="/daftar" class="hover:text-brand">Punya Token?</NuxtLink>
          <NuxtLink v-if="profile?.role === 'admin'" to="/admin" class="hover:text-brand">Admin</NuxtLink>
          <NuxtLink v-if="user" to="/dashboard" class="btn-primary btn-sm">Dashboard</NuxtLink>
          <NuxtLink v-else to="/masuk" class="btn-ghost btn-sm">Masuk</NuxtLink>
        </nav>

        <button class="grid h-10 w-10 place-items-center rounded-xl text-brand md:hidden" aria-label="Menu" @click="menuOpen = !menuOpen">
          <svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" /></svg>
        </button>
      </div>
      <nav v-if="menuOpen" class="grid gap-1 border-t border-brand-100 bg-cream px-4 py-3 text-sm font-medium text-brand-800 md:hidden">
        <NuxtLink to="/#katalog" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Katalog Tema</NuxtLink>
        <NuxtLink to="/#harga" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Harga</NuxtLink>
        <NuxtLink to="/daftar" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Punya Token? Daftar</NuxtLink>
        <NuxtLink v-if="profile?.role === 'admin'" to="/admin" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Admin</NuxtLink>
        <NuxtLink v-if="user" to="/dashboard" class="btn-primary mt-1">Dashboard</NuxtLink>
        <NuxtLink v-else to="/masuk" class="btn-ghost mt-1">Masuk</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-16 border-t border-brand-100 py-8 text-center text-xs text-brand-500">
      © {{ new Date().getFullYear() }} {{ config.public.siteName }} · Undangan digital untuk momen sakral Anda
    </footer>
  </div>
</template>
