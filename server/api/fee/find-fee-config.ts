import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { RESPONSE_HTTP_CODE } from '~/utils/constants'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
// import { findFeeConfigById } from '../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeModel | null>> => {
  const payload = await readBody<any>(event)
  try {
    const response = (await requestToPgwModuleApi(
      event,
      `/get_fee_config_by_id/${payload.id}`,
      'POST'
    )) as ApiResponse<FeeModel | null>

    if (!response || response.code !== RESPONSE_HTTP_CODE.SUCCESS) {
      return {
        code: 'ERROR',

           
        message: response.message,
        data: null,
      }
    }

    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as FeeModel,
    }
  } catch (error) {
    console.error('Error fetching fee config :', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }

  //   const data = {
  //     id: 'fee_12345',
  //     code: 'FEE001',
  //     name: 'Transaction Fee',
  //     currency: 'USD',
  //     fee_type: 'transaction_fee',
  //     supplier_id: 'sup_789',
  //     fee_details: [
  //       {
  //         start_amount: 0,
  //         end_amount: 1000,
  //         fee_amount: 10.5,
  //         fee_rate: 0,
  //       },
  //       {
  //         start_amount: 1001,
  //         end_amount: 5000,
  //         fee_amount: 0,
  //         fee_rate: 0.012,
  //       },
  //     ],
  //     allocate_details: [
  //       {
  //         editable: true,
  //         party_id: 'party_001',
  //         party_name: 'Merchant A',
  //         logo: 'https://example.com/logos/merchant_a.png',
  //         party_type: 1,
  //         value: 7.5,
  //       },
  //       {
  //         editable: false,
  //         party_id: 'party_002',
  //         party_name: 'Processor B',
  //         party_type: 2,
  //         value: 3.0,
  //       },
  //     ],
  //     allocation_rule_id: 'rule_101',
  //   }

  // return {
  //     code: 'SUCCESS',
  //     message: 'Success',
  //     data: data as FeeModel,
  //   }
})
