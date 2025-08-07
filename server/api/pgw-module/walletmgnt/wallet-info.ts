import type {
  WalletBalanceResponse,
  WalletBalanceRequest,
} from '~~/server/model/pgw_module_api/wallet'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as WalletBalanceRequest

   console.log('Fetching wallet balance with body:', body)
   
    const response = (await requestToPgwModuleApi(
      event,
      '/walletmgnt/wallet-info',
      'POST',
      false,
    )) as WalletBalanceResponse

    return response
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wallet balance',
    })
  }
})
