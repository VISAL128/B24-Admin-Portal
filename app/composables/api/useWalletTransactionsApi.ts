import { z } from 'zod'
import { useApiExecutor } from '~/composables/api/useApiExecutor'
import type { WalletApiResponse } from '~/models/wallet'

// Define validation schemas for the inputs
const WalletTransactionParamsSchema = z.object({
  walletType: z.enum(['settlement_wallet', 'top_up_wallet']),
  currency: z.enum(['KHR', 'USD']),
  fromDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in DD/MM/YYYY format'),
  toDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in DD/MM/YYYY format'),
  pageIndex: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).optional(),
  search: z.string().optional(),
  supplierId: z.string().uuid().optional(),
})

// Define the type for the function parameters from the schema
export type WalletTransactionParams = z.infer<typeof WalletTransactionParamsSchema>

export function useWalletTransactionsApi() {
  const { executeV2 } = useApiExecutor()

  /**
   * Retrieves wallet transactions based on the specified wallet type and currency.
   *
   * @param params - The parameters for fetching transactions.
   * @returns The API response data.
   */
  async function getWalletTransactions(params: WalletTransactionParams) {
    // 1. Validate inputs
    const validationResult = WalletTransactionParamsSchema.safeParse(params)
    if (!validationResult.success) {
      // Create a user-friendly error message from validation issues
      const errorMessages = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Invalid input: ${errorMessages}`)
    }

    const {
      walletType,
      currency,
      fromDate,
      toDate,
      pageIndex,
      search,
      supplierId,
    } = validationResult.data

    // Special validation for supplierId
    if (walletType === 'top_up_wallet' && !supplierId) {
      throw new Error('supplierId is required for top_up_wallet')
    }

    // 2. Construct the API URL and PageSize
    const baseUrl = walletType === 'settlement_wallet'
      ? '/api/pgw-module/walletmgnt/settlement/transactions'
      : '/api/pgw-module/walletmgnt/top-up/transactions'
    
    const pageSize = params.pageSize ?? (walletType === 'settlement_wallet' ? 25 : 10)

    // 3. Build the Filter parameter
    const filters = []

    // Search filter
    filters.push({
      field: 'search',
      operator: 'contains',
      value: walletType === 'settlement_wallet' ? search || '' : '',
      manualFilter: false,
    })

    // Date filters
    filters.push({ field: 'fromDate', operator: 'gte', value: fromDate, manualFilter: false })
    filters.push({ field: 'toDate', operator: 'lte', value: toDate, manualFilter: false })

    // Currency filter
    filters.push({ field: 'currencyId', operator: 'eq', value: currency, manualFilter: false })

    // Supplier ID filter for top-up wallet
    if (walletType === 'top_up_wallet' && supplierId) {
      filters.push({ field: 'supplierId', operator: 'eq', value: supplierId, manualFilter: false })
    }

    // 4. Construct query parameters
    const queryParams = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      pageCount: '0', // As per spec
      rowCount: '0', // As per spec
      sorts: 'tranDate-', // As per spec
    })

    // Add all statuses
    const statuses = ['success', 'pending', 'canceled', 'failed', 'expire', 'reversed']
    statuses.forEach(status => queryParams.append('statuses', status))

    // Add the JSON filter string
    queryParams.append('Filter', JSON.stringify(filters))

    // 5. Execute the API call
    try {
      const response = await executeV2<WalletApiResponse>(() =>
        $fetch(`${baseUrl}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'accept': 'text/plain',
          },
        })
      )
      return response
    } catch (error) {
      console.error('API call failed:', error)
      // Handle errors gracefully
      throw new Error('Failed to retrieve wallet transactions.')
    }
  }

  return {
    getWalletTransactions,
  }
}
