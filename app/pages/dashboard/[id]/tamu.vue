<script setup lang="ts">
import type { GuestRow } from '#shared/types/models'
import { withDefaults as contentWithDefaults, inviteNames } from '#shared/theme/content'

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
    phone: normalizePhoneId(one.phone) ?? (one.phone.replace(/[^0-9+ -]/g, '').slice(0, 20) || null),
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
    out.push({ name, phone: normalizePhoneId(phone) ?? (phone.length >= 6 ? phone.slice(0, 20) : null), group_name: rawGroup?.slice(0, 50) || null })
  }
  return out
})

async function onCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) bulkText.value = await file.text()
  ;(e.target as HTMLInputElement).value = ''
}

/** Simpan banyak tamu sekaligus (import teks/CSV & kontak HP). */
async function insertGuests(rows: Parsed[]) {
  msg.value = null
  if (!rows.length) return false
  if (rows.length > remaining.value) {
    msg.value = { type: 'err', text: `Sisa kuota ${remaining.value} tamu, tetapi Anda mencoba menambah ${rows.length}. Kurangi daftar atau upgrade paket.` }
    return false
  }
  busy.value = true
  const { error } = await supabase.from('guests').insert(rows.map(p => ({ invitation_id: id, ...p })) as never)
  busy.value = false
  if (error) {
    msg.value = { type: 'err', text: friendlyError(error) }
    return false
  }
  msg.value = { type: 'ok', text: `${rows.length} tamu ditambahkan.` }
  await refresh()
  return true
}

async function importBulk() {
  if (!await insertGuests(parsed.value)) return
  bulkText.value = ''
  bulkOpen.value = false
}

const contactImport = ref<{ close: () => void } | null>(null)
async function importContacts(rows: Parsed[]) {
  if (await insertGuests(rows)) contactImport.value?.close()
}

// ---------- Daftar, link & share ----------
const q = ref('')
type Tab = 'all' | 'unsent' | 'sent' | 'opened'
const tab = ref<Tab>('all')
const TABS: { key: Tab, label: string, short: string }[] = [
  { key: 'all', label: 'Semua', short: 'Semua' },
  { key: 'unsent', label: 'Belum dikirim', short: 'Belum' },
  { key: 'sent', label: 'Terkirim', short: 'Terkirim' },
  { key: 'opened', label: 'Dibuka', short: 'Dibuka' },
]
const inTab = (g: GuestRow, t: Tab) => t === 'all' || (t === 'unsent' ? !g.sent_at : t === 'sent' ? !!g.sent_at : !!g.opened_at)
const tabCount = (t: Tab) => (guests.value ?? []).filter(g => inTab(g, t)).length
const sentCount = computed(() => tabCount('sent'))
// Di tab "Belum dikirim", tamu yang baru dikirim tetap tampil (redup) sampai tab diganti agar daftar tidak meloncat
const keep = ref(new Set<string>())
watch([tab, q], () => { keep.value = new Set() })
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  return (guests.value ?? []).filter(g => (inTab(g, tab.value) || keep.value.has(g.id))
    && (!s || g.name.toLowerCase().includes(s) || (g.group_name ?? '').toLowerCase().includes(s)))
})
/** Tamu berikutnya yang belum dikirim, sesuai urutan daftar yang tampil. */
const nextUnsent = computed(() => shown.value.find(g => !g.sent_at) ?? null)

const eventKind = computed(() => inv.value?.theme.definition.kind ?? 'wedding')
const content = computed(() => contentWithDefaults(inv.value?.content, eventKind.value, inv.value?.theme.definition.demo))
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
  const phrase = {
    aqiqah: ['tasyakuran aqiqah buah hati kami', 'hadir dan mendoakan buah hati kami'],
    khitan: ['walimatul khitan putra kami', 'hadir dan mendoakan putra kami'],
    birthday: ['syukuran ulang tahun', 'hadir dan memberikan doa terbaik'],
    office: ['acara', 'hadir'],
    general: ['acara', 'hadir'],
  }[eventKind.value as string]
  if (phrase) {
    template.value = template.value
      .replace('acara pernikahan kami', phrase[0]!)
      .replace('hadir dan memberikan doa restu', phrase[1]!)
  }
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
  .replaceAll('{mempelai}', inviteNames(content.value, eventKind.value))
const waFor = (g: GuestRow) => {
  const phone = normalizePhoneId(g.phone)
  return phone ? waLink(phone, messageFor(g)) : `https://wa.me/?text=${encodeURIComponent(messageFor(g))}`
}

