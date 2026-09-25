<script setup lang="ts">
const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()
watch(user, (u) => { if (u) navigateTo(redirect.pluck() || '/dashboard') }, { immediate: true })
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-20 text-center text-brand-600">
    Mengonfirmasi akun Anda…
  </div>
</template>
