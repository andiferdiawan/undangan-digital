<script setup lang="ts">
import type { GuestRow } from '#shared/types/models'
import { withDefaults as contentWithDefaults } from '#shared/theme/content'

const route = useRoute()
const id = String(route.params.id)
const supabase = useSupabaseClient()
const { data: inv } = await useInvitation(id)
useSeoMeta({ title: 'Buku Tamu' })

const { data: guests, refresh } = await useAsyncData(`guests-${id}`, async () => {
  const { data } = await supabase.from('guests').select('*').eq('invitation_id', id).order('created_at', { ascending: false })
  return (data ?? []) as GuestRow[]
})

const limit = computed(() => inv.value?.guest_limit ?? 0)
const used = computed(() => guests.value?.length ?? 0)
const remaining = computed(() => Math.max(0, limit.value - used.value))
const full = computed(() => remaining.value <= 0)

// ---------- Tambah satu ----------
const one = reactive({ name: '', phone: '', group_name: '' })
const busy = ref(false)
const msg = ref<{ type: 'ok' | 'err', text: string } | null>(null)

async function addOne() {
  msg.value = null
  const name = one.name.trim()
  if (!name) return
  busy.value = true
  const { error } = await supabase.from('guests').insert({
    invitation_id: id, name,
    phone: one.phone.replace(/[^0-9+ -]/g, '') || null,
    group_name: one.group_name.trim() || null,
  } as never)
  busy.value = false
  if (error) {
    msg.value = { type: 'err', text: friendlyError(error) }
    return
  }
  one.name = ''
  one.phone = ''
  await refresh()
}

// ---------- Bulk import ----------
const bulkOpen = ref(false)
const bulkText = ref('')
type Parsed = { name: string, phone: string | null, group_name: string | null }
const parsed = computed<Parsed[]>(() => {
  const existing = new Set((guests.value ?? []).map(g => g.name.toLowerCase()))
  const seen = new Set<string>()
  const out: Parsed[] = []
  for (const line of bulkText.value.split(/\r?\n/)) {
    const [rawName, rawPhone, rawGroup] = line.split(/[,;\t]/).map(s => s?.trim() ?? '')
    const name = (rawName ?? '').replace(/^"|"$/g, '').slice(0, 100)
    if (!name || /^nama$/i.test(name)) continue
    const key = name.toLowerCase()
    if (existing.has(key) || seen.has(key)) continue
    seen.add(key)
    const phone = (rawPhone ?? '').replace(/[^0-9+]/g, '')
    out.push({ name, phone: phone.length >= 6 ? phone : null, group_name: rawGroup || null })
  }
  return out
})

async function onCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) bulkText.value = await file.text()
  ;(e.target as HTMLInputElement).value = ''
}

async function importBulk() {
  msg.value = null
  if (!parsed.value.length) return
  if (parsed.value.length > remaining.value) {
    msg.value = { type: 'err', text: `Sisa kuota ${remaining.value} tamu, tetapi Anda mencoba menambah ${parsed.value.length}. Kurangi daftar atau upgrade paket.` }
    return
  }
  busy.value = true
  const { error } = await supabase.from('guests').insert(parsed.value.map(p => ({ invitation_id: id, ...p })) as never)
  busy.value = false
  if (error) {
    msg.value = { type: 'err', text: friendlyError(error) }
    return
  }
  msg.value = { type: 'ok', text: `${parsed.value.length} tamu ditambahkan.` }
  bulkText.value = ''
  bulkOpen.value = false
  await refresh()
}

// ---------- Daftar, link & share ----------
const q = ref('')
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  return (guests.value ?? []).filter(g => !s || g.name.toLowerCase().includes(s) || (g.group_name ?? '').toLowerCase().includes(s))
})

