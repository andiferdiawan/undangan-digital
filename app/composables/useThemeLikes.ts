const KEY = 'uv-liked-themes'

/**
 * Tema yang disukai (tombol hati di katalog). Disimpan di localStorage agar pengunjung tanpa akun pun
 * bisa menandai tema; setelah login, suka lokal digabung dengan milik akun di tabel theme_likes.
 * Isinya id tema (bukan slug) supaya tetap valid walau slug berubah.
 */
export function useThemeLikes() {
  const liked = useState<string[]>('liked-themes', () => [])
  /** true setelah localStorage terbaca di browser (hindari beda tampilan saat hidrasi). */
  const ready = useState('liked-themes-ready', () => false)
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userId = () => (user.value as { sub?: string } | null)?.sub ?? null

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(liked.value)) }
    catch { /* mode privat / penyimpanan penuh: suka tetap berlaku selama sesi */ }
  }

  function load() {
    if (import.meta.server) return
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '[]')
      liked.value = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
    }
    catch { liked.value = [] }
    ready.value = true
  }

  /** Gabungkan suka lokal dengan milik akun, lalu simpan ke database yang belum tercatat. */
  async function sync() {
    const uid = userId()
    if (!uid) return
    const { data, error } = await supabase.from('theme_likes').select('theme_id').eq('user_id', uid)
    if (error) return
    const remote = (data ?? []).map(r => (r as { theme_id: string }).theme_id)
    const missing = liked.value.filter(id => !remote.includes(id))
    if (missing.length) {
      // Abaikan tema yang sudah dihapus agar foreign key tidak menggagalkan seluruh batch
      const { data: exist } = await supabase.from('themes').select('id').in('id', missing)
      const rows = ((exist ?? []) as { id: string }[]).map(t => ({ user_id: uid, theme_id: t.id }))
      if (rows.length) await supabase.from('theme_likes').upsert(rows as never, { onConflict: 'user_id,theme_id', ignoreDuplicates: true })
    }
    liked.value = [...new Set([...liked.value, ...remote])]
    save()
  }

  /** Suka/batal suka; mengembalikan status baru. Bila tersimpan ke akun gagal, perubahan dibatalkan. */
  async function toggle(id: string) {
    const before = liked.value
    const on = !before.includes(id)
    liked.value = on ? [...before, id] : before.filter(x => x !== id)
    save()
    const uid = userId()
    if (!uid) return on
    const { error } = on
      ? await supabase.from('theme_likes').upsert({ user_id: uid, theme_id: id } as never, { onConflict: 'user_id,theme_id', ignoreDuplicates: true })
      : await supabase.from('theme_likes').delete().eq('user_id', uid).eq('theme_id', id)
    if (error) {
      liked.value = before
      save()
      return !on
    }
    return on
  }

  const isLiked = (id: string) => liked.value.includes(id)
  const count = computed(() => liked.value.length)

  return { liked, ready, count, load, sync, toggle, isLiked }
}
