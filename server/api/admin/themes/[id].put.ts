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
  const body = await readValidatedBody(event, Body.parse)

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

  const { data: before } = await client.from('themes').select('status').eq('id', id!).maybeSingle()
  const { data: after, error } = await client.from('themes').update(patch as never).eq('id', id!).select('slug, status, category_id').single()
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  // Beri tahu Bing (IndexNow) bila halaman tema publik berubah: baru tayang, isinya diperbarui, atau ditarik dari katalog
  const t = after as { slug: string, status: string, category_id: number | null }
  const wasPublished = (before as { status: string } | null)?.status === 'published'
  if (t.status === 'published' || wasPublished)
    await submitIndexNow(event, await themeIndexPaths(event, t))
  return { ok: true, warnings }
})
