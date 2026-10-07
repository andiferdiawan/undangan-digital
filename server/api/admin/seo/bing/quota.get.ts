/** Sisa kuota kirim URL Bing Webmaster hari ini & bulan ini. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { key, site } = await requireBing(event)
  try {
    return { site, ...(await bingQuota(key, site)) }
  }
  catch (e) {
    throw searchHttpError(e)
  }
})
