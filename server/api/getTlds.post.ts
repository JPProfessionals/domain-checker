// Importing necessary modules from h3 and axios
import { defineEventHandler } from 'h3'
import axios from 'axios'

export default defineEventHandler(async (event) => {
  let url = 'https://api.jpprofessionals.de/items/TLDS?fields[]=name'

  const body = await readBody(event)
  if(body && body.input.length > 0){
    url = url + `&filter[name][_contains]=${body.input}`
  }

  try {
    // Fetching the list of TLDs from GoDaddy's API
    const response = await axios.get(url)
    const tlds = response.data.data.map((tld: any) => tld.name)
    return tlds // Returning the list of TLDs
  } catch (error: any) {
    console.error('Error fetching TLDs from API:', error)
    console.error('Error Body',error.response.data)
    // Returning an error response
    throw createError({ statusMessage: 'Failed to fetch TLDs', statusCode: 500 })
  }
})
