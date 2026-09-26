import { z } from 'zod'

const Body = z.object({
  business_name: z.string().max(80), whatsapp: z.string().max(20), bank_name: z.string().max(60),
  account_number: z.string().max(30), account_holder: z.string().max(80), code: z.string().max(20).nullable().optional(),
})

/** Pendaftaran reseller (via RPC apply_reseller) + email ke calon reseller dan admin. */
export default defineEventHandler(async (event) => {
  const { client, email } = await requireUser(event)
  const b = Body.parse(await readBody(event))
  const { data, error } = await client.rpc('apply_reseller', {
    p_business_name: b.business_name, p_whatsapp: b.whatsapp, p_bank_name: b.bank_name,
    p_account_number: b.account_number, p_account_holder: b.account_holder, p_code: b.code || null,
  } as never)
  if (error) throw rpcError(error)
  const r = data as { id: string, business_name: string, code: string, whatsapp: string, bank_name: string | null, bank_account_number: string | null, bank_account_holder: string | null }
  await notifyResellerApplied(event, r, email)
  return { ok: true, code: r.code }
})
