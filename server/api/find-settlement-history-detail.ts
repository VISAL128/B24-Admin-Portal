import { defineEventHandler, getRouterParam } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import { SettlementHistoryDetail, SettlementHistoryDetailQuery, SettlementHistoryRecord, SettlementHistoryDetailResponse } from '~/models/settlement'
import { getSettlementHistoryById } from '~~/server/logic/management_api_logic'

// export default defineEventHandler(async (event): Promise<ApiResponse<SettlementHistoryRecord>> => {
//   const id = getRouterParam(event, 'id')
  export default defineEventHandler(async (event): Promise<ApiResponse<SettlementHistoryDetailResponse>> => {
  const payload = await readBody<SettlementHistoryDetailQuery>(event)

   if (!payload.settlement_history_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Settlement ID is required'
      })
    }

    const response = await getSettlementHistoryById(payload);
    // Do NOT call .json() again here!
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as SettlementHistoryDetailResponse
    };
    
})
