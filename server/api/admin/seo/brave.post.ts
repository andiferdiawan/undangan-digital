import { z } from 'zod'

/** Tandai/batalkan tanda "sudah dikirim ke Brave" (form manual search.brave.com/submit-url, Brave tidak punya API). */
const Body = z.object({ paths: PathList(10_000), sent: z.boolean() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { paths, sent } = await readValidatedBody(event, Body.parse)
  const at = sent ? new Date().toISOString() : null
  await serverRpc(event, 'server_seo_record', { p_rows: paths.map(path => ({ path, brave_submitted_at: at })) })
  return { ok: true, at }
})
