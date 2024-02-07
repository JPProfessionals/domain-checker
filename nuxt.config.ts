// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/ui', 'nuxt-icon'],
  ui: {
    icons: ['heroicons', 'simple-icons', 'material-symbols'],
  },
  devtools: {
    enabled: true
  }
})
