/**
 * Supabase tiruan (PostgREST + Auth + RPC seperlunya) berisi DATA CONTOH untuk screenshot panduan reseller.
 * Tidak ada data pelanggan asli: nama, nomor, dan angka di sini fiktif. Tema dimuat dari scripts/themes/*.ts dan
 * dikompilasi dengan compiler yang sama seperti seed, jadi tampilannya identik dengan tema yang tayang.
 * Dipakai oleh scripts/panduan/screenshots.ts; bisa juga dijalankan sendiri: npx tsx scripts/panduan/supabase-tiruan.ts
 */
import { readdirSync } from 'node:fs'
import http from 'node:http'
import { compileTheme } from '../../server/utils/theme-compiler'

export const DEMO_USER_ID = '7f1c2a90-5b6d-4e1f-9a3c-0d2e4f6a8b10'
export const DEMO_EMAIL = 'berkah.wo@contoh.id'
export const DEMO_INVITATION_ID = '3c9d8e7f-1a2b-4c5d-8e9f-0a1b2c3d4e5f'
export const DEMO_ORDER_ID = '5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b'

// ---------- Data acuan (sama dengan database) ----------
const groups = [
  { slug: 'pernikahan', name: 'Pernikahan & Lamaran', icon: 'wedding', description: 'Undangan akad, walimah, resepsi, dan lamaran', sort: 1, is_active: true },
  { slug: 'aqiqah', name: 'Aqiqah & Tasyakuran', icon: 'aqiqah', description: 'Aqiqah kelahiran buah hati, tasyakuran, dan syukuran', sort: 2, is_active: true },
  { slug: 'khitanan', name: 'Khitanan', icon: 'khitan', description: 'Walimatul khitan dan syukuran sunatan', sort: 3, is_active: true },
  { slug: 'ulang-tahun', name: 'Ulang Tahun', icon: 'birthday', description: 'Ulang tahun anak, milad, dan syukuran', sort: 4, is_active: true },
  { slug: 'kantor', name: 'Acara Kantor', icon: 'office', description: 'Peresmian, grand opening, seminar, dan rapat kerja', sort: 5, is_active: true },
  { slug: 'umum', name: 'Acara Umum', icon: 'general', description: 'Pengajian, silaturahmi, reuni, dan kegiatan sekolah', sort: 6, is_active: true },
]
const categories = [
  { id: 1, slug: 'syari', name: 'Syar\'i', sort: 1, group_slug: 'pernikahan' },
  { id: 2, slug: 'minimalis', name: 'Minimalis', sort: 2, group_slug: 'pernikahan' },
  { id: 3, slug: 'floral', name: 'Floral', sort: 3, group_slug: 'pernikahan' },
  { id: 4, slug: 'modern', name: 'Modern', sort: 4, group_slug: 'pernikahan' },
  { id: 5, slug: 'elegan', name: 'Elegan & Luxury', sort: 5, group_slug: 'pernikahan' },
  { id: 6, slug: 'rustic', name: 'Rustic', sort: 6, group_slug: 'pernikahan' },
  { id: 7, slug: 'adat', name: 'Adat & Tradisional', sort: 7, group_slug: 'pernikahan' },
  { id: 8, slug: 'aqiqah-putra', name: 'Aqiqah Putra', sort: 20, group_slug: 'aqiqah' },
  { id: 9, slug: 'aqiqah-putri', name: 'Aqiqah Putri', sort: 21, group_slug: 'aqiqah' },
  { id: 10, slug: 'khitan-ceria', name: 'Ceria Anak', sort: 30, group_slug: 'khitanan' },
  { id: 11, slug: 'khitan-klasik', name: 'Islami Klasik', sort: 31, group_slug: 'khitanan' },
  { id: 12, slug: 'ulang-tahun-anak', name: 'Ulang Tahun Anak', sort: 40, group_slug: 'ulang-tahun' },
  { id: 13, slug: 'milad-dewasa', name: 'Milad Dewasa', sort: 41, group_slug: 'ulang-tahun' },
  { id: 14, slug: 'peresmian-korporat', name: 'Peresmian & Korporat', sort: 50, group_slug: 'kantor' },
  { id: 15, slug: 'seminar-rapat', name: 'Seminar & Rapat Kerja', sort: 51, group_slug: 'kantor' },
  { id: 16, slug: 'pengajian-silaturahmi', name: 'Pengajian & Silaturahmi', sort: 60, group_slug: 'umum' },
  { id: 17, slug: 'reuni-komunitas', name: 'Reuni & Komunitas', sort: 61, group_slug: 'umum' },
  { id: 18, slug: 'ekskul-sekolah', name: 'Ekskul & Sekolah', sort: 62, group_slug: 'umum' },
]
const packages = [
  { id: 1, code: 'BASIC-100', name: 'Paket 100 Tamu', guest_limit: 100, price: 79000, is_active: true, sort: 1 },
  { id: 2, code: 'PREMIUM-500', name: 'Paket 500 Tamu', guest_limit: 500, price: 99000, is_active: true, sort: 2 },
  { id: 3, code: 'EXCLUSIVE-1000', name: 'Paket 1000 Tamu', guest_limit: 1000, price: 189000, is_active: true, sort: 3 },
]
const settings = { id: true, default_reseller_rate: 70, payout_days: [5, 25], min_payout: 50000, order_expiry_hours: 24, bing_site_verification: null, google_site_verification: null }

