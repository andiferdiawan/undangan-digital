import type { H3Event } from 'h3'

interface PaidOrder {
  id: string, merchant_ref: string, channel: 'platform' | 'reseller'
  customer_name: string, customer_email: string, customer_phone: string
  amount: number, fee_customer: number, total_amount: number, payment_name: string | null, paid_at: string | null
  guest_limit: number, commission_rate: number, reseller_share: number, platform_share: number
  theme: { name: string, code: string } | null, package: string | null, token: string | null
  reseller: { business_name: string, code: string, email: string | null } | null
}

const idr = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`
const when = (iso: string | null) => iso
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(iso)) + ' WIB'
  : '-'
/** Baris "Label: nilai" untuk isi email (nilai sudah di-escape) */
const rows = (items: [string, string][]) => items.map(([k, v]) => `<span style="color:#7a857d">${k}</span><br><strong>${v}</strong>`).join('<br><br>')

/**
 * Kirim notifikasi pembayaran lunas: admin selalu, reseller bila penjualan lewat reseller.
 * Diklaim sekali per pesanan di database, jadi aman dipanggil dari callback maupun sinkronisasi.
 * Tidak pernah melempar error: kegagalan email tidak boleh menggagalkan pemrosesan pembayaran.
 */
export async function notifyPaidOrder(event: H3Event, orderId: string) {
  try {
    const o = await serverRpc<PaidOrder | null>(event, 'server_claim_paid_notification', { p_order_id: orderId })
    if (!o) return
    const site = EMAIL_BRAND.site
    const e = escapeHtml
    const theme = o.theme ? `${e(o.theme.name)} (${e(o.theme.code)})` : '-'
    const pkg = `${e(o.package ?? '-')} · ${o.guest_limit} tamu`
    const viaReseller = o.channel === 'reseller' && o.reseller

    const adminTo = String((useRuntimeConfig(event).email as { adminTo?: string }).adminTo ?? '')
      .split(',').map(s => s.trim()).filter(Boolean)
    const jobs: Promise<unknown>[] = []

    if (adminTo.length) {
      jobs.push(sendBrandEmail(event, adminTo,
        `Pembayaran masuk ${idr(o.total_amount)} — ${o.theme?.name ?? 'Tema'}${viaReseller ? ` (via ${o.reseller!.business_name})` : ''}`, {
          preheader: `${o.customer_name} membayar ${idr(o.total_amount)} untuk ${o.theme?.name ?? 'tema'} · ${o.merchant_ref}`,
          title: 'Pembayaran baru diterima 🎉',
          body: [
            `Pesanan <strong>${e(o.merchant_ref)}</strong> sudah <strong>lunas</strong>${o.token ? ' dan token aktivasi sudah terbit' : ''}.`,
            rows([
              ['Pelanggan', `${e(o.customer_name)}<br><span style="font-weight:normal">${e(o.customer_email)} · +${e(o.customer_phone)}</span>`],
              ['Tema & paket', `${theme}<br><span style="font-weight:normal">${pkg}</span>`],
              ['Pembayaran', `${idr(o.total_amount)} via ${e(o.payment_name ?? '-')}<br><span style="font-weight:normal">Harga ${idr(o.amount)}${o.fee_customer ? ` + biaya ${idr(o.fee_customer)}` : ''} · ${when(o.paid_at)}</span>`],
              ['Penjualan', viaReseller
                ? `Reseller ${e(o.reseller!.business_name)} (${e(o.reseller!.code)})<br><span style="font-weight:normal">Komisi ${Number(o.commission_rate)}% = ${idr(o.reseller_share)} · bagian platform ${idr(o.platform_share)}</span>`
                : `Langsung (platform) · ${idr(o.platform_share)}`],
              ...(o.token ? [['Token', `<span style="font-family:monospace;font-size:16px;letter-spacing:1px">${e(o.token)}</span>`] as [string, string]] : []),
            ]),
          ],
          button: { label: 'Lihat di Admin', url: `${site}/admin/pesanan` },
        }))
    }

    if (viaReseller && o.reseller!.email) {
      jobs.push(sendBrandEmail(event, o.reseller!.email, `Penjualan baru! Komisi ${idr(o.reseller_share)} masuk ke saldomu`, {
        preheader: `${o.customer_name} membeli ${o.theme?.name ?? 'tema'} lewat link kamu.`,
        title: 'Alhamdulillah, ada penjualan baru! 🎉',
        body: [
          `Halo <strong>${e(o.reseller!.business_name)}</strong>, pelangganmu baru saja menyelesaikan pembayaran.`,
          rows([
            ['Pelanggan', e(o.customer_name)],
            ['Tema & paket', `${theme}<br><span style="font-weight:normal">${pkg}</span>`],
            ['Harga', idr(o.amount)],
            ['Komisimu', `${idr(o.reseller_share)} <span style="font-weight:normal">(${Number(o.commission_rate)}%)</span>`],
            ...(o.token ? [['Token aktivasi pelanggan', `<span style="font-family:monospace;font-size:16px;letter-spacing:1px">${e(o.token)}</span>`] as [string, string]] : []),
          ]),
          'Komisi sudah masuk ke saldo reseller dan bisa dicairkan sesuai jadwal pencairan.',
        ],
        button: { label: 'Buka Dashboard Reseller', url: `${site}/reseller/dashboard` },
        note: `No. pesanan ${e(o.merchant_ref)}. Terima kasih sudah menjadi bagian dari Undangan Virtual.`,
      }))
    }

    const results = await Promise.all(jobs)
    for (const r of results as { sent: boolean, reason?: string }[])
      if (!r.sent) console.error('[notify] email pembayaran tidak terkirim:', o.merchant_ref, r.reason)
  }
  catch (err) {
    console.error('[notify] gagal memproses notifikasi pembayaran', orderId, (err as Error).message)
  }
}
