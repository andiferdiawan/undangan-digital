<script setup lang="ts">
useSeoMeta({ title: 'Aktivasi Token — Buat Akun' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

type TokenInfo = { theme_name: string, theme_code: string, theme_slug: string, package_name: string, guest_limit: number }

const step = ref<1 | 2 | 3>(1)
const token = ref(String(route.query.token ?? '').toUpperCase())
const info = ref<TokenInfo | null>(null)
const loading = ref(false)
const error = ref('')

const form = reactive({ full_name: '', slug: '', email: '', password: '' })
const slugState = ref<'idle' | 'checking' | 'ok' | 'taken'>('idle')

function onTokenInput(e: Event) {
  token.value = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

async function checkToken() {
  error.value = ''
  if (token.value.length !== 6) {
    error.value = 'Token terdiri dari 6 karakter.'
    return
  }
  loading.value = true
  const { data, error: err } = await supabase.rpc('check_token', { p_code: token.value } as never)
  loading.value = false
  const row = (data as TokenInfo[] | null)?.[0]
  if (err || !row) {
    error.value = 'Token tidak ditemukan, sudah dipakai, atau kedaluwarsa. Hubungi admin bila perlu.'
    return
  }
  info.value = row
  step.value = 2
}

let slugTimer: ReturnType<typeof setTimeout> | undefined
watch(() => form.slug, (v) => {
  const clean = slugify(v)
  if (clean !== v) {
    form.slug = clean
    return
  }
  clearTimeout(slugTimer)
  if (clean.length < 3) {
    slugState.value = 'idle'
    return
  }
  slugState.value = 'checking'
  slugTimer = setTimeout(async () => {
    const { data } = await supabase.rpc('is_slug_available', { p_slug: clean } as never)
    if (form.slug === clean) slugState.value = data ? 'ok' : 'taken'
  }, 350)
})

async function submit() {
  error.value = ''
  if (slugState.value !== 'ok') {
    error.value = 'Pilih alamat undangan yang tersedia.'
    return
  }
  loading.value = true

  // User yang sudah login cukup menukar token ke workspace baru
  if (user.value) {
    const { data, error: err } = await supabase.rpc('redeem_token', { p_code: token.value, p_slug: form.slug } as never)
    loading.value = false
    if (err) error.value = friendlyError(err)
    else await navigateTo(`/dashboard/${data}`)
    return
  }

  if (form.password.length < 8) {
    loading.value = false
    error.value = 'Password minimal 8 karakter.'
    return
  }
  const { data, error: err } = await supabase.auth.signUp({
    email: form.email.trim(),
    password: form.password,
    options: {
      data: { token: token.value, slug: form.slug, full_name: form.full_name.trim() },
      emailRedirectTo: `${window.location.origin}/confirm`,
    },
  })
  loading.value = false
  if (err) {
    error.value = friendlyError(err)
    return
  }
  if (data.session) await navigateTo('/dashboard')
  else step.value = 3
}
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-10">
    <ol class="mb-6 flex items-center gap-2 text-xs font-semibold text-brand-500">
      <li :class="step >= 1 && 'text-brand'">1. Token</li>
      <li class="h-px flex-1 bg-brand-100" />
      <li :class="step >= 2 && 'text-brand'">2. Akun</li>
      <li class="h-px flex-1 bg-brand-100" />
      <li :class="step >= 3 && 'text-brand'">3. Selesai</li>
    </ol>

    <!-- Langkah 1: token -->
    <form v-if="step === 1" class="card p-6" @submit.prevent="checkToken">
      <h1 class="font-display text-3xl text-brand">Aktivasi Token</h1>
      <p class="mt-2 text-sm text-brand-600">Masukkan token 6 karakter yang dikirim admin melalui WhatsApp setelah pembayaran.</p>
      <label class="label mt-6">
        Token
        <input
          :value="token" class="input text-center font-mono text-2xl tracking-[0.5em] uppercase"
          inputmode="text" autocomplete="one-time-code" maxlength="6" placeholder="••••••" autofocus
          @input="onTokenInput"
        >
      </label>
      <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>
      <button class="btn-primary mt-5 w-full" :disabled="loading || token.length !== 6">{{ loading ? 'Memeriksa…' : 'Lanjut' }}</button>
      <p class="mt-5 text-center text-sm text-brand-600">
        Belum punya token? <NuxtLink to="/#katalog" class="font-semibold text-clay-600">Pilih tema dulu</NuxtLink>
      </p>
    </form>

    <!-- Langkah 2: akun -->
    <form v-else-if="step === 2 && info" class="card p-6" @submit.prevent="submit">
      <div class="rounded-2xl bg-brand-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Token {{ token }} valid</p>
        <p class="mt-1 font-semibold text-brand-900">{{ info.theme_name }} <span class="font-normal text-brand-500">({{ info.theme_code }})</span></p>
        <p class="text-sm text-brand-600">{{ info.package_name }} · kuota {{ info.guest_limit }} tamu</p>
      </div>

      <div class="mt-5 grid gap-4">
        <label class="label">
          Alamat undangan
          <div class="flex items-center overflow-hidden rounded-xl border border-brand-100 bg-white focus-within:border-brand-400">
            <span class="shrink-0 pl-3.5 text-sm text-brand-400">/</span>
            <input v-model="form.slug" class="w-full bg-transparent px-1 py-2.5 text-base outline-none" placeholder="andi-siti" required minlength="3" maxlength="50">
          </div>
          <span class="text-xs font-normal" :class="{ 'text-brand-500': slugState === 'idle' || slugState === 'checking', 'text-green-700': slugState === 'ok', 'text-red-600': slugState === 'taken' }">
            {{ slugState === 'ok' ? '✓ Tersedia' : slugState === 'taken' ? 'Sudah dipakai atau tidak valid' : slugState === 'checking' ? 'Memeriksa…' : 'Huruf kecil, angka, dan tanda hubung. Contoh: andi-siti' }}
          </span>
        </label>

        <template v-if="!user">
          <label class="label">Nama lengkap
            <input v-model="form.full_name" class="input" autocomplete="name" required>
          </label>
          <label class="label">Email
            <input v-model="form.email" type="email" class="input" autocomplete="email" required>
          </label>
          <label class="label">Password
            <input v-model="form.password" type="password" class="input" autocomplete="new-password" minlength="8" required>
            <span class="text-xs font-normal text-brand-500">Minimal 8 karakter</span>
          </label>
        </template>
        <p v-else class="text-sm text-brand-600">Token akan ditambahkan ke akun Anda yang sedang login.</p>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600" role="alert">{{ error }}</p>
      <button class="btn-primary mt-6 w-full" :disabled="loading">{{ loading ? 'Memproses…' : user ? 'Aktifkan Token' : 'Buat Akun' }}</button>
      <button type="button" class="mt-3 w-full text-sm text-brand-500" @click="step = 1">← Ganti token</button>
    </form>

    <!-- Langkah 3: cek email -->
    <div v-else class="card p-6 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-2xl">✉️</div>
      <h1 class="mt-4 font-display text-2xl text-brand">Cek email Anda</h1>
      <p class="mt-2 text-sm text-brand-600">
        Kami mengirim link konfirmasi ke <b>{{ form.email }}</b>. Setelah dikonfirmasi, workspace undangan Anda langsung siap dengan tema <b>{{ info?.theme_name }}</b>.
      </p>
      <NuxtLink to="/masuk" class="btn-ghost mt-6">Ke halaman masuk</NuxtLink>
    </div>
  </div>
</template>
