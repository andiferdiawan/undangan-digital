<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Paket' })

interface PackageRow { id: number, code: string, name: string, guest_limit: number, price: number, is_active: boolean, sort: number }
type Form = Omit<PackageRow, 'id'>

const supabase = useSupabaseClient()
const { data: packages, refresh } = await useAsyncData('admin-packages', async () => {
  const { data } = await supabase.from('packages').select('*').order('sort').order('id')
  return (data ?? []) as PackageRow[]
})

const editing = ref<number | 'new' | null>(null)
const form = reactive<Form>({ code: '', name: '', guest_limit: 100, price: 0, is_active: true, sort: 0 })
const saving = ref(false)
const msg = ref<{ ok: boolean, text: string } | null>(null)

function startNew() {
  const last = packages.value?.at(-1)
  Object.assign(form, { code: '', name: '', guest_limit: 100, price: 0, is_active: true, sort: (last?.sort ?? 0) + 1 })
  editing.value = 'new'
  msg.value = null
}
function startEdit(p: PackageRow) {
  Object.assign(form, { code: p.code, name: p.name, guest_limit: p.guest_limit, price: p.price, is_active: p.is_active, sort: p.sort })
  editing.value = p.id
  msg.value = null
}

async function save() {
  const payload = {
    code: form.code.trim().toUpperCase().replace(/\s+/g, '-'),
    name: form.name.trim(),
    guest_limit: Math.round(Number(form.guest_limit)),
    price: Math.round(Number(form.price)),
    is_active: form.is_active,
    sort: Math.round(Number(form.sort)) || 0,
  }
  if (!payload.code || !payload.name) { msg.value = { ok: false, text: 'Kode dan nama wajib diisi.' }; return }
  if (!(payload.guest_limit > 0)) { msg.value = { ok: false, text: 'Kuota tamu harus lebih dari 0.' }; return }
  if (!(payload.price >= 0)) { msg.value = { ok: false, text: 'Harga tidak valid.' }; return }

  saving.value = true
  msg.value = null
  const q = editing.value === 'new'
    ? supabase.from('packages').insert(payload as never).select('id')
    : supabase.from('packages').update(payload as never).eq('id', editing.value!).select('id')
  const { data, error } = await q
  saving.value = false
  if (error || !data?.length) {
    msg.value = { ok: false, text: error?.code === '23505' ? 'Kode paket sudah dipakai paket lain.' : error ? friendlyError(error) : 'Perubahan ditolak: hanya admin yang boleh mengubah paket.' }
    return
  }
  const wasNew = editing.value === 'new'
  editing.value = null
  await refresh()
  msg.value = { ok: true, text: wasNew ? 'Paket ditambahkan.' : 'Paket diperbarui. Harga baru berlaku untuk pesanan berikutnya.' }
}

async function toggleActive(p: PackageRow) {
  const { error } = await supabase.from('packages').update({ is_active: !p.is_active } as never).eq('id', p.id)
  if (error) msg.value = { ok: false, text: friendlyError(error) }
  await refresh()
}

async function remove(p: PackageRow) {
  if (!confirm(`Hapus ${p.name}?`)) return
  const { error } = await supabase.from('packages').delete().eq('id', p.id)
  if (error) {
    msg.value = { ok: false, text: error.code === '23503' ? 'Paket ini sudah dipakai pesanan/token sehingga tidak bisa dihapus. Nonaktifkan saja agar tidak tampil lagi.' : friendlyError(error) }
    return
  }
  await refresh()
  msg.value = { ok: true, text: 'Paket dihapus.' }
}
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-4xl px-4 py-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-3xl text-brand">Paket & Harga</h1>
          <p class="mt-1 text-sm text-brand-600">Paket aktif tampil di beranda, halaman tema, checkout, dan token manual. Pesanan lama tetap memakai harga saat dibeli.</p>
        </div>
        <button class="btn-primary btn-sm" @click="startNew">+ Tambah paket</button>
      </div>

      <p v-if="msg" class="mt-4 text-sm" :class="msg.ok ? 'text-green-700' : 'text-red-600'" role="status">{{ msg.text }}</p>

      <form v-if="editing !== null" class="card mt-4 grid gap-3 p-5 sm:grid-cols-2" @submit.prevent="save">
        <h2 class="font-semibold text-brand sm:col-span-2">{{ editing === 'new' ? 'Paket baru' : 'Ubah paket' }}</h2>
        <label class="label">Nama
          <input v-model="form.name" class="input" maxlength="80" placeholder="Paket 100 Tamu" required>
        </label>
        <label class="label">Kode
          <input v-model="form.code" class="input font-mono uppercase" maxlength="40" placeholder="BASIC-100" required>
        </label>
        <label class="label">Harga (Rp)
          <input v-model.number="form.price" type="number" min="0" step="1000" class="input" required>
          <span class="text-xs font-normal text-brand-500">{{ rupiah(Number(form.price) || 0) }}</span>
        </label>
        <label class="label">Kuota tamu
          <input v-model.number="form.guest_limit" type="number" min="1" class="input" required>
        </label>
        <label class="label">Urutan tampil
          <input v-model.number="form.sort" type="number" class="input">
        </label>
        <label class="flex items-center gap-2 self-end pb-3 text-sm font-medium text-brand-800">
          <input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-[#2f4a3a]"> Aktif (dijual)
        </label>
        <div class="flex gap-2 sm:col-span-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
          <button type="button" class="btn-ghost" @click="editing = null">Batal</button>
        </div>
      </form>

      <div class="mt-4 grid gap-3">
        <div v-for="p in packages" :key="p.id" class="card flex flex-wrap items-center justify-between gap-3 p-4" :class="!p.is_active && 'opacity-60'">
          <div class="min-w-0">
            <p class="font-semibold text-brand">
              {{ p.name }}
              <span v-if="!p.is_active" class="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-600">nonaktif</span>
            </p>
            <p class="text-xs text-brand-500"><span class="font-mono">{{ p.code }}</span> · {{ p.guest_limit }} tamu · urutan {{ p.sort }}</p>
          </div>
          <div class="flex items-center gap-2">
            <p class="font-display text-xl text-brand">{{ rupiah(p.price) }}</p>
            <button class="btn-ghost btn-sm" @click="startEdit(p)">Ubah</button>
            <button class="btn-ghost btn-sm" @click="toggleActive(p)">{{ p.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
            <button class="btn-ghost btn-sm text-red-600" @click="remove(p)">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
