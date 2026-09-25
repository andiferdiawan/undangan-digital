<script setup lang="ts">
// Link pendek reseller: /r/KODE → simpan referral lalu ke katalog
const route = useRoute()
const code = String(route.params.code).toUpperCase()
if (/^[A-Z0-9]{4,12}$/.test(code)) {
  useCookie('ref', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', path: '/' }).value = code
}
await navigateTo('/', { replace: true })
</script>

<template>
  <div />
</template>
