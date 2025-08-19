import { defineEventHandler, readBody } from 'h3'
import type { FeeModel } from '~/models/settlement'
import type { ApiResponse } from '~/models/baseModel'
import type { FeeConfig } from '~/models/feeConfiguration'

export default defineEventHandler(async (event): Promise<ApiResponse<FeeConfig[] | null>> => {
  const payload = await readBody<FeeModel>(event)
  console.log('Update Supplier Fee Config API:', payload)
  console.log('Update Supplier Fee Config API Payload:', JSON.stringify(payload, null, 2))

  try {
    const apiUrl = useRuntimeConfig(event).pgwModuleApiUrl // 🔹 update with your service URL

    const response = await $fetch<ApiResponse<FeeConfig[]>>('/updatefeeconfig', {
      baseURL: apiUrl,
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${event.context.auth?.token || ''}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response || !response.data) {
      return {
        code: 'ERROR',
        message: 'Failed to create fee config',
        data: null,
      }
    }

    if (response.code !== '000') {
      return {
        code: response.code,
        message: response.message || 'Failed to create fee config',
        data: null,
      }
    }

    return {
      code: 'SUCCESS',
      message: 'Success',
      data: response.data,
    }
  } catch (error) {
    console.error('Error updating fee config:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update fee config',
    })
  }
})
