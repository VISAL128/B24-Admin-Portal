import type { H3Event } from 'h3'

export async function requestToPgwModuleApi(
  event: H3Event,
  endpoint: string,
  method: string = 'POST',
  body: unknown | null = null
): Promise<unknown> {
  const url = `${useRuntimeConfig(event).pgwModuleApiUrl}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${event.context.auth?.token || ''}`,
    },
  }

  console.log(`Requesting PGW Module API: ${url}`, { method, body, headers: options.headers })
  // Only add body for non-GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  return handlePgwModuleApiResponse(response)
}

function handlePgwModuleApiResponse(response: Response): Promise<unknown> {
  console.log('PGW Module Api Response:', response)
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    })
  }
  return response.json()
}
