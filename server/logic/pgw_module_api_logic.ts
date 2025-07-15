export async function requestToPgwModuleApi(
  event: any,
  endpoint: string,
  method: string = 'POST',
  body: any = null
): Promise<any> {
  let url = `${useRuntimeConfig().pgw_module_api_url}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${event.context.auth?.token || ''}`,
    },
  }

  // Only add body for non-GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  return handlePgwModuleApiResponse(response)
}

function handlePgwModuleApiResponse(response: Response): any {
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}
