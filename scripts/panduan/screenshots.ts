/**
 * Screenshot untuk halaman Panduan Reseller (/reseller/panduan), diambil otomatis dengan Playwright dari aplikasi
 * yang berjalan lokal dengan DATA CONTOH (scripts/panduan/supabase-tiruan.ts), jadi tidak ada data pelanggan asli.
 *
 *   npm run panduan:screenshots
 *
 * Hasil: public/panduan/reseller/<nama>.webp + app/utils/panduan-gambar.ts (ukuran gambar untuk <img>).
 * Butuh Chromium: otomatis memakai /opt/pw-browsers/chromium bila ada, atau isi CHROMIUM_PATH, atau jalankan
 * `npx playwright-core install chromium`. Port aplikasi bisa diubah lewat PANDUAN_PORT (bawaan 3011).
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { type BrowserContext, chromium, type Locator, type Page } from 'playwright-core'
import sharp from 'sharp'
import { DEMO_EMAIL, DEMO_INVITATION_ID, DEMO_ORDER_ID, DEMO_USER_ID, startSupabaseTiruan } from './supabase-tiruan'

const ROOT = new URL('../../', import.meta.url).pathname
const OUT = `${ROOT}public/panduan/reseller`
const PORT = Number(process.env.PANDUAN_PORT ?? 3011)
const SUPA_PORT = 54329
const BASE = `http://localhost:${PORT}`
const only = process.argv.slice(2) // opsional: nama screenshot tertentu saja

// ---------- Sesi login contoh (JWT tanpa tanda tangan sah; Supabase tiruan menerima apa adanya) ----------
const b64url = (s: string) => Buffer.from(s).toString('base64url')
function sessionCookie() {
  const exp = 4102444800 // 2100-01-01
  const user = { id: DEMO_USER_ID, aud: 'authenticated', role: 'authenticated', email: DEMO_EMAIL, app_metadata: { provider: 'email' }, user_metadata: {} }
  const jwt = `${b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ sub: DEMO_USER_ID, email: DEMO_EMAIL, role: 'authenticated', aud: 'authenticated', iat: 1759000000, exp, session_id: 'panduan' }))}.${b64url('panduan-tiruan')}`
  const session = { access_token: jwt, refresh_token: 'panduan', expires_at: exp, expires_in: 3600, token_type: 'bearer', user }
  return { name: 'sb-localhost-auth-token', value: `base64-${b64url(JSON.stringify(session))}`, domain: 'localhost', path: '/' }
}

// ---------- API server yang bergantung pada layanan luar (Tripay) ditiru di browser ----------
const icon = (t: string, bg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="40"><rect width="96" height="40" rx="8" fill="${bg}"/><text x="48" y="26" font-family="Arial" font-weight="700" font-size="15" fill="#fff" text-anchor="middle">${t}</text></svg>`)}`
const CHANNELS = [
  { code: 'QRIS', name: 'QRIS (semua e-wallet & m-banking)', group: 'E-Wallet', icon_url: icon('QRIS', '#c7282e'), fee_customer: { flat: 750, percent: 0.7 } },
  { code: 'DANA', name: 'DANA', group: 'E-Wallet', icon_url: icon('DANA', '#118eea'), fee_customer: { flat: 0, percent: 1.67 } },
  { code: 'BSIVA', name: 'BSI Virtual Account', group: 'Virtual Account', icon_url: icon('BSI', '#00a39d'), fee_customer: { flat: 4250, percent: 0 } },
  { code: 'BRIVA', name: 'BRI Virtual Account', group: 'Virtual Account', icon_url: icon('BRI', '#00529c'), fee_customer: { flat: 4250, percent: 0 } },
  { code: 'ALFAMART', name: 'Alfamart', group: 'Convenience Store', icon_url: icon('Alfa', '#e2231a'), fee_customer: { flat: 3500, percent: 0 } },
]
async function stubApis(ctx: BrowserContext) {
  await ctx.route('**/api/payments/channels', r => r.fulfill({ json: CHANNELS }))
  await ctx.route('**/api/checkout', r => r.fulfill({ json: { url: `https://undanganvirtual.com/pesanan/${DEMO_ORDER_ID}?k=9f2c41`, order_id: DEMO_ORDER_ID, key: '9f2c41' } }))
  await ctx.route('**/api/track', r => r.fulfill({ status: 204 }))
  await ctx.route('**/api/ref-click', r => r.fulfill({ status: 204 }))
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.continue())
}

// ---------- Daftar screenshot ----------
type Shot = { name: string, path: string, login?: boolean, run: (page: Page) => Promise<Locator | 'viewport' | { top: Locator, bottom: Locator }> }
const card = (page: Page, text: string) => page.locator('.card', { has: page.getByText(text, { exact: true }) }).first()

