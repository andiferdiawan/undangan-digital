<script setup lang="ts">
const route = useRoute()
const links = [
  { to: '/admin', label: 'Analitik' },
  { to: '/admin/pesanan', label: 'Pesanan' },
  { to: '/admin/reseller', label: 'Reseller' },
  { to: '/admin/pencairan', label: 'Pencairan' },
  { to: '/admin/token', label: 'Token Manual' },
  { to: '/admin/tema', label: 'Tema' },
  { to: '/admin/tema/baru', label: 'Generate AI' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/pengaturan', label: 'Pengaturan' },
]
const isActive = (to: string) => to === '/admin' ? route.path === '/admin' : route.path === to || (to === '/admin/tema' && /^\/admin\/tema\/(?!baru)/.test(route.path))
</script>

<template>
  <nav class="border-b border-brand-100 bg-white">
    <div class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
      <NuxtLink
        v-for="l in links" :key="l.to" :to="l.to"
        class="shrink-0 border-b-2 px-3 py-3 text-sm font-medium"
        :class="isActive(l.to) ? 'border-clay text-brand' : 'border-transparent text-brand-500 hover:text-brand'"
      >
        {{ l.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
