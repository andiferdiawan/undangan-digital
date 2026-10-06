/**
 * Link reseller:
 *   /r/KODE        → link utama, ke beranda
 *   /r/KODE/slug   → link pelacakan reseller, ke halaman tujuan link tsb.
 * Klik dicatat (kecuali bot/preview), atribusi disimpan di cookie 30 hari, lalu redirect 302.
 * Parameter UTM pada link ikut diteruskan ke halaman tujuan.
 */
export default defineEventHandler(async (event) => {
  const [rawCode = '', rawSlug = ''] = (getRouterParam(event, 'path') ?? '').split('/')
  const code = rawCode.toUpperCase()
  // Slug tidak valid → tetap dihitung sebagai link utama (kode reseller tidak hilang)
  const slug = /^[a-z0-9-]{2,40}$/.test(rawSlug.toLowerCase()) ? rawSlug.toLowerCase() : ''
  const query = getQuery(event) as Record<string, string | undefined>
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => typeof v === 'string') as [string, string][]).toString()
  if (!/^[A-Z0-9]{4,12}$/.test(code))
    return sendRedirect(event, '/', 302)

  const v = visitorInfo(event, getHeader(event, 'referer') ?? '', query)
  let target = '/'
  try {
    const res = await serverRpc<{ code: string, link_id: string | null, target: string } | null>(event, 'server_ref_click', {
      p_code: code,
      p_slug: slug,
      p_click: { record: !v.bot, kind: 'link', source: v.source, referrer_host: v.referrer_host, device: v.device, country: v.country, visitor: v.visitor },
    })
    if (res) {
      setReferralCookies(event, res.code, res.link_id)
      target = res.target || '/'
    }
  }
  catch (e) {
    console.error('[ref-click]', e instanceof Error ? e.message : e)
    // Tetap simpan kode agar penjualan tidak hilang walau pencatatan gagal
    setReferralCookies(event, code, null)
  }
  setHeader(event, 'cache-control', 'no-store')
  setHeader(event, 'x-robots-tag', 'noindex')
  return sendRedirect(event, qs ? `${target}${target.includes('?') ? '&' : '?'}${qs}` : target, 302)
})
