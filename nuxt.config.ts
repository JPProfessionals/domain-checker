// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    'nuxt-security',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/eslint',
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
    bundle: {
      optimizeTranslationDirective: false,
    },
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
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: false,
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
      // Add request size limits to prevent memory issues
      cors: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
      },
    },
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
    // Add request limits to prevent memory exhaustion
    experimental: {
      wasm: false,
    },
  },

  compatibilityDate: '2025-03-17',
})
