<script setup lang="ts">
import type { GuestRow } from '#shared/types/models'

/**
 * Impor tamu dari kontak HP.
 * - Android + Chrome: Contact Picker API membuka layar pilih kontak bawaan HP; situs hanya menerima
 *   nama & nomor yang dicentang customer (daftar kontak lengkap & info "punya WhatsApp" tidak bisa dibaca web).
 * - Android tanpa picker & laptop: unggah file kontak .vcf.
 * - iPhone/iPad: fitur disembunyikan seluruhnya (Contact Picker tidak tersedia di Safari).
 * Sebelum disimpan, customer meninjau: nama (tampil di undangan) bisa diedit, nomor dipilih, duplikat ditandai.
 */
export interface ImportRow { name: string, phone: string | null, group_name: string | null }

const props = defineProps<{ existing: GuestRow[], remaining: number, busy?: boolean, disabled?: boolean }>()
const emit = defineEmits<{ import: [rows: ImportRow[]] }>()

// Contact Picker API belum ada di lib DOM TypeScript
interface PickedContact { name?: string[], tel?: string[] }
interface ContactsManager { select: (props: string[], opts?: { multiple?: boolean }) => Promise<PickedContact[]> }

const supported = ref(false)
const platform = ref<'android' | 'ios' | 'other' | null>(null) // null = belum dicek (SSR) → jangan tampil dulu
onMounted(() => {
  supported.value = 'contacts' in navigator && 'ContactsManager' in window
  const ua = navigator.userAgent
  platform.value = /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : 'other'
})

interface Cand { key: number, include: boolean, name: string, phones: string[], phone: string }
const cands = ref<Cand[] | null>(null)
const source = ref<'picker' | 'vcf'>('picker')
const group = ref('')
const filter = ref('')
const error = ref('')

/** Nomor dirapikan & diurutkan: nomor HP lebih dulu. */
function phonesOf(list: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const p = normalizePhoneId(raw) ?? raw.replace(/[^\d+]/g, '')
    if (p.replace(/\D/g, '').length < 6 || seen.has(p)) continue
    seen.add(p)
    out.push(p)
  }
  return out.sort((a, b) => Number(isMobileId(b)) - Number(isMobileId(a)))
}

function open(list: { name: string, phones: string[] }[], from: 'picker' | 'vcf') {
  const rows = list
    .map((c, i) => ({ key: i, name: c.name.replace(/\s+/g, ' ').trim().slice(0, 100), phones: phonesOf(c.phones) }))
    .filter(c => c.name || c.phones.length)
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
  // File .vcf bisa berisi seluruh buku telepon: centang otomatis hanya bila muat di sisa kuota
  const autoCheck = from === 'picker' || rows.length <= props.remaining
  cands.value = rows.map(c => ({
    ...c,
    phone: c.phones[0] ?? '',
    include: autoCheck && !!c.name && c.phones.length > 0 && !existingNames.value.has(c.name.toLowerCase()) && !c.phones.some(p => existingPhones.value.has(p)),
  }))
  source.value = from
  group.value = ''
  filter.value = ''
  error.value = ''
  if (!cands.value.length) {
    cands.value = null
    error.value = from === 'vcf' ? 'Tidak ada kontak yang terbaca dari file ini. Pastikan formatnya .vcf (vCard).' : 'Tidak ada kontak yang dipilih.'
  }
}

async function pick() {
  error.value = ''
  try {
    const res = await (navigator as unknown as { contacts: ContactsManager }).contacts.select(['name', 'tel'], { multiple: true })
    if (!res.length) return
    open(res.map(c => ({ name: c.name?.find(Boolean) ?? '', phones: c.tel ?? [] })), 'picker')
  }
  catch {
    error.value = 'Tidak bisa membuka kontak. Izinkan akses kontak di browser, atau gunakan unggah file .vcf.'
  }
}

async function onVcf(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  if (file.size > 15 * 1024 * 1024) { error.value = 'File terlalu besar (maks. 15 MB).'; return }
  open(parseVcf(await file.text()), 'vcf')
}

