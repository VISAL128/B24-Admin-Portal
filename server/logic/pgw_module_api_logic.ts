import type { H3Event } from 'h3'
import type { QueryParams, TransactionQueryParams } from '~/models/baseModel'
import { mapQueryParamsToPgwModule, serializePgwModuleParams } from '../utils/queryParamsMapper'

// export async function requestToPgwModuleApi<T>(
//   event: H3Event,
//   endpoint: string,
//   method: string = 'POST',
//   body: unknown | null = null
// ): Promise<T> {
//   try {
//     const url = `${useRuntimeConfig(event).pgwModuleApiUrl}${endpoint}`
//     const options: RequestInit = {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${event.context.auth?.token || ''}`,
//       },
//       signal: AbortSignal.timeout(30000),
//     }

//     console.log(`Requesting PGW Module API: ${url}`, { method, body, headers: options.headers })
//     // Only add body for non-GET/HEAD
//     if (body && method !== 'GET' && method !== 'HEAD') {
//       options.body = JSON.stringify(body)
//     }

//     const response = await fetch(url, options)
//     return handlePgwModuleApiResponse<T>(response)
//   } catch (error) {
//     console.error('Error fetching fee config :', error)
//     const statusCode = error && typeof error === 'object' && 'statusCode' in error 
//       ? (error as { statusCode: number }).statusCode 
//       : 500
//     throw createError({
//       statusCode,
//       statusMessage: (error as Error).message ?? 'Internal Server Error',
//     })
//   }
// }

export async function requestToPgwModuleApi<T>(
  event: H3Event,
  endpoint: string,
  method: string = 'POST',
  body?: unknown,
  additionalHeaders?: Record<string, string>,
  useRawQueryParams: boolean = false
): Promise<T> {
  try {
    let url = `${useRuntimeConfig(event).pgwModuleApiUrl}${endpoint}`
    const query = getQuery<QueryParams | TransactionQueryParams>(event)
    
    // Check if we should use raw query params (for endpoints like transaction list with Statuses)
    if (useRawQueryParams && method === 'GET') {
      // Hybrid approach: Use QueryParams mapping for standard params + raw handling for special params
      const isQueryParams = query && typeof query === 'object' && 'page' in query && 'page_size' in query
      
      let finalParams = new URLSearchParams()
      
      if (isQueryParams) {
        // First, process standard QueryParams (pagination, filters, sorting)
        const pgwParams = mapQueryParamsToPgwModule(query as QueryParams)
        const serializedParams = serializePgwModuleParams(pgwParams)
        
        // Add standard parameters
        for (const [key, value] of Object.entries(serializedParams)) {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              finalParams.append(key, JSON.stringify(value))
            } else {
              finalParams.append(key, String(value))
            }
          }
        }
        
        console.log('Processed standard QueryParams:', serializedParams)
      }
      
      // Then, add raw query params for special transaction parameters (Statuses, Types)
      const specialParams = ['Statuses', 'Types']
      for (const [key, value] of Object.entries(query)) {
        if (specialParams.includes(key) && value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // For arrays (like Statuses, Types), add each item as a separate parameter
            value.forEach(item => {
              if (item !== undefined && item !== null && item !== '') {
                finalParams.append(key, String(item))
              }
            })
          } else {
            finalParams.append(key, String(value))
          }
        }
      }
      
      const queryString = finalParams.toString()
      url = `${url}${queryString ? `?${queryString}` : ''}`
      
      console.log(`Requesting PGW Module API with hybrid query params: ${url}`, { 
        method,
        hybridQuery: query,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer [REDACTED]' }
      })
    } else {
      // Check if the query is type of QueryParams for GET requests
      const isQueryParams = query && typeof query === 'object' && 'page' in query && 'page_size' in query && method === 'GET'

      // Only use QueryParams mapping for GET list requests
      if (isQueryParams) {
        const pgwParams = mapQueryParamsToPgwModule(query as QueryParams)
        const serializedParams = serializePgwModuleParams(pgwParams)
        
        // Convert serialized params to URL query string
        const urlParams = new URLSearchParams()
        for (const [key, value] of Object.entries(serializedParams)) {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              urlParams.append(key, JSON.stringify(value))
            } else {
              urlParams.append(key, String(value))
            }
          }
        }
        
        const queryString = urlParams.toString()
        url = `${url}${queryString ? `?${queryString}` : ''}`
        
        console.log(`Requesting PGW Module API with query params: ${url}`, { 
          method,
          pgwParams: serializedParams, 
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer [REDACTED]' }
        })
      } else {
        console.log(`Requesting PGW Module API: ${url}`, { method, hasBody: !!body })
      }
    }

    console.log(`Requesting PGW Module API: ${url}`, { method, body, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer [REDACTED]' } })
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${event.context.auth?.token || ''}`,
        ...additionalHeaders, // Merge additional headers (like Accept-Language)
      },
      signal: AbortSignal.timeout(30000),
    }

    // For POST requests, if no body is provided as parameter, try to read it from the request
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let requestBody = body
      
      // If no body provided as parameter, try to read from request
      if (!requestBody) {
        try {
          requestBody = await readBody(event)
        } catch (error) {
          console.warn('Could not read request body:', error)
        }
      }
      
      if (requestBody) {
        options.body = JSON.stringify(requestBody)
        console.log(`Adding request body to ${method} request`)
      }
    }
    
    const response = await fetch(url, options)
    return handlePgwModuleApiResponse<T>(response)
  } catch (error) {
    console.error('Error in PGW Module API request:', error)
    const statusCode = error && typeof error === 'object' && 'statusCode' in error 
      ? (error as { statusCode: number }).statusCode 
      : 500
    throw createError({
      statusCode,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }
}

function handlePgwModuleApiResponse<T>(response: Response): Promise<T> {
  console.log('PGW Module API response:', response)
  if(!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    })
  }
  return response.json()
}

export const pgwModuleApiLogic = () => {
  /**
   * Logic to proxy wallet transaction requests to the PGW Module API.
   * It constructs the correct endpoint and forwards the query parameters.
   *
   * @param event The H3 event object.
   * @param walletType The type of wallet ('settlement' or 'top-up').
   */
  const getWalletTransactionsLogic = async (event: H3Event, walletType: 'settlement' | 'top-up') => {
    const query = getQuery(event)
    const endpoint = `/walletmgnt/${walletType}/transactions`
    const queryString = new URLSearchParams(query as Record<string, string>).toString()
    const fullEndpoint = `${endpoint}?${queryString}`

    console.log(`Forwarding wallet transaction request to PGW Module API: ${fullEndpoint}`)

    // The existing `requestToPgwModuleApi` is primarily for POST requests.
    // For GET requests with query parameters, it's cleaner to make a direct call.
    try {
      const url = `${useRuntimeConfig(event).pgwModuleApiUrl}${fullEndpoint}`
      const options: RequestInit = {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${event.context.auth?.token || ''}`,
        },
        signal: AbortSignal.timeout(30000),
      }
 
      const response = await fetch(url, options)
      return handlePgwModuleApiResponse(response)
    } catch (error) {
      console.error(`Error fetching wallet transactions for type '${walletType}':`, error)
      throw createError({
        statusCode: 500,
        statusMessage: (error as Error).message ?? 'Internal Server Error while fetching transactions.',
      })
    }
  }

  return {
    getWalletTransactionsLogic,
  }
}
