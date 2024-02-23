<script setup>
const links = [
  {
    label: 'Homepage',
    to: 'https://jpprofessionals.de/',
    target: '_blank',
  },
  {
    label: 'Imprint',
    to: 'https://jpprofessionals.de/impressum',
    target: '_blank',
  },
  {
    label: 'Privacy Policy',
    to: 'https://jpprofessionals.de/privacy-policy',
    target: '_blank',
  },
]

useHead({
  title: 'Domain Checker',
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  description:
    'This Domain checker is an open source project where you can check if a domain already in use or available to buy.',
})
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <p>
        Domain Checker
        <UBadge label="Open Soruce" variant="subtle" class="mb-0.5" />
      </p>
    </template>

    <template #right>
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
  </UMain>

  <UFooter>
    <template #center>
      <small>Copyright © {{ new Date().getFullYear() }} | Created with
        <UIcon name="i-heroicons-heart" /> from JPProfessionals</small>
    </template>
  </UFooter>
</template>
