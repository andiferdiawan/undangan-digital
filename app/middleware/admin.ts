export default defineNuxtRouteMiddleware(async () => {
  const { refresh } = useProfile()
  const p = await refresh()
  if (!p) return navigateTo('/masuk')
  if (p.role !== 'admin') return navigateTo('/dashboard')
})
