/**
 * Kunjungan halaman dengan ?ref=KODE (dimuat penuh dari luar): catat klik reseller & simpan atribusi 30 hari.
 * Hanya untuk permintaan dokumen HTML (bukan API/aset).
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return
  const url = getRequestURL(event)
  const code = (url.searchParams.get('ref') ?? '').toUpperCase()
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return
  if (/^\/(api|_nuxt|og|r)\//.test(url.pathname) || !(getHeader(event, 'accept') ?? '').includes('text/html')) return

  const v = visitorInfo(event, getHeader(event, 'referer') ?? '', Object.fromEntries(url.searchParams))
  try {
    const res = await serverRpc<{ code: string, link_id: string | null } | null>(event, 'server_ref_click', {
      p_code: code, p_slug: '',
      p_click: { record: !v.bot, kind: 'param', landing: url.pathname.slice(0, 200), source: v.source, referrer_host: v.referrer_host, device: v.device, country: v.country, visitor: v.visitor },
    })
    if (res) setReferralCookies(event, res.code, null)
  }
  catch (e) {
    console.error('[ref-param]', e instanceof Error ? e.message : e)
    setReferralCookies(event, code, null)
  }
})