// ---------- Tema dari scripts/themes (definisi & CSS dikompilasi saat pertama diminta) ----------
type Meta = { code: string, slug: string, name: string, description: string, category: string }
type ThemeMod = { meta: Meta, definition: unknown }
const themeDir = new URL('../themes/', import.meta.url)
const themeMods = new Map<string, () => Promise<ThemeMod>>()
for (const f of readdirSync(themeDir).filter(f => f.endsWith('.ts') && !f.startsWith('_')))
  themeMods.set(f.replace(/\.ts$/, ''), () => import(new URL(f, themeDir).href) as Promise<ThemeMod>)
const uuid = (n: number, prefix = '0d1e') => `${prefix}0000-0000-4000-8000-${String(n).padStart(12, '0')}`
let themeIndex: Record<string, unknown>[] = []
const compiled = new Map<string, Promise<Record<string, unknown>>>()
async function loadThemeIndex() {
  const rows: Record<string, unknown>[] = []
  let i = 0
  for (const [file, load] of themeMods) {
    const m = (await load()).meta
    if (!m?.slug) continue
    i++
    rows.push({
      id: uuid(i), code: m.code, slug: m.slug, name: m.name, description: m.description, status: 'published',
      category_id: categories.find(c => c.slug === m.category)?.id ?? null,
      // Urutan katalog: terbaru dulu (urutan berkas dibalik agar tema unggulan di depan)
      created_at: new Date(Date.UTC(2026, 9, 1) - i * 3600e3).toISOString(), updated_at: '2026-10-01T00:00:00Z', file,
    })
  }
  const featured = ['sakinah-sage', 'mocca-gypsophila', 'lengkung-mawar', 'aurelia-luxe', 'amplop-zaitun', 'pita-marun', 'anggrek-emas', 'pilot-cilik']
  const rank = (r: Record<string, unknown>) => { const i = featured.indexOf(r.slug as string); return i === -1 ? featured.length : i }
  rows.sort((a, b) => rank(a) - rank(b))
  rows.forEach((r, k) => { r.created_at = new Date(Date.UTC(2026, 9, 1) - k * 3600e3).toISOString() })
  themeIndex = rows
}
function fullTheme(row: Record<string, unknown>) {
  const slug = row.slug as string
  if (!compiled.has(slug)) {
    compiled.set(slug, (async () => {
      const mod = await themeMods.get(row.file as string)!()
      const r = await compileTheme(mod.definition)
      if (!r.ok) throw new Error(`Tema ${slug} tidak valid: ${r.errors.join('; ')}`)
      const { file: _, ...rest } = row
      return { ...rest, definition: r.definition, compiled_css: r.css, thumbnail_url: null, music_url: null }
    })())
  }
  return compiled.get(slug)!
}

