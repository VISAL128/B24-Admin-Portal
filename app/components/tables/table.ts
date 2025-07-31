// ~/types/table.ts
import type { TableColumn } from '@nuxt/ui'

export type BaseTableColumn<T> = TableColumn<T> & {
  id: string // ✅ Make `id` required
  enableColumnFilter?: boolean
  filterOptions?: Array<{ label: string; value: string }>
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
