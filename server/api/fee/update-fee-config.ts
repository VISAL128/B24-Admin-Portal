import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type { FeeConfig } from '~/models/feeConfiguration'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeConfig[] | null>> => {
  const payload = await readBody<FeeModel>(event)
  console.log('Update Supplier Fee Config API:', payload);
  try {
    const response = (await requestToPgwModuleApi(
      event,
      '/updatefeeconfig',
      'POST',
      payload
    )) as ApiResponse<FeeConfig[]>

    if (!response || !response.data) {
      return {
        code: 'ERROR',
        message: 'Failed to create fee config',
        data: null,
      }
    }

    if (response.code !== 'SUCCESS') {
      return {
        code: response.code,
        message: response.message || 'Failed to create fee config',
        data: null,
      }
    }

    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data as FeeConfig[],
    }
  } catch (error) {
    console.error('Error fetching wallet types:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wallet types',
    })
  }
})
