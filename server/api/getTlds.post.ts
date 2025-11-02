// Importing necessary modules from h3
import { defineEventHandler, readBody } from 'h3'
import type { TldApiResponse, GetTldsRequestBody, GoDaddyApiError } from '../../types/domain'

// Performance constants
const MAX_PAGE_SIZE = 1000 // Maximum TLDs to load at once
const DEFAULT_PAGE_SIZE = 500 // Default limit to prevent memory issues
const CACHE_TTL = 60 * 60 * 1000 // 1 hour cache

// Simple in-memory cache for TLDs
let cachedTlds: string[] | null = null
let cacheTimestamp = 0

export default defineEventHandler(async (event) => {
  let url = 'https://api.jpprofessionals.de/items/TLDS?fields[]=name'

  const body = await readBody<GetTldsRequestBody>(event)
  
  // Validate and sanitize pageSize
  let pageSize = body?.pageSize
  if (pageSize === undefined || pageSize === null) {
    pageSize = DEFAULT_PAGE_SIZE
  } else if (pageSize === -1 || pageSize > MAX_PAGE_SIZE) {
    // Prevent unlimited or excessive requests
    pageSize = MAX_PAGE_SIZE
  }

  // Use cache if available and no filter is applied
  if (!body?.input && cachedTlds && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedTlds.slice(0, pageSize)
  }

  if (body?.input && body.input.length > 0) {
    // Limit search input length to prevent abuse
    const searchInput = body.input.slice(0, 100)
    url = url + `&filter[name][_contains]=${encodeURIComponent(searchInput)}`
  }

  url = url + `&limit=${pageSize}`

  try {
    // Fetching the list of TLDs from the API with timeout
    const response = await $fetch<TldApiResponse>(url, {
      timeout: 10000, // 10 second timeout
    })
    if (!response?.data || !Array.isArray(response.data)) {
      throw createError({
        statusMessage: 'Invalid response format from TLD API',
        statusCode: 500,
      })
    }
    const tlds = response.data.map((tld) => tld.name)
    
    // Cache the full list if no filter was applied
    if (!body?.input && tlds.length <= MAX_PAGE_SIZE) {
      cachedTlds = tlds
      cacheTimestamp = Date.now()
    }
    
    return tlds // Returning the list of TLDs
  } catch (error: unknown) {
    console.error('Error fetching TLDs from API:', error)
    const apiError = error as GoDaddyApiError
    if (apiError?.response?.data) {
      console.error('Error Body', apiError.response.data)
    }
    // Returning an error response
    throw createError({
      statusMessage: 'Failed to fetch TLDs',
      statusCode: 500,
    })
  }
})
