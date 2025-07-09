export async function requestToPgwModuleApi(endpoint: string, method: string = 'POST', body: any = null): Promise<any> {
    let url = `${useRuntimeConfig().pgw_module_api_url}${endpoint}`;
    const options: RequestInit = {
        method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer staticToken`, // Replace with actual token logic
    }
  };

  // Only add body for non-GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response.json().then((data) => {
    console.log('Response from PGW Module API:', data);
    if (!response.ok) {
      throw new Error(`Error: ${data.message || 'Unknown error'}`);
    }
    return data;
  }).catch((error) => {
    throw error;
  });
}