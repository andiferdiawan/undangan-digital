<script setup lang="ts">
useSeoMeta({
  title: 'Program Reseller Undangan Digital',
  description: 'Jadi reseller Undangan Virtual: jual undangan pernikahan digital tanpa modal dan tanpa desain, dapatkan bagi hasil dari setiap penjualan, pencairan dua kali sebulan.',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { data: settings } = await useAsyncData('settings-public', async () => {
  const { data } = await supabase.from('app_settings').select('default_reseller_rate, payout_days, min_payout').single()
  return data as { default_reseller_rate: number, payout_days: number[], min_payout: number } | null
})

// Status reseller user yang sedang login
const { data: mine, refresh } = await useAsyncData('my-reseller', async () => {
  const uid = (user.value as { sub?: string } | null)?.sub
  if (!uid) return null
  const { data } = await supabase.from('resellers').select('status, code').eq('id', uid).maybeSingle()
  return data as { status: string, code: string } | null
}, { watch: [user] })

const account = reactive({ email: '', password: '' })
const form = reactive({ business_name: '', whatsapp: '', bank_name: '', account_number: '', account_holder: '', code: '' })
const busy = ref(false)
const error = ref('')
const done = ref(false)

function phone62(v: string) {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('0')) d = `62${d.slice(1)}`
  else if (d.startsWith('8')) d = `62${d}`
  return d
}

async function submit() {
  error.value = ''
  busy.value = true
  try {
    if (!user.value) {
      if (account.password.length < 8) throw new Error('Password minimal 8 karakter.')
      const { data, error: err } = await supabase.auth.signUp({
        email: account.email.trim(),
        password: account.password,
        options: { data: { full_name: form.business_name }, emailRedirectTo: `${window.location.origin}/reseller` },
      })
      if (err) throw err
      if (!data.session) {
        error.value = 'Akun dibuat. Konfirmasi email Anda, lalu masuk dan lengkapi pendaftaran reseller di halaman ini.'
        return
      }
    }
    const { error: err } = await supabase.rpc('apply_reseller', {
      p_business_name: form.business_name,
      p_whatsapp: phone62(form.whatsapp),
      p_bank_name: form.bank_name,
      p_account_number: form.account_number.replace(/\D/g, ''),
      p_account_holder: form.account_holder,
      p_code: form.code || null,
    } as never)
    if (err) throw err
    done.value = true
    await refresh()
  }
  catch (e: any) {
    const m = e?.message ?? ''
    error.value = m.includes('CODE_TAKEN') ? 'Kode reseller sudah dipakai, coba yang lain.'
      : m.includes('ALREADY_APPLIED') ? 'Anda sudah terdaftar sebagai reseller.'
        : m.includes('check constraint') ? 'Periksa kembali data: nomor WA, nomor rekening (angka saja), dan kode (4–12 huruf/angka).'
          : friendlyError(e)
  }
  finally {
    busy.value = false
  }
}

const days = computed(() => settings.value?.payout_days?.join(' & ') ?? '5 & 25')
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <div class="grid gap-8 md:grid-cols-2">
      <div>
        <span class="chip bg-clay-100 text-clay-700">Program Reseller</span>
        <h1 class="mt-3 font-display text-4xl leading-tight text-brand">Jual undangan digital, dapatkan <span class="text-clay">{{ settings?.default_reseller_rate ?? 30 }}%</span> dari setiap penjualan.</h1>
        <p class="mt-4 text-brand-600">Tanpa stok, tanpa desain. Bagikan link Anda atau buatkan link pembayaran untuk pelanggan. Semua pembayaran diproses platform secara otomatis, komisi langsung masuk saldo Anda.</p>
        <ul class="mt-6 grid gap-3 text-sm text-brand-800">
          <li class="card flex items-start gap-4 p-4">
            <FeatureIcon name="link" />
            <div><h2 class="font-semibold text-brand-900">Link referral pribadi</h2><p class="mt-1 text-brand-600">Pembeli lewat link Anda otomatis tercatat sebagai penjualan Anda, dan tombol WhatsApp mengarah ke nomor Anda.</p></div>
          </li>
          <li class="card flex items-start gap-4 p-4">
            <FeatureIcon name="receipt" />
            <div><h2 class="font-semibold text-brand-900">Buat pesanan untuk pelanggan</h2><p class="mt-1 text-brand-600">Kirim link pembayaran, token aktivasi muncul di dashboard Anda setelah lunas.</p></div>
          </li>
          <li class="card flex items-start gap-4 p-4">
            <FeatureIcon name="wallet" />
            <div><h2 class="font-semibold text-brand-900">Pencairan tanggal {{ days }}</h2><p class="mt-1 text-brand-600">Ajukan kapan saja, minimal {{ rupiah(settings?.min_payout ?? 50000) }}, ditransfer ke rekening Anda.</p></div>
          </li>
        </ul>
      </div>

      <div>
        <div v-if="mine?.status === 'active'" class="card p-6 text-center">
          <p class="font-semibold text-brand-900">Akun reseller Anda aktif ({{ mine.code }})</p>
          <NuxtLink to="/reseller/dashboard" class="btn-primary mt-4">Buka Dashboard Reseller</NuxtLink>
        </div>
        <div v-else-if="mine?.status === 'pending' || done" class="card p-6 text-center">
          <FeatureIcon name="pending" class="mx-auto" />
          <p class="mt-2 font-semibold text-brand-900">Pendaftaran sedang ditinjau</p>
          <p class="mt-1 text-sm text-brand-600">Admin akan mengaktifkan akun Anda. Setelah aktif, dashboard reseller bisa dibuka.</p>
          <NuxtLink to="/reseller/dashboard" class="btn-ghost mt-4">Cek status</NuxtLink>
        </div>
        <div v-else-if="mine?.status === 'suspended'" class="card p-6 text-center text-sm text-brand-700">
          Akun reseller Anda sedang dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.
        </div>

        <form v-else class="card grid gap-3 p-6" @submit.prevent="submit">
          <h2 class="font-display text-2xl text-brand">Daftar Reseller</h2>
          <p v-if="mine?.status === 'rejected'" class="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Pendaftaran sebelumnya belum disetujui. Anda bisa memperbaiki data dan mengajukan ulang.</p>
          <template v-if="!user">
            <label class="label">Email
              <input v-model="account.email" type="email" class="input" autocomplete="email" required>
            </label>
            <label class="label">Password
              <input v-model="account.password" type="password" class="input" autocomplete="new-password" minlength="8" required>
            </label>
            <p class="text-xs text-brand-500">Sudah punya akun? <NuxtLink to="/masuk" class="font-semibold text-clay-600">Masuk dulu</NuxtLink></p>
          </template>
          <label class="label">Nama usaha / nama Anda
            <input v-model="form.business_name" class="input" maxlength="60" required>
          </label>
          <label class="label">Nomor WhatsApp
            <input v-model="form.whatsapp" type="tel" class="input" placeholder="08xxxxxxxxxx" required>
          </label>
          <label class="label">Kode reseller (opsional)
            <input v-model="form.code" class="input uppercase" maxlength="12" placeholder="Mis. BERKAH">
            <span class="text-xs font-normal text-brand-500">Dipakai di link Anda: /r/KODE. Kosongkan untuk dibuat otomatis.</span>
          </label>
          <div class="grid gap-3 rounded-2xl bg-brand-50/60 p-3">
            <p class="text-sm font-semibold text-brand-800">Rekening pencairan</p>
            <label class="label">Bank / e-wallet
              <input v-model="form.bank_name" class="input" placeholder="BSI, BCA, Mandiri, …" required>
            </label>
            <label class="label">Nomor rekening
              <input v-model="form.account_number" inputmode="numeric" class="input" required>
            </label>
            <label class="label">Atas nama
              <input v-model="form.account_holder" class="input" required>
            </label>
          </div>
          <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
          <button class="btn-primary" :disabled="busy">{{ busy ? 'Mengirim…' : 'Daftar Sekarang' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>
