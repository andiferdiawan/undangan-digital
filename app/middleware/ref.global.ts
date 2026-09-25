/** Simpan kode referral reseller dari ?ref=KODE selama 30 hari. */
export default defineNuxtRouteMiddleware((to) => {
  const code = String(to.query.ref ?? '').toUpperCase()
  if (/^[A-Z0-9]{4,12}$/.test(code)) {
    const ref = useCookie('ref', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', path: '/' })
    ref.value = code
  }
})
