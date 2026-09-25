import type { InvitationRow, ThemeRow } from '#shared/types/models'

export type InvitationWithTheme = InvitationRow & {
  theme: Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'definition' | 'compiled_css'>
}

/** Undangan milik user (RLS memastikan hanya pemilik/admin yang bisa membaca). */
export function useInvitation(id: string) {
  const supabase = useSupabaseClient()
  return useAsyncData(`invitation-${id}`, async () => {
    const { data, error } = await supabase
      .from('invitations')
      .select('*, theme:themes(id, code, slug, name, definition, compiled_css)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan', fatal: true })
    return data as unknown as InvitationWithTheme
  })
}

export function inviteUrl(slug: string, guest?: string) {
  const config = useRuntimeConfig()
  const base = config.public.siteUrl || (import.meta.client ? window.location.origin : '')
  return `${base}/${slug}${guest ? `?to=${encodeURIComponent(guest)}` : ''}`
}
