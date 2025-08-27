import { defineEventHandler, readBody } from 'h3'
import type { ConfirmSettlementRequest, ConfirmSettlementResponse } from '~/models/settlement'
import type { ApiResponseList } from '~/models/baseModel'
import { submitSettlement } from '../../logic/management_api_logic'

export default defineEventHandler(
  async (event): Promise<ApiResponseList<ConfirmSettlementResponse | null>> => {
    const payload = await readBody<ConfirmSettlementRequest>(event)

    const response = await submitSettlement(payload)
    if (!response || !response.data) {
      return {
        code: 'ERROR',
        message: 'Failed to submit settlement',
        data: null,
      }
    }
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as ConfirmSettlementResponse,
    }
  }
)
