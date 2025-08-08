
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const queryString = getQuery(event)
    const queryParams = new URLSearchParams(queryString as Record<string, string>).toString()

    const fullEndpoint = `/walletmgnt/get-wallet-type${queryParams ? `?${queryParams}` : ''}`

    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET')

    return response
  } catch (error) {
    console.error('Error fetching wallet list:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wallet types',
    })
  }
})
