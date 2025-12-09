<script setup lang="ts">
// 1. Imports - Nuxt auto-imports ref, reactive, computed, etc.
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { DomainResult, DomainsResult, TldType } from '../types/domain'
import { useVirtualList } from '@vueuse/core'
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
const open = ref(false)
const popover = ref<null | HTMLElement>(null)

// TLD Type filter state
const tldTypeFilter = ref<'all' | TldType>('all')

// Keyboard navigation state
const focusedTldIndex = ref(-1)

const formState = reactive({
  search: '',
  selectedTLDs: defaultTlds,
})

const fetchedTLDs = ref([] as string[])
const search = ref('')

// Get TLD type from static data
const getTldType = (tldName: string): TldType | null => {
  const tld = tldData.tlds.find((t) => t.name === tldName)
  return (tld?.type as TldType) ?? null
}

const filteredTlds = computed(() => {
  let filtered = fetchedTLDs.value.filter((i) =>
    i.includes(search.value.toLowerCase())
  )

  // Apply type filter
  if (tldTypeFilter.value !== 'all') {
    filtered = filtered.filter((tld) => getTldType(tld) === tldTypeFilter.value)
  }

  return filtered
})

const { list, containerProps, wrapperProps } = useVirtualList(filteredTlds, {
  itemHeight: 40, // Fixed height for each TLD item (padding + content)
  overscan: 10,
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
    open.value = !open.value
    toggleTldPicker()
  },
})

// Keyboard navigation handler
function handleTldKeydown(event: KeyboardEvent) {
  const listLength = filteredTlds.value.length

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusedTldIndex.value = Math.min(
        focusedTldIndex.value + 1,
        listLength - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedTldIndex.value = Math.max(focusedTldIndex.value - 1, 0)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (focusedTldIndex.value >= 0 && focusedTldIndex.value < listLength) {
        selectTld(filteredTlds.value[focusedTldIndex.value])
      }
      break
    case 'Escape':
      open.value = false
      break
  }
}

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
  fetchedTLDs.value = fetchedTLDs.value.sort((a, b) => {
    if (formState.selectedTLDs?.includes(a)) {
      return -1
    }

    if (formState.selectedTLDs?.includes(b)) {
      return 1
    }

    return a > b ? 1 : -1
  })

  setTimeout(() => {
    popover.value?.scrollIntoView({ behavior: 'smooth' })
  }, 200)

  search.value = ''
  focusedTldIndex.value = -1
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
            pageSize: 500, // Load all TLDs, virtual list handles rendering
          }),
        }),
      {
        server: false, // Client-side only to reduce SSR memory
        lazy: true,
      }
    )

    if (fetchError.value || !data.value) {
      console.error('TLD fetch error:', fetchError.value)
      return defaultTlds
    }

    return data.value
  } catch (e) {
    console.error('TLD fetch failed:', e)
    return defaultTlds
  }
}

