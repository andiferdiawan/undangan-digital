<script setup lang="ts">
import type { Package } from '#shared/types/models'
import type { CatalogTheme } from '~/composables/useCatalog'

const props = defineProps<{ theme: CatalogTheme | null, packages: Package[] }>()
const emit = defineEmits<{ close: [] }>()
const config = useRuntimeConfig()

const selected = ref<number | null>(null)
watch(() => props.theme, () => { selected.value = props.packages[0]?.id ?? null })

const pkg = computed(() => props.packages.find(p => p.id === selected.value) ?? null)
const link = computed(() => {
  if (!props.theme || !pkg.value) return ''
  const msg = [
    'Assalamu\'alaikum, saya ingin memesan undangan digital:',
    '',
    `• Tema: ${props.theme.name}`,
    `• ID Tema: ${props.theme.code}`,
    `• Paket: ${pkg.value.name} (${pkg.value.guest_limit} tamu)`,
    `• Harga: ${rupiah(pkg.value.price)}`,
    '',
    'Mohon info langkah pembayarannya. Terima kasih.',
  ].join('\n')
  return waLink(config.public.adminWhatsapp, msg)
})

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="sheet">
    <div v-if="theme" class="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 md:items-center" @click.self="emit('close')">
      <div class="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl md:rounded-3xl" role="dialog" aria-modal="true" :aria-label="`Pesan ${theme.name}`">
        <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-brand-100 md:hidden" />
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-clay-600">{{ theme.code }}</p>
            <h3 class="font-display text-2xl text-brand">{{ theme.name }}</h3>
          </div>
          <button class="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand" aria-label="Tutup" @click="emit('close')">✕</button>
        </div>

        <p class="mt-4 text-sm font-medium text-brand-800">Pilih paket</p>
        <div class="mt-2 grid gap-2">
          <label
            v-for="p in packages" :key="p.id"
            class="flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3 transition"
            :class="selected === p.id ? 'border-brand bg-brand-50' : 'border-brand-100'"
          >
            <span class="flex items-center gap-3">
              <input v-model="selected" type="radio" :value="p.id" class="h-4 w-4 accent-[#2f4a3a]">
              <span>
                <span class="block text-sm font-semibold text-brand-900">{{ p.name }}</span>
                <span class="text-xs text-brand-500">Maks. {{ p.guest_limit }} nama tamu</span>
              </span>
            </span>
            <span class="text-sm font-bold text-brand">{{ rupiah(p.price) }}</span>
          </label>
        </div>

        <a :href="link" target="_blank" rel="noopener" class="btn mt-5 w-full bg-[#25d366] text-white hover:bg-[#1eb957]" :class="{ 'pointer-events-none opacity-50': !link }">
          <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" /></svg>
          Pesan via WhatsApp
        </a>
        <p class="mt-3 text-center text-xs text-brand-500">Setelah pembayaran, admin akan mengirim <b>token 6 karakter</b> untuk membuat akun Anda.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
