import { defineEventHandler, readBody } from 'h3'
import type { ApiResponseList } from '~/models/baseModel'
import type {
  SettlementInquiryRequest,
  SettlementInquiryResponse,
} from '../../model/management_api/settlement'
import { inquirySettlementWallet } from '../../logic/management_api_logic'

export default defineEventHandler(
  async (event): Promise<ApiResponseList<SettlementInquiryResponse>> => {
    const walletInquiryRequest = await readBody<SettlementInquiryRequest>(event)

    const response = await inquirySettlementWallet(walletInquiryRequest)
    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as SettlementInquiryResponse,
    }
  }
)
