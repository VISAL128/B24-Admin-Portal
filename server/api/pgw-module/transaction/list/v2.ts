import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const fullEndpoint = `/transaction/list/v2`
    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET', true)

    return response
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
    })
  }
})
