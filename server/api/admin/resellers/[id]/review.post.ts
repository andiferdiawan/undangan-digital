import { z } from 'zod'

const Body = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'rejected']),
  commission_rate: z.number().min(0).max(90).nullable(),
  use_default_rate: z.boolean(),
  note: z.string().trim().max(500).nullable(),
})

/** Tinjau reseller (lewat RPC admin, RLS tetap berlaku) lalu kirim email saat baru disetujui. */
export default defineEventHandler(async (event) => {
  const { client } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = Body.parse(await readBody(event))

  const { data: before } = await client.from('resellers').select('status').eq('id', id).maybeSingle()
  const { data: row, error } = await client.rpc('admin_review_reseller', {
    p_reseller: id, p_status: body.status,
    p_commission_rate: body.commission_rate, p_use_default_rate: body.use_default_rate, p_note: body.note,
  } as never)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  const r = row as { status: string, business_name: string, code: string } | null
  const wasActive = (before as { status?: string } | null)?.status === 'active'
  if (!r || r.status !== 'active' || wasActive) return { ok: true, email: null }

  const { data: prof } = await client.from('profiles').select('email, full_name').eq('id', id).maybeSingle()
  const to = (prof as { email: string | null } | null)?.email
  if (!to) return { ok: true, email: { sent: false, reason: 'Reseller tidak punya email' } }

  const site = EMAIL_BRAND.site
  const email = await sendBrandEmail(event, to, 'Selamat, Anda resmi menjadi Reseller Undangan Virtual!', {
    preheader: 'Pendaftaran reseller Anda disetujui. Mulai bagikan link dan dapatkan komisi.',
    title: 'Selamat, Anda resmi menjadi Reseller!',
    body: [
      `Assalamu'alaikum <strong>${escapeHtml(r.business_name)}</strong>,`,
      'Alhamdulillah, pendaftaran reseller Anda di <strong>Undangan Virtual</strong> telah <strong>disetujui</strong>. Sekarang Anda bisa menjual undangan digital dan mendapatkan komisi dari setiap pesanan.',
      `Kode reseller Anda: <strong style="font-size:18px;letter-spacing:2px;color:#2f4a3a">${escapeHtml(r.code)}</strong><br>Link referral: <a href="${site}/?ref=${encodeURIComponent(r.code)}" style="color:#2f4a3a">${site}/?ref=${escapeHtml(r.code)}</a>`,
      'Buka dashboard reseller untuk melihat pesanan, komisi, dan mengajukan pencairan.',
    ],
    button: { label: 'Buka Dashboard Reseller', url: `${site}/reseller/dashboard` },
    note: 'Ada pertanyaan? Hubungi admin kami melalui WhatsApp.',
  })
  return { ok: true, email }
})
