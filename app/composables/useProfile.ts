export interface Profile { id: string, email: string | null, full_name: string | null, role: 'user' | 'admin' }

/** Profil user yang sedang login (termasuk peran admin). */
export function useProfile() {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const profile = useState<Profile | null>('profile', () => null)

  async function refresh() {
    const id = (user.value as { sub?: string } | null)?.sub
    if (!id) {
      profile.value = null
      return null
    }
    if (profile.value?.id === id) return profile.value
    const { data } = await supabase.from('profiles').select('id, email, full_name, role').eq('id', id).maybeSingle()
    profile.value = (data as Profile | null) ?? null
    return profile.value
  }

  return { profile, refresh, user }
}
