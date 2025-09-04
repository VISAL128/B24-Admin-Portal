/**
 * Types for table configuration management
 */
export interface TableColumnConfig {
  [columnId: string]: boolean
}

export interface TableConfiguration {
  columnVisibility: TableColumnConfig
  columnOrder?: string[]
  columnFilters?: Record<string, string>
  pageSize?: number
  sortingState?: Array<{
    id: string
    desc: boolean
  }>
  autoRefresh?: boolean
  statusFilter?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface TableConfigStorage {
  [tableId: string]: TableConfiguration
}

export interface TableConfigComposable {
  saveColumnConfig: (tableId: string, columnVisibility: TableColumnConfig) => boolean
  getColumnConfig: (tableId: string) => TableColumnConfig | null
  saveColumnOrder: (tableId: string, columnOrder: string[]) => boolean
  getColumnOrder: (tableId: string) => string[] | null
  saveColumnFilters: (tableId: string, columnFilters: Record<string, string>) => boolean
  getColumnFilters: (tableId: string) => Record<string, string> | null
  saveTableConfig: (tableId: string, config: TableConfiguration) => boolean
  getTableConfig: (tableId: string) => TableConfiguration | null
  resetTableConfig: (tableId: string) => boolean
  getAllTableConfigs: () => TableConfigStorage | null
  clearAllTableConfigs: () => boolean
  getIsAutoRefresh: (tableId: string) => boolean | null
  saveAutoRefresh: (tableId: string, isEnabled: boolean) => boolean
  saveSortingState: (tableId: string, sortingState: Array<{ id: string; desc: boolean }>) => boolean
  getSortingState: (tableId: string) => Array<{ id: string; desc: boolean }> | null
  saveStatusFilter: (tableId: string, statusFilterValue: string[]) => boolean
  getStatusFilter: (tableId: string) => string[] | null
  saveDateRange: (tableId: string, dateRange: { start: string; end: string }) => boolean
  getDateRange: (tableId: string) => { start: string; end: string } | null
}
