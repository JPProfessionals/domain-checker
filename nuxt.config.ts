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
    vueI18n: './i18n/i18n.config.ts',
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

  // Static client-side app: no private API secrets.
  // Domain checks run in the browser against Cloudflare DoH (1.1.1.1).
  security: {
    // No server API routes — rate limiting would be a no-op on static hosting.
    rateLimiter: false,
    headers: {
      // COEP breaks some third-party scripts/assets; keep disabled for this static site.
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'data:', 'https:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        // Nuxt/UI inject inline styles; keep unsafe-inline for styles.
        'style-src': ["'self'", "'unsafe-inline'", 'https:'],
        // Nuxt hydration needs inline scripts on static builds.
        'script-src': ["'self'", "'unsafe-inline'", 'https:'],
        'connect-src': [
          "'self'",
          'https://1.1.1.1',
          'https://cloudflare-dns.com',
          'https://vitals.vercel-insights.com',
          'https://va.vercel-scripts.com',
          'https://api.iconify.design',
          'https://api.simplesvg.com',
          'https://api.unisvg.com',
        ],
        'upgrade-insecure-requests': true,
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
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
