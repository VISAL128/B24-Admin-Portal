import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params as { id: string }

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing sub-biller ID',
      })
    }

    const fullEndpoint = `/sub-biller/${id}`

    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET')

    return response
  } catch (error) {
    console.error('Error fetching sub biller by ID:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sub biller by ID',
    })
  }
})
