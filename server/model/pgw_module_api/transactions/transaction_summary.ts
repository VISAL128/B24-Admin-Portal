import { PeriodType } from "~/utils/enumModel"


export interface SummaryParams {
  PeriodType?: PeriodType | number
  FromDate?: string // DD/MM/YYYY
  ToDate?: string   // DD/MM/YYYY
}

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
