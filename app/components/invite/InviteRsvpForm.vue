<script setup lang="ts">
const props = defineProps<{ input_class?: string, button_class?: string, label_class?: string }>()
const rt = useInvite()
const supabase = useSupabaseClient()

const form = reactive({
  name: rt.ctx.value.values.guest_name || '',
  attendance: 'hadir' as 'hadir' | 'tidak_hadir' | 'ragu',
  pax: 1,
  message: '',
})
const state = ref<'idle' | 'sending' | 'sent'>('idle')
const error = ref('')

const inputCls = computed(() => props.input_class || 'w-full rounded-xl border border-muted/30 bg-surface px-3.5 py-2.5 text-base text-ink outline-none focus:border-primary')
const labelCls = computed(() => props.label_class || 'grid gap-1.5 text-left text-sm font-medium text-ink')

async function submit() {
  error.value = ''
  if (!form.name.trim()) {
    error.value = 'Mohon isi nama Anda.'
    return
  }
  if (rt.preview || !rt.slug) {
    state.value = 'sent'
    return
  }
  state.value = 'sending'
  const { error: err } = await supabase.rpc('submit_rsvp', {
    p_slug: rt.slug,
    p_name: form.name.trim().slice(0, 100),
    p_attendance: form.attendance,
    p_pax: form.pax,
    p_message: form.message.trim().slice(0, 500) || null,
  })
  if (err) {
    state.value = 'idle'
    error.value = err.message.includes('RSVP_LIMIT') ? 'Anda sudah mengirim konfirmasi. Terima kasih!' : 'Gagal mengirim, coba lagi.'
    return
  }
  state.value = 'sent'
  rt.wishesVersion.value++
}
</script>

<template>
  <div v-if="state === 'sent'" class="rounded-2xl bg-surface p-6 text-center text-ink">
    <p class="font-heading text-xl text-primary">Jazakumullahu khairan</p>
    <p class="mt-1 text-sm text-muted">Konfirmasi dan doa Anda sudah kami terima.</p>
  </div>
  <form v-else class="grid gap-3.5" novalidate @submit.prevent="submit">
    <label :class="labelCls">Nama
      <input v-model="form.name" :class="inputCls" maxlength="100" autocomplete="name" placeholder="Nama lengkap">
    </label>
    <div :class="labelCls">
      Kehadiran
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="opt in [['hadir', 'Hadir'], ['ragu', 'Ragu'], ['tidak_hadir', 'Tidak']]" :key="opt[0]"
          type="button"
          class="rounded-xl py-2.5 text-sm font-medium transition"
          :class="form.attendance === opt[0] ? 'bg-primary text-surface' : 'bg-surface text-muted ring-1 ring-muted/30'"
          @click="form.attendance = opt[0] as any"
        >
          {{ opt[1] }}
        </button>
      </div>
    </div>
    <label v-if="form.attendance !== 'tidak_hadir'" :class="labelCls">Jumlah tamu
      <select v-model.number="form.pax" :class="inputCls">
        <option v-for="n in 5" :key="n" :value="n">{{ n }} orang</option>
      </select>
    </label>
    <label :class="labelCls">Doa &amp; ucapan
      <textarea v-model="form.message" :class="inputCls" rows="3" maxlength="500" placeholder="Barakallahu lakuma..." />
    </label>
    <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
    <button type="submit" :disabled="state === 'sending'" :class="props.button_class || 'w-full rounded-full bg-primary py-3 font-semibold text-surface disabled:opacity-60'">
      {{ state === 'sending' ? 'Mengirim…' : 'Kirim Konfirmasi' }}
    </button>
  </form>
</template>
