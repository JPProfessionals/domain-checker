<script setup>
const links = [{
  label: 'Homepage',
  to: 'https://jpprofessionals.de/:',
  target: '_blank'
}, {
  label: 'Impressum',
  to: 'https://jpprofessionals.de/impressum',
  target: '_blank'
}, {
  label: 'Datenschutz',
  to: 'https://jpprofessionals.de/privacy-policy',
  target: '_blank'
}]

useHead({
  title: 'Domain Checker',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  description: 'Nuxt UI Pro is a collection of premium components built on top of Nuxt UI to create beautiful & responsive Nuxt applications in minutes.'
})
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <p>Domain Checker <UBadge label="Open Soruce" variant="subtle" class="mb-0.5" /></p>
    </template>

    <template #right>
      <UColorModeButton />

      <UButton to="https://github.com/jpprofessionals/domain-checker" target="_blank" icon="i-simple-icons-github" aria-label="GitHub" color="gray" variant="ghost" />
    </template>
  </UHeader>

  <UMain>
    <NuxtPage />
  </UMain>

  <UFooter>
    <template #center>
      <p>Copyright © {{ new Date().getFullYear() }}</p>
    </template>
  </UFooter>
</template>
