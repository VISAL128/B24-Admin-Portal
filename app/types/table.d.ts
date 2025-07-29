/**
 * Types for table configuration management
 */
export interface TableColumnConfig {
  [columnId: string]: boolean
}

export interface TableConfiguration {
  columnVisibility: TableColumnConfig
  pageSize?: number
  sortingState?: Array<{
    id: string
    desc: boolean
  }>
  autoRefresh?: boolean
  statusFilter?: string[]
}

export interface TableConfigStorage {
  [tableId: string]: TableConfiguration
}

export interface TableConfigComposable {
  saveColumnConfig: (tableId: string, columnVisibility: TableColumnConfig) => boolean
  getColumnConfig: (tableId: string) => TableColumnConfig | null
  saveTableConfig: (tableId: string, config: TableConfiguration) => boolean
  getTableConfig: (tableId: string) => TableConfiguration | null
  resetTableConfig: (tableId: string) => boolean
  getAllTableConfigs: () => TableConfigStorage | null
  clearAllTableConfigs: () => boolean
  getIsAutoRefresh: (tableId: string) => boolean | null
  saveAutoRefresh: (tableId: string, isEnabled: boolean) => boolean
  saveSortingState: (tableId: string, sortingState: Array<{ id: string; desc: boolean }>) => boolean
  getSortingState: (tableId: string) => Array<{ id: string; desc: boolean }> | null
  getStatusFilter: (tableId: string) => string[] | null
  saveStatusFilter: (tableId: string, statusFilterValue: string[]) => boolean
}
