import { z } from 'zod'

const PREFIX: Record<string, string> = { syari: 'SYR', minimalis: 'MIN', floral: 'FLR', modern: 'MOD', elegan: 'ELG', rustic: 'RUS', adat: 'ADT' }

const Body = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  description: z.string().trim().max(300).default(''),
  category_id: z.number().int().positive(),
  status: z.enum(['draft', 'published']).default('draft'),
  source: z.enum(['manual', 'ai']).default('manual'),
  definition: z.unknown(),
  generation_id: z.string().uuid().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const { client, uid } = await requireAdmin(event)
  const body = Body.parse(await readBody(event))

  const compiled = await compileTheme(body.definition)
  if (!compiled.ok) throw createError({ statusCode: 422, statusMessage: 'Tema tidak lolos validasi', data: { errors: compiled.errors } })

  // Kode produk otomatis per kategori: SYR-002, MIN-003, …
  const { data: cat } = await client.from('categories').select('slug').eq('id', body.category_id).single()
  const prefix = PREFIX[(cat as { slug: string } | null)?.slug ?? ''] ?? 'THM'
  const { data: existing } = await client.from('themes').select('code').like('code', `${prefix}-%`)
  const next = Math.max(0, ...((existing ?? []) as { code: string }[]).map(t => Number(t.code.split('-')[1]) || 0)) + 1
  const code = `${prefix}-${String(next).padStart(3, '0')}`

  const { data, error } = await client.from('themes').insert({
    code, slug: body.slug, name: body.name, description: body.description || null,
    category_id: body.category_id, definition: compiled.definition, compiled_css: compiled.css,
    status: body.status, source: body.source, created_by: uid,
  } as never).select('id, code, slug').single()
  if (error) throw createError({ statusCode: 400, statusMessage: error.message.includes('duplicate') ? 'Slug tema sudah dipakai' : error.message })

  if (body.generation_id)
    await client.from('ai_generations').update({ theme_id: (data as { id: string }).id } as never).eq('id', body.generation_id)

  return { ...(data as object), warnings: compiled.warnings }
})
