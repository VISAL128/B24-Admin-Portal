import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
// import { submitSettlement } from '../../logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeModel[] | null>> => {
  const payload = await readBody<FeeModel>(event)

  //   const response = await submitSettlement(payload)
  //   if (!response || !response.data) {
  //     return {
  //       code: 'ERROR',
  //       message: 'Failed to submit settlement',
  //       data: null,
  //     }
  //   }

  //   return {
  //     code: 'SUCCESS',
  //     message: 'Success',
  //     data: response.data as FeeModel[],
  //   }
  const data = [
    {
      id: 'fee_12345',
      code: 'FEE001',
      name: 'Transaction Fee',
      currency: 'USD',
      fee_type: 'percentage',
      supplier_id: 'sup_789',
      fee_details: [
        {
          start_amount: 0,
          end_amount: 1000,
          fee_amount: 10.5,
          fee_rate: 0.015,
        },
        {
          start_amount: 1001,
          end_amount: 5000,
          fee_amount: 20.0,
          fee_rate: 0.012,
        },
      ],
      allocate_details: [
        {
          editable: true,
          party_id: 'party_001',
          party_name: 'Merchant A',
          logo: 'https://example.com/logos/merchant_a.png',
          party_type: 1,
          value: 7.5,
        },
        {
          editable: false,
          party_id: 'party_002',
          party_name: 'Processor B',
          party_type: 2,
          value: 3.0,
        },
      ],
      allocation_rule_id: 'rule_101',
    },
    {
      id: 'fee_67890',
      code: 'FEE002',
      name: 'Service Fee',
      currency: 'KHR',
      fee_type: 'fixed',
      supplier_id: 'sup_456',
      fee_details: [
        {
          start_amount: 0,
          end_amount: 4000000,
          fee_amount: 20000,
          fee_rate: 0.01,
        },
      ],
      allocate_details: [
        {
          editable: true,
          party_id: 'party_003',
          party_name: 'Vendor C',
          party_type: 3,
          value: 15000,
        },
      ],
      allocation_rule_id: 'rule_102',
    },
  ]

  return {
    code: 'SUCCESS',
    message: 'Success',
    data: data as FeeModel[],
  }
})
