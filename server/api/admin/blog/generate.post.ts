import { z } from 'zod'

/**
 * Tulis artikel dengan AI dari topik antrean (`topic_id`) atau topik bebas, simpan sebagai draf
 * (admin meninjau & menayangkan dari editor).
 */
const Body = z.object({
  topic_id: z.number().int().positive().optional(),
  topic: z.string().trim().min(5).max(200).optional(),
  focus_keyword: z.string().trim().max(80).optional(),
  category_slug: z.string().trim().max(60).nullish(),
  intent: z.enum(['informasional', 'komersial', 'transaksional', 'navigasional']).optional(),
  provider: z.enum(['openrouter', 'gemini']).optional(),
  model: z.string().trim().max(200).optional(),
}).refine(b => b.topic_id || b.topic, 'Isi topik artikel')

export default defineEventHandler(async (event) => {
  const deadline = Date.now() + 280_000
  const { client } = await requireAdmin(event)
  const body = await readValidatedBody(event, Body.parse)
  const cfg = await getAiConfig(event)
  const provider = pickProvider(cfg, body.provider)
  if (!provider) throw createError({ statusCode: 400, statusMessage: 'Belum ada API key AI (Gemini / OpenRouter). Isi di Admin → Pengaturan.' })

  let brief = { topic: body.topic ?? '', focus_keyword: body.focus_keyword, category_slug: body.category_slug ?? null, intent: body.intent }
  if (body.topic_id) {
    const { data: t } = await client.from('blog_topics').select('*').eq('id', body.topic_id).maybeSingle()
    if (!t) throw createError({ statusCode: 404, statusMessage: 'Topik tidak ditemukan' })
    const r = t as { topic: string, focus_keyword: string, category_slug: string | null, intent: typeof body.intent }
    brief = { topic: r.topic, focus_keyword: r.focus_keyword, category_slug: r.category_slug, intent: r.intent }
  }

  const ctx = await serverRpc<import('../../../utils/blog-ai').BlogContext>(event, 'server_blog_context', {})
  let article
  try {
    article = await generateArticle({ event, cfg, provider, model: body.model, brief, ctx, timeoutMs: deadline - Date.now() - 10_000 })
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (body.topic_id) await client.from('blog_topics').update({ status: 'failed', note: msg.slice(0, 500) } as never).eq('id', body.topic_id)
    throw createError({ statusCode: 500, statusMessage: msg.slice(0, 300) })
  }

  const { data: settings } = await client.from('blog_settings').select('default_author_id, default_editor_id').maybeSingle()
  const st = settings as { default_author_id: string | null, default_editor_id: string | null } | null
  const { stats, ...post } = article
  // Slug unik
  let slug = post.slug
  for (let i = 2; ; i++) {
    const { data: hit } = await client.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
    if (!hit) break
    slug = `${post.slug}-${i}`
  }
  const { data, error } = await client.from('blog_posts').insert({
    ...post, slug, status: 'draft', origin: 'ai',
    author_id: st?.default_author_id ?? null, editor_id: st?.default_editor_id ?? null,
  } as never).select('id, slug').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  const row = data as { id: string, slug: string }
  if (body.topic_id) await client.from('blog_topics').update({ status: 'done', post_id: row.id, note: null } as never).eq('id', body.topic_id)
  return { ...row, title: post.title, stats, provider, model: post.ai_model }
})
