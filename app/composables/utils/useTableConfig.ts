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

  return {
    saveColumnConfig,
    getColumnConfig,
    saveTableConfig,
    getTableConfig,
    resetTableConfig,
    getAllTableConfigs,
    clearAllTableConfigs,
  }
}
