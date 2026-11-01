<script setup lang="ts">
/**
 * Akses customer tanpa login: reseller membagikan link /kelola/<slug>, customer cukup memasukkan kode token
 * pesanan. Browser customer memakai sesi anonim, lalu claim_invitation_access() mendaftarkannya sebagai editor
 * undangan (isi undangan, buku tamu, RSVP). Pemilik undangan tetap reseller/pemesan.
 */
useSeoMeta({ title: 'Kelola Undangan', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const route = useRoute()
const slug = String(route.params.slug).toLowerCase()

const code = ref(String(route.query.kode ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
const loading = ref(false)
const error = ref('')

function onInput(e: Event) {
  code.value = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

async function submit() {
  error.value = ''
  if (code.value.length !== 6) {
    error.value = 'Kode token terdiri dari 6 karakter.'
    return
  }
  loading.value = true
  try {
    // Tanpa akun: buat sesi anonim di browser ini (tetap tersimpan sampai keluar / data browser dihapus)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { error: authErr } = await supabase.auth.signInAnonymously()
      if (authErr) {
        error.value = /anonymous/i.test(authErr.message)
          ? 'Akses tanpa login belum diaktifkan. Hubungi admin Undangan Virtual.'
          : friendlyError(authErr)
        return
      }
    }
    const { data, error: err } = await supabase.rpc('claim_invitation_access', { p_slug: slug, p_code: code.value } as never)
    if (err) {
      error.value = err.message.includes('TOO_MANY_ATTEMPTS')
        ? 'Terlalu banyak percobaan kode yang salah. Coba lagi 1 jam lagi.'
        : err.message.includes('INVALID_CODE')
          ? 'Kode token tidak cocok untuk undangan ini. Periksa kembali kode dari reseller/admin.'
          : friendlyError(err)
      return
    }
    await navigateTo(`/dashboard/${data}`)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10">
    <form class="card p-6" @submit.prevent="submit">
      <p class="text-xs font-semibold uppercase tracking-wider text-clay-600">Kelola undangan</p>
      <h1 class="mt-1 break-all font-display text-3xl text-brand">/{{ slug }}</h1>
      <p class="mt-2 text-sm text-brand-600">
        Masukkan <b>kode token</b> pesanan undangan ini (6 karakter) untuk mengedit undangan, menambah daftar tamu,
        dan melihat RSVP — tanpa perlu membuat akun.
      </p>
      <label class="label mt-6">
        Kode token
        <input
          :value="code" class="input text-center font-mono text-2xl tracking-[0.5em] uppercase"
          inputmode="text" autocomplete="one-time-code" maxlength="6" placeholder="••••••" autofocus
          @input="onInput"
        >
      </label>
      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      <button class="btn-primary mt-5 w-full" :disabled="loading || code.length !== 6">
        {{ loading ? 'Memeriksa…' : 'Kelola undangan' }}
      </button>
      <p class="mt-4 text-xs text-brand-500">
        Akses tersimpan di browser ini. Bila memakai HP/browser lain, masukkan kode yang sama lagi.
      </p>
    </form>
  </div>
</template>
