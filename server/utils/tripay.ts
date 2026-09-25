import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export interface TripayChannel {
  group: string
  code: string
  name: string
  type: string
  fee_merchant: { flat: number, percent: number }
  fee_customer: { flat: number, percent: number }
  total_fee: { flat: number, percent: number }
  minimum_fee: number | null
  maximum_fee: number | null
  icon_url: string
  active: boolean
}

export interface TripayTransaction {
  reference: string
  merchant_ref: string
  payment_method: string
  payment_name: string
  amount: number
  fee_merchant: number
  fee_customer: number
  total_fee: number
  amount_received: number
  pay_code: string | null
  pay_url: string | null
  checkout_url: string
  status: 'UNPAID' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED' | 'REFUND'
  expired_time: number
  paid_at?: number | null
  instructions?: { title: string, steps: string[] }[]
  qr_url?: string | null
}

export function tripayConfig(event?: H3Event) {
  const c = useRuntimeConfig(event).tripay as { mode: string, apiKey: string, privateKey: string, merchantCode: string }
  if (!c.apiKey || !c.privateKey || !c.merchantCode)
    throw createError({ statusCode: 500, statusMessage: 'Payment gateway belum dikonfigurasi' })
  const production = c.mode === 'production'
  return { ...c, baseUrl: production ? 'https://tripay.co.id/api/' : 'https://tripay.co.id/api-sandbox/' }
}

const hmac = (key: string, data: string) => createHmac('sha256', key).update(data).digest('hex')

/** Signature transaksi closed payment: HMAC-SHA256(merchant_code + merchant_ref + amount). */
export function tripaySignature(cfg: ReturnType<typeof tripayConfig>, merchantRef: string, amount: number) {
  return hmac(cfg.privateKey, `${cfg.merchantCode}${merchantRef}${amount}`)
}

/** Verifikasi callback: HMAC-SHA256 dari raw body, dibandingkan secara timing-safe. */
export function verifyTripayCallback(cfg: ReturnType<typeof tripayConfig>, rawBody: string, signature: string | undefined) {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false
  const expected = Buffer.from(hmac(cfg.privateKey, rawBody), 'hex')
  const given = Buffer.from(signature.toLowerCase(), 'hex')
  return expected.length === given.length && timingSafeEqual(expected, given)
}

async function tripayRequest<T>(cfg: ReturnType<typeof tripayConfig>, path: string, init: { method?: 'GET' | 'POST', query?: Record<string, string>, body?: unknown } = {}): Promise<T> {
  const res = await $fetch.raw<{ success: boolean, message?: string, data: T }>(path, {
    baseURL: cfg.baseUrl,
    method: init.method ?? 'GET',
    query: init.query,
    body: init.body as Record<string, unknown> | undefined,
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    timeout: 20_000,
    ignoreResponseError: true,
  })
  const json = res._data
  if (!res.ok || !json?.success)
    throw createError({ statusCode: 502, statusMessage: `Tripay: ${json?.message || res.statusText || 'gagal'}` })
  return json.data
}

let channelCache: { at: number, key: string, data: TripayChannel[] } | null = null
export async function tripayChannels(cfg: ReturnType<typeof tripayConfig>) {
  const key = `${cfg.mode}:${cfg.merchantCode}`
  if (channelCache && channelCache.key === key && Date.now() - channelCache.at < 10 * 60_000) return channelCache.data
  const data = (await tripayRequest<TripayChannel[]>(cfg, 'merchant/payment-channel')).filter(c => c.active)
  channelCache = { at: Date.now(), key, data }
  return data
}

export function tripayCreateTransaction(cfg: ReturnType<typeof tripayConfig>, body: Record<string, unknown>) {
  return tripayRequest<TripayTransaction>(cfg, 'transaction/create', { method: 'POST', body })
}

export function tripayTransactionDetail(cfg: ReturnType<typeof tripayConfig>, reference: string) {
  return tripayRequest<TripayTransaction>(cfg, 'transaction/detail', { query: { reference } })
}
