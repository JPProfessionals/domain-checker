<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useFetch } from '#imports'
import type { DomainResult } from '../types/domain'

const schema = z.object({
  search: z.string().min(3, 'Must be at least 3 characters').nonempty('Required'),
})

type FormData = z.infer<typeof schema>;

const state = reactive<FormData>({
  search: '',
})

const searchQuery = ref('')
const domainResults: Ref<DomainResult[]> = ref([])
const error = ref('')

const checkDomains = async () => {
  const { data, error: fetchError } = await useFetch(`/api/checkDomains?domain=${searchQuery.value}`)
  
  if (fetchError.value) {
    error.value = 'Failed to check domain availability.'
    return
  }

  if (data.value) {
    domainResults.value = data.value as DomainResult[]
  }
}

const onSubmit = () => {
  checkDomains() // Call the function to check domain availability
}
</script>

<template>
  <div>
    <ULandingHero
      title="JPP - Domain Checker"
      description="Check if your desired Domain is available in seconds."
    >
      <template #links>
        <UButton
          to="#check"
          size="lg"
          icon="i-material-symbols:domain-verification"
        >
          Check Domain
        </UButton>
        <UButton
          to="https://github.com/jpprfoessionals/"
          target="_blank"
          size="lg"
          color="gray"
          icon="i-heroicons-cube-transparent"
        >
          Open Source Repository
        </UButton>
      </template>
    </ULandingHero>

    <ULandingSection
      id="features"
      title="Search & Check"
      class="py-0 pb-0 pt-0 mb-0"
    >
      <template #description>
        Enter Your Desired Domain and we will check if it's available or used.
      </template>

      <UForm :state="state" class="pb-0" @submit.prevent="onSubmit">
        <UFormGroup name="domain-search">
          <UInput
            v-model="state.search"
            name="search"
            color="primary"
            variant="outline"
            placeholder="Search Domains..."
          />
          <UButton type="button" @click="onSubmit">
            Check
          </UButton>
        </UFormGroup>
      </UForm>
    </ULandingSection>

    <ULandingSection id="results" class="mt-0 py-0 pb-0 pt-0">
      <div v-for="result in domainResults" :key="result.id">
        <p>{{ result.name }} - {{ result.available }}</p>
      </div>
    </ULandingSection>
  </div>
</template>
