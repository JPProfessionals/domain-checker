<script setup lang="ts">
// 1. Imports - Nuxt auto-imports ref, reactive, computed, etc.
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { DomainResult, DomainsResult, TldType } from '../types/domain'
import tldData from '../data/tlds.json'

// 2. Reactive States and Refs
const defaultTlds = ['.com', '.net', '.org', '.de']
const { t } = useI18n()
const domainsResults: Ref<DomainsResult> = ref({
  domains: [] as DomainResult[],
})
const error = ref('')
const loading = ref(false)
const isOpen = ref(false)
const currentLink = ref('')
const searchTerm = ref('')
const selectMenuOpen = ref(false)

// TLD Type filter state
const tldTypeFilter = ref<'all' | TldType>('all')

const formState = reactive({
  search: '',
  selectedTLDs: defaultTlds,
})

const fetchedTLDs = ref([] as string[])

// Get TLD type from static data
const getTldType = (tldName: string): TldType | null => {
  const tld = tldData.tlds.find((t) => t.name === tldName)
  return (tld?.type as TldType) ?? null
}

// Computed: TLDs sorted with selected first, then filtered by type
const sortedTlds = computed(() => {
  return [...fetchedTLDs.value].sort((a, b) => {
    const aSelected = formState.selectedTLDs.includes(a)
    const bSelected = formState.selectedTLDs.includes(b)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return a.localeCompare(b)
  })
})

// Filtered TLDs based on type filter (search is handled by USelectMenu)
const filteredTlds = computed(() => {
  if (tldTypeFilter.value === 'all') {
    return sortedTlds.value
  }
  return sortedTlds.value.filter((tld) => getTldType(tld) === tldTypeFilter.value)
})

// 3. Validation Schema
const schema = z.object({
  search: z
    .string()
    .min(3, t('schema.searchMin'))
    .max(
      63,
      t('schema.searchMax') || 'Domain name too long (max 63 characters)'
    )
    .regex(/^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/, t('schema.searchRegex')),
})

// 4. Lifecycle Hooks
onNuxtReady(async () => {
  const data = await fetchTLDs()
  fetchedTLDs.value = data.map((tld: string) =>
    tld.startsWith('.') ? tld : `.${tld}`
  )
})

// 5. Methods
defineShortcuts({
  ctrl_i: () => {
    selectMenuOpen.value = !selectMenuOpen.value
  },
})

// Select/Deselect all visible TLDs
function selectAllTlds() {
  const tldsToAdd = filteredTlds.value.filter(
    (tld) => !formState.selectedTLDs.includes(tld)
  )
  formState.selectedTLDs = [...formState.selectedTLDs, ...tldsToAdd]
}

function deselectAllTlds() {
  const filteredSet = new Set(filteredTlds.value)
  formState.selectedTLDs = formState.selectedTLDs.filter(
    (tld) => !filteredSet.has(tld)
  )
}

function toggleTldPicker() {
  searchTerm.value = ''
}

async function fetchTLDs(input: string | null = null): Promise<string[]> {
  try {
    const { data, error: fetchError } = await useAsyncData(
      'tlds',
      () =>
        $fetch<string[]>('/api/getTlds', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: input ?? '',
            pageSize: 550, // Load all TLDs, virtual list handles rendering
          }),
        }),
      {
        server: false, // Client-side only to reduce SSR memory
        lazy: true,
      }
    )

    if (fetchError.value || !data.value) {
      return defaultTlds
    }

    return data.value
  } catch (e) {
    return defaultTlds
  }
}

