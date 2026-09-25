<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Analitik' })

interface Stats {
  revenue_total: number
  tokens_generated: number
  tokens_redeemed: number
  users_total: number
  users_active: number
  invitations_total: number
  guests_total: number
  rsvps_total: number
  monthly: { month: string, revenue: number, tokens: number, redeemed: number, new_users: number }[]
  leaderboard: { theme_id: string, code: string, name: string, category: string | null, sold: number, redeemed: number, revenue: number }[]
}

const supabase = useSupabaseClient()
const { data: stats, error } = await useAsyncData('admin-stats', async () => {
  const { data, error } = await supabase.rpc('admin_stats')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data as Stats
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const monthLabel = (ym: string) => MONTHS[Number(ym.slice(5, 7)) - 1] ?? ym
const compactRp = (n: number) => n >= 1e6 ? `${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` : n >= 1e3 ? `${Math.round(n / 1e3)} rb` : String(n)
const num = (n: number) => n.toLocaleString('id-ID')

const conversion = computed(() => stats.value && stats.value.tokens_generated
  ? Math.round((stats.value.tokens_redeemed / stats.value.tokens_generated) * 100)
  : 0)
const thisMonth = computed(() => stats.value?.monthly.at(-1))
const prevMonth = computed(() => stats.value?.monthly.at(-2))
const delta = computed(() => {
  const a = thisMonth.value?.revenue ?? 0
  const b = prevMonth.value?.revenue ?? 0
  if (!b) return null
  return Math.round(((a - b) / b) * 100)
})
const maxSold = computed(() => Math.max(1, ...(stats.value?.leaderboard ?? []).map(l => l.sold)))
</script>

<template>
  <div>
    <AdminNav />
    <div class="mx-auto max-w-6xl px-4 py-6">
      <h1 class="font-display text-3xl text-brand">Analitik Penjualan</h1>
      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error.message }}</p>

      <template v-if="stats">
        <!-- KPI -->
        <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="card p-4">
            <p class="text-xs text-brand-500">Pendapatan bulan ini</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ rupiah(thisMonth?.revenue ?? 0) }}</p>
            <p v-if="delta !== null" class="mt-1 text-xs" :class="delta >= 0 ? 'text-green-700' : 'text-red-600'">{{ delta >= 0 ? '▲' : '▼' }} {{ Math.abs(delta) }}% vs bulan lalu</p>
            <p v-else class="mt-1 text-xs text-brand-400">Total {{ rupiah(stats.revenue_total) }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">User aktif (30 hari)</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(stats.users_active) }}</p>
            <p class="mt-1 text-xs text-brand-400">dari {{ num(stats.users_total) }} user</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">Conversion token</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ conversion }}%</p>
            <p class="mt-1 text-xs text-brand-400">{{ num(stats.tokens_redeemed) }} diaktifkan / {{ num(stats.tokens_generated) }} dibuat</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-brand-500">Undangan · tamu · RSVP</p>
            <p class="mt-1 text-2xl font-semibold text-brand-900">{{ num(stats.invitations_total) }}</p>
            <p class="mt-1 text-xs text-brand-400">{{ num(stats.guests_total) }} tamu · {{ num(stats.rsvps_total) }} RSVP</p>
          </div>
        </div>

        <!-- Grafik: dua ukuran berbeda = dua grafik terpisah (tanpa sumbu ganda) -->
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Pendapatan bulanan (12 bulan)"
            :data="stats.monthly.map(m => ({ label: monthLabel(m.month), value: m.revenue }))"
            :format="rupiah" :compact="compactRp"
          />
          <BarChart
            title="User baru per bulan"
            :data="stats.monthly.map(m => ({ label: monthLabel(m.month), value: m.new_users }))"
            :format="n => `${num(n)} user`" :compact="num"
          />
        </div>

        <!-- Leaderboard -->
        <div class="card mt-4 overflow-hidden">
          <div class="flex items-center justify-between p-4">
            <h2 class="font-semibold text-brand-900">Leaderboard tema terlaris</h2>
            <span class="text-xs text-brand-500">berdasarkan token terjual</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-sm">
              <thead>
                <tr class="border-y border-brand-50 bg-brand-50/50 text-left text-xs text-brand-500">
                  <th class="px-4 py-2 font-medium">#</th>
                  <th class="px-4 py-2 font-medium">Tema</th>
                  <th class="px-4 py-2 font-medium">Terjual</th>
                  <th class="px-4 py-2 text-right font-medium">Diaktifkan</th>
                  <th class="px-4 py-2 text-right font-medium">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(l, i) in stats.leaderboard" :key="l.theme_id" class="border-b border-brand-50 last:border-0">
                  <td class="px-4 py-2.5 text-brand-400">{{ i + 1 }}</td>
                  <td class="px-4 py-2.5">
                    <p class="font-medium text-brand-900">{{ l.name }}</p>
                    <p class="text-xs text-brand-500">{{ l.code }} · {{ l.category ?? '-' }}</p>
                  </td>
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-24 overflow-hidden rounded-full bg-brand-50">
                        <div class="h-full rounded-full bg-brand-500" :style="{ width: `${(l.sold / maxSold) * 100}%` }" />
                      </div>
                      <span class="font-medium text-brand-900">{{ l.sold }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2.5 text-right text-brand-700">{{ l.redeemed }}</td>
                  <td class="px-4 py-2.5 text-right font-medium text-brand-900">{{ rupiah(l.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
