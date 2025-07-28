/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import type { Column } from '@tanstack/vue-table'
import type { TableColumnConfig, TableConfiguration } from '~/types/table'
import { useTableConfig } from './useTableConfig'

/**
 * Enhanced table composable with persistent column configuration
 * @param tableId - Unique identifier for the table
 * @param defaultColumnVisibility - Default column visibility configuration
 */
export const useTableWithConfig = <T = unknown>(
  tableId: string,
  defaultColumnVisibility: TableColumnConfig = {}
) => {
  const tableConfig = useTableConfig()

  // Initialize column visibility from localStorage or defaults
  const initializeColumnVisibility = (): TableColumnConfig => {
    const savedConfig = tableConfig.getColumnConfig(tableId)
    return savedConfig || defaultColumnVisibility
  }

  const columnVisibility = ref<TableColumnConfig>(initializeColumnVisibility())

  /**
   * Save current column visibility to localStorage
   */
  const saveColumnVisibility = () => {
    tableConfig.saveColumnConfig(tableId, columnVisibility.value)
  }

  /**
   * Reset column visibility to defaults and clear from localStorage
   */
  const resetColumnVisibility = () => {
    columnVisibility.value = { ...defaultColumnVisibility }
    tableConfig.resetTableConfig(tableId)
  }

  /**
   * Toggle column visibility and save to localStorage
   * @param columnId - The column ID to toggle
   * @param isVisible - Whether the column should be visible
   */
  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    columnVisibility.value[columnId] = isVisible
    saveColumnVisibility()
  }

  /**
   * Get computed column configuration for the table API
   * @param table - The table template ref
   */
  const getColumnConfig = (table: Ref<any>) => {
    return computed<Column<T>[]>(() => {
      return (
        table?.value?.tableApi
          ?.getAllColumns()
          .filter((column: Column<T>) => column.getCanHide()) ?? []
      )
    })
  }

  /**
   * Reset table API column visibility (for immediate UI update)
   * @param table - The table template ref
   */
  const resetTableApiColumns = (table: Ref<any>) => {
    table?.value?.tableApi?.resetColumnVisibility()
  }

  /**
   * Initialize table configuration from localStorage
   * @param table - The table template ref
   */
  const initializeTableConfig = (table: Ref<any>) => {
    const savedConfig = tableConfig.getTableConfig(tableId)

    if (savedConfig?.columnVisibility && table?.value?.tableApi) {
      // Apply saved column visibility
      Object.entries(savedConfig.columnVisibility).forEach(([columnId, isVisible]) => {
        table.value.tableApi.getColumn(columnId)?.toggleVisibility(isVisible)
      })
    }
  }

  /**
   * Save complete table configuration (including sorting, page size, etc.)
   * @param config - Complete table configuration
   */
  const saveTableConfiguration = (config: Partial<TableConfiguration>) => {
    const currentConfig = tableConfig.getTableConfig(tableId) || {}
    const updatedConfig: TableConfiguration = {
      ...currentConfig,
      ...config,
      columnVisibility: columnVisibility.value,
    }

    tableConfig.saveTableConfig(tableId, updatedConfig)
  }

  /**
   * Watch for column visibility changes and auto-save
   */
  watch(
    columnVisibility,
    (newValue) => {
      tableConfig.saveColumnConfig(tableId, newValue)
    },
    { deep: true }
  )

  return {
    columnVisibility: readonly(columnVisibility),
    saveColumnVisibility,
    resetColumnVisibility,
    toggleColumnVisibility,
    getColumnConfig,
    resetTableApiColumns,
    initializeTableConfig,
    saveTableConfiguration,

    // Expose table config methods
    getTableConfig: () => tableConfig.getTableConfig(tableId),
    resetTableConfig: () => tableConfig.resetTableConfig(tableId),
  }
}
