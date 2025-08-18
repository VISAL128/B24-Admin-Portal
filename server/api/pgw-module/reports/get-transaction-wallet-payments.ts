import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const fullEndpoint = `/reports/get-transaction-wallet-payments`
    console.log(`Fetching wallet payments from PGW Module API: ${fullEndpoint}`)
    console.log(`Fetching wallet payments from PGW Module API: ${event}`)
    const response = await requestToPgwModuleApi(event, fullEndpoint, 'GET', true)

    return response
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to transactions',
    })
  }
})

