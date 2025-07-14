// ~/types/table.ts
import type { TableColumn } from '@nuxt/ui'

export type BaseTableColumn<T> = TableColumn<T> & {
    id: string // ✅ Make `id` required
  enableColumnFilter?: boolean
  filterOptions?: Array<{ label: string; value: string }>
  accessorKey?: keyof T | string
}
