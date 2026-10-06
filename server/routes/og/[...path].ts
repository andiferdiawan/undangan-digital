import { withDefaults as contentWithDefaults, isHostKind, type DemoText } from '#shared/theme/content'
import { dateParts } from '#shared/theme/context'
import type { EventKind } from '#shared/theme/constants'

/**
 * Gambar pratinjau link (gaya iklan brand, nama mempelai dinamis):
 *   /og/<slug>.png       → undangan pelanggan
 *   /og/tema/<slug>.png  → tema di katalog (nama contoh)
 *   /og/blog/<slug>.png  → artikel blog (judul & kategori)
 * Hasil di-cache CDN; URL memuat ?v=<hash> sehingga berubah saat nama/tanggal berubah.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const b = /^blog\/([a-z0-9-]{3,90})\.png$/.exec(path)
  if (b) {
    const { data } = await publicDb(event).from('blog_posts')
      .select('title, reading_minutes, category:blog_categories(name)').eq('slug', b[1]!).eq('status', 'published').maybeSingle()
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan' })
    const post = data as unknown as { title: string, reading_minutes: number, category: { name: string } | null }
    const png = await renderBlogOg({ title: post.title, category: post.category?.name, meta: `${post.reading_minutes} menit baca` })
    setHeader(event, 'content-type', 'image/png')
    setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400')
    return png
  }
  const m = /^(?:(tema)\/)?([a-z0-9-]{2,60})\.png$/.exec(path)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Tidak ditemukan' })
  const [, kind, slug] = m
  const db = publicDb(event)

  let raw: unknown
  let eventKind: EventKind = 'wedding'
  let demo: DemoText | undefined
  if (kind === 'tema') {
    const { data } = await db.from('themes').select('id, definition').eq('slug', slug!).eq('status', 'published').maybeSingle()
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan' })
    raw = undefined // nama & tanggal contoh
    const def = (data as { definition: { kind?: EventKind, demo?: DemoText } }).definition
    eventKind = def?.kind ?? 'wedding'
    demo = def?.demo
  }
  else {
    const { data } = await db.rpc('get_public_invitation', { p_slug: slug } as never)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })
    raw = (data as { content: unknown }).content
    const def = (data as { theme?: { definition?: { kind?: EventKind, demo?: DemoText } } }).theme?.definition
    eventKind = def?.kind ?? 'wedding'
    demo = def?.demo
  }

  const c = contentWithDefaults(raw, eventKind, demo)
  const host = isHostKind(eventKind)
  const png = await renderBrandOg({
    groom: c.groom.nickname,
    bride: c.bride.nickname,
    date: dateParts(c.events[0]?.date ?? '')?.full ?? '',
    child: eventKind === 'wedding' ? undefined : host ? (c.host.title || c.host.name) : (c.child.nickname || c.child.name),
    childLabel: { khitan: 'WALIMATUL KHITAN', birthday: 'SYUKURAN ULANG TAHUN', office: 'UNDANGAN RESMI', general: 'UNDANGAN' }[eventKind as string] ?? 'TASYAKURAN AQIQAH',
  })

  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400')
  return png
})
