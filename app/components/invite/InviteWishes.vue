<script setup lang="ts">
const props = defineProps<{ item_class?: string, name_class?: string, text_class?: string }>()
const rt = useInvite()
const supabase = useSupabaseClient()

type Wish = { name: string, attendance: string, message: string, created_at: string }
const SAMPLE: Wish[] = [
  { name: 'Fulan', attendance: 'hadir', message: 'Barakallahu lakuma wa baraka \'alaikuma wa jama\'a bainakuma fii khair.', created_at: new Date().toISOString() },
  { name: 'Fulanah', attendance: 'hadir', message: 'Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah.', created_at: new Date().toISOString() },
]
const wishes = ref<Wish[]>(rt.preview ? SAMPLE : [])

async function load() {
  if (rt.preview || !rt.slug) return
  const { data } = await supabase.rpc('get_wishes', { p_slug: rt.slug })
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
