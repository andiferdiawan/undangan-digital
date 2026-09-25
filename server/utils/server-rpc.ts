import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

let client: SupabaseClient | null = null

/**
 * Memanggil fungsi server_* di database. Fungsi tersebut menolak panggilan
 * tanpa secret server yang cocok, jadi aman walau memakai publishable key.
 */
export async function serverRpc<T = unknown>(event: H3Event, fn: string, args: Record<string, unknown>): Promise<T> {
  const config = useRuntimeConfig(event)
  const secret = config.serverRpcSecret as string
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'NUXT_SERVER_RPC_SECRET belum diisi' })
  const supa = (config.public.supabase ?? {}) as { url?: string, key?: string }
  client ??= createClient(supa.url!, supa.key!, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data, error } = await client.rpc(fn, { p_secret: secret, ...args } as never)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message, data: { hint: error.hint } })
  return data as T
}

export function publicDb(event: H3Event) {
  const config = useRuntimeConfig(event)
  const supa = (config.public.supabase ?? {}) as { url?: string, key?: string }
  client ??= createClient(supa.url!, supa.key!, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

/** Nomor HP Indonesia → format 62xxxxxxxx. */
export function normalizePhone(v: string): string | null {
  let d = String(v || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = `62${d.slice(1)}`
  else if (d.startsWith('8')) d = `62${d}`
  return /^62[0-9]{8,14}$/.test(d) ? d : null
}

export function siteOrigin(event: H3Event) {
  const site = useRuntimeConfig(event).public.siteUrl as string
  return (site || getRequestURL(event).origin).replace(/\/$/, '')
}