// ---------- Data contoh reseller (fiktif) ----------
const days = (n: number, h = 10) => new Date(Date.UTC(2026, 9, 9 - n, h - 7, 15)).toISOString()
const reseller = {
  id: DEMO_USER_ID, code: 'BERKAH', business_name: 'Berkah Wedding Organizer', whatsapp: '6281234567890',
  bank_name: 'Bank Syariah Indonesia', bank_account_number: '7123456789', bank_account_holder: 'Siti Rahmawati', status: 'active',
}
const summary = {
  reseller, effective_rate: 70, balance: 415800, pending_payout: 207900, paid_out: 1247400, commission_total: 1871100,
  sales_count: 27, sales_amount: 2673000, min_payout: 50000, payout_days: [5, 25], next_payout_date: '2026-10-25',
}
const theme = (slug: string) => ({ name: themeIndex.find(t => t.slug === slug)?.name ?? slug })
const orders = () => [
  { id: 'o1', merchant_ref: 'UV-2610-0931', access_key: 'k1', status: 'unpaid', customer_name: 'Dewi Lestari', customer_phone: '6281311112222', amount: 99000, reseller_share: 69300, commission_rate: 70, created_at: days(0, 9), paid_at: null, theme: theme('mocca-gypsophila'), package: { name: 'Paket 500 Tamu' }, token: null },
  { id: 'o2', merchant_ref: 'UV-2610-0928', access_key: 'k2', status: 'paid', customer_name: 'Rina & Fajar', customer_phone: '6281322223333', amount: 99000, reseller_share: 69300, commission_rate: 70, created_at: days(1, 15), paid_at: days(1, 16), theme: theme('sakinah-sage'), package: { name: 'Paket 500 Tamu' }, token: { code: 'K7M2QX', redeemed_at: null } },
  { id: 'o3', merchant_ref: 'UV-2610-0917', access_key: 'k3', status: 'paid', customer_name: 'Keluarga Bpk. Hasan', customer_phone: '6281333334444', amount: 79000, reseller_share: 55300, commission_rate: 70, created_at: days(3, 11), paid_at: days(3, 11), theme: theme('anggrek-emas'), package: { name: 'Paket 100 Tamu' }, token: { code: 'P4T8WN', redeemed_at: days(3, 13) } },
  { id: 'o4', merchant_ref: 'UV-2610-0902', access_key: 'k4', status: 'paid', customer_name: 'CV Maju Bersama', customer_phone: '6281344445555', amount: 189000, reseller_share: 132300, commission_rate: 70, created_at: days(5, 10), paid_at: days(5, 10), theme: theme('gunting-pita'), package: { name: 'Paket 1000 Tamu' }, token: { code: 'B9R3LD', redeemed_at: days(5, 12) } },
  { id: 'o5', merchant_ref: 'UV-2609-0877', access_key: 'k5', status: 'expired', customer_name: 'Ayu Pratiwi', customer_phone: '6281355556666', amount: 99000, reseller_share: 69300, commission_rate: 70, created_at: days(8, 20), paid_at: null, theme: theme('lengkung-mawar'), package: { name: 'Paket 500 Tamu' }, token: null },
]
const payouts = [
  { id: 'p1', amount: 207900, status: 'requested', scheduled_for: '2026-10-25', requested_at: days(1, 19), transfer_reference: null, admin_note: null },
  { id: 'p2', amount: 623700, status: 'paid', scheduled_for: '2026-10-05', requested_at: days(6, 9), transfer_reference: 'BSI 0510-77812', admin_note: null },
  { id: 'p3', amount: 623700, status: 'paid', scheduled_for: '2026-09-25', requested_at: days(16, 9), transfer_reference: 'BSI 2509-55120', admin_note: null },
]
const stat = (clicks: number, visitors: number, orders: number, paid: number, price = 99000) => ({ clicks, visitors, orders, paid, revenue: paid * price, commission: Math.round(paid * price * 0.7) })
const linkStats = (n: number) => {
  const f = n / 30
  const sc = (s: ReturnType<typeof stat>) => ({ ...s, clicks: Math.round(s.clicks * f), visitors: Math.round(s.visitors * f), orders: Math.round(s.orders * f), paid: Math.round(s.paid * f), revenue: Math.round(s.revenue * f), commission: Math.round(s.commission * f) })
  const links = [
    { id: 'l1', slug: 'status-wa', label: 'Status WhatsApp', target_path: '/katalog', is_active: true, created_at: days(40), ...sc(stat(412, 301, 14, 9)) },
    { id: 'l2', slug: 'ig-bio', label: 'Bio Instagram', target_path: '/', is_active: true, created_at: days(38), ...sc(stat(268, 214, 7, 5)) },
    { id: 'l3', slug: 'tiktok-mocca', label: 'Video TikTok Mocca', target_path: '/tema/mocca-gypsophila', is_active: true, created_at: days(20), ...sc(stat(355, 290, 6, 4)) },
    { id: 'l4', slug: 'grup-alumni', label: 'Grup alumni SMA', target_path: '/katalog/pernikahan', is_active: true, created_at: days(15), ...sc(stat(96, 71, 3, 2)) },
    { id: 'l5', slug: 'aqiqah-fb', label: 'Grup FB Ibu Muda', target_path: '/katalog/aqiqah', is_active: false, created_at: days(60), ...sc(stat(41, 37, 1, 1, 79000)) },
  ]
  const main = sc(stat(187, 150, 8, 6))
  const all = [main, ...links]
  const totals = Object.fromEntries((['clicks', 'visitors', 'orders', 'paid', 'revenue', 'commission'] as const).map(k => [k, all.reduce((s, x) => s + x[k], 0)]))
  const daily = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(2026, 9, 9 - (n - 1 - i)))
    const wave = 0.6 + 0.4 * Math.sin(i / 2.3) + (d.getUTCDay() === 6 || d.getUTCDay() === 0 ? 0.45 : 0)
    return { day: d.toISOString().slice(0, 10), clicks: Math.round(Math.max(4, (totals.clicks / n) * wave)), paid: i % 4 === 1 ? 1 : i % 9 === 3 ? 2 : 0 }
  })
  return {
    days: n, code: 'BERKAH', totals, daily, links, main,
    sources: [{ source: 'sosial', clicks: Math.round(902 * f) }, { source: 'langsung', clicks: Math.round(318 * f) }, { source: 'organik', clicks: Math.round(97 * f) }, { source: 'referral', clicks: Math.round(42 * f) }],
    referrers: [{ host: 'instagram.com', clicks: Math.round(241 * f) }, { host: 'tiktok.com', clicks: Math.round(203 * f) }, { host: 'facebook.com', clicks: Math.round(88 * f) }, { host: 'google.com', clicks: Math.round(71 * f) }],
    landings: [{ path: '/katalog', clicks: Math.round(512 * f) }, { path: '/', clicks: Math.round(455 * f) }, { path: '/tema/mocca-gypsophila', clicks: Math.round(355 * f) }],
    devices: { mobile: Math.round(1180 * f), desktop: Math.round(149 * f), tablet: Math.round(30 * f) },
    recent_sales: [
      { at: days(1, 16), amount: 99000, commission: 69300, link: 'Status WhatsApp', theme: theme('sakinah-sage').name },
      { at: days(3, 11), amount: 79000, commission: 55300, link: 'Bio Instagram', theme: theme('anggrek-emas').name },
      { at: days(5, 10), amount: 189000, commission: 132300, link: 'Link utama', theme: theme('gunting-pita').name },
      { at: days(7, 21), amount: 99000, commission: 69300, link: 'Video TikTok Mocca', theme: theme('mocca-gypsophila').name },
    ],
  }
}
const blogPosts = [
  { slug: 'contoh-kata-kata-undangan-pernikahan-islami', title: 'Contoh Kata-Kata Undangan Pernikahan Islami yang Menyentuh' },
  { slug: 'cara-menyebar-undangan-digital-lewat-whatsapp', title: 'Cara Menyebar Undangan Digital lewat WhatsApp dengan Sopan' },
]

