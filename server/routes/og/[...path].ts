import type { ThemeDefinition } from '#shared/theme/schema'
import type { InvitationContent } from '#shared/theme/content'

/**
 * Gambar pratinjau link:
 *   /og/<slug>.png       → undangan pelanggan (nama mempelai + tema yang dipakai)
 *   /og/tema/<slug>.png  → tema di katalog (data contoh)
 * Hasil di-cache CDN; URL memuat ?v=<hash> sehingga berubah saat isi berubah.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const m = /^(?:(tema)\/)?([a-z0-9-]{2,60})\.png$/.exec(path)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Tidak ditemukan' })
  const [, kind, slug] = m
  const db = publicDb(event)
  const origin = siteOrigin(event)

  let png: Buffer
  if (kind === 'tema') {
    const { data } = await db.from('themes').select('name, definition').eq('slug', slug!).eq('status', 'published').maybeSingle()
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan' })
    const def = data.definition as ThemeDefinition
    const content = contentOf(undefined)
    if (def.demo) {
      content.cover_photos = (def.demo.cover_photos ?? []).map(url => ({ url }))
      content.gallery = (def.demo.gallery ?? []).map(url => ({ url, caption: '' }))
    }
    png = await renderOgImage({ definition: def, content, themeName: `Tema ${data.name}`, footer: `undanganvirtual.com/tema/${slug}` }, origin)
  }
  else {
    const { data } = await db.rpc('get_public_invitation', { p_slug: slug } as never)
    const inv = data as { content: unknown, style: Record<string, string>, assets: Record<string, string>, theme: { name: string, definition: ThemeDefinition } } | null
    if (!inv) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })
    const content: InvitationContent = contentOf(inv.content)
    png = await renderOgImage({
      definition: inv.theme.definition, style: inv.style, assets: inv.assets, content,
      themeName: `Tema ${inv.theme.name}`, footer: `${new URL(origin).host}/${slug}`,
    }, origin)
  }

  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400')
  return png
})
