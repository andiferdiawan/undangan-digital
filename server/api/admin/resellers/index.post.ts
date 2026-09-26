import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const phone62 = (v: string) => {
  let d = v.replace(/\D/g, '')
  if (d.startsWith('0')) d = `62${d.slice(1)}`
  else if (d.startsWith('8')) d = `62${d}`
  return d
}

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(72).optional().or(z.literal('')),
  business_name: z.string().trim().min(2).max(60),
  whatsapp: z.string().trim().min(8).max(20).transform(phone62).pipe(z.string().regex(/^62[0-9]{8,14}$/, 'Nomor WhatsApp tidak valid')),
  code: z.string().trim().max(12).optional(),
  bank_name: z.string().trim().max(40).optional(),
  account_number: z.string().trim().max(30).optional().transform(v => v?.replace(/\D/g, '') || undefined),
  account_holder: z.string().trim().max(60).optional(),
  commission_rate: z.number().min(0).max(90).nullable().optional(),
  note: z.string().trim().max(200).optional(),
  send_email: z.boolean().default(true),
})

/**
 * Admin menambahkan reseller langsung tanpa formulir pendaftaran.
 * Email sudah punya akun → langsung dijadikan reseller aktif.
 * Email belum terdaftar → akun dibuat dengan kata sandi sementara dari admin
 * (pemilik tetap menerima email konfirmasi dari Supabase Auth).
 */
export default defineEventHandler(async (event) => {
  const { client } = await requireAdmin(event)
  const parsed = Body.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Data tidak valid' })
  const b = parsed.data

  let accountCreated = false
  const { data: prof } = await client.from('profiles').select('id').eq('email', b.email).maybeSingle()
  let userId = (prof as { id: string } | null)?.id

  if (!userId) {
    if (!b.password) throw createError({ statusCode: 400, statusMessage: 'NEED_PASSWORD' })
    const pub = useRuntimeConfig(event).public.supabase as { url: string, key: string }
    const anon = createClient(pub.url, pub.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data, error } = await anon.auth.signUp({
      email: b.email,
      password: b.password,
      options: { data: { full_name: b.business_name }, emailRedirectTo: `${EMAIL_BRAND.site}/reseller/dashboard` },
    })
    if (error) throw createError({ statusCode: 400, statusMessage: error.message })
    // identities kosong = email sebenarnya sudah terdaftar (Supabase menyamarkan respons)
    if (!data.user || data.user.identities?.length === 0) throw createError({ statusCode: 409, statusMessage: 'EMAIL_EXISTS' })
    userId = data.user.id
    accountCreated = true
  }

  const { data: row, error } = await client.rpc('admin_create_reseller', {
    p_user: userId, p_business_name: b.business_name, p_whatsapp: b.whatsapp, p_code: b.code || null,
    p_bank_name: b.bank_name || null, p_account_number: b.account_number || null, p_account_holder: b.account_holder || null,
    p_commission_rate: b.commission_rate ?? null, p_note: b.note || null,
  } as never)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  const r = row as { business_name: string, code: string }
  const email = b.send_email
    ? await sendResellerApprovedEmail(event, b.email, r, accountCreated
      ? `Akun Anda dibuatkan oleh admin. Masuk dengan email <strong>${escapeHtml(b.email)}</strong> dan kata sandi sementara yang diberikan admin (konfirmasi email Anda terlebih dahulu), lalu segera ganti kata sandi.`
      : undefined)
    : null
  return { ok: true, code: r.code, account_created: accountCreated, email }
})