// ── Pemeriksaan ──
const existingNames = computed(() => new Set(props.existing.map(g => g.name.trim().toLowerCase())))
const existingPhones = computed(() => new Set(props.existing.map(g => normalizePhoneId(g.phone)).filter(Boolean) as string[]))
const chosen = computed(() => (cands.value ?? []).filter(c => c.include))
const nameCount = computed(() => {
  const m = new Map<string, number>()
  for (const c of chosen.value) {
    const k = c.name.trim().toLowerCase()
    if (k) m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
})
/** Masalah yang menghalangi penyimpanan (nama wajib & unik per undangan). */
function blocker(c: Cand) {
  const k = c.name.trim().toLowerCase()
  if (!k) return 'Isi nama tamu'
  if (existingNames.value.has(k)) return 'Nama sudah ada di daftar tamu'
  if (c.include && (nameCount.value.get(k) ?? 0) > 1) return 'Nama kembar — ubah salah satu'
  return ''
}
function warning(c: Cand) {
  if (!c.phone) return 'Tanpa nomor — pilih kontak di WhatsApp saat mengirim'
  if (existingPhones.value.has(c.phone)) return 'Nomor ini sudah ada di daftar tamu'
  if (!isMobileId(c.phone)) return 'Bukan nomor HP Indonesia — mungkin tidak punya WhatsApp'
  return ''
}
const blocked = computed(() => chosen.value.filter(c => blocker(c)).length)
const over = computed(() => chosen.value.length > props.remaining)
const canSave = computed(() => chosen.value.length > 0 && !blocked.value && !over.value && !props.busy)

const visible = computed(() => {
  const s = filter.value.trim().toLowerCase()
  const d = s.replace(/\D/g, '').replace(/^0/, '62')
  return (cands.value ?? []).filter(c => !s || c.name.toLowerCase().includes(s) || (!!d && c.phones.some(p => p.includes(d))))
})
function setAll(v: boolean) {
  let room = props.remaining - chosen.value.length
  for (const c of visible.value) {
    if (!v) c.include = false
    else if (!c.include && room > 0 && !blocker(c)) { c.include = true; room-- }
  }
}

function save() {
  if (!canSave.value) return
  const g = group.value.trim().slice(0, 50) || null
  emit('import', chosen.value.map(c => ({
    name: c.name.trim().slice(0, 100),
    phone: c.phone && c.phone.length <= 20 ? c.phone : null,
    group_name: g,
  })))
}
const close = () => { cands.value = null }
defineExpose({ close })
</script>

<template>
  <div v-if="platform && platform !== 'ios'" class="grid gap-2">
    <div class="grid gap-2" :class="supported && 'sm:grid-cols-2'">
      <button v-if="supported" type="button" class="btn-accent" :disabled="disabled" @click="pick">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" /></svg>
        Pilih dari kontak HP
      </button>
      <label class="btn-ghost cursor-pointer" :class="disabled && 'pointer-events-none opacity-50'">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        Unggah file kontak (.vcf)
        <input type="file" accept=".vcf,text/vcard,text/x-vcard" class="sr-only" :disabled="disabled" @change="onVcf">
      </label>
    </div>
    <p v-if="!supported && platform === 'android'" class="text-xs text-brand-600">
      Pilih kontak langsung dari HP bisa dipakai di <b>Google Chrome</b>. Jika halaman ini terbuka di dalam aplikasi (WhatsApp/Instagram), buka lewat Chrome.
    </p>
    <p v-if="error" class="text-sm text-red-600" role="status">{{ error }}</p>
    <div class="mt-1 flex items-center gap-3 text-xs text-brand-400"><span class="h-px flex-1 bg-brand-100" />atau isi manual<span class="h-px flex-1 bg-brand-100" /></div>

    <!-- Tinjau kontak sebelum disimpan -->
    <Teleport to="body">
      <div v-if="cands" class="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 md:items-center md:p-4" @click.self="close">
        <div class="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" role="dialog" aria-modal="true" aria-label="Tinjau kontak">
          <div class="grid gap-3 border-b border-brand-50 p-4 pb-3">
            <div class="mx-auto h-1.5 w-10 rounded-full bg-brand-100 md:hidden" />
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-display text-xl text-brand">Tinjau {{ cands.length }} kontak</h3>
                <p class="text-xs text-brand-600">Nama tampil di undangan sebagai “Kepada Yth.” — rapikan bila perlu (mis. “Mama” → “Ibu Siti & Keluarga”).</p>
              </div>
              <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand" aria-label="Tutup" @click="close">✕</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="group" class="input py-2 text-sm" placeholder="Grup, mis. Keluarga" aria-label="Grup untuk semua kontak (opsional)" maxlength="50">
              <input v-if="cands.length > 6" v-model="filter" type="search" class="input py-2 text-sm" placeholder="Cari kontak…">
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="flex gap-3">
                <button type="button" class="font-semibold text-brand-700 underline" @click="setAll(true)">Centang semua</button>
                <button type="button" class="font-semibold text-brand-700 underline" @click="setAll(false)">Kosongkan</button>
              </span>
              <span v-if="source === 'vcf' && !chosen.length" class="text-brand-500">Centang tamu yang ingin diundang</span>
            </div>
          </div>

          <ul class="min-h-0 flex-1 divide-y divide-brand-50 overflow-y-auto overscroll-contain">
            <li v-for="c in visible" :key="c.key" class="flex gap-3 px-4 py-3" :class="!c.include && 'opacity-60'">
              <input v-model="c.include" type="checkbox" class="mt-2.5 h-5 w-5 shrink-0 accent-[#2f4a3a]" :aria-label="`Undang ${c.name || 'kontak ini'}`">
              <div class="grid min-w-0 flex-1 gap-1.5">
                <input v-model="c.name" class="input px-3 py-2 text-sm" maxlength="100" placeholder="Nama tamu" @focus="c.include = true">
                <select v-if="c.phones.length > 1" v-model="c.phone" class="input px-3 py-2 text-sm">
                  <option v-for="p in c.phones" :key="p" :value="p">{{ formatPhoneId(p) }}{{ isMobileId(p) ? '' : ' (bukan HP)' }}</option>
                </select>
                <p v-else class="px-1 text-xs text-brand-600">{{ c.phone ? formatPhoneId(c.phone) : 'Tanpa nomor' }}</p>
                <p v-if="c.include && blocker(c)" class="px-1 text-xs font-medium text-red-600">{{ blocker(c) }}</p>
                <p v-else-if="warning(c)" class="px-1 text-xs text-amber-700">{{ warning(c) }}</p>
              </div>
            </li>
            <li v-if="!visible.length" class="p-6 text-center text-sm text-brand-500">Tidak ada kontak yang cocok.</li>
          </ul>

          <div class="grid gap-2 border-t border-brand-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p class="text-center text-xs" :class="over || blocked ? 'font-semibold text-red-600' : 'text-brand-600'">
              {{ chosen.length }} dipilih · sisa kuota {{ remaining }}
              <template v-if="over"> — kurangi {{ chosen.length - remaining }} kontak</template>
              <template v-else-if="blocked"> — {{ blocked }} nama perlu diperbaiki</template>
            </p>
            <button type="button" class="btn-primary w-full" :disabled="!canSave" @click="save">
              {{ busy ? 'Menyimpan…' : `Tambahkan ${chosen.length} tamu` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
