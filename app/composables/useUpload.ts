const AUDIO_EXT: Record<string, string> = {
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg',
}
export const AUDIO_ACCEPT = 'audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,.mp3,.m4a,.aac,.ogg'
export const AUDIO_MAX_MB = 10

/** Tipe MIME audio dari file; sebagian browser mengosongkan file.type untuk .m4a/.mp3. */
export function audioType(file: File): string | null {
  if (AUDIO_EXT[file.type]) return file.type === 'audio/mp3' ? 'audio/mpeg' : file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ({ mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg' } as Record<string, string>)[ext ?? ''] ?? null
}

/** Unggah gambar/audio ke bucket invitation-media/{user_id}/{invitation_id}/… dan kembalikan URL publik. */
export function useUpload(invitationId: string) {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const uploading = ref(false)
  const error = ref('')

  async function put(blob: Blob, ext: string, contentType: string) {
    const uid = (user.value as { sub?: string } | null)?.sub
    if (!uid) return null
    const path = `${uid}/${invitationId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: err } = await supabase.storage.from('invitation-media').upload(path, blob, {
      contentType, upsert: false, cacheControl: '31536000',
    })
    if (err) {
      error.value = err.message
      return null
    }
    return supabase.storage.from('invitation-media').getPublicUrl(path).data.publicUrl
  }

  async function upload(file: File): Promise<string | null> {
    error.value = ''
    if (file.size > 15 * 1024 * 1024) {
      error.value = 'Ukuran foto maksimal 15 MB.'
      return null
    }
    uploading.value = true
    try {
      const blob = await compressImage(file)
      const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase()
      return await put(blob, ext, blob.type || file.type)
    }
    finally {
      uploading.value = false
    }
  }

  async function uploadAudio(file: File): Promise<string | null> {
    error.value = ''
    const type = audioType(file)
    if (!type) {
      error.value = 'Format audio harus MP3, M4A, AAC, atau OGG.'
      return null
    }
    if (file.size > AUDIO_MAX_MB * 1024 * 1024) {
      error.value = `Ukuran audio maksimal ${AUDIO_MAX_MB} MB.`
      return null
    }
    uploading.value = true
    try {
      return await put(file, AUDIO_EXT[type]!, type)
    }
    finally {
      uploading.value = false
    }
  }

  return { upload, uploadAudio, uploading, error }
}
