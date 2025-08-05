import { pgwModuleApiLogic } from '../../../../logic/pgw_module_api_logic'

export default defineEventHandler(async (event) => {
  const { getWalletTransactionsLogic } = pgwModuleApiLogic()
  return await getWalletTransactionsLogic(event, 'top-up')
})
