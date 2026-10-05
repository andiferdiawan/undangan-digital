/** Muat tema yang disukai dari localStorage, lalu sinkronkan ke akun setiap kali user login. */
export default defineNuxtPlugin(() => {
  const likes = useThemeLikes()
  const user = useSupabaseUser()
  // Setelah hidrasi selesai agar tampilan awal sama dengan hasil render server
  onNuxtReady(() => {
    likes.load()
    watch(() => (user.value as { sub?: string } | null)?.sub ?? null, (id) => {
      if (id) likes.sync()
    }, { immediate: true })
  })
})
