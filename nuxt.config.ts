// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  modules: [
    '@nuxt/ui',
    'nuxt-icon',
    'nuxt-security',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@nuxthq/studio',
    '@nuxt/content',
    '@nuxtjs/eslint-module',
  ],
  site: {
    url: 'https://domain.jpprofessionals.de',
    name: 'JPP\'s Domain Checker',
    description:
      'This is a streamlined open-source domain checker designed to quickly ascertain whether a domain is available or already in use, all without the annoyance of ads!',
  },
  ui: {
    icons: ['heroicons', 'simple-icons', 'material-symbols', 'circle-flags'],
  },
  devtools: {
    enabled: true,
  },
  i18n: {
    vueI18n: './i18n.config.ts',
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
    },
  },
})
