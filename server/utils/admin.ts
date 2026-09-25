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
