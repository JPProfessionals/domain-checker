<script setup lang="ts">
// 1. Imports
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useI18n } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { DomainResult, DomainsResult } from '../types/domain'
import { useVirtualList } from '@vueuse/core'

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

const formState = reactive({
  search: '',
  selectedTLDs: defaultTlds,
})

const fetchedTLDs = ref([] as string[])
const search = ref('')

const filteredTlds = computed(() => {
  return fetchedTLDs.value.filter((i) =>
    i.includes(search.value.toLowerCase())
  ) as any[]
})

const { list, containerProps, wrapperProps } = useVirtualList(filteredTlds, {
  itemHeight: (i) => filteredTlds.value[i].height + 8,
  overscan: 10,
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
}

async function fetchTLDs(input: any = null): Promise<string[]> {
  const { data, error: fetchError } = await useAsyncData('tlds', () =>
    $fetch('/api/getTlds', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input ?? '', pageSize: -1 }),
    })
  )

  if (fetchError.value || !data.value) {
    console.error(
      t('notifications.generalError', { returnObjects: true }),
      fetchError.value
    )
    return defaultTlds
  }

  return data.value
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
  loading.value = true
  const requestBody = {
    domain: formState.search,
    tlds: formState.selectedTLDs,
  }
  const { data, error: fetchError } = await useAsyncData('domains', () =>
    $fetch('/api/checkDomains', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
  )
  if (fetchError.value) {
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

<style scoped>
:deep(.popover-container) {
  inset: unset !important;
  transform: unset !important;
  width: 100%;
  margin-top: 8px !important;
}
</style>

<template>
  <div class="mb-6">
    <ULandingHero
      :title="$t('header.title', { returnObjects: true })"
      :description="$t('header.subTitle', { returnObjects: true })"
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
                :label="
                  $t('search.form.selectMenuLabel', {
                    returnObjects: true,
                  })
                "
                name="tlds"
                class="mb-6"
              >
                <UPopover
                  overlay
                  v-model:open="open"
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
                        $t('search.form.selectMenuSelectedLabel', {
                          returnObjects: true,
                        })
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
                    >
                      <UInput
                        v-model="search"
                        class="p-2"
                        name="search"
                        variant="outline"
                        size="xl"
                        :placeholder="
                          $t('search.form.selectMenuPlaceholder', {
                            returnObjects: true,
                          })
                        "
                        :autofocus="true"
                        autofocusDelay="400"
                      >
                      </UInput>

                      <div
                        v-bind="containerProps"
                        class="h-64 pt-0 overflow-auto p-2"
                      >
                        <div v-bind="wrapperProps">
                          <div
                            v-for="{ index, data } in list"
                            :key="index"
                            class="p-2 mt-2 flex space-x-2 justify-center items-center"
                            :style="{
                              height: `${data.height}px`,
                            }"
                            @click="selectTld(data)"
                          >
                            <div
                              class="flex flex-1 cursor-pointer"
                              :class="
                                formState.selectedTLDs.includes(data)
                                  ? 'text-[rgb(var(--color-primary-400))]'
                                  : ''
                              "
                            >
                              {{ data }}
                            </div>
                            <div class="flex">
                              <Icon
                                class="text-[rgb(var(--color-primary-400))]"
                                name="material-symbols:check"
                                v-if="formState.selectedTLDs.includes(data)"
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
