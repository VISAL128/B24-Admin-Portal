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

const isFormData = (v: unknown): v is FormData =>
  typeof v === 'object' && v !== null && (v as any)[Symbol.toStringTag] === 'FormData'
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && v.constructor === Object
const isTypedArrayOrBuffer = (v: unknown): v is ArrayBuffer | Uint8Array | Buffer =>
  v instanceof ArrayBuffer ||
  ArrayBuffer.isView(v) ||
  (typeof Buffer !== 'undefined' && v instanceof Buffer)

function buildFetchInit(
  event: H3Event,
  method: string,
  body: unknown | undefined,
  additionalHeaders?: Record<string, string>
): RequestInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${event.context.auth?.token || ''}`,
    ...additionalHeaders, // allow caller to force/override
  }

  const init: RequestInit = { method, headers, signal: AbortSignal.timeout(30000) }

  // No body for GET/HEAD
  if (method === 'GET' || method === 'HEAD') return init

  // If body is provided, set it properly
  if (body != null) {
    if (isFormData(body)) {
      // Important: DO NOT set Content-Type for FormData (boundary is auto)
      init.body = body as any
    } else if (isTypedArrayOrBuffer(body)) {
      headers['Content-Type'] ||= 'application/octet-stream'
      init.body = body as any
    } else if (typeof body === 'string') {
      headers['Content-Type'] ||= 'text/plain;charset=utf-8'
      init.body = body
    } else if (isPlainObject(body)) {
      headers['Content-Type'] ||= 'application/json'
      init.body = JSON.stringify(body)
    } else {
      // Fallback: let fetch handle it if possible
      init.body = body as any
    }
  }

  return init
}

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

    if (useRawQueryParams && method === 'GET') {
      const isQueryParams =
        query && typeof query === 'object' && 'page' in query && 'page_size' in query
      const finalParams = new URLSearchParams()

      if (isQueryParams) {
        const pgwParams = mapQueryParamsToPgwModule(query as QueryParams)
        const serialized = serializePgwModuleParams(pgwParams)
        for (const [k, v] of Object.entries(serialized)) {
          if (v !== undefined && v !== null && v !== '') {
            Array.isArray(v)
              ? finalParams.append(k, JSON.stringify(v))
              : finalParams.append(k, String(v))
          }
        }
      }

      for (const [k, v] of Object.entries(query)) {
        if ((k === 'Statuses' || k === 'Types') && v != null && v !== '') {
          if (Array.isArray(v)) v.forEach((x) => x != null && finalParams.append(k, String(x)))
          else finalParams.append(k, String(v))
        }
      }

      const qs = finalParams.toString()
      url = `${url}${qs ? `?${qs}` : ''}`
    } else {
      const isQueryParams =
        query &&
        typeof query === 'object' &&
        'page' in query &&
        'page_size' in query &&
        method === 'GET'
      if (isQueryParams) {
        const pgwParams = mapQueryParamsToPgwModule(query as QueryParams)
        const serialized = serializePgwModuleParams(pgwParams)
        const urlParams = new URLSearchParams()
        for (const [k, v] of Object.entries(serialized)) {
          if (v !== undefined && v !== null && v !== '') {
            Array.isArray(v)
              ? urlParams.append(k, JSON.stringify(v))
              : urlParams.append(k, String(v))
          }
        }
        const qs = urlParams.toString()
        url = `${url}${qs ? `?${qs}` : ''}`
      }
    }

    // If no body passed and request is non-GET, try to read it from the incoming request.
    let outboundBody = body
    if (!outboundBody && !(method === 'GET' || method === 'HEAD')) {
      // Detect multipart from inbound headers and rebuild as FormData
      const ctype = getRequestHeader(event, 'content-type') || ''
      if (ctype.startsWith('multipart/form-data')) {
        const parts = await readMultipartFormData(event)
        const form = new FormData()
        for (const p of parts || []) {
          if (p.filename && p.data) {
            // @ts-ignore Node fetch/undici File is available in Nitro runtime
            const file = new File([p.data], p.filename, {
              type: p.type || 'application/octet-stream',
            })
            form.append(p.name || 'file', file)
          } else {
            form.append(p.name || 'field', p.data?.toString('utf8') ?? '')
          }
        }
        outboundBody = form
      } else if (ctype.startsWith('application/json')) {
        outboundBody = await readBody(event)
      } else {
        // Fallback: raw text/body
        outboundBody = await readRawBody(event)
      }
    }

    const options = buildFetchInit(event, method, outboundBody, additionalHeaders)

    const response = await fetch(url, options)
    return handlePgwModuleApiResponse<T>(response)
  } catch (error) {
    console.error('Error in PGW Module API request:', error)
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500
    throw createError({
      statusCode,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }
}

function handlePgwModuleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: response.statusText })
  }
  return response.json() as Promise<T>
}

export const pgwModuleApiLogic = () => {
  /**
   * Logic to proxy wallet transaction requests to the PGW Module API.
   * It constructs the correct endpoint and forwards the query parameters.
   *
   * @param event The H3 event object.
   * @param walletType The type of wallet ('settlement' or 'top-up').
   */
  const getWalletTransactionsLogic = async (
    event: H3Event,
    walletType: 'settlement' | 'top-up'
  ) => {
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
          accept: 'text/plain',
          Authorization: `Bearer ${event.context.auth?.token || ''}`,
        },
        signal: AbortSignal.timeout(30000),
      }

      const response = await fetch(url, options)
      return handlePgwModuleApiResponse(response)
    } catch (error) {
      console.error(`Error fetching wallet transactions for type '${walletType}':`, error)
      throw createError({
        statusCode: 500,
        statusMessage:
          (error as Error).message ?? 'Internal Server Error while fetching transactions.',
      })
    }
  }

  return {
    getWalletTransactionsLogic,
  }
}
