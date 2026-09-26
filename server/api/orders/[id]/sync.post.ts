import { z } from 'zod'

/** Cek ulang status ke Tripay (cadangan bila callback terlambat/terlewat). */
export default defineEventHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { key } = z.object({ key: z.string().regex(/^[a-f0-9]{32}$/) }).parse(await readBody(event))

  const { data } = await publicDb(event).rpc('get_order_payment_ref', { p_order_id: id, p_key: key } as never)
  const row = (data as { merchant_ref: string, payment_reference: string | null, status: string }[] | null)?.[0]
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  if (row.status !== 'unpaid' || !row.payment_reference) return { status: row.status }

  const detail = await tripayTransactionDetail(tripayConfig(event), row.payment_reference)
  const order = await serverRpc<{ id: string, status: string }>(event, 'server_process_payment', {
    p_merchant_ref: row.merchant_ref,
    p_reference: row.payment_reference,
    p_status: detail.status,
    p_total_amount: detail.amount,
    p_paid_at: detail.paid_at ? new Date(detail.paid_at * 1000).toISOString() : null,
  })
  if (order.status === 'paid') await notifyPaidOrder(event, order.id)
  return { status: order.status }
})
