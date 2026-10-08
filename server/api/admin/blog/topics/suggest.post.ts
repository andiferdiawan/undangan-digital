import { z } from 'zod'

/**
 * Minta AI mengusulkan topik artikel baru lalu masukkan ke antrean. Porsi intent bisa diatur (persen, total 100);
 * default 50% informasional, 20% transaksional, 10% navigasional, 20% komersial.
 */
const Pct = z.number().int().min(0).max(100)
const Body = z.object({
  count: z.number().int().min(1).max(20).default(10),
  provider: z.enum(['openrouter', 'gemini']).optional(),
  mix: z.object({ informasional: Pct, transaksional: Pct, navigasional: Pct, komersial: Pct })
    .refine(m => m.informasional + m.transaksional + m.navigasional + m.komersial === 100, 'Total porsi intent harus 100%')
    .optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, b => Body.parse(b ?? {}))
  const cfg = await getAiConfig(event)
  const provider = pickProvider(cfg, body.provider)
  if (!provider) throw createError({ statusCode: 400, statusMessage: 'Belum ada API key AI (Gemini / OpenRouter). Isi di Admin → Pengaturan.' })
  const ctx = await serverRpc<import('../../../../utils/blog-ai').BlogContext & { all_topics: string[] }>(event, 'server_blog_context', {})
  const mix = body.mix ?? DEFAULT_INTENT_MIX
  try {
    const topics = await suggestTopics({ event, cfg, provider, ctx, existing: ctx.all_topics, count: body.count, mix, timeoutMs: 200_000 })
    const added = topics.length ? await serverRpc<number>(event, 'server_blog_add_topics', { p_topics: topics }) : 0
    const target = intentQuota(body.count, mix)
    const got = Object.fromEntries(Object.keys(target).map(i => [i, topics.filter(t => t.intent === i).length]))
    return { added, target, got }
  }
  catch (e) {
    throw createError({ statusCode: 500, statusMessage: (e instanceof Error ? e.message : String(e)).slice(0, 300) })
  }
})