/** Tandai sudah/belum dikirim (otomatis saat tombol WhatsApp diklik; bisa diubah manual). */
async function setSent(g: GuestRow, sent: boolean) {
  const prev = g.sent_at
  const at = sent ? new Date().toISOString() : null
  // data useAsyncData berupa shallowRef: ganti array agar tampilan ikut berubah
  const patch = (v: string | null) => { guests.value = (guests.value ?? []).map(x => x.id === g.id ? { ...x, sent_at: v } : x) }
  if (sent && tab.value === 'unsent') keep.value.add(g.id)
  patch(at)
  const { data, error } = await supabase.from('guests').update({ sent_at: at } as never).eq('id', g.id).select('id')
  if (error || !data?.length) {
    patch(prev)
    msg.value = { type: 'err', text: error ? friendlyError(error) : 'Gagal menyimpan tanda kirim: akun ini tidak punya akses.' }
  }
}
function sendWa(g: GuestRow) {
  if (!g.sent_at) setSent(g, true)
}
function sendNext() {
  const g = nextUnsent.value
  if (!g) return
  window.open(waFor(g), '_blank', 'noopener')
  setSent(g, true)
  nextTick(() => document.getElementById(`tamu-${g.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}

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
  const rows = [['Nama', 'Telepon', 'Grup', 'Dikirim', 'Dibuka', 'Link'], ...(guests.value ?? []).map(g => [g.name, g.phone ?? '', g.group_name ?? '', g.sent_at ? tanggal(g.sent_at, true) : 'Belum', g.opened_at ? 'Ya' : 'Belum', linkFor(g)])]
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

    <div class="mx-auto grid max-w-4xl gap-4 px-4 py-5" :class="nextUnsent && 'pb-28'">
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

        <ContactImport ref="contactImport" :existing="guests ?? []" :remaining="remaining" :busy="busy" :disabled="full" @import="importContacts" />

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
        <div class="grid gap-3 border-b border-brand-50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="q" type="search" class="input flex-1" placeholder="Cari nama atau grup…">
            <button class="btn-ghost btn-sm" :disabled="!guests?.length" @click="exportCsv">Export CSV</button>
          </div>
          <div v-if="guests?.length" class="grid gap-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-brand-800">Terkirim {{ sentCount }} dari {{ used }} tamu</span>
              <span class="text-brand-500">{{ tabCount('opened') }} sudah membuka</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-brand-50">
              <div class="h-full rounded-full bg-[#25d366] transition-all" :style="{ width: `${(sentCount / Math.max(1, used)) * 100}%` }" />
            </div>
          </div>
          <div v-if="guests?.length" class="grid grid-cols-4 gap-1 rounded-full bg-brand-50 p-1 text-xs font-semibold" role="tablist" aria-label="Filter status kirim">
            <button
              v-for="t in TABS" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" :aria-label="`${t.label} (${tabCount(t.key)})`"
              class="whitespace-nowrap rounded-full px-1 py-1.5" :class="tab === t.key ? 'bg-white text-brand shadow-sm' : 'text-brand-600'" @click="tab = t.key"
            >
              <span class="sm:hidden">{{ t.short }}</span><span class="hidden sm:inline">{{ t.label }}</span>
              <span class="font-normal opacity-70">{{ tabCount(t.key) }}</span>
            </button>
          </div>
        </div>
        <ul v-if="shown.length" class="divide-y divide-brand-50">
          <li v-for="g in shown" :id="`tamu-${g.id}`" :key="g.id" class="grid scroll-mt-20 gap-2 p-4 transition-opacity" :class="tab === 'unsent' && g.sent_at && 'opacity-60'">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold text-brand-900">{{ g.name }}</p>
                <p v-if="g.group_name || g.phone" class="text-xs text-brand-500">
                  <span v-if="g.group_name">{{ g.group_name }}</span>
                  <span v-if="g.group_name && g.phone"> · </span>
                  <span v-if="g.phone">{{ formatPhoneId(g.phone) }}</span>
                </p>
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span v-if="g.sent_at" class="chip gap-1 bg-[#e7f8ee] px-2 py-0.5 text-[11px] text-[#12763a]">✓ Terkirim {{ tanggal(g.sent_at, true) }}</span>
                  <span v-else class="chip bg-brand-50 px-2 py-0.5 text-[11px] text-brand-600">Belum dikirim</span>
                  <span class="chip px-2 py-0.5 text-[11px]" :class="g.opened_at ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-500'">{{ g.opened_at ? `Dibuka ${tanggal(g.opened_at, true)}` : 'Belum dibuka' }}</span>
                  <button type="button" class="px-1 text-brand-500 underline" @click="setSent(g, !g.sent_at)">{{ g.sent_at ? 'batalkan tanda' : 'tandai terkirim' }}</button>
                </div>
              </div>
              <button class="shrink-0 text-xs text-red-600" @click="remove(g)">Hapus</button>
            </div>
            <p class="truncate rounded-lg bg-brand-50 px-2.5 py-1.5 font-mono text-[11px] text-brand-700">{{ linkFor(g) }}</p>
            <div class="grid grid-cols-3 gap-2">
              <button class="btn-ghost btn-sm px-2" @click="copy(linkFor(g), `l-${g.id}`)">{{ copied === `l-${g.id}` ? '✓ Disalin' : 'Salin link' }}</button>
              <button class="btn-ghost btn-sm px-2" @click="copy(messageFor(g), `m-${g.id}`)">{{ copied === `m-${g.id}` ? '✓ Disalin' : 'Salin pesan' }}</button>
              <a
                :href="waFor(g)" target="_blank" rel="noopener" class="btn btn-sm px-2"
                :class="g.sent_at ? 'bg-white text-[#12763a] ring-1 ring-[#25d366]' : 'bg-[#25d366] text-white'" @click="sendWa(g)"
              >{{ g.sent_at ? 'Kirim ulang' : 'WhatsApp' }}</a>
            </div>
          </li>
        </ul>
        <p v-else class="p-8 text-center text-sm text-brand-500">
          {{ !guests?.length ? 'Belum ada tamu. Tambahkan nama tamu untuk membuat link personal.' : tab === 'unsent' && !q ? 'Semua tamu sudah dikirimi undangan. 🎉' : 'Tidak ada yang cocok.' }}
        </p>
      </div>
    </div>

    <!-- Kirim satu per satu: buka WhatsApp tamu berikutnya yang belum dikirim -->
    <div v-if="nextUnsent" class="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] text-brand-500">Berikutnya · {{ sentCount }}/{{ used }} terkirim</p>
          <p class="truncate text-sm font-semibold text-brand-900">{{ nextUnsent.name }}</p>
        </div>
        <button type="button" class="btn btn-sm shrink-0 bg-[#25d366] text-white" @click="sendNext">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
          Kirim berikutnya
        </button>
      </div>
    </div>
  </div>
</template>
