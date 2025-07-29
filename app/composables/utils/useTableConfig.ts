import type {
  TableColumnConfig,
  TableConfiguration,
  TableConfigStorage,
  TableConfigComposable,
} from '~/types/table'
import { LOCAL_STORAGE_KEYS } from '~/utils/constants'

/**
 * Composable for managing table configuration (column visibility, page size, sorting, etc.)
 * with localStorage persistence
 */
export const useTableConfig = (): TableConfigComposable => {
  const storage = useStorage<TableConfigStorage>()

  /**
   * Get the base storage key for table configurations
   */
  const getStorageKey = () => LOCAL_STORAGE_KEYS.TABLE_COLUMN_CONFIG

  /**
   * Get all table configurations from localStorage
   */
  const getAllConfigs = (): TableConfigStorage => {
    return storage.getItem(getStorageKey()) || {}
  }

  /**
   * Save column visibility configuration for a specific table
   * @param tableId - Unique identifier for the table (e.g., 'settlement-history', 'transaction-list')
   * @param columnVisibility - Object mapping column IDs to visibility boolean
   */
  const saveColumnConfig = (tableId: string, columnVisibility: TableColumnConfig): boolean => {
    try {
      const allConfigs = getAllConfigs()

      if (!allConfigs[tableId]) {
        allConfigs[tableId] = { columnVisibility }
      } else {
        allConfigs[tableId].columnVisibility = columnVisibility
      }

      const success = storage.setItem(getStorageKey(), allConfigs)

      return success
    } catch (error) {
      console.error(`❌ Failed to save column config for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Get column visibility configuration for a specific table
   * @param tableId - Unique identifier for the table
   */
  const getColumnConfig = (tableId: string): TableColumnConfig | null => {
    try {
      const allConfigs = getAllConfigs()
      return allConfigs[tableId]?.columnVisibility || null
    } catch (error) {
      console.error(`❌ Failed to get column config for table ${tableId}:`, error)
      return null
    }
  }

  /**
   * Save complete table configuration (column visibility, page size, sorting, etc.)
   * @param tableId - Unique identifier for the table
   * @param config - Complete table configuration object
   */
  const saveTableConfig = (tableId: string, config: TableConfiguration): boolean => {
    try {
      const allConfigs = getAllConfigs()
      allConfigs[tableId] = {
        ...allConfigs[tableId],
        ...config,
      }

      const success = storage.setItem(getStorageKey(), allConfigs)

      return success
    } catch (error) {
      console.error(`❌ Failed to save table config for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Get complete table configuration for a specific table
   * @param tableId - Unique identifier for the table
   */
  const getTableConfig = (tableId: string): TableConfiguration | null => {
    try {
      const allConfigs = getAllConfigs()
      return allConfigs[tableId] || null
    } catch (error) {
      console.error(`❌ Failed to get table config for table ${tableId}:`, error)
      return null
    }
  }

  /**
   * Reset table configuration to default for a specific table
   * @param tableId - Unique identifier for the table
   */
  const resetTableConfig = (tableId: string): boolean => {
    try {
      const allConfigs = getAllConfigs()

      if (allConfigs[tableId]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete allConfigs[tableId]
        const success = storage.setItem(getStorageKey(), allConfigs)

        return success
      }

      return true // Already reset/doesn't exist
    } catch (error) {
      console.error(`❌ Failed to reset table config for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Get all table configurations
   */
  const getAllTableConfigs = (): TableConfigStorage | null => {
    try {
      return getAllConfigs()
    } catch (error) {
      console.error('❌ Failed to get all table configs:', error)
      return null
    }
  }

  /**
   * Clear all table configurations
   */
  const clearAllTableConfigs = (): boolean => {
    try {
      const success = storage.removeItem(getStorageKey())

      return success
    } catch (error) {
      console.error('❌ Failed to clear all table configs:', error)
      return false
    }
  }
  /**
   * Check if auto-refresh is enabled for a specific table
   * @param tableId - Unique identifier for the table
   */
  const getIsAutoRefresh = (tableId: string): boolean | null => {
    try {
      const config = getTableConfig(tableId)
      return config?.autoRefresh ?? null
    } catch (error) {
      console.error(`❌ Failed to check auto-refresh for table ${tableId}:`, error)
      return null
    }
  }

  /**
   * Save auto-refresh setting for a specific table
   * @param tableId - Unique identifier for the table
   * @param isEnabled - Whether auto-refresh is enabled
   */

  const saveAutoRefresh = (tableId: string, isEnabled: boolean): boolean => {
    try {
      const config = getTableConfig(tableId)
      if (!config) {
        console.warn(`Table config for ${tableId} does not exist, creating a new one.`)
        return saveTableConfig(tableId, {
          columnVisibility: {},
          autoRefresh: isEnabled,
          pageSize: DEFAULT_PAGE_SIZE.value,
          sortingState: [],
        })
      }
      config.autoRefresh = isEnabled
      saveTableConfig(tableId, config)
      return true
    } catch (error) {
      console.error(`❌ Failed to save auto-refresh for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Save sorting state for a specific table
   * @param tableId - Unique identifier for the table
   * @param sortingState - Array of sorting configurations
   */
  const saveSortingState = (
    tableId: string,
    sortingState: Array<{ id: string; desc: boolean }>
  ): boolean => {
    try {
      const allConfigs = getAllConfigs()

      if (!allConfigs[tableId]) {
        allConfigs[tableId] = {
          columnVisibility: {},
          sortingState,
        }
      } else {
        allConfigs[tableId].sortingState = sortingState
      }

      const success = storage.setItem(getStorageKey(), allConfigs)

      return success
    } catch (error) {
      console.error(`❌ Failed to save sorting state for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Get sorting state for a specific table
   * @param tableId - Unique identifier for the table
   */
  const getSortingState = (tableId: string): Array<{ id: string; desc: boolean }> | null => {
    try {
      const allConfigs = getAllConfigs()
      return allConfigs[tableId]?.sortingState || null
    } catch (error) {
      console.error(`❌ Failed to get sorting state for table ${tableId}:`, error)
      return null
    }
  }

  /**
   * Save status filter for a specific table
   * @param tableId - Unique identifier for the table
   * @param statusFilterValue - Selected status filter value (only store the value, not the label)
   */
  const saveStatusFilter = (tableId: string, statusFilterValue: string[]): boolean => {
    try {
      const allConfigs = getAllConfigs()

      if (!allConfigs[tableId]) {
        allConfigs[tableId] = {
          columnVisibility: {},
          statusFilter: statusFilterValue,
        }
      } else {
        allConfigs[tableId].statusFilter = statusFilterValue
      }

      const success = storage.setItem(getStorageKey(), allConfigs)

      return success
    } catch (error) {
      console.error(`❌ Failed to save status filter for table ${tableId}:`, error)
      return false
    }
  }

  /**
   * Get status filter for a specific table
   * @param tableId - Unique identifier for the table
   */
  const getStatusFilter = (tableId: string): string[] | null => {
    try {
      const allConfigs = getAllConfigs()
      return allConfigs[tableId]?.statusFilter || null
    } catch (error) {
      console.error(`❌ Failed to get status filter for table ${tableId}:`, error)
      return null
    }
  }

  return {
    saveColumnConfig,
    getColumnConfig,
    saveTableConfig,
    getTableConfig,
    resetTableConfig,
    getAllTableConfigs,
    clearAllTableConfigs,
    getIsAutoRefresh,
    saveAutoRefresh,
    saveSortingState,
    getSortingState,
    saveStatusFilter,
    getStatusFilter,
  }
}
