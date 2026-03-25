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

  it('should check domain availability correctly (available - NXDOMAIN)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 3 }) // NS lookup: NXDOMAIN
    mockFetch.mockResolvedValueOnce({ Status: 3 }) // SOA lookup: NXDOMAIN

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(true)
    expect(domainsResults.value.domains[0]!.domain).toBe('example.com')
  })

  it('should check domain availability correctly (available - NOERROR no answer)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: undefined, Authority: undefined }) 
    mockFetch.mockResolvedValueOnce({ Status: 3 }) 

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(true)
  })

  it('should check domain availability correctly (taken - NS Answer)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: [{ name: 'example.com' }] }) 

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(false)
  })

  it('should check domain availability correctly (taken - NS Authority)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 0, Authority: [{ name: 'example.com' }] }) 

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(false)
  })

  it('should check domain availability correctly (taken - SOA Answer)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 3 }) // NS: NXDOMAIN
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: [{ type: 6 }] }) // SOA: NOERROR

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com'])

    expect(domainsResults.value.domains[0]!.available).toBe(false)
  })

  it('should check domain availability correctly (taken - Status 0 for both but Answer in one)', async () => {
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: undefined, Authority: undefined }) 
    mockFetch.mockResolvedValueOnce({ Status: 0, Answer: [{ type: 6 }] }) 

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

  it('should handle multiple TLDs and progressive updates', async () => {
    mockFetch.mockResolvedValue({ Status: 3 }) // All available

    const { checkDomains, domainsResults } = useDomainChecker()
    await checkDomains('example', ['.com', '.net'])

    expect(domainsResults.value.domains.length).toBe(2)
    expect(domainsResults.value.domains[0]!.domain).toBe('example.com')
    expect(domainsResults.value.domains[1]!.domain).toBe('example.net')
  })
})
