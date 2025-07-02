import { defineEventHandler, readBody } from 'h3'
import type { BalanceQueryRequest, ConfirmSettlementRequest, ConfirmSettlementResponse } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { SettlementInquiryRequest, SettlementInquiryResponse } from '../model/management_api/settlement'
import { inquirySettlementWallet, submitSettlement } from '../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<ConfirmSettlementResponse>> => {
  const payload = await readBody<ConfirmSettlementRequest>(event)

   let response = await submitSettlement(payload);
    return {
        code: 'SUCCESS',
        message: 'Success',
        data: response.data as ConfirmSettlementResponse
    };
})