// ---------- Undangan & tamu pelanggan contoh ----------
const invitationContent = {
  groom: { name: 'Fajar Ramadhan, S.T.', nickname: 'Fajar', parents: 'Putra dari Bapak Ahmad & Ibu Halimah', photo: '', instagram: '' },
  bride: { name: 'Rina Maharani, S.Pd.', nickname: 'Rina', parents: 'Putri dari Bapak Yusuf & Ibu Aminah', photo: '', instagram: '' },
  events: [
    { name: 'Akad Nikah', date: '2026-11-21', time_start: '08:00', time_end: '10:00', timezone: 'WIB', venue: 'Masjid Al-Ikhlas', address: 'Jl. Melati No. 12, Bandung', map_url: 'https://maps.google.com/?q=Bandung' },
    { name: 'Walimatul \'Ursy', date: '2026-11-21', time_start: '11:00', time_end: '14:00', timezone: 'WIB', venue: 'Gedung Serbaguna Melati', address: 'Jl. Melati No. 14, Bandung', map_url: 'https://maps.google.com/?q=Bandung' },
  ],
  gallery: [], rsvp: { enabled: true },
}
const invitation = async () => {
  const t = await fullTheme(themeIndex.find(t => t.slug === 'sakinah-sage')!)
  return {
    id: DEMO_INVITATION_ID, owner_id: DEMO_USER_ID, theme_id: t.id, token_id: null, slug: 'rina-fajar', guest_limit: 500,
    content: invitationContent, style: {}, assets: {}, is_published: true, created_at: days(1), updated_at: days(0),
    theme: { id: t.id, code: t.code, slug: t.slug, name: t.name, definition: t.definition, compiled_css: t.compiled_css, music_url: null },
  }
}
const guests = [
  ['Budi Santoso', '6281211110001', 'Keluarga', days(0, 8), days(0, 9)], ['Ustadz Hamzah', '6281211110002', 'Pengajian', days(0, 8), null],
  ['Sari & Keluarga', '6281211110003', 'Keluarga', days(0, 8), days(0, 10)], ['Tim Kantor PT Sinar', '6281211110004', 'Kantor', null, null],
  ['Dimas Pratama', '6281211110005', 'Teman SMA', null, null], ['Nur Aisyah', '6281211110006', 'Teman kuliah', null, null],
  ['Pak RT 05', '6281211110007', 'Tetangga', null, null], ['Bu Wati', '6281211110008', 'Tetangga', null, null],
].map(([name, phone, group_name, sent_at, opened_at], i) => ({ id: `g${i + 1}`, invitation_id: DEMO_INVITATION_ID, name, phone, group_name, sent_at, opened_at, created_at: days(1, 20 - i) }))

