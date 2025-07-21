import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = await requestToPgwModuleApi(
      event,
      '/walletmgnt/get-top-up-summary-transactions',
      'GET'
    )

    return response
  } catch (error) {
    console.error('Error fetching top-up summary transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch top-up summary transactions',
    })
  }
})
