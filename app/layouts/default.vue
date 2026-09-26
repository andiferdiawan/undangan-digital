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
        <NuxtLink to="/" class="flex items-center gap-2" :aria-label="`${config.public.siteName} — beranda`">
          <img src="/logo-mark.svg" alt="" width="40" height="40" class="h-10 w-10">
          <span class="font-display text-xl text-brand">{{ config.public.siteName }}</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-medium text-brand-700 md:flex">
          <NuxtLink to="/#katalog" class="hover:text-brand">Katalog Tema</NuxtLink>
          <NuxtLink to="/#harga" class="hover:text-brand">Harga</NuxtLink>
          <NuxtLink to="/reseller" class="hover:text-brand">Reseller</NuxtLink>
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
        <NuxtLink to="/reseller" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Program Reseller</NuxtLink>
        <NuxtLink to="/daftar" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Punya Token? Daftar</NuxtLink>
        <NuxtLink v-if="profile?.role === 'admin'" to="/admin" class="rounded-lg px-3 py-2.5 hover:bg-brand-50">Admin</NuxtLink>
        <NuxtLink v-if="user" to="/dashboard" class="btn-primary mt-1">Dashboard</NuxtLink>
        <NuxtLink v-else to="/masuk" class="btn-ghost mt-1">Masuk</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-16 border-t border-brand-100 py-10 text-center text-xs text-brand-500">
      <p class="font-display text-lg text-brand">{{ config.public.siteName }}</p>
      <p class="mt-1 italic text-clay-600">{{ BRAND.tagline }}</p>
      <nav class="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-brand-600" aria-label="Tautan footer">
        <NuxtLink to="/#katalog" class="hover:text-brand">Katalog Tema</NuxtLink>
        <NuxtLink to="/#harga" class="hover:text-brand">Harga</NuxtLink>
        <NuxtLink to="/#faq" class="hover:text-brand">FAQ</NuxtLink>
        <NuxtLink to="/reseller" class="hover:text-brand">Program Reseller</NuxtLink>
        <a :href="waLink(config.public.adminWhatsapp, 'Assalamu\'alaikum, saya ingin bertanya tentang Undangan Virtual.')" target="_blank" rel="noopener" class="hover:text-brand">Hubungi Kami</a>
      </nav>
      <nav class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-brand-500" aria-label="Informasi & kebijakan">
        <NuxtLink to="/tentang-kami" class="hover:text-brand">Tentang Kami</NuxtLink>
        <NuxtLink to="/syarat-ketentuan" class="hover:text-brand">Syarat & Ketentuan</NuxtLink>
        <NuxtLink to="/kebijakan-privasi" class="hover:text-brand">Kebijakan Privasi</NuxtLink>
        <NuxtLink to="/kebijakan-pengembalian" class="hover:text-brand">Kebijakan Pengembalian Dana</NuxtLink>
        <NuxtLink to="/kontak" class="hover:text-brand">Kontak</NuxtLink>
      </nav>
      <p class="mt-4">© {{ new Date().getFullYear() }} {{ config.public.siteName }} · Undangan pernikahan digital syar'i & modern</p>
    </footer>
  </div>
</template>
