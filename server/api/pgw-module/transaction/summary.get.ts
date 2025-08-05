import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = (await requestToPgwModuleApi(
      event,
      '/transaction/summary',
      'GET'
    )) 
    return response
  } catch (error) {
    console.error('❌ Error fetching transaction summary:', error)

  }
})
