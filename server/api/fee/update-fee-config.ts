import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { updateFeeConfig } from '../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeModel | null>> => {
  const payload = await readBody<FeeModel>(event)

  const response = await updateFeeConfig(payload)
  if (!response || !response.data) {
    return {
      code: 'ERROR',
      message: 'Failed to update fee config',
      data: null,
    }
  }
  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response.data as FeeModel,
  }
})
