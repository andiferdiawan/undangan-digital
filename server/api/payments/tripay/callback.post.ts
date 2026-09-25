/**
 * Callback Tripay. Keamanan berlapis:
 * 1. Signature HMAC dari raw body diverifikasi (timing-safe).
 * 2. Status & nominal dikonfirmasi ulang ke API Tripay (transaction/detail).
 * 3. Pemrosesan di database idempotent dan memeriksa referensi + nominal.
 */
export default defineEventHandler(async (event) => {
  const cfg = tripayConfig(event)
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  const signature = getHeader(event, 'x-callback-signature')

  if (!verifyTripayCallback(cfg, raw, signature)) {
    setResponseStatus(event, 401)
    return { success: false, message: 'Invalid signature' }
  }
  if (getHeader(event, 'x-callback-event') !== 'payment_status')
    return { success: true, message: 'Event diabaikan' }

  let payload: { reference?: string, merchant_ref?: string, is_closed_payment?: number }
  try {
    payload = JSON.parse(raw)
  }
  catch {
    setResponseStatus(event, 400)
    return { success: false, message: 'Invalid JSON' }
  }
  if (!payload.reference || !payload.merchant_ref) {
    setResponseStatus(event, 400)
    return { success: false, message: 'Data tidak lengkap' }
  }

  // Merchant sandbox bisa dipakai situs lain; abaikan transaksi yang bukan milik platform ini
  if (!payload.merchant_ref.startsWith('UDG-'))
    return { success: true, message: 'Bukan transaksi platform ini' }

  const detail = await tripayTransactionDetail(cfg, payload.reference)
  if (detail.merchant_ref !== payload.merchant_ref) {
    setResponseStatus(event, 400)
    return { success: false, message: 'Merchant ref tidak cocok' }
  }

  await serverRpc(event, 'server_process_payment', {
    p_merchant_ref: detail.merchant_ref,
    p_reference: detail.reference,
    p_status: detail.status,
    p_total_amount: detail.amount,
    p_paid_at: detail.paid_at ? new Date(detail.paid_at * 1000).toISOString() : null,
  })
  return { success: true }
})
