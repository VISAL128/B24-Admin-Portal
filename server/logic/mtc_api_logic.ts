import type { H3Event } from 'h3'

export function requestToMtcApi(
  event: H3Event,
  endpoint: string,
  method: string,
  data?: unknown,
  contentType: string = 'application/json'
) {
  const url = `${useRuntimeConfig(event).mtcApiUrl}${endpoint}`
  const headers = {
    'Content-Type': contentType,
    Authorization: `Bearer ${event.context.auth?.token}`,
  }

  return fetch(url, {
    method,
    headers,
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`MTC API request failed: ${response.statusText}`)
      }
      return response.json()
    })
    .catch((error) => {
      console.error('Error occurred while calling MTC API:', error)
      throw error
    })
}
