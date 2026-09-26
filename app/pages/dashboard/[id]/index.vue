<script setup lang="ts">
import { ALLOWED_FONTS, COLOR_KEYS, type ColorKey } from '#shared/theme/constants'
import { withDefaults as contentWithDefaults, type EventItem, type InvitationContent } from '#shared/theme/content'

const route = useRoute()
const id = String(route.params.id)
const supabase = useSupabaseClient()
const { data: inv } = await useInvitation(id)

useSeoMeta({ title: () => `Editor /${inv.value?.slug}` })

// ---------- State lokal yang langsung terhubung ke live preview ----------
const content = ref<InvitationContent>(contentWithDefaults(inv.value?.content))
const style = ref<Record<string, string>>({ ...(inv.value?.style ?? {}) })
const assets = ref<Record<string, string>>({ ...(inv.value?.assets ?? {}) })
const published = ref(inv.value?.is_published ?? true)

const theme = computed(() => inv.value!.theme)
const globals = computed(() => ({ ...theme.value.definition.globals, ...style.value }))
const themeAssetKeys = computed(() => Object.keys(theme.value.definition.assets ?? {}))
const usesSlider = computed(() => JSON.stringify(theme.value.definition.sections).includes('"photo_slider"'))

const COLOR_LABEL: Record<ColorKey, string> = {
  primary_color: 'Warna utama',
  secondary_color: 'Warna kedua',
  accent_color: 'Aksen',
  background_color: 'Latar',
  surface_color: 'Kartu',
  text_color: 'Teks',
  muted_color: 'Teks samar',
}

// ---------- Simpan otomatis ----------
const saveState = ref<'saved' | 'dirty' | 'saving' | 'error'>('saved')
const saveError = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

async function save() {
  clearTimeout(timer)
  saveState.value = 'saving'
  const { data, error } = await supabase
    .from('invitations')
    .update({ content: content.value, style: style.value, assets: assets.value, is_published: published.value } as never)
    .eq('id', id)
    .select('id')
  if (error || !data?.length) {
    // 0 baris = ditolak RLS tanpa error; jangan tampilkan "Tersimpan".
    saveState.value = 'error'
    saveError.value = error ? friendlyError(error) : 'Perubahan ditolak: akun ini tidak punya akses untuk mengubah undangan ini.'
  }
  else {
    saveState.value = 'saved'
  }
}
watch([content, style, assets, published], () => {
  saveState.value = 'dirty'
  clearTimeout(timer)
  timer = setTimeout(save, 1200)
}, { deep: true })

onBeforeRouteLeave(async () => { if (saveState.value === 'dirty') await save() })
if (import.meta.client) {
  const warn = (e: BeforeUnloadEvent) => { if (saveState.value === 'dirty' || saveState.value === 'saving') e.preventDefault() }
  onMounted(() => window.addEventListener('beforeunload', warn))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', warn))
}

// ---------- Helper daftar ----------
const newEvent = (): EventItem => ({ name: 'Resepsi', date: content.value.events[0]?.date ?? '', time_start: '11:00', time_end: '13:00', timezone: 'WIB', venue: '', address: '', map_url: '' })
function move<T>(list: T[], i: number, d: -1 | 1) {
  const j = i + d
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j]!, list[i]!]
}

const { upload, uploading: galleryUploading, error: galleryError } = useUpload(id)
async function addGallery(e: Event) {
  const files = [...((e.target as HTMLInputElement).files ?? [])].slice(0, 20 - content.value.gallery.length)
  for (const f of files) {
    const url = await upload(f)
    if (url) content.value.gallery.push({ url, caption: '' })
  }
  ;(e.target as HTMLInputElement).value = ''
}

// ---------- Tampilan ponsel: form / preview ----------
const view = ref<'form' | 'preview'>('form')
const open = reactive<Record<string, boolean>>({ cover: true })
const previewKey = ref(0)
const url = computed(() => inviteUrl(inv.value!.slug))
</script>