async function checkDomains() {
  // Reset error state before new request
  error.value = ''
  loading.value = true

  // Clear previous results to free memory
  domainsResults.value = { domains: [] }

  const requestBody = {
    domain: formState.search,
    tlds: formState.selectedTLDs,
  }

  try {
    const data = await $fetch('/api/checkDomains', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (data) {
      domainsResults.value = data as DomainsResult
    }
  } catch (e) {
    error.value = t('notifications.generalError')
  } finally {
    loading.value = false
  }
}

 
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
    <UPageHero
      :title="$t('header.title')"
      :description="$t('header.subTitle')"
    >
      <template #links>
        <UButton
          to="#check"
          size="lg"
          icon="i-heroicons-magnifying-glass-solid"
        >
          {{ $t('header.checkDomain') }}
        </UButton>
        <UButton
          to="https://github.com/jpprofessionals/domain-checker"
          target="_blank"
          size="lg"
          color="neutral"
          icon="i-heroicons-cube-transparent"
        >
          {{ $t('header.openSourceRepo') }}
        </UButton>
      </template>
    </UPageHero>

    <UContainer id="search">
      <UPageHeader
        :headline="$t('search.headline')"
        :title="$t('search.title')"
        :description="$t('search.description')"
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
              <UFormField
                :label="$t('search.form.inputLabel')"
                name="search"
                class="mb-6"
              >
                <UInput
                  v-model="formState.search"
                  name="search"
                  :loading="loading"
                  :disabled="loading"
                  variant="outline"
                  size="xl"
                  class="w-full"
                  :placeholder="$t('search.form.inputPlaceholder')"
                  :autofocus="false"
                >
                  <template #trailing>
                    <UButton
                      variant="link"
                      icon="i-heroicons-magnifying-glass-solid"
                      type="submit"
                    />
                  </template>
                </UInput>
              </UFormField>
            </div>
            <div class="w-full sm:w-1/4 px-3">
              <UFormField
                :label="$t('search.form.selectMenuLabel')"
                name="tlds"
                class="mb-6"
              >
                <USelectMenu
                  v-model="formState.selectedTLDs"
                  v-model:open="selectMenuOpen"
                  v-model:search-term="searchTerm"
                  multiple
                  searchable
                  size="xl"
                  :color="formState.selectedTLDs.length === 0 ? 'error' : 'primary'"
                  :highlight="selectMenuOpen || formState.selectedTLDs.length === 0"
                  :search-input="{ placeholder: $t('search.form.selectMenuPlaceholder') }"
                  :items="filteredTlds"
                  :virtualize="{ estimateSize: 36, overscan: 15 }"
                  :content="{ side: 'bottom', align: 'start', sideOffset: 8 }"
                  :ui="{
                    content: 'min-w-[320px] max-h-[450px]',
                    viewport: 'max-h-[300px]',
                    itemLeadingIcon: 'text-primary',
                    value: 'truncate',
                  }"
                  class="w-full transition-all duration-200"
                  @open="toggleTldPicker"
                >
                  <template #default="{ modelValue }">
                    <span :class="!modelValue?.length ? 'text-error' : ''">
                      <template v-if="!modelValue?.length">
                        {{ $t('search.form.selectMenuSelectedLabelEmpty') }}
                      </template>
                      <template v-else-if="modelValue.length <= 4">
                        {{ modelValue.join(', ') }}
                      </template>
                      <template v-else>
                        {{ modelValue.length }} {{ $t('search.form.selectMenuSelectedLabel') }}
                      </template>
                    </span>
                  </template>

                  <template #content-top>
                    <!-- TLD Type Filter Buttons -->
                    <div class="flex flex-wrap gap-1 p-2">
                      <UButton
                        size="xs"
                        :variant="tldTypeFilter === 'all' ? 'solid' : 'outline'"
                        @click="tldTypeFilter = 'all'"
                      >
                        {{ $t('tldFilter.all') }}
                      </UButton>
                      <UButton
                        size="xs"
                        :variant="tldTypeFilter === 'GENERIC' ? 'solid' : 'outline'"
                        @click="tldTypeFilter = 'GENERIC'"
                      >
                        {{ $t('tldFilter.generic') }}
                      </UButton>
                      <UButton
                        size="xs"
                        :variant="tldTypeFilter === 'COUNTRY_CODE' ? 'solid' : 'outline'"
                        @click="tldTypeFilter = 'COUNTRY_CODE'"
                      >
                        {{ $t('tldFilter.country') }}
                      </UButton>
                      <span class="mx-1 border-l border-default"></span>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-heroicons-check-circle"
                        @click="selectAllTlds"
                      >
                        {{ $t('tldFilter.selectAll') }}
                      </UButton>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-heroicons-x-circle"
                        @click="deselectAllTlds"
                      >
                        {{ $t('tldFilter.deselectAll') }}
                      </UButton>
                    </div>
                  </template>
                </USelectMenu>
              </UFormField>
            </div>
          </div>
        </UForm>
      </UPageHeader>

      <div v-if="error.length != 0" class="mt-4">
        <UPageCard
          :title="$t('notifications.errorTitle')"
          :description="error"
          icon="i-heroicons-exclamation-circle"
          variant="outline"
          :ui="{
            leadingIcon: 'text-red-500 size-8',
          }"
        />
      </div>

      <div id="resultCards" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <UPageCard
          v-for="result in domainsResults.domains"
          :key="result.id"
          :title="result.domain"
          :icon="
            result.available
              ? 'i-heroicons-lock-open'
              : 'i-heroicons-lock-closed'
          "
          variant="outline"
          :class="!result.available ? 'cursor-pointer hover:ring-primary' : ''"
          :ui="{
            leadingIcon: result.available ? 'text-green-500 size-8' : 'text-red-500 size-8',
          }"
          :description="
            result.available
              ? $t('result.domainAvailable')
              : $t('result.domainUsed')
          "
          @click="!result.available ? openLinkModal(result.domain) : undefined"
        />
      </div>
    </UContainer>

    <UModal v-model:open="isOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3
                class="text-base font-semibold leading-6 text-highlighted"
              >
                {{ $t('modal.headline') }}
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="isOpen = false"
              />
            </div>
          </template>
          <UPageCard
            :title="$t('modal.title')"
            :description="$t('modal.subTitle')"
            icon="i-heroicons-exclamation-triangle"
            variant="ghost"
            class="mb-4"
            :ui="{
              leadingIcon: 'text-orange-500 size-10',
            }"
          />

          <UButton
            block
            :label="$t('modal.button')"
            icon="i-heroicons-link"
            :to="currentLink"
            target="_blank"
            color="info"
          />
        </UCard>
      </template>
    </UModal>
  </div>
</template>
