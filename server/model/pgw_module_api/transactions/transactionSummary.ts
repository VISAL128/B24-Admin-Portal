export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface SummaryValue {
  value: number
  currency?: string
}

export interface SummaryCard {
  title: string
  values: SummaryValue[]
  filterLabel: string
  dateRange: string
  periodType: PeriodType
}

export interface Period {
  type: PeriodType
  label: string
  dateFrom: string
  dateTo: string
}

export interface TransactionSummaryModel {
  period: Period
  summarys: SummaryCard[]
}
