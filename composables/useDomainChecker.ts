import type { DomainResult, DomainsResult } from '../types/domain'
import { isValidDomainLabel, MAX_TLDS_PER_CHECK } from '../utils/domainValidation'

interface DohResponse {
  Status: number
  Answer?: unknown[]
  Authority?: unknown[]
}

const DOH_ENDPOINT = 'https://1.1.1.1/dns-query'

// Cloudflare answers with `Content-Type: application/dns-json`, which ofetch/$fetch
// does not recognise as JSON and returns as a string (so `.Status` was undefined and
// every domain looked "taken"). Parse explicitly and validate the shape.
async function queryDoh(domain: string, type: 'NS' | 'SOA', signal?: AbortSignal): Promise<DohResponse> {
  const timeoutSignal = AbortSignal.timeout(8000)
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  const res = await fetch(`${DOH_ENDPOINT}?name=${encodeURIComponent(domain)}&type=${type}`, {
    headers: { accept: 'application/dns-json' },
    signal: combinedSignal,
  })
  if (!res.ok) throw new Error(`DoH ${type} ${res.status}`)
  const data = JSON.parse(await res.text()) as DohResponse
  if (typeof data?.Status !== 'number') throw new Error(`DoH ${type}: unexpected response`)
  return data
}

export const useDomainChecker = () => {
  const { t } = useI18n()
  const loading = ref(false)
  const error = ref('')
  const domainsResults = ref<DomainsResult>({ domains: [] })

  // Request generation fencing and abort coordination to prevent stale async races
  let activeRunId = 0
  let activeAbortController: AbortController | null = null

  // Maximum number of concurrent DoH lookups; kept small
  const DOH_CONCURRENCY_LIMIT = 5

  const checkDomainAvailability = async (domain: string, signal?: AbortSignal): Promise<DomainResult> => {
    try {
      // Status 0: NOERROR (domain exists)
      // Status 3: NXDOMAIN (domain does not exist)
      // Heuristic only — not a registry/RDAP availability guarantee.
      const nsResponse = await queryDoh(domain, 'NS', signal)

      if (nsResponse.Status === 3 || (nsResponse.Status === 0 && !nsResponse.Answer && !nsResponse.Authority)) {
        const soaResponse = await queryDoh(domain, 'SOA', signal)

        const isAvailable = (nsResponse.Status === 3 || (nsResponse.Status === 0 && !nsResponse.Answer && !nsResponse.Authority))
          && (soaResponse.Status === 3 || (soaResponse.Status === 0 && !soaResponse.Answer && !soaResponse.Authority))

        return { id: domain, domain, available: isAvailable }
      }

      return { id: domain, domain, available: false }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        throw err
      }
      console.error(`DNS lookup failed for ${domain}:`, err)
      // Lookup failed: surface as an error instead of claiming "not available".
      return { id: domain, domain, available: false, error: true }
    }
  }

  const checkDomains = async (baseDomain: string, tlds: string[]) => {
    // Cancel any inflight check and bump the run fence
    activeAbortController?.abort()
    const abortController = new AbortController()
    activeAbortController = abortController
    const runId = ++activeRunId

    loading.value = true
    error.value = ''
    domainsResults.value = { domains: [] }

    if (tlds.length > MAX_TLDS_PER_CHECK) {
      error.value = t('notifications.tooManyTlds')
      loading.value = false
      return
    }

    if (!baseDomain || !isValidDomainLabel(baseDomain)) {
      error.value = t('notifications.noDomainProvided')
      loading.value = false
      return
    }

    if (tlds.length === 0) {
      error.value = t('notifications.noTldsSelected')
      loading.value = false
      return
    }

    // Allow single- and multi-label suffixes (e.g. ".com", ".co.uk") after allowlisting at the call site.
    const tldPattern = /^\.(?:[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)(?:\.(?:[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*))*$/
    const safeTlds = tlds.filter(tld => tldPattern.test(tld))
    if (safeTlds.length === 0) {
      error.value = t('notifications.noTldsSelected')
      loading.value = false
      return
    }

    const domainsToCheck = safeTlds.map(tld => `${baseDomain}${tld}`)
    const results: DomainResult[] = []

    try {
      for (let i = 0; i < domainsToCheck.length; i += DOH_CONCURRENCY_LIMIT) {
        if (runId !== activeRunId || abortController.signal.aborted) {
          return
        }

        const batch = domainsToCheck.slice(i, i + DOH_CONCURRENCY_LIMIT)
        const batchResults = await Promise.all(
          batch.map(d => checkDomainAvailability(d, abortController.signal))
        )

        if (runId !== activeRunId || abortController.signal.aborted) {
          return
        }

        results.push(...batchResults)
        // Update results progressively for better UX
        domainsResults.value.domains = [...results]
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError' || runId !== activeRunId) {
        return
      }
      error.value = t('notifications.generalError')
    } finally {
      if (runId === activeRunId) {
        loading.value = false
      }
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    domainsResults: readonly(domainsResults),
    checkDomains,
  }
}
