// Importing necessary modules from h3 and axios
import { defineEventHandler } from 'h3'
import axios from 'axios'

export default defineEventHandler(async () => {
  const url = 'https://api.godaddy.com/v1/domains/tlds'

  const config = {
    headers: {
      Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
    },
  }

  try {
    // Fetching the list of TLDs from GoDaddy's API
    const response = await axios.get(url, config)
    const tlds = response.data.map((tld: any) => tld.name)
    return tlds // Returning the list of TLDs
  } catch (error) {
    console.error('Error fetching TLDs from GoDaddy:', error)
    // Returning an error response
    throw createError({ statusMessage: 'Failed to fetch TLDs', statusCode: 500 })
  }
})
