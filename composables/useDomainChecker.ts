import type { DomainResult, DomainsResult } from '../types/domain'

interface DohResponse {
  Status: number
  Answer?: unknown[]
  Authority?: unknown[]
}

export const useDomainChecker = () => {
  const { t } = useI18n()
  const loading = ref(false)
  const error = ref('')
  const domainsResults = ref<DomainsResult>({ domains: [] })

  // Maximum number of concurrent DoH lookups; kept small
  const DOH_CONCURRENCY_LIMIT = 5

  const checkDomainAvailability = async (domain: string): Promise<DomainResult> => {
    try {
      // Status 0: NOERROR (domain exists)
      // Status 3: NXDOMAIN (domain does not exist)
      const nsResponse = await $fetch<DohResponse>(
        `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
        { headers: { accept: 'application/dns-json' } }
      )

      if (nsResponse.Status === 3 || (nsResponse.Status === 0 && !nsResponse.Answer && !nsResponse.Authority)) {
        const soaResponse = await $fetch<DohResponse>(
          `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=SOA`,
          { headers: { accept: 'application/dns-json' } }
        )

        const isAvailable = (nsResponse.Status === 3 || (nsResponse.Status === 0 && !nsResponse.Answer && !nsResponse.Authority)) &&
          (soaResponse.Status === 3 || (soaResponse.Status === 0 && !soaResponse.Answer && !soaResponse.Authority))

        return { id: domain, domain, available: isAvailable }
      }

      return { id: domain, domain, available: false }
    } catch (err) {
      console.error(`DNS lookup failed for ${domain}:`, err)
      return { id: domain, domain, available: false }
    }
  }

  const checkDomains = async (baseDomain: string, tlds: string[]) => {
    loading.value = true
    error.value = ''
    domainsResults.value = { domains: [] }

    if (tlds.length > 50) {
      error.value = t('notifications.tooManyTlds')
      loading.value = false
      return
    }

    if (!baseDomain) {
      error.value = t('notifications.noDomainProvided')
      loading.value = false
      return
    }

    const domainsToCheck = tlds.map(tld => `${baseDomain}${tld}`)
    const results: DomainResult[] = []

    try {
      for (let i = 0; i < domainsToCheck.length; i += DOH_CONCURRENCY_LIMIT) {
        const batch = domainsToCheck.slice(i, i + DOH_CONCURRENCY_LIMIT)
        const batchResults = await Promise.all(batch.map(checkDomainAvailability))
        results.push(...batchResults)
        // Update results progressively for better UX
        domainsResults.value.domains = [...results]
      }
    } catch {
      error.value = t('notifications.generalError')
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    domainsResults: readonly(domainsResults),
    checkDomains
  }
}
