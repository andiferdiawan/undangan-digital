/**
 * Pemicu artikel blog otomatis. Dua pemanggil:
 *  - pg_cron + pg_net di database (tiap 5 menit, hanya saat jadwal tiba) dengan header `x-blog-tick: <token>`
 *    (token di private.blog_tick, dicek lewat RPC);
 *  - cron Vercel harian (cadangan) dengan `Authorization: Bearer <CRON_SECRET>`.
 * Jadwal, kuota per hari, dan status berhenti-setelah-gagal diputuskan database (server_blog_auto_claim).
 */
export default defineEventHandler(async (event) => {
  const deadline = Date.now() + 280_000
  const secret = process.env.CRON_SECRET || String(useRuntimeConfig(event).cronSecret || '')
  const tick = getHeader(event, 'x-blog-tick') ?? ''
  const viaVercel = !!secret && getHeader(event, 'authorization') === `Bearer ${secret}`
  const viaTick = !viaVercel && tick.length >= 32 && await serverRpc<boolean>(event, 'server_blog_tick_ok', { p_token: tick }).catch(() => false)
  if (!viaVercel && !viaTick) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  try {
    return await runAutoArticle(event, { deadline })
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[cron blog]', msg)
    throw createError({ statusCode: 500, statusMessage: msg.replace(/[^\x20-\x7E]/g, ' ').slice(0, 200) })
  }
})
