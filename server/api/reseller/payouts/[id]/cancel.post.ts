import { z } from 'zod'

/** Reseller membatalkan pengajuan pencairan + email ke admin (agar tidak ditransfer). */
export default defineEventHandler(async (event) => {
  const { client, uid } = await requireUser(event)
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { error } = await client.rpc('cancel_payout', { p_payout: id } as never)
  if (error) throw rpcError(error)
  const [{ data: p }, { data: r }] = await Promise.all([
    client.from('payouts').select('*').eq('id', id).maybeSingle(),
    client.from('resellers').select('business_name, code').eq('id', uid).maybeSingle(),
  ])
  if (p && r) await notifyPayoutCancelled(event, p as never, r as never)
  return { ok: true }
})
