import type { DomainsResult } from '../../types/domain'
import { defineEventHandler, readBody } from 'h3'
import axios from 'axios'

export default defineEventHandler(async (event) => {
  // Reading JSON body from the POST request
  const body = await readBody(event)

  const baseDomain = body.domain
  const tlds = body.tlds ? body.tlds : ['.com', '.net', '.org', '.de'] // Default TLDs if none are provided

  if (!baseDomain) {
    throw createError({ statusMessage: 'No base domain provided', statusCode: 400 })
  }

  if (!Array.isArray(tlds) || tlds.some(tld => typeof tld !== 'string')) {
    throw createError({ statusMessage: 'Invalid TLDs format', statusCode: 400 })
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
  const url = 'https://api.godaddy.com/v1/domains/available?checkType=FAST'
  const config = {
    headers: {
      Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
      'Content-Type': 'application/json',
    },
  }

  const response = await axios.post(url, domains, config)
  return response.data
}
