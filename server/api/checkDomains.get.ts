// ~/server/api/checkDomains.ts
import { DomainsResult } from '../../types/domain'
import { defineEventHandler, getQuery } from 'h3'
import axios from 'axios'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const baseDomain = query.domain as string

  if (!baseDomain) {
    return { error: 'No base domain provided' }
  }

  const domainsToCheck = generateDomainList(baseDomain, [
    '.com',
    '.net',
    '.de',
    '.org',
  ]) // Add more TLDs as needed -TODO Dynamic with list that user can select
  return await checkDomains(domainsToCheck)
})

function generateDomainList(baseDomain: string, tlds: string[]): string[] {
  return tlds.map((tld) => `${baseDomain}${tld}`)
}

async function checkDomains(domains: string[]): Promise<DomainsResult> {
  const url = 'https://api.godaddy.com/v1/domains/available?checkType=FAST'
  const domainData = domains
  const config = {
    headers: {
      Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await axios.post(url, domainData, config)
    return response.data
  } catch (error) {
    console.error('Error checking domain availability:', error)
    throw new Error('Failed to check domain availability')
  }
}
