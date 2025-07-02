import { defineEventHandler, getRouterParam } from 'h3'
import type { ApiResponse } from '~/models/baseModel'
import { SettlementHistoryDetail, SettlementHistoryRecord } from '~/models/settlement'
import { getSettlementHistoryById } from '~~/server/logic/management_api_logic'

export default defineEventHandler(async (event): Promise<ApiResponse<SettlementHistoryRecord>> => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Settlement ID is required'
    })
  }

//   try {
//     const response = await getSettlementHistoryById(id);
//     // Do NOT call .json() again here!
//     return {
//       code: 'SUCCESS',
//       message: 'Success',
//       data: response.data as SettlementHistoryRecord
//     };
//   } catch (error: any) {
//     console.error('Error fetching settlement history detail:', error)

//     return {
//       code: '999',
//       message: 'Failed to fetch settlement history detail',
//       data: null as any
//     }
//   }

   const mockSettlementDetail: SettlementHistoryRecord = {
      settlement_id: id,
      settlement_date: "2025-01-01 10:04:09",
      total_supplier: 5,
      total_amount: "21000",
      currency: "USD",
      supplier_id: "945u44hv883gh443",
      settled_by: "admin",
      total_Settled: 12,
      success: 10,
      fail: 2,
      settle_details: {
        party_id: "e4b96b38-5ccf-4365-b3ce-67b9dacf1d06",
        supplier_id: "",
        supplier: {
          id: "54b96b38-5ccf-4365-b3ce-67b9dacf1d06",
          code: "8203",
          name: "hong channy",
          phone: 88930499,
          email: "channyheng232@gmail.com",
          address: ""
        },
        cpo: {
          id: "e4b96b38-5ccf-4365-b3ce-67b9dacf1d06",
          code: "7929",
          name: "chang dara",
          phone: 88930499,
          email: "changdarra232@gmail.com",
          address: ""
        },
        settle_amount: 1200,
        settlement_bank_id: "AC",
        settlement_bank_name: "ACLEDA BANK",
        status: "success"
      }
    }

    // TODO: Replace with actual API call to management API
    // const response = await getSettlementHistoryById(id);
    
    var response: ApiResponse<SettlementHistoryRecord> = {
      code: 'SUCCESS',
      message: 'Success',
      data: mockSettlementDetail
    }

    return response;

})
