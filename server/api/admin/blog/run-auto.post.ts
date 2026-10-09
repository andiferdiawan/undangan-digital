import { z } from 'zod'

/** Jalankan artikel otomatis sekarang (tanpa menunggu cron), memakai topik antrean berikutnya. */
const Body = z.object({ provider: z.enum(['openrouter', 'gemini']).optional() })

export default defineEventHandler(async (event) => {
  const deadline = Date.now() + 280_000
  await requireAdmin(event)
  const body = await readValidatedBody(event, b => Body.parse(b ?? {}))
  try {
    return await runAutoArticle(event, { force: true, provider: body.provider, deadline })
  }
  catch (e) {
    throw createError({ statusCode: 500, statusMessage: (e instanceof Error ? e.message : String(e)).slice(0, 300) })
  }
})
