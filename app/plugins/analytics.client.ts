import { classifyTraffic, pageTypeOf, type TrafficInfo } from '#shared/traffic'

/**
 * Analitik halaman publik tanpa cookie: setiap perpindahan halaman dikirim ke /api/track.
 * Sumber trafik diatribusikan per sesi tab (sessionStorage) dari halaman masuk pertama — referrer Google →
 * organik, gclid/fbclid/utm_medium=cpc → iklan, dst. Admin yang sedang login tidak dihitung.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const { profile, refresh, user } = useProfile()
  const KEY = 'uv_traffic'
  let firstHit = true
  let lastPath = ''

  const read = (): TrafficInfo | null => {
    try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') }
    catch { return null }
  }
  const write = (t: TrafficInfo) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(t)) }
    catch { /* mode privat */ }
  }

  async function track(path: string, query: Record<string, unknown>) {
    path = path.replace(/\/+$/, '') || '/'
    if (path === lastPath || !pageTypeOf(path)) return
    lastPath = path
    if (user.value) {
      await refresh().catch(() => null)
      if (profile.value?.role === 'admin') return
    }
    const q = Object.fromEntries(Object.entries(query).map(([k, v]) => [k, Array.isArray(v) ? String(v[0] ?? '') : v == null ? undefined : String(v)]))
    let info = read()
    let entry = false
    if (firstHit) {
      // Halaman dimuat penuh: sesi baru bila datang dari luar situs / membawa parameter kampanye, atau belum ada sesi
      const fresh = classifyTraffic({ referrer: document.referrer, siteHost: location.hostname, query: q })
      const external = !!fresh.referrer_host || !!fresh.utm_source || fresh.source === 'iklan'
      if (!info || external) { info = fresh; entry = true; write(info) }
    }
    else if (!info) { info = classifyTraffic({ referrer: '', siteHost: location.hostname, query: q }); entry = true; write(info) }
    firstHit = false

    const body = JSON.stringify({ path, is_entry: entry, ...info })
    try {
      if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' })))
        await fetch('/api/track', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true })
    }
    catch { /* abaikan */ }
  }

  nuxtApp.hook('app:mounted', () => {
    const r = router.currentRoute.value
    track(r.path, r.query)
  })
  router.afterEach((to, from) => {
    if (nuxtApp.isHydrating || to.path === from.path) return
    track(to.path, to.query)
  })
})