const SHOTS: Shot[] = [
  { name: 'daftar-reseller', path: '/reseller', run: async p => p.locator('form.card').first() },
  { name: 'dashboard-ringkasan', path: '/reseller/dashboard', login: true, run: async p => ({ top: p.locator('h1').first().locator('xpath=..'), bottom: card(p, 'Link referral Anda') }) },
  { name: 'link-referral', path: '/reseller/dashboard', login: true, run: async p => card(p, 'Link referral Anda') },
  { name: 'pesanan-pelanggan', path: '/reseller/dashboard', login: true, run: async p => card(p, 'Pesanan pelanggan') },
  {
    name: 'buat-link-bayar', path: '/reseller/dashboard', login: true, run: async (p) => {
      const f = p.locator('form', { has: p.getByText('Buat link pembayaran pelanggan') })
      await f.getByPlaceholder('Nama pelanggan').fill('Dewi Lestari')
      await f.getByPlaceholder('Email pelanggan').fill('dewi@contoh.id')
      await f.getByPlaceholder('WhatsApp pelanggan (08…)').fill('081311112222')
      await f.locator('summary', { hasText: 'Metode pembayaran' }).click()
      await f.locator('label', { hasText: 'QRIS' }).first().click()
      await f.getByRole('button', { name: 'Buat Link Pembayaran' }).click()
      await f.getByText('Link pembayaran untuk Dewi Lestari siap:').waitFor()
      await f.locator('details').evaluate((d: HTMLDetailsElement) => { d.open = false })
      return f
    },
  },
  {
    name: 'pencairan', path: '/reseller/dashboard', login: true, run: async (p) => {
      const f = p.locator('form', { has: p.getByText('Cairkan saldo', { exact: true }) })
      await f.getByPlaceholder('Nominal').fill('200000')
      return f
    },
  },
  {
    name: 'rekening', path: '/reseller/dashboard', login: true, run: async (p) => {
      const d = p.locator('details.card', { hasText: 'Profil & rekening' })
      await d.locator('summary').click()
      return d
    },
  },
  { name: 'analitik-ringkasan', path: '/reseller/analitik', login: true, run: async p => ({ top: p.locator('h1').first(), bottom: p.locator('section', { has: p.getByText('Klik per hari') }) }) },
  {
    name: 'analitik-per-link', path: '/reseller/analitik', login: true, run: async (p) => {
      const sec = p.locator('section', { has: p.getByText('Performa per link') })
      return { top: sec.locator('h2'), bottom: sec.locator('tbody tr').nth(1) }
    },
  },
  {
    name: 'analitik-buat-link', path: '/reseller/analitik', login: true, run: async (p) => {
      const f = p.locator('form', { has: p.getByText('Buat link pelacakan baru') })
      await f.locator('input').first().fill('Status WA tema Mocca')
      await f.locator('select').first().selectOption('tema')
      await f.locator('select').nth(1).selectOption('mocca-gypsophila')
      return f
    },
  },
  { name: 'analitik-sumber', path: '/reseller/analitik', login: true, run: async p => p.locator('section', { has: p.getByText('Asal klik') }) },
  { name: 'analitik-penjualan', path: '/reseller/analitik', login: true, run: async p => p.locator('section', { has: p.getByText('Penjualan terbaru dari link') }) },
  // Perjalanan pelanggan
  { name: 'katalog', path: '/katalog?ref=BERKAH', run: async () => 'viewport' },
  { name: 'tema-detail', path: '/tema/sakinah-sage', run: async () => 'viewport' },
  {
    name: 'checkout', path: '/checkout/sakinah-sage', run: async (p) => {
      const data = p.locator('section', { has: p.getByText('2. Data pemesan') })
      await data.locator('input').nth(0).fill('Dewi Lestari')
      await data.locator('input').nth(1).fill('dewi@contoh.id')
      await data.locator('input').nth(2).fill('081311112222')
      await data.scrollIntoViewIfNeeded()
      return { top: p.locator('section', { has: p.getByText('1. Paket') }), bottom: p.locator('section', { has: p.getByText('2. Data pemesan') }) }
    },
  },
  { name: 'pesanan-lunas', path: `/pesanan/${DEMO_ORDER_ID}?k=9f2c41`, run: async () => 'viewport' },
  {
    name: 'aktivasi-token', path: '/daftar', run: async (p) => {
      const f = p.locator('form.card').first()
      await f.locator('input').first().fill('K7M2QX')
      return f
    },
  },
  { name: 'editor-undangan', path: `/dashboard/${DEMO_INVITATION_ID}`, login: true, run: async () => 'viewport' },
  { name: 'kirim-tamu', path: `/dashboard/${DEMO_INVITATION_ID}/tamu`, login: true, run: async () => 'viewport' },
]

