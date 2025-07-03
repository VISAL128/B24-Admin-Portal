import { defineEventHandler, readBody } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import { SettlementInquiryRequest, SettlementInquiryResponse } from '../model/management_api/settlement'
import { inquirySettlementWallet } from '../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<SettlementInquiryResponse>> => {
  const walletInquiryRequest = await readBody<SettlementInquiryRequest>(event)

   let response = await inquirySettlementWallet(walletInquiryRequest);
    return {
        code: 'SUCCESS',
        message: 'Success',
        data: response.data as SettlementInquiryResponse
    };
})