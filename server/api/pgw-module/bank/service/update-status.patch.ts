import type { ApiResponseList } from '~/models/baseModel'
import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'
import { z } from 'zod'

const payloadSchema = z.object({
  sbsId: z.string().uuid().describe('Supplier Bank Service ID'),
  status: z.boolean(),
})

export default defineEventHandler(async (event) => {
  try {
    const result = await readValidatedBody(event, (body) => payloadSchema.safeParse(body))

    if (!result.success) throw result.error.issues

    // Call the PGW Module API
    const endpoint = PGW_MODULE_API_ENDPOINTS.BANK.UPDATE_SBS_STATUS
    const response = await requestToPgwModuleApi<boolean>(event, endpoint, 'POST', {
      id: result.data.sbsId,
      active: result.data.status,
    })

    return {
      code: 'SUCCESS',
      message: '',
      data: response,
    } as ApiResponseList<boolean>
  } catch (error) {
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to update service status',
        data: null,
      },
    })
  }
})
