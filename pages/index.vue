<script setup lang="ts">
// 1. Imports
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useFetch, useI18n } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { DomainResult, DomainsResult } from '../types/domain'

// 2. Reactive States and Refs
const { t } = useI18n()
const domainsResults: Ref<DomainsResult> = ref({
  domains: [] as DomainResult[],
})
const error = ref('')
const loading = ref(false)
const isOpen = ref(false)
const currentLink = ref('')

const defaultTLDs = ['.com', '.net', '.org', '.de']
let TLDs = [...defaultTLDs]
const formState = reactive({
  search: '',
  selectedTLDs: [...defaultTLDs], // Use a spread to ensure reactivity is maintained
})

// 3. Validation Schema
const schema = z.object({
  search: z
    .string()
    .min(3, t('schema.searchMin', { returnObjects: true }))
    .regex(
      /^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/,
      t('schema.searchRegex', { returnObjects: true })
    ),
})

// 4. Lifecycle Hooks
onNuxtReady(async () => {
  await fetchTLDs()
})

const fetchedTLDs = ref([] as string[])

// 5. Methods
async function fetchTLDs() {
  const { data, error: fetchError } = await useFetch('/api/getTlds')
  if (fetchError.value || !data.value || data.value.length === 0) {
    console.error('Failed to fetch TLDs, using default TLDs:', fetchError.value)
    TLDs = defaultTLDs
    return
  }
  fetchedTLDs.value = data.value
    .map((tld: string) => (tld.startsWith('.') ? tld : `.${tld}`))
    .filter((tld: string) => !defaultTLDs.includes(tld))
  TLDs = [...defaultTLDs, ...fetchedTLDs.value.slice(0, 50)]
  formState.selectedTLDs = [...defaultTLDs]
}

async function search(q: string) {
  loading.value = true

  if (fetchedTLDs.value.length == 0) {
    await fetchTLDs()
  }

  let filteredTlds = [...defaultTLDs, ...fetchedTLDs.value.slice(0, 50)]

  if (q.length != 0) {
    filteredTlds = fetchedTLDs.value.filter((tld) => tld.includes(q))
  }

  loading.value = false

  return filteredTlds
}

async function checkDomains() {
  loading.value = true
  const requestBody = {
    domain: formState.search,
    tlds: formState.selectedTLDs,
  }
  const { data, error: fetchError } = await useFetch('/api/checkDomains', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })
  if (fetchError.value) {
    console.log('fetchError', fetchError)
    error.value = t('notifications.generalError', { returnObjects: true })
    loading.value = false
    return
  }
  if (data.value) {
    domainsResults.value = data.value as DomainsResult
  }
  loading.value = false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function onSubmit(_event: FormSubmitEvent<z.output<typeof schema>>) {
  await checkDomains()
}

function openLinkModal(domain: string) {
  currentLink.value = 'https://' + domain
  isOpen.value = true
}
</script>

<template>
  <div class="mb-6">
    <ULandingHero
      :title="$t('header.title', { returnObjects: true })"
      :description="$t('header.subtitle', { returnObjects: true })"
    >
      <template #links>
        <UButton
          to="#check"
          size="lg"
          icon="i-material-symbols-domain-verification"
        >
          {{ $t('header.checkDomain', { returnObjects: true }) }}
        </UButton>
        <UButton
          to="https://github.com/jpprofessionals/domain-checker"
          target="_blank"
          size="lg"
          color="gray"
          icon="i-heroicons-cube-transparent"
        >
          {{ $t('header.openSourceRepo', { returnObjects: true }) }}
        </UButton>
      </template>
    </ULandingHero>

    <UContainer id="search">
      <UPageHeader
        :headline="$t('search.headline', { returnObjects: true })"
        :title="$t('search.title', { returnObjects: true })"
        :description="$t('search.description', { returnObjects: true })"
        class="pb-4 pt-0"
      >
        <UForm
          id="check"
          :state="formState"
          :schema="schema"
          class="mt-6"
          @submit="onSubmit"
        >
          <div class="flex flex-wrap -mx-3">
            <div class="w-full sm:w-3/4 px-3">
              <UFormGroup
                :label="$t('search.form.inputLabel', { returnObjects: true })"
                name="search"
                class="mb-6"
              >
                <UInput
                  v-model="formState.search"
                  name="search"
                  :loading="loading"
                  :disabled="loading"
                  color="primary"
                  variant="outline"
                  size="xl"
                  :placeholder="
                    $t('search.form.inputPlaceholder', {
                      returnObjects: true,
                    })
                  "
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
              <UFormGroup
                :label="
                  $t('search.form.selectMenuLabel', {
                    returnObjects: true,
                  })
                "
                name="tlds"
                class="mb-6"
              >
                <USelectMenu
                  v-model="formState.selectedTLDs"
                  size="xl"
                  :options="TLDs"
                  multiple
                  :required="true"
                  :placeholder="
                    $t('search.form.selectMenuPlaceholder', {
                      returnObjects: true,
                    })
                  "
                  :searchable="search"
                  :searchable-placeholder="
                    $t('search.form.selectMenuSearchablePlaceholder', {
                      returnObjects: true,
                    })
                  "
                >
                  <template #label>
                    <template v-if="formState.selectedTLDs.length != 0">
                      <span>{{ formState.selectedTLDs.length }}
                        {{
                          $t('search.form.selectMenuSelectedLabel', { returnObjects: true })
                        }}</span>
                    </template>
                    <template v-else>
                      <span class="text-gray-500 dark:text-gray-400 truncate">
                        {{
                          $t('search.form.selectMenuSelectedLabelEmpty', {
                            returnObjects: true,
                          })
                        }}</span>
                    </template>
                  </template>
                </USelectMenu>
              </UFormGroup>
            </div>
          </div>
        </UForm>
      </UPageHeader>

      <div v-if="error.length != 0" class="mt-4">
        <ULandingCard
          title="Error"
          description="Something went wrong, please try again later."
          color="red"
          icon="i-heroicons-exclamation-circle"
          :ui="{
            icon: {
              wrapper: 'mb-2 flex',
              base: 'w-10 h-10 flex-shrink-0 text-red-500 dark:text-red-500',
            },
          }"
        />
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
                  base: 'w-10 h-10 flex-shrink-0 text-green-500 dark:text-green-500',
                },
              }
              : {
                icon: {
                  wrapper: 'mb-2 flex',
                  base: 'w-10 h-10 flex-shrink-0 text-red-500 dark:text-red-500',
                },
              }
          "
          :description="
            result.available
              ? $t('result.domainAvailable', { returnObjects: true })
              : $t('result.domainUsed', { returnObjects: true })
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
              {{ $t('modal.headline', { returnObjects: true }) }}
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
          :title="$t('modal.title', { returnObjects: true })"
          :description="$t('modal.subTitle', { returnObjects: true })"
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
          :label="$t('modal.button', { returnObjects: true })"
          icon="i-heroicons-link"
          :to="currentLink"
          target="_blank"
          color="blue"
        />
      </UCard>
    </UModal>
  </div>
</template>
