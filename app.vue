<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: t('global.homepage'),
    to: 'https://jpprofessionals.de/',
    target: '_blank',
  },
  {
    label: t('global.imprint'),
    to: 'https://jpprofessionals.de/imprint',
    target: '_blank',
  },
  {
    label: t('global.privacyPolicy'),
    to: 'https://jpprofessionals.de/privacy',
    target: '_blank',
  },
])

// Structured Data (JSON-LD) for SEO
const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: "JPP's Domain Checker",
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
    { property: 'og:site_name', content: "JPP's Domain Checker" },
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
  <UApp>
    <UHeader title="Domain Checker">
      <template #title>
        <p class="text-sm md:text-base font-bold">
          Domain Checker
          <UBadge label="Open Source" variant="subtle" class="mb-0.5 ml-1" />
        </p>
      </template>

      <UNavigationMenu :items="links" />

      <template #right>
        <UButton
          v-for="localeLang in availableLocales"
          :key="localeLang.code"
          color="neutral"
          variant="ghost"
          :to="switchLocalePath(localeLang.code)"
          :label="localeLang.name"
        >
          <template #trailing>
            <UIcon :name="'i-circle-flags-' + localeLang.code" />
          </template>
        </UButton>
        <UColorModeButton />

        <UButton
          to="https://github.com/jpprofessionals/domain-checker"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template #body>
        <UNavigationMenu
          :items="links"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
      
    </UMain>

    <UFooter>
      <template #center>
        <small
          >Copyright © {{ new Date().getFullYear() }} | Created with
          <UIcon name="i-heroicons-heart" /> from
          <a href="https://jpprofessionals.de" target="_blank"
            >JPProfessionals</a
          ></small
        >
      </template>
    </UFooter>
  </UApp>
</template>
