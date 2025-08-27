import type { BankAccount } from '~/models/bank'
import type { ApiResponseList, PgwModuleResponse } from '~/models/baseModel'
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
// import { PGW_MODULE_API_ENDPOINTS } from '~~/server/utils/pgw-module-api-endpoints'
// import { requestToPgwModuleApi } from '../../../../logic/pgw_module_api_logic'
// import type { PgwModuleResponse } from '~/models/baseModel'

export default defineEventHandler(async (event): Promise<ApiResponseList<BankAccount[]>> => {
  try {
    const sbsId = getRouterParam(event, 'sbs_id')

    if (!sbsId) {
      return {
        code: 'ERROR',
        message: 'Supplier bank service ID is required',
        data: [],
      }
    }

    // TODO: Uncomment when PGW Module API is ready
    const response = await requestToPgwModuleApi<PgwModuleResponse<BankAccount[]>>(
      event,
      PGW_MODULE_API_ENDPOINTS.BANK.ACCOUNTS_BY_SBS_ID.replace('{sbs_id}', sbsId),
      'GET'
    )
    const accounts = response.data || []

    // Mock data for development - replace with actual API call
    // const accounts: BankAccount[] = [
    //   {
    //     id: 'acc-001',
    //     bank_id: 'bank-001',
    //     code: 'ACC001',
    //     name: 'Primary Business Account',
    //     title: 'Main Settlement Account',
    //     account_type_id: 'settlement',
    //     status: 'active',
    //     currency_id: 'USD',
    //     is_default: true,
    //     created_date: '2024-01-15T10:30:00.000Z',
    //     updated_date: '2024-08-01T14:20:00.000Z',
    //   },
    //   {
    //     id: 'acc-002',
    //     bank_id: 'bank-001',
    //     code: 'ACC002',
    //     name: 'Secondary Account',
    //     title: 'Collection Account',
    //     account_type_id: 'collection',
    //     status: 'active',
    //     currency_id: 'KHR',
    //     is_default: false,
    //     created_date: '2024-02-01T09:15:00.000Z',
    //     updated_date: '2024-07-15T16:45:00.000Z',
    //   },
    // ]

    return {
      code: 'SUCCESS',
      message: 'Bank accounts retrieved successfully',
      data: accounts,
    }
  } catch (error) {
    console.error('Error in bank accounts API:', error)

    return {
      code: 'ERROR',
      message: 'Failed to retrieve bank accounts',
      data: [],
    }
  }
})
