import { describe, it, expect } from 'vitest'
import {
  buildAllowedTldSet,
  createDomainSearchSchema,
  filterAllowedTlds,
  isSafeDomainName,
  isValidDomainLabel,
  MAX_TLDS_PER_CHECK,
} from '../utils/domainValidation'

const t = (key: string) => key

describe('domainValidation', () => {
  it('validates domain labels', () => {
    expect(isValidDomainLabel('example')).toBe(true)
    expect(isValidDomainLabel('ex')).toBe(false)
    expect(isValidDomainLabel('example.com')).toBe(false)
    expect(isValidDomainLabel('-bad')).toBe(false)
    expect(isValidDomainLabel('a'.repeat(64))).toBe(false)
  })

  it('validates safe full domain names', () => {
    expect(isSafeDomainName('example.com')).toBe(true)
    expect(isSafeDomainName('sub.example.co.uk')).toBe(true)
    expect(isSafeDomainName('https://evil.com')).toBe(false)
    expect(isSafeDomainName('example.com/path')).toBe(false)
    expect(isSafeDomainName('example.com?q=1')).toBe(false)
  })

  it('allowlists and normalizes TLDs', () => {
    const allowed = buildAllowedTldSet(['.com', 'net', '.org'])
    expect(filterAllowedTlds(['com', '.net', '.evil', '.com', 'org'], allowed)).toEqual([
      '.com',
      '.net',
      '.org',
    ])
  })

  it('caps TLDs at the max per check', () => {
    const many = Array.from({ length: MAX_TLDS_PER_CHECK + 10 }, (_, i) => `.t${i}`)
    const allowed = buildAllowedTldSet(many)
    expect(filterAllowedTlds(many, allowed)).toHaveLength(MAX_TLDS_PER_CHECK)
  })

  it('rejects invalid search schema input', () => {
    const schema = createDomainSearchSchema(t)
    expect(schema.safeParse({ search: 'ab' }).success).toBe(false)
    expect(schema.safeParse({ search: 'example.com' }).success).toBe(false)
    expect(schema.safeParse({ search: 'example' }).success).toBe(true)
  })
})
