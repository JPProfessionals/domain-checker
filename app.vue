<script setup>
const { t } = useI18n()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const links = computed(() => [
  {
    label: t('global.homepage'),
    to: 'https://jpprofessionals.de/',
    target: '_blank',
  },
  {
    label: t('global.imprint'),
    to: 'https://jpprofessionals.de/impressum',
    target: '_blank',
  },
  {
    label: t('global.privacyPolicy'),
    to: 'https://jpprofessionals.de/privacy-policy',
    target: '_blank',
  },
])

// Structured Data (JSON-LD) for SEO
const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPP\'s Domain Checker',
  description: t('global.seoDescription'),
  url: 'https://domain.jpprofessionals.de',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  author: {
    '@type': 'Organization',
    name: 'JPProfessionals',
    url: 'https://jpprofessionals.de',
  },
  inLanguage: [locale.value],
  isAccessibleForFree: true,
}))

useHead({
  title: t('global.seoTitle'),
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#14b8a6' },
    { name: 'author', content: 'JPProfessionals' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'JPP\'s Domain Checker' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'preconnect', href: 'https://api.ote-godaddy.com' },
  ],
  htmlAttrs: {
    lang: locale.value,
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData.value),
    },
  ],
})

useSeoMeta({
  description: t('global.seoDescription'),
})

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value)
})
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <p class="text-sm md:text-base">
        Domain Checker
        <UBadge label="Open Source" variant="subtle" class="mb-0.5 block text-center" />
      </p>
    </template>

    <template #right>
      <UButton
        v-for="localeLang in availableLocales"
        :key="localeLang.code"
        color="gray"
        variant="ghost"
        :to="switchLocalePath(localeLang.code)"
        :label="localeLang.name"
      >
        <template #trailing>
          <UIcon :name="'i-circle-flags-' + localeLang.code" dynamic />
        </template>
      </UButton>
      <UColorModeButton />

      <UButton
        to="https://github.com/jpprofessionals/domain-checker"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="gray"
        variant="ghost"
      />
    </template>
  </UHeader>

  <UMain>
    <NuxtPage />
    <UNotifications />
  </UMain>

  <UFooter>
    <template #center>
      <small>Copyright © {{ new Date().getFullYear() }} | Created with
        <UIcon name="i-heroicons-heart" /> from <a href="https://jpprofessionals.de" target="_blank">JPProfessionals</a></small>
    </template>
  </UFooter>
</template>
