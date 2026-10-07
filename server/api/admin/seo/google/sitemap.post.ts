/** Kirim (ulang) /sitemap.xml ke Search Console, lalu kembalikan status sitemap terbaru. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { sa, property } = await requireGoogle(event)
  const sitemap = `${siteOrigin(event)}/sitemap.xml`
  try {
    await submitSitemap(sa, property, sitemap)
    return { property, sitemap, sitemaps: await listSitemaps(sa, property) }
  }
  catch (e) {
    throw searchHttpError(e)
  }
})
