import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { findFeeConfigById } from '../../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeModel | null>> => {
  const payload = await readBody<{ id: string }>(event)

  const response = await findFeeConfigById(payload)
  if (!response || !response.data) {
    return {
      code: 'ERROR',
      message: 'Failed to find fee config',
      data: null,
    }
  }
  return {
    code: 'SUCCESS',
    message: 'Success',
    data: response.data as FeeModel,
  }
})
