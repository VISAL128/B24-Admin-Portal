/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineEventHandler, readBody } from 'h3'
import type { FeeConfig } from '~/models/feeConfiguration'
import type { ApiResponse } from '~/models/baseModel'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import { RESPONSE_HTTP_CODE } from '~/utils/constants'

// Mockup data for fee configuration
// const mockFeeConfigs: FeeConfig[] = [
//   {
//     currency: 'KHR',
//     transactionFee: {
//       rows: [
//         {
//           startAmount: 0,
//           endAmount: 4000000,
//           feeAmount: 10,
//           feeType: "percentage",
//           unlimited: false,
//            suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//         },
//         {
//           startAmount: 4004000,
//           endAmount: 40000000,
//           feeAmount: 5,
//           feeType: "percentage",
//           unlimited: false,
//            suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//         },
//         {
//           startAmount: 40004000,
//           endAmount: null,
//           feeAmount: 2,
//           feeType: "percentage",
//           unlimited: true,
//            suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//         }
//       ]
//     },
//     distributionFee: {
//       suppliers: [
//         {
//           id: "supplier-a",
//           name: "EV-Hong Vanndy (You)",
//           visible: true
//         },
//         {
//           id: "supplier-b",
//           name: "Bill24",
//           visible: true
//         },
//         {
//           id: "three",
//           name: "Supplier-Test",
//           visible: true
//         }
//       ]
//     }
//   },
//   {
//       currency: 'USD',
//       transactionFee: {
//         rows: [
//           {
//             startAmount: 0,
//             endAmount: 500,
//             feeAmount: 12,
//             feeType: "percentage",
//             unlimited: false,
//             suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//           },
//           {
//             startAmount: 501,
//             endAmount: 5000,
//             feeAmount: 7,
//             feeType: "percentage",
//             unlimited: false,
//             suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//           },
//           {
//             startAmount: 5001,
//             endAmount: null,
//             feeAmount: 3,
//             feeType: "percentage",
//             unlimited: true,
//             suppliers: [
//               {
//                 id: "supplier1",
//                 value: "100",
//               },
//               {
//                 id: "supplier2",
//                 value: "100",
//               }
//             ]
//           }
//         ]
//       },
//       distributionFee: {
//         suppliers: [
//           {
//             id: "supplier-x",
//             name: "Global Payments",
//             visible: true
//           },
//           {
//             id: "supplier-y",
//             name: "PayFast",
//             visible: true
//           }
//         ]
//       }
//     }
// ];

// Default fee configurations
// const defaultFeeConfigs: FeeConfig[] = [
//   {
//       currency:'USD',
//       transactionFee: [],
//       distributionFee: []
//     },
//     {
//       currency:'KHR',
//       transactionFee: [],
//       distributionFee: []
//     }
// ];

export default defineEventHandler(async (event): Promise<ApiResponse<FeeConfig[] | null>> => {
  const payload = await readBody<FeeConfig>(event)
  try {
    const response = (await requestToPgwModuleApi(
      event,
      '/getfeeconfig',
      'GET'
    )) as ApiResponse<FeeConfig[]>

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
      data: response.data as FeeConfig[],
    }
  } catch (error) {
    console.error('Error fetching fee config :', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message ?? 'Internal Server Error',
    })
  }
})


