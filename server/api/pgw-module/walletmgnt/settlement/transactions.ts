import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {

    const fullEndpoint = `/walletmgnt/settlement/transactions`
    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET')

    return response
  } catch (error) {
    console.error('Failed to fetch settlement transaction list', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch settlement transaction list',
    })
  }
})