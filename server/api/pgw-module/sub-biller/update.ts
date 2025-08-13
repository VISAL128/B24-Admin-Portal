import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {

    const fullEndpoint = `/sub-biller/update`

    const response = await requestToPgwModuleApi(event, fullEndpoint, 'POST')

    return response
  } catch (error) {
    console.error('Error update sub biller:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update sub biller',
    })
  }
})
