import { z } from 'zod'

const Body = z.object({ prompt: z.string().trim().min(10).max(2000) })

export default defineEventHandler(async (event) => {
  const { client, uid } = await requireAdmin(event)
  const { prompt } = Body.parse(await readBody(event))
  const config = useRuntimeConfig(event)
  if (!config.anthropicApiKey)
    throw createError({ statusCode: 500, statusMessage: 'NUXT_ANTHROPIC_API_KEY belum diisi di environment server' })

  const { data: cats } = await client.from('categories').select('slug').order('sort')
  const categories = ((cats ?? []) as { slug: string }[]).map(c => c.slug)

  try {
    const result = await generateTheme({ apiKey: config.anthropicApiKey, model: config.anthropicModel, prompt, categories })
    const { data: log } = await client.from('ai_generations').insert({
      prompt, model: result.model, status: result.ok ? 'success' : 'invalid',
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
      generation_id: (log as { id?: string } | null)?.id ?? null,
    }
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await client.from('ai_generations').insert({ prompt, model: config.anthropicModel, status: 'error', errors: [message], created_by: uid } as never)
    throw createError({ statusCode: 502, statusMessage: message })
  }
})