const content = computed(() => contentWithDefaults(inv.value?.content))
const TEMPLATE_KEY = `wa-template-${id}`
const template = ref(`Assalamu'alaikum Warahmatullahi Wabarakatuh

Kepada Yth. {nama}

Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:

{mempelai}

Informasi lengkap acara dapat dilihat melalui tautan berikut:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Wassalamu'alaikum Warahmatullahi Wabarakatuh`)
onMounted(() => {
  try {
    const saved = localStorage.getItem(TEMPLATE_KEY)
    if (saved) template.value = saved
  }
  catch { /* storage tidak tersedia */ }
})
watch(template, (v) => {
  try { localStorage.setItem(TEMPLATE_KEY, v) }
  catch { /* storage tidak tersedia */ }
})
const templateOpen = ref(false)

const linkFor = (g: GuestRow) => inviteUrl(inv.value!.slug, g.name)
const messageFor = (g: GuestRow) => template.value
  .replaceAll('{nama}', g.name)
  .replaceAll('{link}', linkFor(g))
  .replaceAll('{mempelai}', `${content.value.groom.nickname} & ${content.value.bride.nickname}`)
const waFor = (g: GuestRow) => g.phone
  ? waLink(g.phone.replace(/^0/, '62'), messageFor(g))
  : `https://wa.me/?text=${encodeURIComponent(messageFor(g))}`

const copied = ref<string | null>(null)
async function copy(text: string, key: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* fallback diabaikan */ }
  copied.value = key
  setTimeout(() => (copied.value = null), 1500)
}

async function remove(g: GuestRow) {
  if (!confirm(`Hapus ${g.name} dari daftar tamu?`)) return
  const { data, error } = await supabase.from('guests').delete().eq('id', g.id).select('id')
  if (error || !data?.length) msg.value = { type: 'err', text: error ? friendlyError(error) : 'Gagal menghapus: akun ini tidak punya akses.' }
  await refresh()
}

function exportCsv() {
  const rows = [['Nama', 'Telepon', 'Grup', 'Dibuka', 'Link'], ...(guests.value ?? []).map(g => [g.name, g.phone ?? '', g.group_name ?? '', g.opened_at ? 'Ya' : 'Belum', linkFor(g)])]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv' }))
  a.download = `tamu-${inv.value?.slug}.csv`
  a.click()
}
</script>

