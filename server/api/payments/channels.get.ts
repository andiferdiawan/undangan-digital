/** Daftar metode pembayaran aktif dari Tripay (di-cache 10 menit). */
export default defineEventHandler(async (event) => {
  const channels = await tripayChannels(tripayConfig(event))
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return channels.map(c => ({
    code: c.code, name: c.name, group: c.group, icon_url: c.icon_url,
    fee_customer: c.fee_customer, minimum_fee: c.minimum_fee, maximum_fee: c.maximum_fee,
  }))
})
