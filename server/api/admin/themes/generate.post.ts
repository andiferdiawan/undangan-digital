import { z } from 'zod'
import type { AiThemeResult } from '../../../utils/ai-theme'

const Body = z.object({
  prompt: z.string().trim().min(10).max(2000),
  provider: z.enum(['anthropic', 'openrouter']).optional(),
  model: z.string().trim().max(200).optional(),
  // Putaran perbaikan OpenRouter: jawaban model sebelumnya + error validator
  previous: z.object({
    text: z.string().max(200_000),
    errors: z.array(z.string().max(500)).max(50),
    attempt: z.number().int().min(1).max(2),
  }).optional(),
})

export default defineEventHandler(async (event) => {
  // Batas fungsi Vercel 300 dtk: sisakan waktu untuk validasi, kompilasi CSS & log
  const deadline = Date.now() + 275_000
  const { client, uid } = await requireAdmin(event)
  const body = await readValidatedBody(event, Body.parse)
  const config = useRuntimeConfig(event)
  const or = await getOpenRouterConfig(event)
  const hasOpenRouter = !!or.apiKey
  const provider = body.provider ?? (hasOpenRouter ? 'openrouter' : 'anthropic')
  if (provider === 'openrouter' && !hasOpenRouter)
    throw createError({ statusCode: 500, statusMessage: 'API key OpenRouter belum diisi. Isi di Admin → Pengaturan.' })
  if (provider === 'anthropic' && !config.anthropicApiKey)
    throw createError({ statusCode: 500, statusMessage: 'NUXT_ANTHROPIC_API_KEY belum diisi di environment server' })

  const { data: cats } = await client.from('categories').select('slug').order('sort')
  const categories = ((cats ?? []) as { slug: string }[]).map(c => c.slug)
  let modelLabel = provider === 'anthropic' ? config.anthropicModel : (body.model || or.model || 'openrouter')

  try {
    let result: AiThemeResult
    let rawText = ''
    if (provider === 'openrouter') {
      // Hanya model gratis yang boleh dipakai (cegah tagihan tak terduga)
      const models = await listFreeModels()
      const wanted = body.model || or.model
      const model = models.find(m => m.id === wanted) ?? models[0]
      if (!model) throw new Error('Tidak ada model gratis OpenRouter yang tersedia saat ini.')
      if (body.model && model.id !== body.model) throw new Error(`Model "${body.model}" bukan model gratis OpenRouter.`)
      modelLabel = model.id
      const r = await generateThemeOpenRouter({
        apiKey: or.apiKey, model, prompt: body.prompt, categories, siteUrl: config.public.siteUrl,
        timeoutMs: deadline - Date.now() - 15_000, previous: body.previous,
      })
      rawText = r.rawText
      result = r
    }
    else {
      result = await generateTheme({ apiKey: config.anthropicApiKey, model: config.anthropicModel, prompt: body.prompt, categories })
    }

    const { data: log } = await client.from('ai_generations').insert({
      prompt: body.prompt, model: result.model, status: result.ok ? 'success' : 'invalid',
      output: result.raw as never, errors: result.errors.length ? result.errors : null, created_by: uid,
    } as never).select('id').single()

    return {
      ok: result.ok,
      errors: result.errors,
      warnings: result.warnings,
      definition: result.definition ?? null,
      css: result.css,
      meta: result.meta,
      attempts: result.attempts,
      model: result.model,
      // Untuk putaran perbaikan berikutnya (OpenRouter), dikirim balik oleh browser
      raw_text: !result.ok && provider === 'openrouter' ? rawText : undefined,
      generation_id: (log as { id?: string } | null)?.id ?? null,
    }
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await client.from('ai_generations').insert({ prompt: body.prompt, model: modelLabel, status: 'error', errors: [message], created_by: uid } as never)
    throw createError({ statusCode: 502, statusMessage: message })
  }
})
