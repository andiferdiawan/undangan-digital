import { z } from 'zod'

/** Pengajuan pencairan komisi + email ke reseller dan admin. */
export default defineEventHandler(async (event) => {
  const { client, uid, email } = await requireUser(event)
  const { amount } = z.object({ amount: z.number().int().positive() }).parse(await readBody(event))
  const { data, error } = await client.rpc('request_payout', { p_amount: amount } as never)
  if (error) throw rpcError(error)
  const { data: r } = await client.from('resellers').select('business_name, code').eq('id', uid).maybeSingle()
  await notifyPayoutRequested(event, data as never, r as never, email)
  return { ok: true }
})
