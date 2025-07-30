import { defineEventHandler, readBody, createError } from 'h3'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requestToPgwModuleApi } from '~~/server/logic/pgw_module_api_logic'
import type {
  WalletTransactionRequest,
  WalletTransaction,
} from '~~/server/model/pgw_module_api/walletTransactions'

// Mock data for development
const generateMockTransactions = (
  page: number,
  pageSize: number,
  walletId: string
): WalletTransaction[] => {
  const transactions: WalletTransaction[] = []
  const startIndex = (page - 1) * pageSize

  for (let i = 0; i < pageSize; i++) {
    const index = startIndex + i
    const date = new Date()
    date.setDate(date.getDate() - index)

    const transactionTypes = ['top_up', 'settlement', 'transfer', 'payment'] as const
    const statuses = ['completed', 'pending', 'failed', 'cancelled'] as const
    const currencies = ['KHR', 'USD'] as const

    const type = transactionTypes[index % transactionTypes.length]
    const status = statuses[index % statuses.length]
    const currency = currencies[index % currencies.length]
    const amount = Math.floor(Math.random() * 1000000) + 10000

    transactions.push({
      id: `txn_${walletId}_${index + 1}`,
      transaction_no: `TXN${String(index + 1).padStart(8, '0')}`,
      wallet_id: walletId,
      transaction_type: type,
      amount: amount,
      currency: currency,
      status: status,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      reference_no: `REF${String(index + 1).padStart(6, '0')}`,
      bank_reference:
        status === 'completed' ? `BNK${String(index + 1).padStart(10, '0')}` : undefined,
      created_date: date.toISOString(),
      completed_date: status === 'completed' ? date.toISOString() : undefined,
      fee_amount: type === 'settlement' ? Math.floor(amount * 0.01) : undefined,
      net_amount: type === 'settlement' ? amount - Math.floor(amount * 0.01) : amount,
      counterparty_name:
        index % 3 === 0 ? ['John Doe', 'Jane Smith', 'Company ABC'][index % 3] : undefined,
      counterparty_account:
        index % 3 === 0 ? `ACC${String(index + 1).padStart(8, '0')}` : undefined,
      channel: ['web', 'mobile', 'api'][index % 3],
      payment_method: ['card', 'bank_transfer', 'wallet'][index % 3],
      merchant_name: type === 'payment' ? `Merchant ${index + 1}` : undefined,
      merchant_id: type === 'payment' ? `MER${String(index + 1).padStart(6, '0')}` : undefined,
    })
  }

  return transactions
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<WalletTransactionRequest>(event)

    // Validate required fields
    if (!body.wallet_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'wallet_id is required',
      })
    }

    // Set default pagination if not provided
    const request = {
      wallet_id: body.wallet_id,
      page: body.page || 1,
      page_size: body.page_size || 20,
      transaction_type: body.transaction_type,
      status: body.status,
      start_date: body.start_date,
      end_date: body.end_date,
      search: body.search,
    }

    // For development, return mock data
    // In production, replace this with the actual API call:
    // const response = await requestToPgwModuleApi(event, '/walletmgnt/get-wallet-transactions', 'POST', request)

    const mockTransactions = generateMockTransactions(
      request.page,
      request.page_size,
      request.wallet_id
    )

    // Apply filters to mock data
    let filteredTransactions = mockTransactions

    if (request.transaction_type) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.transaction_type === request.transaction_type
      )
    }

    if (request.status) {
      filteredTransactions = filteredTransactions.filter((t) => t.status === request.status)
    }

    if (request.search) {
      const searchLower = request.search.toLowerCase()
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.transaction_no.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          (t.reference_no && t.reference_no.toLowerCase().includes(searchLower)) ||
          (t.counterparty_name && t.counterparty_name.toLowerCase().includes(searchLower))
      )
    }

    const hasMore = request.page < 5 // Mock pagination - show 5 pages max

    return {
      code: 'SUCCESS',
      message: 'Transactions retrieved successfully',
      message_kh: 'ការទទួលបានប្រតិបត្តិការដោយជោគជ័យ',
      data: {
        transactions: filteredTransactions,
        total_count: filteredTransactions.length * 5, // Mock total
        page: request.page,
        page_size: request.page_size,
        has_more: hasMore,
      },
    }
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wallet transactions',
    })
  }
})
