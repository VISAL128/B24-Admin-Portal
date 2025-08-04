import type { H3Event } from 'h3'

export async function requestToPgwModuleApi<T>(
  event: H3Event,
  endpoint: string,
  method: string = 'POST',
  body: unknown | null = null
): Promise<T> {
  try {
    const url = `${useRuntimeConfig(event).pgwModuleApiUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${event.context.auth?.token || ''}`,
      },
      signal: AbortSignal.timeout(30000),
    }

    console.log(`Requesting PGW Module API: ${url}`, { method, body, headers: options.headers })
    // Only add body for non-GET/HEAD
    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    return handlePgwModuleApiResponse<T>(response)
  } catch (error) {
    console.error('Error fetching fee config :', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }
}

function handlePgwModuleApiResponse<T>(response: Response): Promise<T> {
  console.log('PGW Module Api Response:', response)
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    })
  }
  return response.json()
}
