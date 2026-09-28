import type { Category, EventGroup, Package, ThemeRow } from '#shared/types/models'

/** Tema lengkap (definisi + CSS) untuk dirender. */
export type CatalogTheme = Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'description' | 'category_id' | 'definition' | 'compiled_css' | 'thumbnail_url' | 'music_url' | 'updated_at'>
/** Indeks ringan semua tema tayang: cukup untuk filter, hitungan, dan pagination tanpa memuat definisi. */
export type ThemeIndex = Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'description' | 'category_id' | 'updated_at' | 'created_at'>

const FULL_COLS = 'id, code, slug, name, description, category_id, definition, compiled_css, thumbnail_url, music_url, updated_at'
/** Tema tanpa kategori dianggap Pernikahan. */
export const DEFAULT_GROUP = 'pernikahan'

export function useCatalog() {
  const supabase = useSupabaseClient()
  return useAsyncData('catalog', async () => {
    const [groups, cats, pkgs, themes] = await Promise.all([
      supabase.from('event_groups').select('*').eq('is_active', true).order('sort'),
      supabase.from('categories').select('*').order('sort'),
      supabase.from('packages').select('*').eq('is_active', true).order('sort'),
      supabase.from('themes')
        .select('id, code, slug, name, description, category_id, updated_at, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
    ])
    return {
      groups: (groups.data ?? []) as EventGroup[],
      categories: (cats.data ?? []) as Category[],
      packages: (pkgs.data ?? []) as Package[],
      themes: (themes.data ?? []) as ThemeIndex[],
    }
  })
}

/** Jenis acara (induk) dari sebuah kategori. */
export function groupOfCategory(categories: Category[], categoryId: number | null) {
  return categories.find(c => c.id === categoryId)?.group_slug ?? DEFAULT_GROUP
}

/** Satu tema lengkap berdasarkan slug (halaman detail, checkout, pratinjau). */
export function useTheme(slug: string) {
  const supabase = useSupabaseClient()
  return useAsyncData(`theme-${slug}`, async () => {
    const { data } = await supabase.from('themes').select(FULL_COLS).eq('slug', slug).eq('status', 'published').maybeSingle()
    return (data as CatalogTheme | null) ?? null
  })
}

/** Tema lengkap untuk daftar id (satu halaman katalog), urutannya mengikuti ids. */
export async function fetchThemesByIds(supabase: ReturnType<typeof useSupabaseClient>, ids: string[]) {
  if (!ids.length) return [] as CatalogTheme[]
  const { data } = await supabase.from('themes').select(FULL_COLS).in('id', ids)
  const rows = (data ?? []) as CatalogTheme[]
  return ids.map(id => rows.find(r => r.id === id)).filter((r): r is CatalogTheme => !!r)
}