<template>
  <div v-if="inv">
    <DashHeader :id="id" :slug="inv.slug" :theme-name="inv.theme.name" />

    <div class="mx-auto grid max-w-4xl gap-4 px-4 py-5">
      <!-- Kuota -->
      <div class="card p-4">
        <div class="flex items-end justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">Kuota tamu</p>
            <p class="font-display text-3xl text-brand">{{ used }}<span class="text-lg text-brand-400">/{{ limit }}</span></p>
          </div>
          <p class="text-sm" :class="full ? 'font-semibold text-red-600' : 'text-brand-600'">{{ full ? 'Kuota penuh' : `Sisa ${remaining}` }}</p>
        </div>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-brand-50">
          <div class="h-full rounded-full transition-all" :class="full ? 'bg-red-500' : 'bg-brand-400'" :style="{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }" />
        </div>
      </div>

      <!-- Tambah -->
      <form class="card grid gap-3 p-4" @submit.prevent="addOne">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-brand-900">Tambah tamu</h2>
          <button type="button" class="text-sm font-semibold text-clay-600" @click="bulkOpen = !bulkOpen">{{ bulkOpen ? 'Tutup import' : 'Import massal' }}</button>
        </div>

        <template v-if="!bulkOpen">
          <input v-model="one.name" class="input" placeholder="Nama tamu, mis. Bapak Budi & Keluarga" maxlength="100" :disabled="full">
          <div class="grid grid-cols-2 gap-2">
            <input v-model="one.phone" class="input" placeholder="No. WA (opsional)" inputmode="tel" :disabled="full">
            <input v-model="one.group_name" class="input" placeholder="Grup (opsional)" maxlength="50" :disabled="full">
          </div>
          <button class="btn-primary" :disabled="busy || full || !one.name.trim()">{{ full ? 'Kuota penuh' : 'Tambah' }}</button>
        </template>

        <template v-else>
          <p class="text-xs text-brand-600">Satu tamu per baris. Format: <code class="rounded bg-brand-50 px-1">Nama, No WA, Grup</code> (No WA & grup opsional). Bisa juga unggah file CSV/TXT.</p>
          <textarea v-model="bulkText" rows="7" class="input font-mono text-sm" placeholder="Bapak Budi & Keluarga, 081234567890, Kantor&#10;Ibu Siti&#10;Keluarga Pak RT, , Tetangga" />
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label class="btn-ghost btn-sm cursor-pointer">
              Unggah CSV
              <input type="file" accept=".csv,.txt,text/csv,text/plain" class="sr-only" @change="onCsv">
            </label>
            <span class="text-sm" :class="parsed.length > remaining ? 'font-semibold text-red-600' : 'text-brand-600'">
              {{ parsed.length }} nama baru · sisa kuota {{ remaining }}
            </span>
          </div>
          <button type="button" class="btn-primary" :disabled="busy || !parsed.length || parsed.length > remaining" @click="importBulk">
            Import {{ parsed.length }} tamu
          </button>
        </template>

        <p v-if="msg" class="text-sm" :class="msg.type === 'err' ? 'text-red-600' : 'text-green-700'" role="status">{{ msg.text }}</p>
      </form>

      <!-- Template pesan -->
      <div class="card p-4">
        <button type="button" class="flex w-full items-center justify-between text-left" @click="templateOpen = !templateOpen">
          <span class="font-semibold text-brand-900">Template pesan WhatsApp</span>
          <span class="text-brand-400">{{ templateOpen ? '−' : '+' }}</span>
        </button>
        <div v-if="templateOpen" class="mt-3 grid gap-2">
          <textarea v-model="template" rows="10" class="input text-sm" />
          <p class="text-xs text-brand-500">Gunakan <code>{nama}</code>, <code>{link}</code>, dan <code>{mempelai}</code>.</p>
        </div>
      </div>

      <!-- Daftar -->
      <div class="card">
        <div class="flex flex-wrap items-center gap-2 border-b border-brand-50 p-4">
          <input v-model="q" type="search" class="input flex-1" placeholder="Cari nama atau grup…">
          <button class="btn-ghost btn-sm" :disabled="!guests?.length" @click="exportCsv">Export CSV</button>
        </div>
        <ul v-if="shown.length" class="divide-y divide-brand-50">
          <li v-for="g in shown" :key="g.id" class="grid gap-2 p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold text-brand-900">{{ g.name }}</p>
                <p class="text-xs text-brand-500">
                  <span v-if="g.group_name">{{ g.group_name }} · </span>
                  <span v-if="g.phone">{{ g.phone }} · </span>
                  <span :class="g.opened_at ? 'text-green-700' : ''">{{ g.opened_at ? `Dibuka ${tanggal(g.opened_at, true)}` : 'Belum dibuka' }}</span>
                </p>
              </div>
              <button class="shrink-0 text-xs text-red-600" @click="remove(g)">Hapus</button>
            </div>
            <p class="truncate rounded-lg bg-brand-50 px-2.5 py-1.5 font-mono text-[11px] text-brand-700">{{ linkFor(g) }}</p>
            <div class="grid grid-cols-3 gap-2">
              <button class="btn-ghost btn-sm px-2" @click="copy(linkFor(g), `l-${g.id}`)">{{ copied === `l-${g.id}` ? '✓ Disalin' : 'Salin link' }}</button>
              <button class="btn-ghost btn-sm px-2" @click="copy(messageFor(g), `m-${g.id}`)">{{ copied === `m-${g.id}` ? '✓ Disalin' : 'Salin pesan' }}</button>
              <a :href="waFor(g)" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] px-2 text-white">WhatsApp</a>
            </div>
          </li>
        </ul>
        <p v-else class="p-8 text-center text-sm text-brand-500">{{ guests?.length ? 'Tidak ada yang cocok.' : 'Belum ada tamu. Tambahkan nama tamu untuk membuat link personal.' }}</p>
      </div>
    </div>
  </div>
</template>
