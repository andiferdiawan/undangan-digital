import type { H3Event } from 'h3'

/** Email "Selamat, Anda resmi menjadi Reseller" — dipakai saat admin menyetujui atau menambahkan reseller. */
export async function sendResellerApprovedEmail(event: H3Event, to: string, r: { business_name: string, code: string }, extraNote?: string) {
  const site = EMAIL_BRAND.site
  // Salinan untuk admin (tidak memengaruhi hasil pengiriman ke reseller)
  const admins = adminRecipients(event)
  if (admins.length) {
    sendBrandEmail(event, admins, `Reseller aktif: ${r.business_name} (${r.code})`, {
      preheader: 'Catatan persetujuan reseller.',
      title: 'Reseller baru sudah aktif',
      body: [`<strong>${escapeHtml(r.business_name)}</strong> (kode ${escapeHtml(r.code)}, ${escapeHtml(to)}) sekarang aktif sebagai reseller dan sudah diberi tahu lewat email.`],
      button: { label: 'Lihat Reseller', url: `${site}/admin/reseller` },
    }).catch(() => {})
  }
  return sendBrandEmail(event, to, 'Selamat, Anda resmi menjadi Reseller Undangan Virtual!', {
    preheader: 'Akun reseller Anda sudah aktif. Mulai bagikan link dan dapatkan komisi.',
    title: 'Selamat, Anda resmi menjadi Reseller!',
    body: [
      `Assalamu'alaikum <strong>${escapeHtml(r.business_name)}</strong>,`,
      'Alhamdulillah, akun reseller Anda di <strong>Undangan Virtual</strong> sudah <strong>aktif</strong>. Sekarang Anda bisa menjual undangan digital dan mendapatkan komisi dari setiap pesanan.',
      `Kode reseller Anda: <strong style="font-size:18px;letter-spacing:2px;color:#2f4a3a">${escapeHtml(r.code)}</strong><br>Link referral: <a href="${site}/?ref=${encodeURIComponent(r.code)}" style="color:#2f4a3a">${site}/?ref=${escapeHtml(r.code)}</a>`,
      ...(extraNote ? [extraNote] : []),
      'Buka dashboard reseller untuk melihat pesanan, komisi, melengkapi data rekening, dan mengajukan pencairan.',
    ],
    button: { label: 'Buka Dashboard Reseller', url: `${site}/reseller/dashboard` },
    note: 'Ada pertanyaan? Hubungi admin kami melalui WhatsApp.',
  })
}
