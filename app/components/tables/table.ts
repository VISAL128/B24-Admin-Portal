// ~/types/table.ts
import type { TableColumn } from '@nuxt/ui'
import type { Bank } from '~/models/bank'
import type { SettlementHistoryRecord } from '~/models/settlement'

export type BaseTableColumn<T> = TableColumn<T> & {
  id: string // ✅ Make `id` required
  enableColumnFilter?: boolean
  filterOptions?: Array<{ label: string; value: string | number }>
  accessorKey?: keyof T | string
  // Optional properties for advanced filtering
  filterType?: 'select' | 'status'
  filterValues?: string[] // For select and status filters
  /**
   * Type of the column for rendering and filtering
   * This should match the ColumnType enum defined in app/utils/enumModel.ts
   * @see ColumnType
   * @default ColumnType.Text
   * Note: rendering should be working when cell is undefined
   * and type is set to ColumnType.DateTime   */
  type?: ColumnType
}

export type TableFetchResult<TData> = {
  data: TData
  total_record: number
  total_page: number
  [key: string]: unknown // For extensibility: allows additional properties such as pagination metadata or custom response fields
}

export interface SettlementHistoryTableFetchResult extends TableFetchResult<SettlementHistoryRecord[]> {
  sum_total_amount_khr?: number
  sum_total_amount_usd?: number
  sum_total_settled?: number
  sum_success?: number
  sum_failed?: number
}

export type BankListTableFetchResult = TableFetchResult<Bank[]>