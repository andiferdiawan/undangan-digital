export default defineEventHandler((event) => {
  const origin = siteOrigin(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard',
    'Disallow: /admin',
    'Disallow: /checkout/',
    'Disallow: /pesanan/',
    'Disallow: /masuk',
    'Disallow: /daftar',
    'Disallow: /confirm',
    'Disallow: /reset-password',
    'Disallow: /reseller/dashboard',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')
})
