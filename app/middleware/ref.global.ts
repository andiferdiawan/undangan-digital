/**
 * ?ref=KODE saat berpindah halaman di dalam aplikasi: simpan atribusi 30 hari & catat klik.
 * Kunjungan pertama (halaman dimuat penuh) dicatat server/middleware/ref-param; link /r/... oleh server/routes/r.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || useNuxtApp().isHydrating) return
  const code = String(to.query.ref ?? '').toUpperCase()
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return
  const opts = { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' as const, path: '/' }
  useCookie('ref', opts).value = code
  useCookie('ref_link', opts).value = null
  const body = JSON.stringify({ code, path: to.path, referrer: document.referrer })
  try {
    if (!navigator.sendBeacon?.('/api/ref-click', new Blob([body], { type: 'application/json' })))
      fetch('/api/ref-click', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {})
  }
  catch { /* abaikan */ }
})
