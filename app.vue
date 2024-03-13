<script setup>
const { t } = useI18n()

const links = computed(() => [
  {
    label: t('global.homepage', { returnObjects: true }),
    to: 'https://jpprofessionals.de/',
    target: '_blank',
  },
  {
    label: t('global.imprint', { returnObjects: true }),
    to: 'https://jpprofessionals.de/impressum',
    target: '_blank',
  },
  {
    label: t('global.privacyPolicy', { returnObjects: true }),
    to: 'https://jpprofessionals.de/privacy-policy',
    target: '_blank',
  },
])

useHead({
  title: t('global.seoTitle', { returnObjects: true }),
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
})

useSeoMeta({
  description: t('global.seoDescription', { returnObjects: true }),
})

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

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
