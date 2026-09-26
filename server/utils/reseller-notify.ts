import type { H3Event } from 'h3'
import type { BrandEmail } from './email-layout'

/** Notifikasi email seputar reseller: pendaftaran dan pencairan komisi (ke reseller + admin). */

const idr = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`
const day = (d: string | null | undefined) => d
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(new Date(`${d.slice(0, 10)}T12:00:00+07:00`))
  : '-'
const rows = (items: [string, string][]) => items.map(([k, v]) => `<span style="color:#7a857d">${k}</span><br><strong>${v}</strong>`).join('<br><br>')

export function adminRecipients(event: H3Event): string[] {
  return String((useRuntimeConfig(event).email as { adminTo?: string }).adminTo ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)
}

/** Kirim beberapa email sekaligus; kegagalan hanya dicatat, tidak menggagalkan aksi utama. */
async function sendAll(event: H3Event, jobs: [string | string[] | null | undefined, string, BrandEmail][]) {
  const results = await Promise.allSettled(jobs
    .filter(([to]) => Array.isArray(to) ? to.length : !!to)
    .map(([to, subject, email]) => sendBrandEmail(event, to!, subject, email)))
  for (const r of results) {
    if (r.status === 'rejected') console.error('[reseller-notify]', r.reason)
    else if (!r.value.sent) console.error('[reseller-notify] tidak terkirim:', r.value.reason)
  }
}

interface ResellerInfo { business_name: string, code: string, whatsapp?: string | null, bank_name?: string | null, bank_account_number?: string | null, bank_account_holder?: string | null }
interface PayoutInfo { id: string, amount: number, bank_name: string, bank_account_number: string, bank_account_holder: string, scheduled_for: string, transfer_reference?: string | null, admin_note?: string | null, status: string }

const bankLine = (p: { bank_name?: string | null, bank_account_number?: string | null, bank_account_holder?: string | null }) =>
  p.bank_account_number ? `${escapeHtml(p.bank_name ?? '')} ${escapeHtml(p.bank_account_number)} a.n. ${escapeHtml(p.bank_account_holder ?? '')}` : 'Belum diisi'

export async function notifyResellerApplied(event: H3Event, r: ResellerInfo, email: string | null) {
  const e = escapeHtml
  const site = EMAIL_BRAND.site
  await sendAll(event, [
    [email, 'Pendaftaran reseller kamu sudah kami terima', {
      preheader: 'Tim kami sedang meninjau pendaftaranmu.',
      title: 'Terima kasih sudah mendaftar! 🙌',
      body: [
        `Halo <strong>${e(r.business_name)}</strong>, pendaftaran reseller <strong>Undangan Virtual</strong> kamu sudah masuk dan sedang kami tinjau.`,
        rows([['Kode reseller (usulan)', e(r.code)], ['WhatsApp', `+${e(r.whatsapp ?? '-')}`]]),
        'Kamu akan menerima email lagi begitu pendaftaran disetujui. Biasanya tidak lebih dari 1×24 jam.',
      ],
      button: { label: 'Lihat Status Pendaftaran', url: `${site}/reseller` },
    }],
    [adminRecipients(event), `Pendaftaran reseller baru: ${r.business_name}`, {
      preheader: `${r.business_name} (${r.code}) menunggu persetujuan.`,
      title: 'Ada pendaftaran reseller baru',
      body: [
        'Pendaftaran berikut menunggu persetujuan Anda:',
        rows([
          ['Nama usaha', `${e(r.business_name)} <span style="font-weight:normal">(${e(r.code)})</span>`],
          ['Email', e(email ?? '-')],
          ['WhatsApp', `+${e(r.whatsapp ?? '-')}`],
          ['Rekening', bankLine(r)],
        ]),
      ],
      button: { label: 'Tinjau di Admin', url: `${site}/admin/reseller` },
    }],
  ])
}

export async function notifyPayoutRequested(event: H3Event, p: PayoutInfo, r: ResellerInfo, email: string | null) {
  const e = escapeHtml
  const site = EMAIL_BRAND.site
  await sendAll(event, [
    [email, `Pengajuan pencairan ${idr(p.amount)} sudah kami terima`, {
      preheader: `Dijadwalkan ditransfer ${day(p.scheduled_for)}.`,
      title: 'Pengajuan pencairan diterima ✅',
      body: [
        `Halo <strong>${e(r.business_name)}</strong>, pengajuan pencairan komisimu sudah tercatat.`,
        rows([['Nominal', idr(p.amount)], ['Rekening tujuan', bankLine(p)], ['Jadwal transfer', day(p.scheduled_for)]]),
        'Selama belum diproses, kamu masih bisa membatalkan pengajuan dari dashboard reseller.',
      ],
      button: { label: 'Buka Dashboard Reseller', url: `${site}/reseller/dashboard` },
    }],
    [adminRecipients(event), `Pengajuan pencairan ${idr(p.amount)} — ${r.business_name}`, {
      preheader: `Jadwal transfer ${day(p.scheduled_for)}.`,
      title: 'Pengajuan pencairan komisi baru',
      body: [rows([
        ['Reseller', `${e(r.business_name)} <span style="font-weight:normal">(${e(r.code)})</span>`],
        ['Nominal', idr(p.amount)],
        ['Rekening tujuan', bankLine(p)],
        ['Jadwal transfer', day(p.scheduled_for)],
      ])],
      button: { label: 'Proses di Admin', url: `${site}/admin/pencairan` },
    }],
  ])
}

export async function notifyPayoutProcessed(event: H3Event, p: PayoutInfo, r: ResellerInfo, email: string | null) {
  const e = escapeHtml
  const site = EMAIL_BRAND.site
  const paid = p.status === 'paid'
  const detail = rows([
    ['Nominal', idr(p.amount)],
    ['Rekening tujuan', bankLine(p)],
    ...(paid ? [['Referensi transfer', e(p.transfer_reference ?? '-')] as [string, string]] : []),
    ...(p.admin_note ? [[paid ? 'Catatan' : 'Alasan', e(p.admin_note)] as [string, string]] : []),
  ])
  await sendAll(event, [
    [email, paid ? `Komisi ${idr(p.amount)} sudah ditransfer 💸` : `Pengajuan pencairan ${idr(p.amount)} ditolak`, {
      preheader: paid ? 'Silakan cek mutasi rekeningmu.' : 'Saldo sudah dikembalikan ke akun resellermu.',
      title: paid ? 'Alhamdulillah, komisimu sudah ditransfer!' : 'Pengajuan pencairan ditolak',
      body: [
        `Halo <strong>${e(r.business_name)}</strong>,`,
        paid ? 'Pencairan komisimu sudah kami transfer. Terima kasih atas kerja kerasmu!' : 'Mohon maaf, pengajuan pencairanmu belum bisa kami proses. Saldonya sudah dikembalikan dan bisa kamu ajukan lagi.',
        detail,
      ],
      button: { label: 'Buka Dashboard Reseller', url: `${site}/reseller/dashboard` },
      note: paid ? 'Jika dana belum masuk dalam 1×24 jam, hubungi admin via WhatsApp.' : 'Pastikan data rekening sudah benar sebelum mengajukan lagi.',
    }],
    [adminRecipients(event), `${paid ? 'Pencairan dibayar' : 'Pencairan ditolak'}: ${idr(p.amount)} — ${r.business_name}`, {
      preheader: 'Catatan pemrosesan pencairan.',
      title: paid ? 'Pencairan ditandai sudah dibayar' : 'Pencairan ditolak',
      body: [`Reseller <strong>${e(r.business_name)}</strong> (${e(r.code)}) sudah diberi tahu lewat email.`, detail],
      button: { label: 'Lihat Pencairan', url: `${site}/admin/pencairan` },
    }],
  ])
}

export async function notifyPayoutCancelled(event: H3Event, p: PayoutInfo, r: ResellerInfo) {
  await sendAll(event, [
    [adminRecipients(event), `Pengajuan pencairan dibatalkan — ${r.business_name}`, {
      preheader: 'Tidak perlu ditransfer.',
      title: 'Pengajuan pencairan dibatalkan reseller',
      body: [
        `<strong>${escapeHtml(r.business_name)}</strong> (${escapeHtml(r.code)}) membatalkan pengajuan pencairan berikut, jadi <strong>tidak perlu ditransfer</strong>:`,
        rows([['Nominal', idr(p.amount)], ['Jadwal semula', day(p.scheduled_for)]]),
      ],
      button: { label: 'Lihat Pencairan', url: `${EMAIL_BRAND.site}/admin/pencairan` },
    }],
  ])
}
