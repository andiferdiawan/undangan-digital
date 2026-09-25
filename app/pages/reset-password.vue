<script setup lang="ts">
useSeoMeta({ title: 'Atur Ulang Password' })
const supabase = useSupabaseClient()
const password = ref('')
const done = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Password minimal 8 karakter.'
    return
  }
  const { error: err } = await supabase.auth.updateUser({ password: password.value })
  if (err) error.value = friendlyError(err)
  else done.value = true
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12">
    <form class="card p-6" @submit.prevent="save">
      <h1 class="font-display text-2xl text-brand">Password baru</h1>
      <template v-if="!done">
        <label class="label mt-5">Password
          <input v-model="password" type="password" class="input" autocomplete="new-password" required>
        </label>
        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
        <button class="btn-primary mt-5 w-full">Simpan</button>
      </template>
      <template v-else>
        <p class="mt-3 text-sm text-brand-600">Password berhasil diperbarui.</p>
        <NuxtLink to="/dashboard" class="btn-primary mt-5 w-full">Ke Dashboard</NuxtLink>
      </template>
    </form>
  </div>
</template>
