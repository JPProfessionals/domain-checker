<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useFetch } from '#imports'
import type { DomainResult, DomainsResult } from '../types/domain'

const schema = z.object({
  search: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .regex(new RegExp('[^A-Za-z0-9]'))
})

type FormData = z.infer<typeof schema>;

const state = reactive<FormData>({
  search: '',
})

const domainsResults: Ref<DomainsResult> = ref({
  domains: [] as DomainResult[],
})
const error = ref('')
const loading = ref(false)

const checkDomains = async () => {
  const { data, error: fetchError } = await useFetch(
    `/api/checkDomains?domain=${state.search}`
  )

  if (fetchError.value) {
    console.log('ERROR')
    error.value = 'Failed to check domain availability.'
    return
  }

  if (data.value) {
    domainsResults.value = data.value as DomainsResult

    console.log(domainsResults)
  }

  loading.value = false
}

const onSubmit = () => {
  loading.value = true
  checkDomains() // Call the function to check domain availability
}
</script>

<template>
  <div class="mb-6">
    <ULandingHero
      title="JPP's Domain Checker"
      description="Check if your desired Domain is available in seconds."
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
          to="https://github.com/jpprofessionals/"
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
        description="Enter Your Desired Domain and we will check if it's available or used."
      >
        <UForm id="check" :state="state" class="mt-6" @submit="onSubmit">
          <UFormGroup name="domain-search">
            <UInput
              v-model="state.search"
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
                  type="button"
                  :padded="false"
                  variant="link"
                  icon="i-heroicons-magnifying-glass-solid"
                  @click="onSubmit"
                />
              </template>
            </UInput>
          </UFormGroup>
        </UForm>
      </UPageHeader>
      <div d="resultCards" class="grid grid-cols-2 gap-4 mt-8">
        <ULandingCard
          v-for="result in domainsResults.domains"
          :key="result.id"
          :title="result.domain"
          :description="result.available ? 'yes' : 'no'"
        />
      </div>
    </UContainer>
  </div>
</template>
