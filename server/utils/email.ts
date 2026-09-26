import type { H3Event } from 'h3'
import { brandEmailHtml, brandEmailText, type BrandEmail } from './email-layout'

/**
 * Kirim email bermerek lewat Resend (https://resend.com).
 * Env: NUXT_EMAIL_RESEND_API_KEY, NUXT_EMAIL_FROM (mis. "Undangan Virtual <noreply@undanganvirtual.com>").
 * Tanpa API key email dilewati (tidak error) agar alur admin tetap jalan.
 */
export async function sendBrandEmail(event: H3Event, to: string | string[], subject: string, email: BrandEmail): Promise<{ sent: boolean, reason?: string }> {
  const cfg = useRuntimeConfig(event).email as { resendApiKey: string, from: string, adminTo: string }
  const key = String(cfg.resendApiKey ?? '').trim()
  if (!key) return { sent: false, reason: 'Email belum dikonfigurasi (NUXT_EMAIL_RESEND_API_KEY kosong)' }
  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: { from: cfg.from, to: Array.isArray(to) ? to : [to], subject, html: brandEmailHtml(email), text: brandEmailText(email) },
      timeout: 10000,
    })
    return { sent: true }
  }
  catch (e) {
    const msg = (e as { data?: { message?: string } }).data?.message ?? (e as Error).message
    console.error('[email] gagal kirim', subject, msg)
    return { sent: false, reason: `Gagal mengirim email: ${msg}` }
  }
}
