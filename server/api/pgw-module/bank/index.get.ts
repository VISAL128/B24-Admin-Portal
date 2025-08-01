import { requestToPgwModuleApi } from '../../../logic/pgw_module_api_logic'

// Define bank interface for type safety
interface BankData {
  id?: string
  bank_name?: string
  name?: string
  bankName?: string
  currency?: string
  currency_code?: string
  currencyCode?: string
  is_settlement_bank?: boolean
  isSettlementBank?: boolean
  is_collection_bank?: boolean
  isCollectionBank?: boolean
  logo?: string
  activated_date?: string
  [key: string]: unknown
}

interface ApiResponse {
  data?: BankData[]
  [key: string]: unknown
}

export default defineEventHandler(async (event) => {
  try {
    // Extract query parameters
    const query = getQuery(event)
    const {
      search = '',
      _page = 1,
      _page_size = 25,
      is_settlement_bank,
      is_collection_bank,
      currency,
      service_id,
    } = query

    // Validate required parameters
    if (!service_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Service ID is required',
        data: {
          code: 'VALIDATION_ERROR',
          message: 'service_id parameter is required',
          data: null,
        },
      })
    }

    // Call the PGW Module API
    const endpoint = `/get-current-bank-by-service-id/${service_id}`
    const response = await requestToPgwModuleApi(event, endpoint, 'GET')

    // Transform the response to match expected format
    let banks: BankData[] = []
    if (response && typeof response === 'object' && 'data' in response) {
      const responseData = response as ApiResponse
      banks = responseData.data || []
    } else if (Array.isArray(response)) {
      banks = response as BankData[]
    }

    // Apply client-side filters if needed
    const filteredBanks = banks.filter((bank: BankData) => {
      let matches = true

      // Search filter
      if (search) {
        const searchTerm = search.toString().toLowerCase()
        matches = !!(bank.bank_name?.toLowerCase().includes(searchTerm) || 
                 bank.name?.toLowerCase().includes(searchTerm) ||
                 bank.bankName?.toLowerCase().includes(searchTerm))
      }

      // Settlement bank filter
      if (is_settlement_bank !== undefined) {
        const isSettlement = bank.is_settlement_bank || bank.isSettlementBank || false
        matches = matches && isSettlement === (is_settlement_bank === 'true')
      }

      // Collection bank filter
      if (is_collection_bank !== undefined) {
        const isCollection = bank.is_collection_bank || bank.isCollectionBank || false
        matches = matches && isCollection === (is_collection_bank === 'true')
      }

      // Currency filter
      if (currency) {
        const bankCurrency = bank.currency || bank.currency_code || bank.currencyCode
        matches = matches && bankCurrency === currency
      }

      return matches
    })

    // Apply pagination
    const pageNum = parseInt(String(_page)) || 1
    const pageSizeNum = parseInt(String(_page_size)) || 25
    const startIndex = (pageNum - 1) * pageSizeNum
    const endIndex = startIndex + pageSizeNum
    const paginatedBanks = filteredBanks.slice(startIndex, endIndex)

    const totalRecords = filteredBanks.length
    const totalPages = Math.ceil(totalRecords / pageSizeNum)

    return {
      code: 'SUCCESS',
      message: 'Banks retrieved successfully',
      data: {
        records: paginatedBanks,
        total_record: totalRecords,
        total_page: totalPages,
        current_page: pageNum,
        page_size: pageSizeNum,
      },
    }
  } catch (error) {
    console.error('Error in banks API:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'ERROR',
        message: 'Failed to retrieve banks',
        data: null,
      },
    })
  }
})
