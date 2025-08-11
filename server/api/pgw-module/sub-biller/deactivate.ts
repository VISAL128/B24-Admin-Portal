import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {

    const fullEndpoint = `/sub-biller/deactivate`

    const response = await requestToPgwModuleApi(event, fullEndpoint, 'POST')

    return response
  } catch (error) {
    console.error('Error deactivate sub biller:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to deactivate sub biller',
    })
  }
})