// ---------- Jalankan ----------
async function waitForServer(url: string, ms = 240_000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return
    }
    catch { /* belum siap */ }
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error(`Server ${url} tidak siap dalam ${ms / 1000} detik`)
}

async function capture(page: Page, shot: Shot): Promise<Buffer> {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 120_000 })
  await page.addStyleTag({ content: 'header.sticky{position:relative!important} nuxt-devtools-frame,#nuxt-devtools-container{display:none!important}' })
  await page.waitForTimeout(600)
  const target = await shot.run(page)
  await page.waitForTimeout(500)
  if (target === 'viewport') return page.screenshot()
  if ('top' in target) {
    await target.top.scrollIntoViewIfNeeded()
    const a = (await target.top.boundingBox())!
    const b = (await target.bottom.boundingBox())!
    const y = Math.max(0, a.y - 16)
    return page.screenshot({ fullPage: true, clip: { x: 0, y: y + (await page.evaluate(() => window.scrollY)), width: page.viewportSize()!.width, height: b.y + b.height + 16 - y } })
  }
  await target.scrollIntoViewIfNeeded()
  return target.screenshot()
}

const chromiumPath = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)
let dev: ChildProcess | undefined
const supa = await startSupabaseTiruan(SUPA_PORT)
try {
  if (!process.env.PANDUAN_BASE) {
    dev = spawn('npx', ['nuxi', 'dev', '--port', String(PORT)], {
      cwd: ROOT, stdio: ['ignore', 'ignore', process.env.PANDUAN_DEBUG ? 'inherit' : 'ignore'], detached: true,
      env: { ...process.env, SUPABASE_URL: `http://localhost:${SUPA_PORT}`, SUPABASE_KEY: 'panduan-tiruan', NUXT_PUBLIC_SUPABASE_URL: `http://localhost:${SUPA_PORT}`, NUXT_PUBLIC_SUPABASE_KEY: 'panduan-tiruan' },
    })
  }
  console.log('Menunggu aplikasi siap…')
  await waitForServer(`${BASE}/robots.txt`)
  mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch({ executablePath: chromiumPath })
  const sizes: Record<string, { w: number, h: number }> = {}
  for (const login of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, locale: 'id-ID', timezoneId: 'Asia/Jakarta', isMobile: true, hasTouch: true })
    await ctx.clock.setFixedTime(new Date('2026-10-09T10:00:00+07:00'))
    await stubApis(ctx)
    if (login) await ctx.addCookies([sessionCookie()])
    const page = await ctx.newPage()
    page.on('pageerror', e => console.warn(`  ! galat halaman: ${e.message}`))
    for (const shot of SHOTS.filter(s => !!s.login === login && (!only.length || only.includes(s.name)))) {
      try {
        const png = await capture(page, shot)
        const img = sharp(png).resize({ width: 780, withoutEnlargement: true })
        const { data, info } = await img.webp({ quality: 82 }).toBuffer({ resolveWithObject: true })
        writeFileSync(`${OUT}/${shot.name}.webp`, data)
        sizes[shot.name] = { w: info.width, h: info.height }
        console.log(`✓ ${shot.name} (${info.width}×${info.height}, ${Math.round(data.length / 1024)} KB)`)
      }
      catch (e) {
        console.error(`✗ ${shot.name}: ${e instanceof Error ? e.message.split('\n')[0] : e}`)
        process.exitCode = 1
      }
    }
    await ctx.close()
  }
  await browser.close()

  {
    // Saat hanya sebagian gambar dibuat ulang, ukuran gambar lain dipertahankan
    if (only.length) {
      const prev = await import('../../app/utils/panduan-gambar').then(m => m.PANDUAN_GAMBAR as Record<string, { w: number, h: number }>).catch(() => ({}))
      for (const [k, v] of Object.entries(prev)) sizes[k] ??= v
    }
    const lines = Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `  '${k}': { w: ${v.w}, h: ${v.h} },`)
    writeFileSync(`${ROOT}app/utils/panduan-gambar.ts`, `// Dibuat otomatis oleh scripts/panduan/screenshots.ts — jangan diubah manual.\n/** Ukuran screenshot panduan reseller (public/panduan/reseller/<nama>.webp). */\nexport const PANDUAN_GAMBAR = {\n${lines.join('\n')}\n} as const\nexport type PanduanGambar = keyof typeof PANDUAN_GAMBAR\n`)
  }
}
finally {
  // Hentikan nuxi beserta proses anaknya (satu grup proses)
  if (dev?.pid) {
    try { process.kill(-dev.pid, 'SIGTERM') }
    catch { dev.kill('SIGTERM') }
  }
  supa.close()
}
