/**
 * Google Ads hanya mencatat page view saat halaman pertama dimuat; perpindahan halaman di dalam aplikasi
 * dikirim manual agar audiens remarketing lengkap. Tag sendiri dipasang di <head> oleh app.vue.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let first = true
  nuxtApp.hook('page:finish', () => {
    if (first) { first = false; return }
    if (isGoogleTagExcluded(useRoute().path)) return
    const ids = activeTagIds(useNuxtData<GoogleTagSettings | null>('google-tag').data.value)
    // Tunggu judul halaman baru terpasang
    setTimeout(() => reportAdsPageView(ids), 0)
  })
})
