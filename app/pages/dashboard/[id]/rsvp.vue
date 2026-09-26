<script setup lang="ts">
import type { RsvpRow } from '#shared/types/models'

const route = useRoute()
const id = String(route.params.id)
const supabase = useSupabaseClient()
const { data: inv } = await useInvitation(id)
useSeoMeta({ title: 'RSVP & Ucapan' })

const { data: rsvps, refresh } = await useAsyncData(`rsvps-${id}`, async () => {
  const { data } = await supabase.from('rsvps').select('*').eq('invitation_id', id).order('created_at', { ascending: false })
  return (data ?? []) as RsvpRow[]
})

const filter = ref<'semua' | RsvpRow['attendance']>('semua')
const shown = computed(() => (rsvps.value ?? []).filter(r => filter.value === 'semua' || r.attendance === filter.value))
const stats = computed(() => {
  const list = rsvps.value ?? []
  const hadir = list.filter(r => r.attendance === 'hadir')
  return {
    hadir: hadir.length,
    pax: hadir.reduce((s, r) => s + r.pax, 0),
    ragu: list.filter(r => r.attendance === 'ragu').length,
    tidak: list.filter(r => r.attendance === 'tidak_hadir').length,
  }
})
const label = { hadir: 'Hadir', ragu: 'Ragu', tidak_hadir: 'Tidak hadir' } as const

async function toggle(r: RsvpRow) {
  const { data, error } = await supabase.from('rsvps').update({ is_visible: !r.is_visible } as never).eq('id', r.id).select('id')
  if (error || !data?.length) alert(error ? friendlyError(error) : 'Perubahan ditolak: akun ini tidak punya akses.')
  await refresh()
}
async function remove(r: RsvpRow) {
  if (!confirm('Hapus RSVP ini?')) return
  const { data, error } = await supabase.from('rsvps').delete().eq('id', r.id).select('id')
  if (error || !data?.length) alert(error ? friendlyError(error) : 'Gagal menghapus: akun ini tidak punya akses.')
  await refresh()
}
function exportCsv() {
  const rows = [['Nama', 'Kehadiran', 'Jumlah', 'Ucapan', 'Waktu'], ...(rsvps.value ?? []).map(r => [r.name, label[r.attendance], r.pax, r.message ?? '', tanggal(r.created_at, true)])]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv' }))
  a.download = `rsvp-${inv.value?.slug}.csv`
  a.click()
}
</script>

<template>
  <div v-if="inv">
    <DashHeader :id="id" :slug="inv.slug" :theme-name="inv.theme.name" />
    <div class="mx-auto grid max-w-4xl gap-4 px-4 py-5">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="card p-4"><p class="text-xs text-brand-500">Hadir</p><p class="font-display text-3xl text-brand">{{ stats.hadir }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Total orang</p><p class="font-display text-3xl text-brand">{{ stats.pax }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Ragu</p><p class="font-display text-3xl text-clay-600">{{ stats.ragu }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Tidak hadir</p><p class="font-display text-3xl text-brand-400">{{ stats.tidak }}</p></div>
      </div>

      <div class="card">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-brand-50 p-3">
          <div class="flex gap-1 overflow-x-auto text-xs font-semibold">
            <button
              v-for="f in (['semua', 'hadir', 'ragu', 'tidak_hadir'] as const)" :key="f"
              class="shrink-0 rounded-full px-3 py-1.5" :class="filter === f ? 'bg-brand text-white' : 'text-brand-600'"
              @click="filter = f"
            >
              {{ f === 'semua' ? 'Semua' : label[f] }}
            </button>
          </div>
          <button class="btn-ghost btn-sm" :disabled="!rsvps?.length" @click="exportCsv">Export CSV</button>
        </div>
        <ul v-if="shown.length" class="divide-y divide-brand-50">
          <li v-for="r in shown" :key="r.id" class="p-4" :class="!r.is_visible && 'opacity-60'">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-brand-900">{{ r.name }}</p>
                <p class="text-xs text-brand-500">{{ label[r.attendance] }}<span v-if="r.attendance !== 'tidak_hadir'"> · {{ r.pax }} orang</span> · {{ tanggal(r.created_at, true) }}</p>
              </div>
              <div class="flex shrink-0 gap-3 text-xs">
                <button v-if="r.message" class="text-brand-600" @click="toggle(r)">{{ r.is_visible ? 'Sembunyikan' : 'Tampilkan' }}</button>
                <button class="text-red-600" @click="remove(r)">Hapus</button>
              </div>
            </div>
            <p v-if="r.message" class="mt-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{{ r.message }}</p>
          </li>
        </ul>
        <p v-else class="p-8 text-center text-sm text-brand-500">Belum ada konfirmasi.</p>
      </div>
    </div>
  </div>
</template>
