import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const Body = z.object({
  theme_id: z.string().uuid(),
  package_id: z.number().int().positive(),
  method: z.string().trim().regex(/^[A-Z0-9_]{2,30}$/),
  customer_name: z.string().trim().min(2).max(80),
  customer_email: z.string().trim().email().max(120),
  customer_phone: z.string().trim().min(8).max(20),
  ref: z.string().trim().max(20).optional(),
  /** Reseller membuat pesanan untuk pelanggannya sendiri (komisi ke reseller). */
  as_reseller: z.boolean().optional(),
})

interface OrderRow {
  id: string
  merchant_ref: string
  access_key: string
  amount: number
  expires_at: string
}

export default defineEventHandler(async (event) => {
  const body = Body.parse(await readBody(event))
  const phone = normalizePhone(body.customer_phone)
  if (!phone) throw createError({ statusCode: 422, statusMessage: 'Nomor WhatsApp tidak valid' })

  const cfg = tripayConfig(event)
  const channels = await tripayChannels(cfg)
  if (!channels.some(c => c.code === body.method))
    throw createError({ statusCode: 422, statusMessage: 'Metode pembayaran tidak tersedia' })

  // Atribusi reseller: dibuat langsung oleh reseller aktif, atau kode referral
  let resellerUser: string | null = null
  if (body.as_reseller) {
    const user = await serverSupabaseUser(event).catch(() => null)
    const uid = (user as { sub?: string } | null)?.sub
    if (!uid) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk sebagai reseller' })
    const db = await serverSupabaseClient(event)
    const { data } = await db.from('resellers').select('status').eq('id', uid).maybeSingle()
    if ((data as { status?: string } | null)?.status !== 'active')
      throw createError({ statusCode: 403, statusMessage: 'Akun reseller belum aktif' })
    resellerUser = uid
  }
  const refCode = body.ref || getCookie(event, 'ref') || null

  const order = await serverRpc<OrderRow>(event, 'server_create_order', {
    p_theme_id: body.theme_id,
    p_package_id: body.package_id,
    p_customer_name: body.customer_name,
    p_customer_email: body.customer_email,
    p_customer_phone: phone,
    p_reseller_code: resellerUser ? null : refCode,
    p_reseller_user: resellerUser,
    p_created_by: resellerUser,
  })

  const { data: meta } = await publicDb(event)
    .from('themes').select('code, name').eq('id', body.theme_id).single()
  const { data: pkg } = await publicDb(event)
    .from('packages').select('code, name').eq('id', body.package_id).single()

  const origin = siteOrigin(event)
  const returnUrl = `${origin}/pesanan/${order.id}?k=${order.access_key}`
  try {
    const trx = await tripayCreateTransaction(cfg, {
      method: body.method,
      merchant_ref: order.merchant_ref,
      amount: order.amount,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: phone,
      order_items: [{
        sku: `${(meta as { code: string }).code}-${(pkg as { code: string }).code}`.slice(0, 50),
        name: `Undangan ${(meta as { name: string }).name} · ${(pkg as { name: string }).name}`.slice(0, 100),
        price: order.amount,
        quantity: 1,
      }],
      callback_url: `${origin}/api/payments/tripay/callback`,
      return_url: returnUrl,
      expired_time: Math.floor(new Date(order.expires_at).getTime() / 1000),
      signature: tripaySignature(cfg, order.merchant_ref, order.amount),
    })

    await serverRpc(event, 'server_attach_payment', {
      p_order_id: order.id,
      p_method: trx.payment_method,
      p_name: trx.payment_name,
      p_reference: trx.reference,
      p_checkout_url: trx.checkout_url,
      p_pay_code: trx.pay_code,
      p_qr_url: trx.qr_url ?? null,
      p_instructions: trx.instructions ?? null,
      p_fee_customer: trx.fee_customer,
      p_fee_merchant: trx.fee_merchant,
      p_total_amount: trx.amount,
      p_expires_at: trx.expired_time ? new Date(trx.expired_time * 1000).toISOString() : null,
    })
  }
  catch (err) {
    await serverRpc(event, 'server_fail_order', { p_order_id: order.id }).catch(() => {})
    throw err
  }

  return { order_id: order.id, key: order.access_key, url: returnUrl }
})