const user = {
  id: DEMO_USER_ID, aud: 'authenticated', role: 'authenticated', email: DEMO_EMAIL, email_confirmed_at: '2026-09-01T00:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { full_name: 'Siti Rahmawati' },
  created_at: '2026-09-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z',
}

// ---------- PostgREST minimal ----------
type Row = Record<string, unknown>
function where(rows: Row[], sp: URLSearchParams) {
  for (const [k, v] of sp) {
    if (['select', 'order', 'limit', 'offset', 'or', 'on_conflict', 'columns'].includes(k)) continue
    const [op, ...rest] = v.split('.')
    const val = rest.join('.')
    if (op === 'eq') rows = rows.filter(r => String(r[k]) === val)
    else if (op === 'neq') rows = rows.filter(r => String(r[k]) !== val)
    else if (op === 'in') { const set = new Set(val.replace(/^\(|\)$/g, '').split(',').map(s => s.replace(/^"|"$/g, ''))); rows = rows.filter(r => set.has(String(r[k]))) }
    else if (op === 'is' && val === 'null') rows = rows.filter(r => r[k] == null)
  }
  return rows
}
function filter(rows: Row[], sp: URLSearchParams) {
  rows = where(rows, sp)
  const off = Number(sp.get('offset') ?? 0)
  const lim = sp.get('limit')
  return { total: rows.length, page: lim ? rows.slice(off, off + Number(lim)) : rows.slice(off) }
}

async function table(name: string, sp: URLSearchParams): Promise<Row[]> {
  switch (name) {
    case 'event_groups': return groups
    case 'categories': return categories
    case 'packages': return packages
    case 'app_settings': return [settings]
    case 'themes': {
      const sel = sp.get('select') ?? ''
      const rows = where(themeIndex, sp)
      return sel.includes('definition') ? Promise.all(rows.map(fullTheme)) : rows.map(({ file: _, ...r }) => r)
    }
    case 'resellers': return [reseller]
    case 'profiles': return [{ id: DEMO_USER_ID, role: 'user', full_name: 'Siti Rahmawati', email: DEMO_EMAIL, phone: '6281234567890' }]
    case 'orders': return orders()
    case 'payouts': return payouts
    case 'blog_posts': return blogPosts
    case 'reseller_links': return linkStats(30).links
    case 'invitations': {
      const inv = await invitation()
      return [{ ...inv, theme: { ...inv.theme, kind: 'wedding', demo: null }, guests: [{ count: guests.length }], rsvps: [{ count: 3 }] }]
    }
    case 'guests': return guests
    default: return []
  }
}

