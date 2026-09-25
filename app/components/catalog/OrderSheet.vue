<script setup lang="ts">
import type { Package } from '#shared/types/models'
import type { CatalogTheme } from '~/composables/useCatalog'

const props = defineProps<{ theme: CatalogTheme | null, packages: Package[] }>()
const emit = defineEmits<{ close: [] }>()
const { reseller, whatsapp } = await useReferral()

const selected = ref<number | null>(null)
watch(() => props.theme, () => { selected.value = props.packages[1]?.id ?? props.packages[0]?.id ?? null }, { immediate: true })
const pkg = computed(() => props.packages.find(p => p.id === selected.value) ?? null)

const checkoutUrl = computed(() => props.theme && pkg.value ? `/checkout/${props.theme.slug}?paket=${pkg.value.id}` : '')
const waUrl = computed(() => {
  if (!props.theme || !pkg.value) return ''
  return waLink(whatsapp.value, `Assalamu'alaikum, saya ingin bertanya tentang tema ${props.theme.name} (${props.theme.code}) ${pkg.value.name}.`)
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

        <NuxtLink :to="checkoutUrl" class="btn-primary mt-5 w-full" :class="{ 'pointer-events-none opacity-50': !checkoutUrl }" @click="emit('close')">
          Bayar Sekarang
        </NuxtLink>
        <a :href="waUrl" target="_blank" rel="noopener" class="btn-ghost mt-2 w-full">
          Tanya dulu via WhatsApp{{ reseller ? ` · ${reseller.business_name}` : '' }}
        </a>
        <p class="mt-3 text-center text-xs text-brand-500">Pembayaran aman via QRIS, virtual account, atau e-wallet. Token aktivasi langsung muncul setelah lunas.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
