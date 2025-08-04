import type { SettlementHistoryStatus } from "#imports"

export interface QueryParam {
    page?: number
    pageSize?: number
    search?: string
    startDate?: string
    endDate?: string
}

export interface QueryParamSettlementHistory extends QueryParam {
    status?: SettlementHistoryStatus
}

export type QueryParamBank = QueryParam