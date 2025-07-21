import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = await requestToPgwModuleApi(
      event,
      '/walletmgnt/get-fee-summary-transactions',
      'GET'
    )

    return response
  } catch (error) {
    console.error('Error fetching fee summary transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch fee summary transactions',
    })
  }
})
