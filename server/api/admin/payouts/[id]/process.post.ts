import { z } from 'zod'

const Body = z.object({
  action: z.enum(['paid', 'rejected']),
  reference: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
})

/** Admin memproses pencairan (dibayar/ditolak) + email ke reseller dan admin. */
export default defineEventHandler(async (event) => {
  const { client } = await requireAdmin(event)
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const b = Body.parse(await readBody(event))
  const { data, error } = await client.rpc('admin_process_payout', {
    p_payout: id, p_action: b.action, p_reference: b.reference || null, p_note: b.note || null,
  } as never)
  if (error) throw rpcError(error)
  const p = data as { reseller_id: string }
  const [{ data: r }, { data: prof }] = await Promise.all([
    client.from('resellers').select('business_name, code').eq('id', p.reseller_id).maybeSingle(),
    client.from('profiles').select('email').eq('id', p.reseller_id).maybeSingle(),
  ])
  if (r) await notifyPayoutProcessed(event, data as never, r as never, (prof as { email: string | null } | null)?.email ?? null)
  return { ok: true }
})
