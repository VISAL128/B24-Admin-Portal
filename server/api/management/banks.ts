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
    } = query

    // Mock bank data - in real implementation, this would come from a database
    const mockBanks = [
      {
        id: '1',
        bank_name: 'ABA Bank',
        currency: 'USD',
        is_settlement_bank: true,
        is_collection_bank: true,
        logo: '/images/banks/aba-logo.png',
        activated_date: '2025-07-30T09:20:43.7853'
      },
      {
        id: '2',
        bank_name: 'Acleda Bank',
        currency: 'KHR',
        is_settlement_bank: true,
        is_collection_bank: false,
        logo: '/images/banks/acleda-logo.png',
        activated_date: '2024-01-10T09:00:00Z'
      },
      {
        id: '3',
        bank_name: 'Canadia Bank',
        currency: 'USD',
        is_settlement_bank: false,
        is_collection_bank: true,
        logo: '/images/banks/canadia-logo.png',
        activated_date: '2024-01-14T15:30:00Z',
      },
      {
        id: '4',
        bank_name: 'Phnom Penh Commercial Bank',
        currency: 'KHR',
        is_settlement_bank: true,
        is_collection_bank: true,
        logo: '/images/banks/ppcb-logo.png',
        activated_date: '2024-01-14T15:30:00Z',
      },
      {
        id: '5',
        bank_name: 'Foreign Trade Bank of Cambodia',
        currency: 'USD',
        is_settlement_bank: false,
        is_collection_bank: false,
        logo: '/images/banks/ftb-logo.png',
        activated_date: '2024-01-14T15:30:00Z',
      },
    ]

    // Apply filters
    const filteredBanks = mockBanks.filter((bank) => {
      let matches = true

      // Search filter
      if (search) {
        const searchTerm = search.toString().toLowerCase()
        matches = (bank.bank_name.toLowerCase().includes(searchTerm)) as boolean
      }

      // Settlement bank filter
      if (is_settlement_bank !== undefined) {
        matches = matches && bank.is_settlement_bank === (is_settlement_bank === 'true')
      }

      // Collection bank filter
      if (is_collection_bank !== undefined) {
        matches = matches && bank.is_collection_bank === (is_collection_bank === 'true')
      }

      // Currency filter
      if (currency) {
        matches = matches && bank.currency === currency
      }

      return matches
    })

    // Apply pagination
    const pageNum = 1
    const pageSizeNum = 10
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
    return createError({
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
