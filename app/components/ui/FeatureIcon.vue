<script setup lang="ts">
/**
 * Ikon ilustrasi flat dua warna (duotone) di dalam ubin lembut.
 * Warna: hijau tua (utama), hijau muda (bidang), terakota (aksen), putih (detail).
 */
export type FeatureIconName = 'invite' | 'music' | 'rsvp' | 'map' | 'gift' | 'countdown' | 'theme' | 'payment' | 'token' | 'share' | 'link' | 'receipt' | 'wallet' | 'pending'
defineProps<{ name: FeatureIconName, size?: 'md' | 'lg' }>()

const D = '#3b5744' // hijau tua
const L = '#b9d3b3' // hijau muda
const A = '#d9825b' // terakota
const W = '#ffffff'
</script>

<template>
  <span class="grid shrink-0 place-items-center rounded-2xl bg-[#eef3ec]" :class="size === 'lg' ? 'h-20 w-20' : 'h-16 w-16'" aria-hidden="true">
    <svg viewBox="0 0 48 48" :class="size === 'lg' ? 'h-13 w-13' : 'h-11 w-11'" fill="none">
      <!-- Undangan: amplop terbuka dengan kartu & hati -->
      <template v-if="name === 'invite'">
        <rect x="11" y="6" width="26" height="24" rx="3" :fill="L" />
        <rect x="16" y="12" width="16" height="3" rx="1.5" :fill="W" />
        <rect x="16" y="18" width="11" height="3" rx="1.5" :fill="W" />
        <path d="M5 21l19 12 19-12v18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V21z" :fill="D" />
        <path d="M5 39l15-11M43 39L28 28" :stroke="L" stroke-width="2" stroke-linecap="round" />
        <circle cx="38" cy="12" r="7" :fill="A" />
        <path d="M38 15.5s-3.5-2.1-3.5-4.3a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.5 1c0 2.2-3.5 4.3-3.5 4.3z" :fill="W" />
      </template>

      <!-- Musik: piringan + not balok -->
      <template v-else-if="name === 'music'">
        <circle cx="19" cy="27" r="15" :fill="L" />
        <circle cx="19" cy="27" r="5" :fill="W" />
        <path d="M26 8l16-4v26" :stroke="D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M26 8v28" :stroke="D" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="21.5" cy="37" rx="6" ry="5" :fill="D" />
        <ellipse cx="37.5" cy="31" rx="6" ry="5" :fill="D" />
        <path d="M28 14l12-3" :stroke="A" stroke-width="3" stroke-linecap="round" />
      </template>

      <!-- RSVP: papan klip + centang -->
      <template v-else-if="name === 'rsvp'">
        <rect x="8" y="8" width="26" height="34" rx="4" :fill="L" />
        <rect x="14" y="5" width="14" height="7" rx="2.5" :fill="D" />
        <rect x="13" y="18" width="16" height="3" rx="1.5" :fill="W" />
        <rect x="13" y="25" width="12" height="3" rx="1.5" :fill="W" />
        <rect x="13" y="32" width="9" height="3" rx="1.5" :fill="W" />
        <circle cx="34" cy="34" r="9" :fill="D" />
        <path d="M30 34l3 3 5.5-6" :stroke="W" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </template>

      <!-- Peta: peta lipat + pin -->
      <template v-else-if="name === 'map'">
        <path d="M5 14l12-5 14 5 12-5v26l-12 5-14-5-12 5z" :fill="L" />
        <path d="M17 9v26M31 14v26" :stroke="W" stroke-width="2" />
        <path d="M24 4a9 9 0 0 1 9 9c0 7-9 16-9 16s-9-9-9-16a9 9 0 0 1 9-9z" :fill="D" />
        <circle cx="24" cy="13" r="3.5" :fill="A" />
      </template>

      <!-- Amplop digital: kado -->
      <template v-else-if="name === 'gift'">
        <rect x="8" y="20" width="32" height="22" rx="3" :fill="L" />
        <rect x="5" y="13" width="38" height="9" rx="3" :fill="D" />
        <rect x="21" y="13" width="6" height="29" :fill="A" />
        <path d="M24 13c-2-5-9-8-10-4-1 3 5 4 10 4zm0 0c2-5 9-8 10-4 1 3-5 4-10 4z" :stroke="D" stroke-width="3" stroke-linejoin="round" />
      </template>

      <!-- Hitung mundur: jam + foto -->
      <template v-else-if="name === 'countdown'">
        <rect x="22" y="20" width="21" height="20" rx="3" :fill="L" />
        <path d="M24 37l6-7 4 4 3-3 5 6" :fill="W" />
        <circle cx="38" cy="25" r="2" :fill="W" />
        <circle cx="18" cy="21" r="14" :fill="D" />
        <circle cx="18" cy="21" r="10" :fill="W" />
        <path d="M18 14v7l4 3" :stroke="D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="15" y="3" width="6" height="4" rx="1.5" :fill="A" />
      </template>

      <!-- Tema: ponsel dengan kartu undangan -->
      <template v-else-if="name === 'theme'">
        <rect x="12" y="4" width="24" height="40" rx="5" :fill="D" />
        <rect x="15" y="9" width="18" height="30" rx="2" :fill="L" />
        <path d="M24 15l3 3-3 3-3-3z" :fill="A" />
        <rect x="18" y="25" width="12" height="3" rx="1.5" :fill="W" />
        <rect x="20" y="31" width="8" height="3" rx="1.5" :fill="W" />
      </template>

      <!-- Pembayaran: kartu + QR -->
      <template v-else-if="name === 'payment'">
        <rect x="4" y="10" width="32" height="22" rx="4" :fill="L" />
        <rect x="4" y="15" width="32" height="5" :fill="D" />
        <rect x="9" y="25" width="10" height="3" rx="1.5" :fill="W" />
        <rect x="24" y="22" width="20" height="20" rx="4" :fill="D" />
        <path d="M28 26h5v5h-5zM35 33h5v5h-5zM28 33h3v3h-3zM37 26h3v3h-3z" :fill="W" />
      </template>

      <!-- Token: kunci -->
      <template v-else-if="name === 'token'">
        <rect x="6" y="12" width="36" height="24" rx="5" :fill="L" />
        <circle cx="17" cy="24" r="7" :fill="D" />
        <circle cx="17" cy="24" r="2.5" :fill="W" />
        <path d="M24 24h14M33 24v5M38 24v4" :stroke="D" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="38" cy="12" r="5" :fill="A" />
      </template>

      <!-- Bagikan: gelembung chat + panah -->
      <template v-else-if="name === 'share'">
        <path d="M6 12a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H17l-8 6v-6.5A5 5 0 0 1 6 25z" :fill="L" />
        <rect x="12" y="14" width="16" height="3" rx="1.5" :fill="W" />
        <rect x="12" y="20" width="10" height="3" rx="1.5" :fill="W" />
        <circle cx="35" cy="34" r="10" :fill="D" />
        <path d="M31 34h8m-3-3.5l3.5 3.5-3.5 3.5" :stroke="W" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </template>

      <!-- Link referral: dua mata rantai diagonal -->
      <template v-else-if="name === 'link'">
        <g transform="rotate(-45 24 24)">
          <rect x="3" y="16" width="24" height="16" rx="8" :fill="L" />
          <rect x="8.5" y="21.5" width="13" height="5" rx="2.5" :fill="W" />
          <rect x="21" y="16" width="24" height="16" rx="8" :stroke="D" stroke-width="5" />
        </g>
        <circle cx="39" cy="39" r="5" :fill="A" />
      </template>

      <!-- Pesanan: struk + tanda Rp -->
      <template v-else-if="name === 'receipt'">
        <path d="M9 4h24v38l-4-3-4 3-4-3-4 3-4-3-4 3z" :fill="L" />
        <rect x="14" y="11" width="14" height="3" rx="1.5" :fill="W" />
        <rect x="14" y="18" width="10" height="3" rx="1.5" :fill="W" />
        <rect x="14" y="25" width="12" height="3" rx="1.5" :fill="W" />
        <circle cx="34" cy="32" r="10" :fill="D" />
        <path d="M34 26v12M37 28.5h-4.2a2 2 0 0 0 0 4h2.4a2 2 0 0 1 0 4H31" :stroke="W" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </template>

      <!-- Pencairan: dompet + koin -->
      <template v-else-if="name === 'wallet'">
        <rect x="5" y="12" width="36" height="28" rx="5" :fill="D" />
        <path d="M9 12l20-7 3 7z" :fill="L" />
        <rect x="28" y="21" width="15" height="10" rx="4" :fill="L" />
        <circle cx="33" cy="26" r="2.5" :fill="W" />
        <circle cx="12" cy="36" r="7" :fill="A" />
        <path d="M12 32.5v7" :stroke="W" stroke-width="2.2" stroke-linecap="round" />
      </template>

      <!-- Menunggu: jam pasir -->
      <template v-else-if="name === 'pending'">
        <path d="M14 8h20c0 8-6 11-10 16 4 5 10 8 10 16H14c0-8 6-11 10-16-4-5-10-8-10-16z" :fill="L" />
        <path d="M18 38c0-4 3-6 6-8 3 2 6 4 6 8z" :fill="A" />
        <path d="M20 14h8l-4 5z" :fill="A" />
        <rect x="10" y="4" width="28" height="5" rx="2.5" :fill="D" />
        <rect x="10" y="39" width="28" height="5" rx="2.5" :fill="D" />
      </template>
    </svg>
  </span>
</template>
