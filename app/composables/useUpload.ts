/** Unggah gambar ke bucket invitation-media/{user_id}/{invitation_id}/… dan kembalikan URL publik. */
export function useUpload(invitationId: string) {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const uploading = ref(false)
  const error = ref('')

  async function upload(file: File): Promise<string | null> {
    error.value = ''
    const uid = (user.value as { sub?: string } | null)?.sub
    if (!uid) return null
    if (file.size > 15 * 1024 * 1024) {
      error.value = 'Ukuran foto maksimal 15 MB.'
      return null
    }
    uploading.value = true
    try {
      const blob = await compressImage(file)
      const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${uid}/${invitationId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: err } = await supabase.storage.from('invitation-media').upload(path, blob, {
        contentType: blob.type || file.type, upsert: false, cacheControl: '31536000',
      })
      if (err) {
        error.value = err.message
        return null
      }
      return supabase.storage.from('invitation-media').getPublicUrl(path).data.publicUrl
    }
    finally {
      uploading.value = false
    }
  }

  return { upload, uploading, error }
}
