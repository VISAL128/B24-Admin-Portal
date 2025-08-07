import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'
import type { Bank } from '~/models/bank'
import type { ApiResponse, PgwModuleResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponse<Bank | null>> => {
  try {
    // Call the PGW Module API
    // const response = await requestToPgwModuleApi<PgwModuleResponse<Bank>>(event, PGW_MODULE_API_ENDPOINTS.BANK.DETAILS.replace('{id}', event.context.params?.id || ''), 'GET')
    // const bank = response.data || null

    // Mock data
    const bank: Bank = {
      "id": "68c4db96-0fa2-45de-8141-5b63f0ff6799",
      "name": "ACLEDA",
      "name_kh": "អេស៊ីលីដា",
      "logo": "https://b24-upload.s3.ap-southeast-1.amazonaws.com/banklogo2024/AC.png",
      "active": 1,
      "activated_date": "2025-07-01T22:33:41.707859",
      "is_settlement_bank": true,
      "is_collection_bank": false
    }

    return {
      code: 'SUCCESS',
      message: 'Bank retrieved successfully',
      data: bank,
    }
  } catch (error) {
    console.error('Error in bank API:', error)

    return {
      code: 'ERROR',
      message: 'Failed to retrieve bank',
      data: null,
    }
  }
})