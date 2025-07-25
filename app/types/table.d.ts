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
}
