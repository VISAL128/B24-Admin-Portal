import type { H3Event } from 'h3'
import type { QueryParams } from '~/models/baseModel'
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
  isGetListRequest: boolean = false
): Promise<T> {
  try {
    let url = `${useRuntimeConfig(event).pgwModuleApiUrl}${endpoint}`
    
    // Only use QueryParams mapping for GET list requests
    if (isGetListRequest) {
      const query = getQuery<QueryParams>(event)
      const pgwParams = mapQueryParamsToPgwModule(query)
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
      console.log(`Requesting PGW Module API: ${url}`, { method })
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${event.context.auth?.token || ''}`,
      },
      signal: AbortSignal.timeout(30000),
    }

    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body)
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
