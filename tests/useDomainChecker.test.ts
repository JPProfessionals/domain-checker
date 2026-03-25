import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDomainChecker } from '../composables/useDomainChecker'

// Mock Vue/Nuxt globals
vi.stubGlobal('ref', (val: unknown) => ({ value: val }))
vi.stubGlobal('readonly', (val: unknown) => val)
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useDomainChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check domain availability correctly (available)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 3 }) // NS lookup: NXDOMAIN
    mockFetch.mockResolvedValueOnce({ Status: 3 }) // SOA lookup: NXDOMAIN

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(true)
    expect(domainsResults.value.domains[0]!.domain).toBe('example.com')
  })

  it('should check domain availability correctly (unavailable)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: [{}] }) // NS lookup: NOERROR

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(false)
  })

  it('should handle too many TLDs error', async () => {
    const { checkDomains, error } = useDomainChecker()
    const longTlds = Array(51).fill('.com')
    await checkDomains('example', longTlds)

    expect(error.value).toBe('notifications.tooManyTlds')
  })

  it('should handle no base domain error', async () => {
    const { checkDomains, error } = useDomainChecker()
    await checkDomains('', ['.com'])

    expect(error.value).toBe('notifications.noDomainProvided')
  })

  it('should handle DNS lookup errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(false)
  })
})
