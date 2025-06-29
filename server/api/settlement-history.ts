import { SettlementHistoryQuery, SettlementHistoryResponse, SettlementHistoryRecord } from '~/models/settlement'
import { ApiResponse } from '~/models/baseModel'
import { parseISO, isAfter, isBefore } from 'date-fns'

export default defineEventHandler(async (event): Promise<ApiResponse<SettlementHistoryResponse>> => {
  const body = await readBody<SettlementHistoryQuery>(event)

  // Example mock data
  const mockRecords: SettlementHistoryRecord[] = [
    {
      settlementId: 'SETTLE-001',
      settlementDate: '2025-06-25T10:00:00Z',
      totalSupplier: 2,
      totalAmount: 7000,
      settledBy: 'admin',
      status: 'paid'
    },
    {
      settlementId: 'SETTLE-002',
      settlementDate: '2025-06-28T15:30:00Z',
      totalSupplier: 5,
      totalAmount: 5500,
      settledBy: 'john',
      status: 'refunded'
    },
    {
      settlementId: 'SETTLE-003',
      settlementDate: '2025-07-01T12:00:00Z',
      totalSupplier: 3,
      totalAmount: 3000,
      settledBy: 'sokleng',
      status: 'failed'
    }
  ]

  const { startDate, endDate, status, page = 1, limit = 10 } = body
  const searchName = (body as any).name?.toLowerCase() // support extra `name` filter

  let filtered = mockRecords

  // Filter by status
  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }

  // Filter by date range
  if (startDate) {
    filtered = filtered.filter(r => isAfter(parseISO(r.settlementDate), parseISO(startDate)))
  }
  if (endDate) {
    filtered = filtered.filter(r => isBefore(parseISO(r.settlementDate), parseISO(endDate)))
  }

  // Filter by settledBy name
  if (searchName) {
    filtered = filtered.filter(r => r.settledBy.toLowerCase().includes(searchName))
  }

  // Pagination
  const start = (page - 1) * limit
  const end = start + limit
  const paginated = filtered.slice(start, end)

  return {
    code: 'SUCCESS',
    message: 'Fetched successfully',
    data: {
      page,
      limit,
      total: filtered.length,
      records: paginated
    }
  }
})
