import type { BankListQuery } from '~/models/bank'
import type { ApiResponseList } from '~/models/baseModel'
import type { PaginationParam } from '~/models/subBiller'

import { getListBanks } from '~~/server/logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponseList<BankListQuery>> => {
  const query = getQuery(event) as PaginationParam

  console.log('Query PARAM:', query)

  const response = await getListBanks(query)
  // Do NOT call .json() again here!
  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response || [],
  }
})
