export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event)
    
    // Build URL with query parameters
    const endpoint = `/walletmgnt/get-fee-summary-transactions`
    const urlParams = new URLSearchParams()
    
    // Add all query parameters to URLSearchParams
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, String(value))
      }
    }
    
    const queryString = urlParams.toString()
    const fullEndpoint = `${endpoint}${queryString ? `?${queryString}` : ''}`

    // Make a direct fetch call to avoid parameter mapping conflicts
    const url = `${useRuntimeConfig(event).pgwModuleApiUrl}${fullEndpoint}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${event.context.auth?.token || ''}`,
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
      })
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching fee summary transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch fee summary transactions',
    })
  }
})
