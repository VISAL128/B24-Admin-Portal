import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { getListFeeConfig } from '../../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeModel[] | null>> => {
  const payload = await readBody<{ search: string }>(event)

  const response = await getListFeeConfig(payload)
  if (!response || !response.data) {
    return {
      code: 'ERROR',
      message: 'Failed to get fee config list',
      data: null,
    }
  }

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response.data as FeeModel[],
  }
})
