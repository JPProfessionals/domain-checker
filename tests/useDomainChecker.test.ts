import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDomainChecker } from '../composables/useDomainChecker'

// Mock Vue/Nuxt globals
vi.stubGlobal('ref', (val: unknown) => ({ value: val }))
vi.stubGlobal('readonly', (val: unknown) => val)
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key
}))

// The composable calls the global fetch() and parses the DoH body itself
// (Cloudflare answers with application/dns-json). mockFetch returns the parsed
// DoH payload; wrap it in a minimal Response-like object.
const mockFetch = vi.fn()
vi.stubGlobal('fetch', async (...args: unknown[]) => {
  const payload = await mockFetch(...args)
  return { ok: true, status: 200, text: async () => JSON.stringify(payload) }
})

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

  it('should reject invalid base domain labels', async () => {
    const { checkDomains, error } = useDomainChecker()
    await checkDomains('ex', ['.com'])

    expect(error.value).toBe('notifications.noDomainProvided')
  })

  it('should reject empty or unsafe TLD lists', async () => {
    const { checkDomains, error } = useDomainChecker()
    await checkDomains('example', [])
    expect(error.value).toBe('notifications.noTldsSelected')

    await checkDomains('example', ['not-a-tld', '../evil'])
    expect(error.value).toBe('notifications.noTldsSelected')
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

  it('should ignore results from an older concurrent search (race condition fence)', async () => {
    let resolveFirstQuery: ((value: unknown) => void) | null = null
    const firstPromise = new Promise(resolve => {
      resolveFirstQuery = resolve
    })

    // Mock fetch so 'slow.com' hangs until resolveFirstQuery is called
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('slow')) {
        await firstPromise
        return { Status: 3 }
      }
      return { Status: 3 }
    })

    const { checkDomains, domainsResults, loading } = useDomainChecker()

    // 1. Start slow check
    const run1 = checkDomains('slow', ['.com', '.net'])
    expect(loading.value).toBe(true)

    // 2. Quickly start second check for 'fast'
    const run2 = checkDomains('fast', ['.org'])

    // Wait for run2 to finish
    await run2
    expect(domainsResults.value.domains.map(d => d.domain)).toEqual(['fast.org'])
    expect(loading.value).toBe(false)

    // 3. Late resolution of run1
    resolveFirstQuery?.({ Status: 3 })
    await run1

    // run1's late results must NOT overwrite or pollute run2
    expect(domainsResults.value.domains.map(d => d.domain)).toEqual(['fast.org'])
    expect(loading.value).toBe(false)
  })
})
