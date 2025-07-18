import type { WalletTypeResponse } from '~~/server/model/pgw_module_api/wallet'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const response = (await requestToPgwModuleApi(
      event,
      '/walletmgnt/get-wallet-type',
      'GET'
    )) as WalletTypeResponse

    return response
  } catch (error) {
    console.error('Error fetching wallet types:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wallet types',
    })
  }
})
