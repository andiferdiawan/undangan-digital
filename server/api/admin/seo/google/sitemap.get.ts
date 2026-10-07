/** Status sitemap di Search Console (terakhir dikirim/diunduh, galat, jumlah URL). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { sa, property } = await requireGoogle(event)
  try {
    return { property, sitemaps: await listSitemaps(sa, property) }
  }
  catch (e) {
    throw searchHttpError(e)
  }
})
