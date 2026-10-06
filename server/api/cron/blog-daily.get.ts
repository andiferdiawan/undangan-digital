/**
 * Cron Vercel (lihat vercel.json): satu artikel blog per hari. Vercel mengirim header
 * `Authorization: Bearer <CRON_SECRET>` bila env CRON_SECRET diisi.
 */
export default defineEventHandler(async (event) => {
  const deadline = Date.now() + 280_000
  const secret = process.env.CRON_SECRET || String(useRuntimeConfig(event).cronSecret || '')
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  try {
    return await runDailyArticle(event, { deadline })
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[cron blog-daily]', msg)
    throw createError({ statusCode: 500, statusMessage: msg.slice(0, 200) })
  }
})
