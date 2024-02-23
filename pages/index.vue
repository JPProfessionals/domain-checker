<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useFetch } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { DomainResult, DomainsResult } from '../types/domain'

const TLDs = ['.com', '.net', '.org', '.de', '.uk', '.fr', '.it', '.tv', '.co', '.eu', '.info', '.biz', '.co.uk', '.us', '.ca']

const domainsResults: Ref<DomainsResult> = ref({
  domains: [] as DomainResult[],
})
const error = ref('')
const loading = ref(false)

const checkDomains = async () => {
  const { data, error: fetchError } = await useFetch(
    `/api/checkDomains?domain=${formState.search}`
  )

  if (fetchError.value) {
    console.log('ERROR')
    error.value = 'Failed to check domain availability, please try again later.'
    loading.value = false
    return
  }

  if (data.value) {
    domainsResults.value = data.value as DomainsResult

    console.log(domainsResults)
  }
}

const schema = z.object({
  search: z
    .string()
    .min(3, 'Must be at least 3 characters long')
    .regex(/^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/, 'Must be a valid domain name without TLD')
})

const formState = reactive({
  search: '',
  selectedTLDs: ref(TLDs.slice(0, 4))
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function onSubmit (event: FormSubmitEvent<z.output<typeof schema>>) {
  loading.value = true

  console.log(event.data)
  await checkDomains()
  loading.value = false
}


const isOpen = ref(false)
const currentLink = ref('')

const openLinkModal = (domain: string) => {
  currentLink.value = 'https://' + domain
  isOpen.value = true
}
</script>

<template>
  <div class="mb-6">
    <ULandingHero
      title="JPP's Domain Checker"
      description="Check if your desired Domain is available in seconds without Ads."
    >
      <template #links>
        <UButton
          to="#check"
          size="lg"
          icon="i-material-symbols-domain-verification"
        >
          Check Domain
        </UButton>
        <UButton
          to="https://github.com/jpprofessionals/domain-checker"
          target="_blank"
          size="lg"
          color="gray"
          icon="i-heroicons-cube-transparent"
        >
          Open Source Repository
        </UButton>
      </template>
    </ULandingHero>

    <UContainer id="results">
      <UPageHeader
        headline="Search & Check"
        title="Domain Results"
        description="Enter your desired domain and we will check whether it is available or already taken."
        class="pb-4 pt-0"
      >
        <UForm id="check" :state="formState" :schema="schema" class="mt-6" @submit="onSubmit">
          <div class="flex flex-wrap -mx-3">
            <div class="w-full sm:w-3/4 px-3">
              <UFormGroup label="Domain Name" name="domain-search" class="mb-6">
                <UInput
                  v-model="formState.search"
                  name="search"
                  :loading="loading"
                  :disabled="loading"
                  color="primary"
                  variant="outline"
                  size="xl"
                  placeholder="Search Domains..."
                  :autofocus="true"
                  :required="true"
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                  <template #trailing>
                    <UButton
                      :padded="false"
                      variant="link"
                      icon="i-heroicons-magnifying-glass-solid"
                      type="submit"
                    />
                  </template>
                </UInput>
              </UFormGroup>
            </div>
            <div class="w-full sm:w-1/4 px-3">
              <UFormGroup label="TLDs" name="tlds" class="mb-6">
                <USelectMenu v-model="formState.selectedTLDs" size="xl" :options="TLDs" multiple placeholder="Select TLDs" :searchable="true" />
              </UFormGroup>
            </div>
          </div>
        </UForm>
      </UPageHeader>

      <div v-if="error.length != 0" class="m-4">
        <ULandingCard title="Error" color="red" icon="i-heroicons-exclamation-circle" />
      </div>

      <div d="resultCards" class="grid grid-cols-2 gap-4 mt-8">
        <ULandingCard
          v-for="result in domainsResults.domains"
          :key="result.id"
          :title="result.domain"
          :icon="
            result.available
              ? 'i-heroicons-lock-open'
              : 'i-heroicons-lock-closed'
          "
          :ui="
            result.available
              ? {
                icon: {
                  wrapper: 'mb-2 flex',
                  base: 'w-10 h-10 flex-shrink-0 text-green-500',
                },
              }
              : {
                icon: {
                  wrapper: 'mb-2 flex',
                  base: 'w-10 h-10 flex-shrink-0 text-red-500',
                },
              }
          "
          :description="
            result.available
              ? 'This Domain is available.'
              : 'This Domain is used and/or not available!'
          "
          :to="!result.available ? 'OpenModal' : null"
          target="_blank"
          @click.prevent.stop="
            !result.available ? openLinkModal(result.domain) : null
          "
        />
      </div>
    </UContainer>
    <UModal v-model="isOpen">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Redirect away?
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>
        <UPageCard
          title="External URL"
          description="You're leaving this Site to an external Domain!"
          icon="i-heroicons-exclamation-triangle"
          class="mb-4"
          :ui="{
            icon: {
              wrapper: 'mb-2 flex',
              base: 'w-10 h-10 flex-shrink-0 text-orange-500',
            },
          }"
        />

        <UButton
          block
          label="I understand, please redirect me"
          icon="i-heroicons-link"
          :to="currentLink"
          target="_blank"
          color="blue"
        />
      </UCard>
    </UModal>
  </div>
</template>
