import type { DomainsResult, CheckDomainsRequestBody, DomainResult } from '../../types/domain'
import { defineEventHandler, readBody, createError } from 'h3'

// Performance constants
const MAX_DOMAIN_LENGTH = 253 // RFC 1035 max domain length
const MAX_TLDS_PER_REQUEST = 100 // Limit simultaneous domain checks
const MAX_DOMAIN_NAME_LENGTH = 63 // Max length per domain label (RFC 1035)

export default defineEventHandler(async (event) => {
  // Reading JSON body from the POST request; default to empty object to guard against null/undefined
  const body = (await readBody<CheckDomainsRequestBody>(event)) ?? {}

  const baseDomain = body.domain
  const tlds = body.tlds ? body.tlds : ['.com', '.net', '.org', '.de'] // Default TLDs if none are provided

  // Validate base domain
  if (!baseDomain || typeof baseDomain !== 'string') {
    throw createError({ statusMessage: 'No base domain provided', statusCode: 400 })
  }

  // Validate domain length
  if (baseDomain.length > MAX_DOMAIN_NAME_LENGTH) {
    throw createError({ 
      statusMessage: `Domain name too long (max ${MAX_DOMAIN_NAME_LENGTH} characters)`, 
      statusCode: 400 
    })
  }

  // Validate TLDs format
  if (!Array.isArray(tlds) || tlds.some(tld => typeof tld !== 'string')) {
    throw createError({ statusMessage: 'Invalid TLDs format', statusCode: 400 })
  }

  // Limit number of TLDs to prevent memory/performance issues
  if (tlds.length > MAX_TLDS_PER_REQUEST) {
    throw createError({ 
      statusMessage: `Too many TLDs requested (max ${MAX_TLDS_PER_REQUEST} allowed)`, 
      statusCode: 400 
    })
  }

  // Validate total domain length (base + TLD)
  const maxTldLength = Math.max(...tlds.map(tld => tld.length))
  if (baseDomain.length + maxTldLength > MAX_DOMAIN_LENGTH) {
    throw createError({ 
      statusMessage: `Total domain length exceeds maximum (${MAX_DOMAIN_LENGTH} characters)`, 
      statusCode: 400 
    })
  }

  try {
    const domainsToCheck = generateDomainList(baseDomain, tlds)
    const result = await checkDomains(domainsToCheck)
    return result
  } catch {
    throw createError({ statusMessage: 'Failed to check domain availability', statusCode: 500 })
  }
})


export function generateDomainList(baseDomain: string, tlds: string[]): string[] {
  return tlds.map(tld => `${baseDomain}${tld}`)
}

export async function checkDomainAvailability(domain: string): Promise<DomainResult> {
  try {
    const response = await $fetch<any>(
      `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
      {
        headers: { accept: 'application/dns-json' },
        responseType: 'json',
        timeout: 10000,
      }
    )

    // Status 0: NOERROR (domain exists)
    // Status 3: NXDOMAIN (domain does not exist, or at least has no DNS records)
    if (response.Status === 3 || (response.Status === 0 && !response.Answer && !response.Authority)) {
      // It might be NXDOMAIN, but let's double check SOA just in case
      const soaResponse = await $fetch<any>(
        `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=SOA`,
        {
          headers: { accept: 'application/dns-json' },
          responseType: 'json',
          timeout: 10000,
        }
      )
      
      const isAvailable = (response.Status === 3 || (response.Status === 0 && !response.Answer && !response.Authority)) &&
                         (soaResponse.Status === 3 || (soaResponse.Status === 0 && !soaResponse.Answer && !soaResponse.Authority))

      return {
        id: domain,
        domain: domain,
        available: isAvailable
      }
    }
    
    // If it has NS or SOA records, it's definitely registered
    return {
      id: domain,
      domain: domain,
      available: false
    }
  } catch (error: any) {
    console.error(`DNS lookup failed for ${domain}:`, error)
    return {
      id: domain,
      domain: domain,
      available: false // Assume unavailable on error
    }
  }
}

// Maximum number of concurrent DoH lookups; kept small to avoid upstream rate-limiting
// (each domain triggers up to 2 HTTP requests: NS + SOA)
const DOH_CONCURRENCY_LIMIT = 5

export async function checkDomains(domains: string[]): Promise<DomainsResult> {
  const results: DomainResult[] = []
  for (let i = 0; i < domains.length; i += DOH_CONCURRENCY_LIMIT) {
    const batch = domains.slice(i, i + DOH_CONCURRENCY_LIMIT)
    const batchResults = await Promise.all(batch.map(checkDomainAvailability))
    results.push(...batchResults)
  }
  return {
    domains: results
  }
}
