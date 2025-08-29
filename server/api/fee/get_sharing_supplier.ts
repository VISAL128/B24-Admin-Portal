/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineEventHandler } from 'h3'
import type { SharingSupplier } from '~/models/settlement'
import type { ApiResponseList } from '~/models/baseModel'
import { RESPONSE_HTTP_CODE } from '~/utils/constants'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
// import { findFeeConfigById } from '../../logic/management_api_logic'

const defaultSuppliers: SharingSupplier[] = [
  { id: 'supplier1', name: 'Supplier One', code: 'SUP1', value: 0 },
  { id: 'supplier2', name: 'Supplier Two', code: 'SUP2', value: 0 },
  { id: 'supplier3', name: 'Supplier Three', code: 'SUP3', value: 0 },
]

export default defineEventHandler(
  async (event): Promise<ApiResponseList<SharingSupplier[] | []>> => {
    try {
      const response = (await requestToPgwModuleApi(
        event,
        `/getallocatesuppliers`,
        'GET'
      )) as ApiResponseList<SharingSupplier[] | []>

      if (!response || response.code !== RESPONSE_HTTP_CODE.SUCCESS) {
        return {
          code: 'ERROR',
          message: response.message,
          data: [],
        }
      }
      return {
        code: 'SUCCESS',
        message: 'Success',
        data: response.data as SharingSupplier[],
      }
    } catch (error) {
      console.error('Error fetching fee config :', error)
      throw createError({
        statusCode: 500,
        statusMessage: (error as Error).message ?? 'Internal Server Error',
      })
    }
  }
)
