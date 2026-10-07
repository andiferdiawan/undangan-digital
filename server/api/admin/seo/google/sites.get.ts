/** Properti Search Console yang bisa diakses service account + usulan properti yang cocok dengan situs ini. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { sa } = await requireGoogle(event, { property: false })
  try {
    const sites = await listSites(sa)
    return { email: sa.client_email, sites, suggested: matchProperty(sites, siteOrigin(event)) }
  }
  catch (e) {
    throw searchHttpError(e)
  }
})
