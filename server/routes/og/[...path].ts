import { withDefaults as contentWithDefaults } from '#shared/theme/content'
import { dateParts } from '#shared/theme/context'
import type { EventKind } from '#shared/theme/constants'

/**
 * Gambar pratinjau link (gaya iklan brand, nama mempelai dinamis):
 *   /og/<slug>.png       → undangan pelanggan
 *   /og/tema/<slug>.png  → tema di katalog (nama contoh)
 * Hasil di-cache CDN; URL memuat ?v=<hash> sehingga berubah saat nama/tanggal berubah.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const m = /^(?:(tema)\/)?([a-z0-9-]{2,60})\.png$/.exec(path)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Tidak ditemukan' })
  const [, kind, slug] = m
  const db = publicDb(event)

  let raw: unknown
  let eventKind: EventKind = 'wedding'
  let demoChild: Record<string, string> | undefined
  if (kind === 'tema') {
    const { data } = await db.from('themes').select('id, definition').eq('slug', slug!).eq('status', 'published').maybeSingle()
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Tema tidak ditemukan' })
    raw = undefined // nama & tanggal contoh
    const def = (data as { definition: { kind?: EventKind, demo?: { child?: Record<string, string> } } }).definition
    eventKind = def?.kind ?? 'wedding'
    demoChild = def?.demo?.child
  }
  else {
    const { data } = await db.rpc('get_public_invitation', { p_slug: slug } as never)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })
    raw = (data as { content: unknown }).content
    eventKind = (data as { theme?: { definition?: { kind?: EventKind } } }).theme?.definition?.kind ?? 'wedding'
  }

  const c = contentWithDefaults(raw, eventKind)
  if (demoChild) Object.assign(c.child, demoChild)
  const png = await renderBrandOg({
    groom: c.groom.nickname,
    bride: c.bride.nickname,
    date: dateParts(c.events[0]?.date ?? '')?.full ?? '',
    child: eventKind === 'wedding' ? undefined : (c.child.nickname || c.child.name),
    childLabel: { khitan: 'WALIMATUL KHITAN', birthday: 'SYUKURAN ULANG TAHUN' }[eventKind as string] ?? 'TASYAKURAN AQIQAH',
  })

  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400')
  return png
})
