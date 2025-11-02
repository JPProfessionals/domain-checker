import type { DomainsResult, CheckDomainsRequestBody } from '../../types/domain'
import { defineEventHandler, readBody } from 'h3'

// Performance constants
const MAX_DOMAIN_LENGTH = 253 // RFC 1035 max domain length
const MAX_TLDS_PER_REQUEST = 100 // Limit simultaneous domain checks
const MAX_DOMAIN_NAME_LENGTH = 63 // Max length per domain label (RFC 1035)

export default defineEventHandler(async (event) => {
  // Reading JSON body from the POST request
  const body = await readBody<CheckDomainsRequestBody>(event)

  const baseDomain = body.domain
  let tlds = body.tlds ? body.tlds : ['.com', '.net', '.org', '.de'] // Default TLDs if none are provided

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
  } catch (error) {
    console.error('Error checking domain availability:', error)
    throw createError({ statusMessage: 'Failed to check domain availability', statusCode: 500 })
  }
})


function generateDomainList(baseDomain: string, tlds: string[]): string[] {
  return tlds.map(tld => `${baseDomain}${tld}`)
}

async function checkDomains(domains: string[]): Promise<DomainsResult> {
  const apiKey = process.env.GODADDY_API_KEY
  const apiSecret = process.env.GODADDY_API_SECRET

  if (!apiKey || !apiSecret) {
    throw createError({
      statusMessage: 'GoDaddy API credentials not configured',
      statusCode: 500,
    })
  }

  const url = 'https://api.ote-godaddy.com/v1/domains/available?checkType=FAST'

  const response = await $fetch<DomainsResult>(url, {
    headers: {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json',
    },
    body: domains,
    method: 'POST',
    timeout: 30000, // 30 second timeout for GoDaddy API
  })
  return response
}
