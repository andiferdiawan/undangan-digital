import { z } from 'zod'

const Body = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).optional(),
  category_id: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  definition: z.unknown().optional(),
  music_url: z.string().trim().url().startsWith('https://').max(500).nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const { client } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = Body.parse(await readBody(event))

  const patch: Record<string, unknown> = { ...body }
  delete patch.definition
  let warnings: string[] = []
  if (body.definition !== undefined) {
    const compiled = await compileTheme(body.definition)
    if (!compiled.ok) throw createError({ statusCode: 422, statusMessage: 'Tema tidak lolos validasi', data: { errors: compiled.errors } })
    patch.definition = compiled.definition
    patch.compiled_css = compiled.css
    warnings = compiled.warnings
  }

  const { error } = await client.from('themes').update(patch as never).eq('id', id!)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return { ok: true, warnings }
})