<template>
  <div v-if="inv">
    <DashHeader :id="id" :slug="inv.slug" :theme-name="theme.name" />

    <!-- Bar status + toggle form/preview di ponsel -->
    <div class="sticky top-16 z-30 border-b border-brand-100 bg-cream/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
        <div class="grid shrink-0 grid-cols-2 whitespace-nowrap rounded-full bg-white p-1 text-xs font-semibold ring-1 ring-brand-100 lg:hidden">
          <button class="rounded-full px-3 py-1.5" :class="view === 'form' ? 'bg-brand text-white' : 'text-brand-600'" @click="view = 'form'">Isi Data</button>
          <button class="rounded-full px-3 py-1.5" :class="view === 'preview' ? 'bg-brand text-white' : 'text-brand-600'" @click="view = 'preview'">Preview</button>
        </div>
        <span class="min-w-0 truncate text-xs" :class="saveState === 'error' ? 'text-red-600' : 'text-brand-500'" role="status" :title="saveError">
          {{ { saved: '✓ Tersimpan', dirty: 'Belum disimpan', saving: 'Menyimpan…', error: 'Gagal menyimpan' }[saveState] }}
        </span>
        <button class="btn-primary btn-sm shrink-0" :disabled="saveState === 'saving' || saveState === 'saved'" @click="save">Simpan</button>
      </div>
    </div>

    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[1fr_420px]">
      <!-- ================= FORM ================= -->
      <div class="grid content-start gap-3" :class="view === 'preview' && 'hidden lg:grid'">
        <EditorCard v-if="usesSlider" v-model:open="open.slides" title="Foto Sampul (Slider)" :hint="content.cover_photos.length ? `${content.cover_photos.length} foto` : 'Belum ada foto · tema ini menampilkan foto di depan'">
          <CoverPhotosField v-model="content.cover_photos" :invitation-id="id" />
        </EditorCard>

        <EditorCard v-model:open="open.cover" title="Sampul & Pembuka" hint="Salam dan kalimat pembuka">
          <label class="label">Salam pembuka
            <input v-model="content.opening.greeting" class="input">
          </label>
          <label class="label">Kalimat pembuka
            <textarea v-model="content.opening.text" rows="3" class="input" />
          </label>
          <ImageField v-if="themeAssetKeys.includes('hero_image')" v-model="assets.hero_image" :invitation-id="id" label="Foto sampul / prewedding" hint="Mengganti latar bawaan tema. Kosongkan untuk memakai latar tema." />
        </EditorCard>

        <EditorCard v-model:open="open.couple" title="Detail Mempelai">
          <div v-for="who in (['groom', 'bride'] as const)" :key="who" class="grid gap-3 rounded-2xl bg-brand-50/60 p-3">
            <p class="text-sm font-bold text-brand">{{ who === 'groom' ? 'Mempelai Pria' : 'Mempelai Wanita' }}</p>
            <label class="label">Nama lengkap & gelar
              <input v-model="content[who].name" class="input">
            </label>
            <label class="label">Nama panggilan
              <input v-model="content[who].nickname" class="input" maxlength="30">
            </label>
            <label class="label">Keterangan orang tua
              <input v-model="content[who].parents" class="input" placeholder="Putra dari Bapak … & Ibu …">
            </label>
            <label class="label">Instagram (opsional)
              <input v-model="content[who].instagram" class="input" placeholder="@username">
            </label>
            <ImageField v-model="content[who].photo" :invitation-id="id" label="Foto (opsional)" hint="Untuk tema syar'i, biarkan kosong agar ilustrasi yang tampil." />
          </div>
        </EditorCard>

        <EditorCard v-model:open="open.events" title="Jadwal Acara" :hint="`${content.events.length} acara · acara pertama dipakai untuk hitung mundur`">
          <div v-for="(ev, i) in content.events" :key="i" class="grid gap-3 rounded-2xl bg-brand-50/60 p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-brand">Acara {{ i + 1 }}</p>
              <div class="flex gap-1 text-xs">
                <button type="button" class="rounded-lg px-2 py-1 hover:bg-white" :disabled="i === 0" @click="move(content.events, i, -1)">↑</button>
                <button type="button" class="rounded-lg px-2 py-1 hover:bg-white" @click="move(content.events, i, 1)">↓</button>
                <button v-if="content.events.length > 1" type="button" class="rounded-lg px-2 py-1 text-red-600 hover:bg-white" @click="content.events.splice(i, 1)">Hapus</button>
              </div>
            </div>
            <label class="label">Nama acara
              <input v-model="ev.name" class="input" placeholder="Akad Nikah">
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="label col-span-2">Tanggal
                <input v-model="ev.date" type="date" class="input">
              </label>
              <label class="label">Mulai
                <input v-model="ev.time_start" type="time" class="input">
              </label>
              <label class="label">Selesai
                <input v-model="ev.time_end" type="time" class="input">
              </label>
            </div>
            <label class="label">Zona waktu
              <select v-model="ev.timezone" class="input">
                <option>WIB</option><option>WITA</option><option>WIT</option>
              </select>
            </label>
            <label class="label">Nama tempat
              <input v-model="ev.venue" class="input">
            </label>
            <label class="label">Alamat
              <textarea v-model="ev.address" rows="2" class="input" />
            </label>
            <label class="label">Link Google Maps
              <input v-model="ev.map_url" type="url" class="input" placeholder="https://maps.app.goo.gl/…">
            </label>
          </div>
          <button type="button" class="btn-ghost btn-sm justify-self-start" @click="content.events.push(newEvent())">+ Tambah acara</button>
        </EditorCard>

        <EditorCard v-model:open="open.quote" title="Ayat / Kutipan">
          <label class="label">Teks Arab (opsional)
            <textarea v-model="content.quote.arabic" rows="3" dir="rtl" class="input font-arabic text-lg" />
          </label>
          <label class="label">Terjemahan / kutipan
            <textarea v-model="content.quote.text" rows="3" class="input" />
          </label>
          <label class="label">Sumber
            <input v-model="content.quote.source" class="input">
          </label>
        </EditorCard>

        <EditorCard v-model:open="open.gallery" title="Galeri" :hint="`${content.gallery.length}/20 foto · kosongkan untuk menyembunyikan`">
          <div v-if="content.gallery.length" class="grid grid-cols-3 gap-2">
            <div v-for="(g, i) in content.gallery" :key="g.url" class="group relative aspect-square overflow-hidden rounded-xl bg-brand-50">
              <img :src="g.url" alt="" class="h-full w-full object-cover">
              <div class="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 p-1 text-xs text-white">
                <button type="button" class="px-1.5" aria-label="Geser kiri" @click="move(content.gallery, i, -1)">‹</button>
                <button type="button" class="px-1.5" aria-label="Hapus foto" @click="content.gallery.splice(i, 1)">✕</button>
                <button type="button" class="px-1.5" aria-label="Geser kanan" @click="move(content.gallery, i, 1)">›</button>
              </div>
            </div>
          </div>
          <label class="btn-ghost btn-sm cursor-pointer justify-self-start" :class="content.gallery.length >= 20 && 'pointer-events-none opacity-50'">
            {{ galleryUploading ? 'Mengunggah…' : '+ Tambah foto' }}
            <input type="file" accept="image/*" multiple class="sr-only" :disabled="galleryUploading" @change="addGallery">
          </label>
          <p v-if="galleryError" class="text-xs text-red-600">{{ galleryError }}</p>
        </EditorCard>

        <EditorCard v-model:open="open.story" title="Kisah Cinta" hint="Kosongkan untuk menyembunyikan">
          <div v-for="(st, i) in content.story" :key="i" class="grid gap-3 rounded-2xl bg-brand-50/60 p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-brand">Momen {{ i + 1 }}</p>
              <button type="button" class="text-xs text-red-600" @click="content.story.splice(i, 1)">Hapus</button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="label">Waktu
                <input v-model="st.date" class="input" placeholder="Maret 2026">
              </label>
              <label class="label">Judul
                <input v-model="st.title" class="input" placeholder="Ta'aruf">
              </label>
            </div>
            <label class="label">Cerita
              <textarea v-model="st.text" rows="2" class="input" />
            </label>
          </div>
          <button type="button" class="btn-ghost btn-sm justify-self-start" @click="content.story.push({ date: '', title: '', text: '' })">+ Tambah momen</button>
        </EditorCard>

        <EditorCard v-model:open="open.gift" title="Amplop Digital" hint="Kosongkan untuk menyembunyikan">
          <div v-for="(g, i) in content.gifts" :key="i" class="grid gap-3 rounded-2xl bg-brand-50/60 p-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-brand">Rekening {{ i + 1 }}</p>
              <button type="button" class="text-xs text-red-600" @click="content.gifts.splice(i, 1)">Hapus</button>
            </div>
            <label class="label">Bank / e-wallet
              <input v-model="g.bank" class="input">
            </label>
            <label class="label">Nomor
              <input v-model="g.number" class="input" inputmode="numeric">
            </label>
            <label class="label">Atas nama
              <input v-model="g.holder" class="input">
            </label>
          </div>
          <button type="button" class="btn-ghost btn-sm justify-self-start" @click="content.gifts.push({ bank: '', number: '', holder: '' })">+ Tambah rekening</button>
        </EditorCard>

        <EditorCard v-model:open="open.rsvp" title="RSVP & Ucapan">
          <label class="flex items-center justify-between gap-3 text-sm font-medium text-brand-800">
            Tampilkan formulir RSVP & buku ucapan
            <input v-model="content.rsvp.enabled" type="checkbox" class="h-5 w-5 accent-[#2f4a3a]">
          </label>
        </EditorCard>

        <EditorCard v-model:open="open.music" title="Musik Latar" :hint="content.music.enabled ? (content.music.url ? 'Musik Anda' : theme.music_url ? 'Musik bawaan tema' : 'Belum ada musik') : 'Nonaktif'">
          <MusicField v-model="content.music" :invitation-id="id" :theme-music="theme.music_url" />
        </EditorCard>

        <EditorCard v-model:open="open.closing" title="Penutup">
          <label class="label">Kalimat penutup
            <textarea v-model="content.closing.text" rows="3" class="input" />
          </label>
          <label class="label">Salam penutup
            <input v-model="content.closing.greeting" class="input">
          </label>
        </EditorCard>

        <EditorCard v-model:open="open.style" title="Warna & Font" hint="Sesuaikan variabel global tema">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label v-for="k in COLOR_KEYS" :key="k" class="flex items-center gap-2 rounded-xl bg-brand-50/60 p-2 text-xs font-medium text-brand-800">
              <input
                type="color" :value="globals[k]" class="h-9 w-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                @input="style[k] = ($event.target as HTMLInputElement).value"
              >
              {{ COLOR_LABEL[k] }}
            </label>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <label v-for="f in (['font_heading', 'font_body', 'font_script'] as const)" :key="f" class="label">
              {{ { font_heading: 'Font judul', font_body: 'Font isi', font_script: 'Font dekoratif' }[f] }}
              <select :value="globals[f]" class="input" @change="style[f] = ($event.target as HTMLSelectElement).value">
                <option v-for="font in ALLOWED_FONTS" :key="font">{{ font }}</option>
              </select>
            </label>
          </div>
          <button type="button" class="btn-ghost btn-sm justify-self-start" @click="style = {}">Kembalikan ke bawaan tema</button>
        </EditorCard>

        <EditorCard v-if="themeAssetKeys.length" v-model:open="open.assets" title="Aset Tema" hint="Ganti gambar/ornamen bawaan dengan milik Anda">
          <ImageField v-for="key in themeAssetKeys" :key="key" v-model="assets[key]" :invitation-id="id" :label="key.replace(/_/g, ' ')" />
        </EditorCard>

        <EditorCard v-model:open="open.publish" title="Publikasi">
          <label class="flex items-center justify-between gap-3 text-sm font-medium text-brand-800">
            Undangan dapat diakses publik
            <input v-model="published" type="checkbox" class="h-5 w-5 accent-[#2f4a3a]">
          </label>
          <p class="break-all rounded-xl bg-brand-50 p-3 text-xs text-brand-700">{{ url }}</p>
        </EditorCard>
      </div>

      <!-- ================= LIVE PREVIEW ================= -->
      <div :class="view === 'form' && 'hidden lg:block'">
        <div class="lg:sticky lg:top-32">
          <PhoneFrame :key="previewKey">
            <InviteRenderer
              :definition="theme.definition" :css="theme.compiled_css" :theme-slug="theme.slug"
              :content="content" :style-override="style" :asset-override="assets"
              :theme-music="theme.music_url"
              guest-name="Nama Tamu" mode="frame" preview
            />
          </PhoneFrame>
          <p class="mt-2 text-center text-xs text-brand-500">
            Preview langsung · <button class="underline" @click="previewKey++">ulang dari sampul</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
