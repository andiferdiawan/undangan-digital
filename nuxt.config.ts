// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/supabase', '@unocss/nuxt'],

  css: ['@unocss/reset/tailwind.css', '~/assets/css/app.css'],

  // Komponen dipanggil dengan nama file saja (InviteRenderer, ThemeThumb, PhoneFrame, …)
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#2f4a3a' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Marcellus&display=swap' },
      ],
    },
  },

  supabase: {
    // URL & key dibaca dari env SUPABASE_URL dan SUPABASE_KEY
    types: false,
    redirectOptions: {
      login: '/masuk',
      callback: '/confirm',
      include: ['/dashboard(/*)?', '/admin(/*)?', '/reseller/dashboard(/*)?'],
      exclude: [],
      saveRedirectToCookie: true,
    },
  },

  runtimeConfig: {
    // Server-only (diisi via env NUXT_ANTHROPIC_API_KEY)
    anthropicApiKey: '',
    anthropicModel: 'claude-opus-5',
    // Payment gateway Tripay (server-only): NUXT_TRIPAY_MODE, NUXT_TRIPAY_API_KEY,
    // NUXT_TRIPAY_PRIVATE_KEY, NUXT_TRIPAY_MERCHANT_CODE
    tripay: { mode: 'sandbox', apiKey: '', privateKey: '', merchantCode: '' },
    // Email bermerek via Resend (server-only): NUXT_EMAIL_RESEND_API_KEY, NUXT_EMAIL_FROM,
    // NUXT_EMAIL_ADMIN_TO (penerima notifikasi pembayaran; boleh beberapa, pisahkan koma)
    email: { resendApiKey: '', from: 'Undangan Virtual <noreply@undanganvirtual.com>', adminTo: '' },
    // Secret untuk RPC server_* di database (NUXT_SERVER_RPC_SECRET)
    serverRpcSecret: '',
    public: {
      // Nomor WhatsApp admin untuk pemesanan, format 628xxxx (env NUXT_PUBLIC_ADMIN_WHATSAPP)
      adminWhatsapp: '6281234567890',
      siteName: 'Undangan Virtual',
      // Domain kanonik untuk SEO & magic link (env NUXT_PUBLIC_SITE_URL)
      siteUrl: 'https://undanganvirtual.com',
    },
  },

  nitro: {
    // Preset Vercel/Netlify/Cloudflare terdeteksi otomatis saat build di platform masing-masing.
    // Generator tema AI butuh waktu 1–3 menit, jadi batas durasi fungsi dinaikkan (Vercel).
    vercel: { functions: { maxDuration: 300 } },
    // Gambar pratinjau (satori) memuat file wasm saat runtime; pastikan ikut dibundel
    externals: { traceInclude: ['node_modules/harfbuzzjs/hb.wasm', 'node_modules/harfbuzzjs/hb-subset.wasm'] },
  },
})
