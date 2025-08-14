import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const fullEndpoint = `/sub-biller/get-sub-biller`
    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET', true)

    return response
  } catch (error) {
    console.error('Error fetching sub biller:', error)
    throw createError({ 
      statusCode: 500,
      statusMessage: 'Failed to sub biller',
    })
  }
})
