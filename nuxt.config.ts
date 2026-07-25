// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    'nuxt-security',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@vercel/analytics',
  ],

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://domain.jpprofessionals.de',
    name: "JPP's Domain Checker",
    description:
      'This is a streamlined open-source domain checker designed to quickly ascertain whether a domain is available or already in use, all without the annoyance of ads!',
  },

  ogImage: { enabled: false },

  icon: {
    serverBundle: 'remote',
    clientBundle: {
      scan: true,
    },
  },

  devtools: {
    enabled: process.env.NODE_ENV === 'development',
  },

  i18n: {
    vueI18n: './i18n.config.ts',
    bundle: {},
    locales: [
      {
        code: 'en',
        name: 'English',
      },
      {
        code: 'de',
        name: 'Deutsch',
      },
    ],
    defaultLocale: 'en',
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://va.vercel-scripts.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'", 'data:'],
        // Client-side DoH lookups go directly to Cloudflare
        'connect-src': [
          "'self'",
          'https://1.1.1.1',
          'https://cloudflare-dns.com',
          'https://va.vercel-scripts.com',
          'https://vitals.vercel-insights.com',
        ],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
      crossOriginEmbedderPolicy: false,
      xFrameOptions: 'DENY',
    },
  },

  routeRules: {
    '/api/*': {
      security: {
        rateLimiter: {
          tokensPerInterval: process.env.NODE_ENV === 'development' ? 100 : 5,
          interval: 10000,
        },
      },
      cors: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
      },
    },
  },

  nitro: {
    preset: 'cloudflare-pages-static',
    prerender: {
      autoSubfolderIndex: false,
    },
    minify: true,
    compressPublicAssets: true,
    experimental: {
      wasm: false,
    },
  },

  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
    },
  },

  compatibilityDate: '2025-03-17',
})
