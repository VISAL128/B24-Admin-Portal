import { defineEventHandler } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import type { SettlementHistoryDetailQuery, SettlementHistoryDetailResponse } from '~/models/settlement'
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
      records: response.data
    };
    return {
      code: response.code === 200 ? 'SUCCESS' : response.code,
      message: response.message || 'Settlement history details fetched successfully',
      message_kh: response.message_kh || 'ការទាញយកព័ត៌មានលម្អិតប្រវត្តិការទូទាត់បានជោគជ័យ',
      data: settlementHistoryDettailResponse
    };
    
})
