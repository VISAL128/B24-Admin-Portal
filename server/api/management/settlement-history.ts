import { defineEventHandler, readBody } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import type { SettlementHistoryQuery, SettlementHistoryResponse } from '~/models/settlement'
import { getSettlementHistory } from '../../logic/management_api_logic'

export default defineEventHandler(
  async (event): Promise<ApiResponse<SettlementHistoryResponse>> => {
    const payload = await readBody<SettlementHistoryQuery>(event)

    const response = await getSettlementHistory(payload, event)
    const data: SettlementHistoryResponse = {
      total_page: response.total_pages || 1,
      page: response.page || 1,
      total_record: response.total_records || 0,
      sum_total_amount_khr: response.sum_total_amount_khr || 0,
      sum_total_amount_usd: response.sum_total_amount_usd || 0,
      sum_total_settled: response.sum_total_settled || 0,
      sum_success: response.sum_success || 0,
      sum_failed: response.sum_failed || 0,
      records: (response.data as unknown as SettlementHistoryResponse['records']) || [],
    }
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: data,
    }
  }
)
