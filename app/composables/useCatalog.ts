import type { Category, EventGroup, Package, ThemeRow } from '#shared/types/models'

export type CatalogTheme = Pick<ThemeRow, 'id' | 'code' | 'slug' | 'name' | 'description' | 'category_id' | 'definition' | 'compiled_css' | 'thumbnail_url' | 'music_url' | 'updated_at'>

export function useCatalog() {
  const supabase = useSupabaseClient()
  return useAsyncData('catalog', async () => {
    const [groups, cats, pkgs, themes] = await Promise.all([
      supabase.from('event_groups').select('*').eq('is_active', true).order('sort'),
      supabase.from('categories').select('*').order('sort'),
      supabase.from('packages').select('*').eq('is_active', true).order('sort'),
      supabase.from('themes')
        .select('id, code, slug, name, description, category_id, definition, compiled_css, thumbnail_url, music_url, updated_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
    ])
    return {
      groups: (groups.data ?? []) as EventGroup[],
      categories: (cats.data ?? []) as Category[],
      packages: (pkgs.data ?? []) as Package[],
      themes: (themes.data ?? []) as CatalogTheme[],
    }
  })
}
