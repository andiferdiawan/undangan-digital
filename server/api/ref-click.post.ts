import { z } from 'zod'

/** Klik lewat parameter ?ref=KODE di halaman mana pun (dikirim middleware klien). */
const Body = z.object({
  code: z.string().trim().regex(/^[A-Za-z0-9]{4,12}$/),
  path: z.string().trim().max(200).regex(/^\/[\w\-/.~%]*$/),
  referrer: z.string().trim().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)
  const raw = await readBody(event).catch(() => null)
  const parsed = Body.safeParse(typeof raw === 'string' ? JSON.parse(raw || 'null') : raw)
  if (!parsed.success) return null
  const v = visitorInfo(event, parsed.data.referrer ?? '')
  if (v.bot) return null
  try {
    await serverRpc(event, 'server_ref_click', {
      p_code: parsed.data.code, p_slug: '',
      p_click: { kind: 'param', landing: parsed.data.path, source: v.source, referrer_host: v.referrer_host, device: v.device, country: v.country, visitor: v.visitor },
    })
  }
  catch (e) { console.error('[ref-click param]', e instanceof Error ? e.message : e) }
  return null
})
