import { defineEventHandler, readBody } from 'h3'
import type { ApiResponseList } from '~/models/baseModel'
import type {
  SettlementHistoryDetailQuery,
  SettlementHistoryDetailResponse,
  SettlementHistoryMainDetails,
} from '~/models/settlement'
import { getSettlementHistoryById } from '../../logic/management_api_logic'

export default defineEventHandler(
  async (event): Promise<ApiResponseList<SettlementHistoryDetailResponse>> => {
    const payload = await readBody<SettlementHistoryDetailQuery>(event)

    if (!payload.settlement_history_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Settlement ID is required',
      })
    }

    const response = await getSettlementHistoryById(payload)
    // Mapping the response to the expected format
    const settlementHistoryDettailResponse: SettlementHistoryDetailResponse = {
      total_page: response.total_pages || 1,
      page: response.page || 1,
      total_record: response.total_records || 0,
      records: response.data as unknown as SettlementHistoryMainDetails,
    }
    return {
      code: response.code === 200 ? 'SUCCESS' : response.code,
      message: response.message || 'Settlement history details fetched successfully',
      message_kh: response.message_kh || 'ការទាញយកព័ត៌មានលម្អិតប្រវត្តិការទូទាត់បានជោគជ័យ',
      data: settlementHistoryDettailResponse,
    }
  }
)