function selectTld(data: string) {
  const index = formState.selectedTLDs.indexOf(data)

  if (index !== -1) {
    formState.selectedTLDs.splice(index, 1)
    return
  }

  formState.selectedTLDs = [...formState.selectedTLDs, data]
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
    const { data, error: fetchError } = await useAsyncData('domains', () =>
      $fetch('/api/checkDomains', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
    )

    if (fetchError.value) {
      error.value = t('notifications.generalError')
      return
    }

    if (data.value) {
      domainsResults.value = data.value as DomainsResult
    }
  } catch (e) {
    console.error('Domain check failed:', e)
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
    <ULandingHero
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
          color="gray"
          icon="i-heroicons-cube-transparent"
        >
          {{ $t('header.openSourceRepo') }}
        </UButton>
      </template>
    </ULandingHero>

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
              <UFormGroup
                :label="$t('search.form.inputLabel')"
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
                  :placeholder="$t('search.form.inputPlaceholder')"
                  :autofocus="false"
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
                :label="$t('search.form.selectMenuLabel')"
                name="tlds"
                class="mb-6"
              >
                <UPopover
                  v-model:open="open"
                  overlay
                  :popper="{ arrow: true }"
                  :ui="{
                    container: 'z-50 popover-container group',
                    popper: {
                      strategy: 'absolute',
                    },
                  }"
                >
                  <div class="flex flex-auto">
                    <UButton
                      size="xl"
                      color="primary"
                      class="flex flex-1 rounded-none rounded-s"
                      variant="outline"
                      @click="toggleTldPicker()"
                    >
                      {{
                        formState.selectedTLDs.length +
                        ' ' +
                        $t('search.form.selectMenuSelectedLabel')
                      }}
                    </UButton>
                    <UButton
                      size="xl"
                      color="primary"
                      class="flex flex-initial justify-center rounded-none rounded-e"
                      variant="outline"
                      :icon="
                        open
                          ? 'i-heroicons-chevron-up-20-solid'
                          : 'i-heroicons-chevron-down-20-solid'
                      "
                      @click="toggleTldPicker()"
                    />
                  </div>

                  <template #panel>
                    <div
                      ref="popover"
                      class="w-full border border-[rgb(var(--color-primary-400))] rounded"
                      style="background-color: rgb(var(--ui-background))"
                      @keydown="handleTldKeydown"
                    >
                      <!-- Search Input -->
                      <UInput
                        v-model="search"
                        class="p-2"
                        name="search"
                        variant="outline"
                        size="xl"
                        :placeholder="$t('search.form.selectMenuPlaceholder')"
                        :autofocus="true"
                        :autofocus-delay="400"
                      />

                      <!-- TLD Type Filter Buttons -->
                      <div class="flex gap-1 px-2 pb-2">
                        <UButton
                          size="xs"
                          :variant="
                            tldTypeFilter === 'all' ? 'solid' : 'outline'
                          "
                          @click="tldTypeFilter = 'all'"
                        >
                          {{ $t('tldFilter.all') }}
                        </UButton>
                        <UButton
                          size="xs"
                          :variant="
                            tldTypeFilter === 'GENERIC' ? 'solid' : 'outline'
                          "
                          @click="tldTypeFilter = 'GENERIC'"
                        >
                          {{ $t('tldFilter.generic') }}
                        </UButton>
                        <UButton
                          size="xs"
                          :variant="
                            tldTypeFilter === 'COUNTRY_CODE'
                              ? 'solid'
                              : 'outline'
                          "
                          @click="tldTypeFilter = 'COUNTRY_CODE'"
                        >
                          {{ $t('tldFilter.country') }}
                        </UButton>
                      </div>

                      <!-- Select All / Deselect All -->
                      <div
                        class="flex gap-2 px-2 pb-2 border-b border-gray-200 dark:border-gray-700"
                      >
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

                      <!-- TLD List with Virtual Scrolling -->
                      <div
                        v-bind="containerProps"
                        class="h-64 pt-0 overflow-auto p-2"
                        role="listbox"
                        tabindex="0"
                      >
                        <div v-bind="wrapperProps">
                          <div
                            v-for="{ index, data } in list"
                            :key="index"
                            role="option"
                            :aria-selected="
                              formState.selectedTLDs.includes(data)
                            "
                            class="p-2 mt-2 flex space-x-2 justify-center items-center cursor-pointer rounded transition-colors"
                            :class="[
                              formState.selectedTLDs.includes(data)
                                ? 'text-[rgb(var(--color-primary-400))] bg-primary-50 dark:bg-primary-900/20'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                              focusedTldIndex === index
                                ? 'ring-2 ring-primary-400'
                                : '',
                            ]"
                            @click="selectTld(data)"
                          >
                            <div class="flex flex-1">
                              {{ data }}
                            </div>
                            <div class="flex">
                              <Icon
                                v-if="formState.selectedTLDs.includes(data)"
                                class="text-[rgb(var(--color-primary-400))]"
                                name="material-symbols:check"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </UPopover>
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

      <div id="resultCards" class="grid grid-cols-2 gap-4 mt-8">
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
              ? $t('result.domainAvailable')
              : $t('result.domainUsed')
          "
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
              {{ $t('modal.headline') }}
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
          :title="$t('modal.title')"
          :description="$t('modal.subTitle')"
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
          :label="$t('modal.button')"
          icon="i-heroicons-link"
          :to="currentLink"
          target="_blank"
          color="blue"
        />
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
:deep(.popover-container) {
  inset: unset !important;
  transform: unset !important;
  width: 100%;
  margin-top: 8px !important;
}
</style>
