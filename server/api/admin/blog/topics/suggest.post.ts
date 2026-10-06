import { z } from 'zod'

/** Minta AI mengusulkan topik artikel baru lalu masukkan ke antrean. */
const Body = z.object({ count: z.number().int().min(1).max(20).default(10), provider: z.enum(['openrouter', 'gemini']).optional() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, b => Body.parse(b ?? {}))
  const cfg = await getAiConfig(event)
  const provider = pickProvider(cfg, body.provider)
  if (!provider) throw createError({ statusCode: 400, statusMessage: 'Belum ada API key AI (Gemini / OpenRouter). Isi di Admin → Pengaturan.' })
  const ctx = await serverRpc<import('../../../../utils/blog-ai').BlogContext & { all_topics: string[] }>(event, 'server_blog_context', {})
  try {
    const topics = await suggestTopics({ event, cfg, provider, ctx, existing: ctx.all_topics, count: body.count, timeoutMs: 90_000 })
    const added = topics.length ? await serverRpc<number>(event, 'server_blog_add_topics', { p_topics: topics }) : 0
    return { added }
  }
  catch (e) {
    throw createError({ statusCode: 500, statusMessage: (e instanceof Error ? e.message : String(e)).slice(0, 300) })
  }
})
