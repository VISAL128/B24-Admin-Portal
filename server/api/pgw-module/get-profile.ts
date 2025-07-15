import type { PgwModuleResponse } from '~/models/baseModel'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type { PgwModuleProfile } from '~~/server/model/pgw_module_api/profile'

export default defineEventHandler(
  async (_event): Promise<PgwModuleResponse<PgwModuleProfile | null>> => {
    // return {
    //   code: '404',
    //   message: 'ERROR',
    //   message_kh: 'កំហុស',
    //   data: null,
    // }
    // return {
    //   code: '000',
    //   message: 'SUCCESS',
    //   message_kh: 'ជោគជ័យ',
    //   data: {
    //     id: 'be9f68fb-9f80-4873-8761-4624e557fab3',
    //     name: 'One Go EV charger',
    //     code: '3804',
    //   },
    // }
    const response = await requestToPgwModuleApi(_event, '/current', 'GET')
    if (!response || response.code !== '000') {
      if (response.code === '001') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Business profile not yet activated!',
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch profile from PGW Module API',
      })
    }
    return response.data as PgwModuleResponse<PgwModuleProfile>
  }
)
