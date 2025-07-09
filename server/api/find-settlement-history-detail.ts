import { defineEventHandler, getRouterParam } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import { SettlementHistoryDetailQuery, SettlementHistoryRecord, SettlementHistoryDetailResponse } from '~/models/settlement'
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
    // Mapping the response to the expected format
    const settlementHistoryDettailResponse: SettlementHistoryDetailResponse = {
      total_page: response.total_page,
      page: response.page,
      total_record: response.total_record,
      records: response.data as SettlementHistoryRecord
    };
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: settlementHistoryDettailResponse
    };
    
})
