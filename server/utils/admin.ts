import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/** Pastikan pemanggil adalah admin. Mengembalikan Supabase client dengan JWT user (RLS tetap berlaku). */
export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null)
  const uid = (user as { sub?: string, id?: string } | null)?.sub ?? (user as { id?: string } | null)?.id
  if (!uid) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu' })

  const client = await serverSupabaseClient(event)
  const { data } = await client.from('profiles').select('role').eq('id', uid).maybeSingle()
  if ((data as { role?: string } | null)?.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Khusus admin' })

  return { client, uid }
}

/** Pastikan pemanggil sudah masuk. Client memakai JWT user, jadi RLS & auth.uid() di RPC tetap berlaku. */
export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null)
  const u = user as { sub?: string, id?: string, email?: string } | null
  const uid = u?.sub ?? u?.id
  if (!uid) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu' })
  return { client: await serverSupabaseClient(event), uid, email: u?.email ?? null }
}

/** Error RPC → error HTTP yang membawa hint (mis. saldo tersedia) ke UI. */
export function rpcError(error: { message: string, hint?: string | null }) {
  return createError({ statusCode: 400, statusMessage: error.message, data: { hint: error.hint ?? null } })
}
