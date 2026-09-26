export interface MediaItem {
  id: string
  kind: 'image' | 'audio'
  name: string
  url: string
  path: string | null
  mime: string | null
  size_bytes: number | null
  created_at: string
}

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' }
export const MEDIA_ACCEPT = { image: 'image/jpeg,image/png,image/webp,image/svg+xml', audio: AUDIO_ACCEPT } as const
const MAX_MB = 10

/** Pustaka media admin (tabel `media` + bucket theme-assets/library/…). */
export function useMediaLibrary() {
  const supabase = useSupabaseClient()
  const uploading = ref(false)
  const error = ref('')

  async function list(kind?: 'image' | 'audio') {
    let q = supabase.from('media').select('*').order('created_at', { ascending: false }).limit(500)
    if (kind) q = q.eq('kind', kind)
    const { data, error: err } = await q
    if (err) throw err
    return (data ?? []) as MediaItem[]
  }

  async function upload(file: File): Promise<MediaItem | null> {
    error.value = ''
    const audio = audioType(file)
    const kind: MediaItem['kind'] | null = audio ? 'audio' : IMAGE_TYPES[file.type] ? 'image' : null
    if (!kind) {
      error.value = `${file.name}: format tidak didukung (JPG, PNG, WEBP, SVG, MP3, M4A, AAC, OGG).`
      return null
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      error.value = `${file.name}: ukuran maksimal ${MAX_MB} MB.`
      return null
    }
    const type = audio ?? file.type
    const ext = kind === 'image' ? IMAGE_TYPES[type]! : ({ 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg' } as Record<string, string>)[type] ?? 'mp3'
    const base = file.name.replace(/\.[^.]+$/, '')
    const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'media'
    const path = `library/${kind}/${Date.now().toString(36)}-${slug}.${ext}`

    uploading.value = true
    try {
      const { error: upErr } = await supabase.storage.from('theme-assets').upload(path, file, { contentType: type, cacheControl: '31536000' })
      if (upErr) throw upErr
      const url = supabase.storage.from('theme-assets').getPublicUrl(path).data.publicUrl
      const { data, error: insErr } = await supabase.from('media')
        .insert({ kind, name: base.slice(0, 120) || slug, url, path, mime: type, size_bytes: file.size } as never)
        .select('*').single()
      if (insErr) {
        await supabase.storage.from('theme-assets').remove([path])
        throw insErr
      }
      return data as MediaItem
    }
    catch (e) {
      error.value = friendlyError(e as { message?: string })
      return null
    }
    finally {
      uploading.value = false
    }
  }

  async function rename(item: MediaItem, name: string) {
    const { error: err } = await supabase.from('media').update({ name } as never).eq('id', item.id)
    if (err) throw err
  }

  async function remove(item: MediaItem) {
    if (item.path) await supabase.storage.from('theme-assets').remove([item.path])
    const { error: err } = await supabase.from('media').delete().eq('id', item.id)
    if (err) throw err
  }

  return { list, upload, rename, remove, uploading, error }
}

export function formatBytes(n: number | null) {
  if (!n) return '-'
  return n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`
}
