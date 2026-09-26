/**
 * Tata letak email bermerek Undangan Virtual.
 * Dipakai oleh email dari server (mis. reseller disetujui) dan oleh
 * scripts/build-email-templates.ts untuk template email Supabase Auth.
 * HTML tabel + CSS inline agar tampil rapi di Gmail/Outlook.
 */
export const EMAIL_BRAND = {
  name: 'Undangan Virtual',
  tagline: 'Satu Link, Sejuta Doa Restu',
  site: 'https://undanganvirtual.com',
  logo: 'https://undanganvirtual.com/logo-undangan-virtual.png',
  whatsapp: '6281953927523',
  green: '#2f4a3a',
  clay: '#d9825b',
  cream: '#fbf7f0',
}

export interface BrandEmail {
  /** Teks pratinjau di daftar kotak masuk */
  preheader: string
  title: string
  /** Paragraf HTML (sudah aman, bukan input pengguna mentah) */
  body: string[]
  button?: { label: string, url: string }
  /** Catatan kecil di bawah tombol */
  note?: string
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function brandEmailHtml(e: BrandEmail): string {
  const B = EMAIL_BRAND
  const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3b4a40">${html}</p>`
  const button = e.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px"><tr><td style="border-radius:999px;background:${B.green}">
<a href="${e.button.url}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${e.button.label}</a>
</td></tr></table>
<p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:#7a857d">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><a href="${e.button.url}" style="color:${B.green};word-break:break-all">${e.button.url}</a></p>`
    : ''
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e.title}</title></head>
<body style="margin:0;padding:0;background:${B.cream};font-family:'Segoe UI',Helvetica,Arial,sans-serif">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${e.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${B.cream};padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td align="center" style="padding:6px 0 22px"><a href="${B.site}"><img src="${B.logo}" width="210" alt="${B.name}" style="display:block;width:210px;height:auto;border:0"></a></td></tr>
<tr><td style="background:#ffffff;border-radius:22px;padding:34px 30px;box-shadow:0 8px 30px rgba(47,74,58,0.08)">
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;font-weight:normal;color:${B.green}">${e.title}</h1>
${e.body.map(p).join('\n')}
${button}
${e.note ? `<p style="margin:14px 0 0;padding-top:14px;border-top:1px solid #eef1ec;font-size:12.5px;line-height:1.6;color:#7a857d">${e.note}</p>` : ''}
</td></tr>
<tr><td align="center" style="padding:22px 10px 0;font-size:12px;line-height:1.7;color:#7a857d">
<em style="color:${B.clay}">${B.tagline}</em><br>
${B.name} · <a href="${B.site}" style="color:${B.green}">undanganvirtual.com</a> · <a href="https://wa.me/${B.whatsapp}" style="color:${B.green}">WhatsApp</a><br>
Email ini dikirim otomatis, mohon tidak membalas.
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

export function brandEmailText(e: BrandEmail): string {
  const strip = (s: string) => s.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
  return [
    e.title, '',
    ...e.body.map(strip).flatMap(s => [s, '']),
    ...(e.button ? [`${e.button.label}: ${e.button.url}`, ''] : []),
    ...(e.note ? [strip(e.note), ''] : []),
    `${EMAIL_BRAND.name} — ${EMAIL_BRAND.tagline}`, EMAIL_BRAND.site,
  ].join('\n')
}
