export interface ResellerPublic { code: string, business_name: string, whatsapp: string }

/** Reseller dari kode referral aktif (bila ada) + nomor WhatsApp kontak yang dipakai situs. */
export async function useReferral() {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const code = useCookie<string | null>('ref')

  const { data: reseller } = await useAsyncData(`ref-${code.value ?? 'none'}`, async () => {
    if (!code.value) return null
    const { data } = await supabase.rpc('get_reseller_public', { p_code: code.value } as never)
    return ((data as ResellerPublic[] | null)?.[0]) ?? null
  }, { watch: [code] })

  const whatsapp = computed(() => reseller.value?.whatsapp || String(config.public.adminWhatsapp))
  return { code, reseller, whatsapp }
}
