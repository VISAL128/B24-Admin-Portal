import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = await requestToPgwModuleApi(event, PGW_MODULE_API_ENDPOINTS.TRANSACTION.GET_TRANSACTION_LIST, 'GET', true)

    return response
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
    })
  }
})
