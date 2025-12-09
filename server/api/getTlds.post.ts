// Static TLD API - No external dependencies (Directus removed)
import { defineEventHandler, readBody } from 'h3'
import type { GetTldsRequestBody, TldData, TldType } from '../../types/domain'
import tldData from '../../data/tlds.json'

// Type assertion for imported JSON
const staticTlds = tldData as TldData

// Performance constants - since data is static, we can load all TLDs
const MAX_PAGE_SIZE = 1000
const DEFAULT_PAGE_SIZE = 500

export default defineEventHandler(async (event) => {
  const body = await readBody<GetTldsRequestBody>(event)

  // Validate and sanitize pageSize
  let pageSize = body?.pageSize ?? DEFAULT_PAGE_SIZE
  if (pageSize === -1 || pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE
  }

  // Start with all TLDs from static data
  let filteredTlds = staticTlds.tlds

  // Filter by type if specified (GENERIC or COUNTRY_CODE)
  if (body?.type) {
    const validTypes: TldType[] = ['GENERIC', 'COUNTRY_CODE']
    if (validTypes.includes(body.type)) {
      filteredTlds = filteredTlds.filter(tld => tld.type === body.type)
    }
  }

  // Filter by search input if provided
  if (body?.input && body.input.length > 0) {
    // Limit search input length to prevent abuse
    const searchInput = body.input.slice(0, 100).toLowerCase()
    filteredTlds = filteredTlds.filter(tld =>
      tld.name.toLowerCase().includes(searchInput)
    )
  }

  // Return only the TLD names (maintaining backward compatibility)
  // Apply pagination
  const tldNames = filteredTlds
    .slice(0, pageSize)
    .map(tld => tld.name)

  return tldNames
})
