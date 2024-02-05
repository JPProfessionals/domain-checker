// ~/server/api/checkDomains.ts
import { DomainResult } from '../types/domain'
import { defineEventHandler, getQuery } from 'h3'
import axios from 'axios'

export default defineEventHandler(async (event) => {
  console.log('test')
  
  const query = getQuery(event)
  const baseDomain = query.domain as string

  if (!baseDomain) {
    return { error: 'No base domain provided' }
  }

  const domainsToCheck = generateDomainList(baseDomain, ['.com', '.net', '.de', '.org']) // Add more TLDs as needed
  return await checkDomains(domainsToCheck)
})

function generateDomainList(baseDomain: string, tlds: string[]): string[] {
  return tlds.map(tld => `${baseDomain}${tld}`)
}

async function checkDomains(domains: string[]): Promise<DomainResult[]> {
  const url = `https://api.godaddy.com/v1/domains/available?domains=${domains.join(',')}`
  const config = {
    headers: {
      Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await axios.post(url, {}, config)
    // Parse the response based on GoDaddy's API structure; this is a placeholder
    return response.data.domains.map((domain: any) => ({
      name: domain.domain,
      available: domain.available ? 'Yes' : 'No',
    }))
  } catch (error) {
    console.error('Error checking domain availability:', error)
    throw new Error('Failed to check domain availability')
  }
}
