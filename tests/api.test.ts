import { describe, it, expect, vi } from 'vitest'
import checkDomainsHandler, { generateDomainList, checkDomainAvailability, checkDomains } from '../server/api/checkDomains.post'
import { readBody } from 'h3'

vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: vi.fn(),
  createError: (err: any) => err
}))

// Mock $fetch globally for the Node test environment
const mockFetch = vi.fn()
globalThis.$fetch = mockFetch as any

describe('Domain Checker Business Logic', () => {

  describe('generateDomainList', () => {
    it('creates correct domains from base and tlds', () => {
      const result = generateDomainList('google', ['.com', '.net'])
      expect(result).toEqual(['google.com', 'google.net'])
    })
  })

  describe('checkDomainAvailability', () => {

    it('returns available: true if NXDOMAIN (Status: 3) for both NS and SOA', async () => {
      mockFetch.mockResolvedValueOnce({ Status: 3 }) // NS response
      mockFetch.mockResolvedValueOnce({ Status: 3 }) // SOA response
      
      const result = await checkDomainAvailability('not-taken-123.com')
      expect(result.domain).toBe('not-taken-123.com')
      expect(result.available).toBe(true)
    })

    it('returns available: false if NS records exist', async () => {
      mockFetch.mockResolvedValueOnce({ Status: 0, Answer: [{ data: 'ns1.com' }] }) 
      
      const result = await checkDomainAvailability('google.com')
      expect(result.domain).toBe('google.com')
      expect(result.available).toBe(false)
    })

    it('returns available: false if fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const result = await checkDomainAvailability('error-domain.com')
      expect(result.domain).toBe('error-domain.com')
      expect(result.available).toBe(false)
    })

  })

  describe('checkDomains', () => {
    it('runs availability checks concurrently for an array of domains', async () => {
      mockFetch.mockResolvedValueOnce({ Status: 3 })
      mockFetch.mockResolvedValueOnce({ Status: 3 })
      
      const result = await checkDomains(['test1.com'])
      expect(result?.domains?.length).toBe(1)
      expect(result?.domains?.[0]?.available).toBe(true)
    })
  })

  describe('API Route Handler Validations', () => {
    it('throws error if no base domain provided', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ tlds: ['.com'] })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error if domain is too long', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'a'.repeat(64), tlds: ['.com'] })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('returns results for valid requests', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'test', tlds: ['.com'] })
      mockFetch.mockResolvedValueOnce({ Status: 3 })
      mockFetch.mockResolvedValueOnce({ Status: 3 })
      const res = await (checkDomainsHandler as any)({} as any)
      expect(res.domains.length).toBe(1)
    })

    it('throws error for invalid TLD format', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'test', tlds: 'not-an-array' })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error for non-string TLDs', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'test', tlds: [123] })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error for missing domain', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ tlds: ['.com'] })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error for empty body', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({})
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error for too many TLDs', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'test', tlds: Array(101).fill('.com') })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })

    it('throws error if base domain + tld is too long', async () => {
      // @ts-ignore
      readBody.mockResolvedValueOnce({ domain: 'a'.repeat(250), tlds: ['.com'] })
      await expect((checkDomainsHandler as any)({} as any)).rejects.toHaveProperty('statusCode', 400)
    })
  })
})
