<script setup lang="ts">
const props = defineProps<{ item_class?: string, name_class?: string, text_class?: string }>()
const rt = useInvite()
const supabase = useSupabaseClient()

type Wish = { name: string, attendance: string, message: string, created_at: string }
const now = new Date().toISOString()
const wish = (name: string, message: string): Wish => ({ name, attendance: 'hadir', message, created_at: now })
/** Contoh ucapan di pratinjau, sesuai jenis acara tema */
const SAMPLES: Record<string, Wish[]> = {
  wedding: [
    wish('Fulan', 'Barakallahu lakuma wa baraka \'alaikuma wa jama\'a bainakuma fii khair.'),
    wish('Fulanah', 'Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah.'),
  ],
  aqiqah: [
    wish('Fulan', 'Barakallahu laka fil mauhubi lak. Semoga menjadi anak yang shalih/shalihah.'),
    wish('Fulanah', 'Selamat atas kelahiran buah hati, semoga sehat dan menjadi penyejuk mata.'),
  ],
  khitan: [
    wish('Fulan', 'Selamat untuk jagoan kecil, semoga tumbuh menjadi anak yang shalih dan berbakti.'),
    wish('Fulanah', 'Barakallahu fiik, semoga lekas pulih dan sehat selalu.'),
  ],
  birthday: [
    wish('Fulan', 'Barakallahu fii umrik! Semoga usianya penuh berkah dan amal kebaikan.'),
    wish('Fulanah', 'Selamat bertambah usia, semoga sehat, bahagia, dan semakin dekat kepada Allah.'),
  ],
  office: [
    wish('Fulan', 'Selamat dan sukses! Semoga acara berjalan lancar dan membawa keberkahan.'),
    wish('Fulanah', 'Terima kasih atas undangannya, insya Allah kami hadir.'),
  ],
  general: [
    wish('Fulan', 'Insya Allah hadir. Semoga acaranya lancar dan penuh berkah.'),
    wish('Fulanah', 'Terima kasih undangannya, senang bisa berkumpul kembali.'),
  ],
}
const SAMPLE = SAMPLES[rt.kind] ?? SAMPLES.wedding!
const wishes = ref<Wish[]>(rt.preview ? SAMPLE : [])

async function load() {
  if (rt.preview || !rt.slug) return
  const { data } = await supabase.rpc('get_wishes', { p_slug: rt.slug } as never)
  wishes.value = (data as Wish[] | null) ?? []
}
onMounted(load)
watch(rt.wishesVersion, load)

const label = (a: string) => (a === 'hadir' ? 'Hadir' : a === 'ragu' ? 'Ragu' : 'Tidak hadir')
</script>

<template>
  <div class="grid max-h-96 gap-2.5 overflow-y-auto text-left">
    <p v-if="!wishes.length" class="py-4 text-center text-sm text-muted">Belum ada ucapan. Jadilah yang pertama mendoakan.</p>
    <div v-for="(w, i) in wishes" :key="i" :class="props.item_class || 'rounded-xl bg-surface p-3.5 shadow-sm'">
      <p :class="props.name_class || 'text-sm font-semibold text-ink'">
        {{ w.name }} <span class="ml-1 text-[11px] font-normal text-muted">· {{ label(w.attendance) }}</span>
      </p>
      <p :class="props.text_class || 'mt-1 text-sm text-muted'">{{ w.message }}</p>
    </div>
  </div>
</template>
