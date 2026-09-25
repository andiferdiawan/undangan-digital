// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/supabase', '@unocss/nuxt'],

  css: ['@unocss/reset/tailwind.css', '~/assets/css/app.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#2f4a3a' },
      ],
      link: [
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
      include: ['/dashboard(/*)?', '/admin(/*)?'],
      exclude: [],
      saveRedirectToCookie: true,
    },
  },

  runtimeConfig: {
    // Server-only (diisi via env NUXT_ANTHROPIC_API_KEY)
    anthropicApiKey: '',
    anthropicModel: 'claude-opus-5-5',
    public: {
      // Nomor WhatsApp admin untuk pemesanan, format 628xxxx (env NUXT_PUBLIC_ADMIN_WHATSAPP)
      adminWhatsapp: '6281234567890',
      siteName: 'Undangin',
      siteUrl: '',
    },
  },

  nitro: {
    // Vercel/Netlify/Cloudflare terdeteksi otomatis saat build di platform masing-masing
  },
})
