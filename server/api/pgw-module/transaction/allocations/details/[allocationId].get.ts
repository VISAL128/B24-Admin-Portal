import { requestToPgwModuleApi } from "~~/server/logic/pgw_module_api_logic"
import { TransactionAllocationDetail } from "~~/server/model/pgw_module_api/transactions/transaction_allocation"


export default defineEventHandler(async (event) => {
  const allocationId = getRouterParam(event, 'allocationId')

  if (!allocationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Allocation ID is required',
    })
  }

  try {
    console.log(`Fetching allocation detail for transaction  allocation ${allocationId}`)
    
    const result = await requestToPgwModuleApi<TransactionAllocationDetail>(
      event,
      `/transaction/allocations/${allocationId}/details`,
      'GET'
    )

    return result
  } catch (error) {
    console.error('Error fetching transaction allocation detail:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transaction allocation detail',
    })
  }
})