async function rpc(fn: string, args: Record<string, unknown>): Promise<unknown> {
  switch (fn) {
    case 'reseller_summary': return summary
    case 'reseller_link_stats': return linkStats(Number(args.p_days) || 30)
    case 'get_reseller_public': return args.p_code === 'BERKAH' ? [{ code: 'BERKAH', business_name: reseller.business_name, whatsapp: reseller.whatsapp }] : []
    case 'get_order_public': return {
      id: DEMO_ORDER_ID, merchant_ref: 'UV-2610-0928', status: 'paid', customer_name: 'Rina & Fajar', amount: 99000, fee_customer: 0, total_amount: 99000,
      payment_name: 'QRIS', checkout_url: null, pay_code: null, qr_url: null, instructions: null, expires_at: null, paid_at: days(1, 16),
      theme: { name: theme('sakinah-sage').name, code: 'SYR-001', slug: 'sakinah-sage' }, package: { name: 'Paket 500 Tamu', guest_limit: 500 },
      reseller: { business_name: reseller.business_name, whatsapp: reseller.whatsapp }, token: 'K7M2QX', token_redeemed: false,
    }
    case 'check_token': return [{ package_name: 'Paket 500 Tamu', guest_limit: 500, theme_id: themeIndex.find(t => t.slug === 'sakinah-sage')?.id, theme_code: themeIndex.find(t => t.slug === 'sakinah-sage')?.code, theme_slug: 'sakinah-sage', theme_name: theme('sakinah-sage').name, expires_at: '2027-01-09T00:00:00Z' }]
    case 'is_slug_available': return true
    case 'admin_ai_settings': case 'admin_seo_settings': return {}
    default: return null
  }
}

export async function startSupabaseTiruan(port = 54329) {
  await loadThemeIndex()
  const server = http.createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x')
    const h: Record<string, string> = {
      'content-type': 'application/json', 'access-control-allow-origin': req.headers.origin ?? '*', 'access-control-allow-credentials': 'true',
      'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*',
    }
    if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end() }
    let body = ''
    req.on('data', (c) => { body += c })
    req.on('end', async () => {
      const send = (v: unknown, status = 200) => { res.writeHead(status, h); res.end(req.method === 'HEAD' ? '' : JSON.stringify(v)) }
      try {
        if (u.pathname.startsWith('/auth/v1/')) return send(u.pathname === '/auth/v1/user' ? user : {})
        if (u.pathname.startsWith('/rest/v1/rpc/')) return send(await rpc(u.pathname.slice('/rest/v1/rpc/'.length), body ? JSON.parse(body) : {}))
        if (!u.pathname.startsWith('/rest/v1/')) return send({ message: 'tidak ada' }, 404)
        const name = u.pathname.slice('/rest/v1/'.length)
        if (req.method !== 'GET' && req.method !== 'HEAD') return send(req.method === 'DELETE' || req.method === 'PATCH' ? [{ id: 'x' }] : [])
        const { total, page } = filter(await table(name, u.searchParams), u.searchParams)
        if (/count=exact/.test(String(req.headers.prefer ?? ''))) h['content-range'] = page.length ? `0-${page.length - 1}/${total}` : `*/${total}`
        if (/vnd\.pgrst\.object/.test(String(req.headers.accept ?? ''))) return page.length ? send(page[0]) : send({ code: 'PGRST116', message: 'no rows' }, 406)
        return send(page)
      }
      catch (e) {
        console.error('[tiruan]', e)
        return send({ message: String(e) }, 500)
      }
    })
  })
  await new Promise<void>(r => server.listen(port, r))
  return server
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startSupabaseTiruan()
  console.log(`Supabase tiruan siap di http://localhost:54329 (${themeIndex.length} tema)`)
}
