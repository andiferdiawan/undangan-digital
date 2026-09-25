<script setup lang="ts">
useSeoMeta({ title: 'Masuk' })
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const info = ref('')

watch(user, (u) => { if (u) navigateTo(redirect.pluck() || '/dashboard') }, { immediate: true })

async function login() {
  error.value = ''
  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
  loading.value = false
  if (err) error.value = friendlyError(err)
}

async function forgot() {
  error.value = ''
  if (!form.email) {
    error.value = 'Isi email Anda terlebih dahulu.'
    return
  }
  const { error: err } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${window.location.origin}/reset-password` })
  if (err) error.value = friendlyError(err)
  else info.value = 'Link reset password telah dikirim ke email Anda.'
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12">
    <form class="card p-6" @submit.prevent="login">
      <h1 class="font-display text-3xl text-brand">Masuk</h1>
      <p class="mt-2 text-sm text-brand-600">Kelola undangan, daftar tamu, dan RSVP Anda.</p>
      <div class="mt-6 grid gap-4">
        <label class="label">Email
          <input v-model="form.email" type="email" class="input" autocomplete="email" required>
        </label>
        <label class="label">Password
          <input v-model="form.password" type="password" class="input" autocomplete="current-password" required>
        </label>
      </div>
      <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>
      <p v-if="info" class="mt-3 text-sm text-green-700">{{ info }}</p>
      <button class="btn-primary mt-5 w-full" :disabled="loading">{{ loading ? 'Masuk…' : 'Masuk' }}</button>
      <button type="button" class="mt-3 w-full text-sm text-brand-500 hover:text-brand" @click="forgot">Lupa password?</button>
    </form>
    <p class="mt-5 text-center text-sm text-brand-600">
      Baru membeli tema? <NuxtLink to="/daftar" class="font-semibold text-clay-600">Aktifkan token</NuxtLink>
    </p>
  </div>
</template>
