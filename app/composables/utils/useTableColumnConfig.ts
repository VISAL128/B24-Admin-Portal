/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'

/**
 * Simple utility function to quickly add column configuration to any table
 * @param tableId - Unique identifier for the table
 * @param defaultColumnVisibility - Default column visibility configuration
 * @param table - Optional table ref for immediate initialization
 */
export async function setupTableColumnConfig(
  tableId: string,
  defaultColumnVisibility: Record<string, boolean>,
  table?: Ref<any>
) {
  const { useTableConfig } = await import('~/composables/utils/useTableConfig')
  const tableConfig = useTableConfig()

  // Initialize column visibility from localStorage or defaults
  const columnVisibility = ref<Record<string, boolean>>(
    tableConfig.getColumnConfig(tableId) || defaultColumnVisibility
  )

  // Auto-save function
  const saveColumnVisibility = () => {
    tableConfig.saveColumnConfig(tableId, columnVisibility.value)
  }

  // Watch for changes and auto-save
  watch(columnVisibility, saveColumnVisibility, { deep: true })

  // Toggle function for UI
  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    columnVisibility.value[columnId] = isVisible
    // Auto-save is handled by the watcher
  }

  // Reset function
  const resetColumnConfig = () => {
    columnVisibility.value = { ...defaultColumnVisibility }
    if (table?.value?.tableApi) {
      table.value.tableApi.resetColumnVisibility()
    }
    tableConfig.resetTableConfig(tableId)
  }

  // Initialize table column visibility from saved configuration
  const initializeTableColumnVisibility = () => {
    if (table?.value?.tableApi) {
      Object.entries(columnVisibility.value).forEach(([columnId, isVisible]) => {
        const column = table.value.tableApi.getColumn(columnId)
        if (column) {
          column.toggleVisibility(isVisible)
        }
      })
    }
  }

  // Auto-initialize if table ref is provided
  if (table) {
    watch(
      () => table?.value?.tableApi,
      (newApi) => {
        if (newApi) {
          nextTick(() => {
            initializeTableColumnVisibility()
          })
        }
      },
      { immediate: true }
    )
  }

  // Get column config for template use
  const getColumnConfig = () => {
    if (!table) return computed(() => [])

    return computed(() => {
      return (
        table?.value?.tableApi
          ?.getAllColumns()

          .filter((column: any) => column.getCanHide()) ?? []
      )
    })
  }

  return {
    columnVisibility: readonly(columnVisibility),
    toggleColumnVisibility,
    resetColumnConfig,
    saveColumnVisibility,
    initializeTableColumnVisibility,
    getColumnConfig,

    // Direct access to table config methods
    getTableConfig: () => tableConfig.getTableConfig(tableId),
    saveTableConfig: (config: any) => tableConfig.saveTableConfig(tableId, config),
  }
}

/**
 * Example usage in a Vue component:
 *
 * ```vue
 * <script setup lang="ts">
 * const table = useTemplateRef('table')
 *
 * const {
 *   columnVisibility,
 *   toggleColumnVisibility,
 *   resetColumnConfig,
 *   getColumnConfig
 * } = setupTableColumnConfig('my-table', {
 *   id: false,
 *   name: true,
 *   email: true,
 *   status: true
 * }, table)
 *
 * const columnConfig = getColumnConfig()
 * </script>
 *
 * <template>
 *   <div class="column-controls">
 *     <div v-for="col in columnConfig" :key="col.id">
 *       <UCheckbox
 *         :model-value="col.getIsVisible()"
 *         :label="col.id"
 *         @update:model-value="(value) => {
 *           col.toggleVisibility(value)
 *           toggleColumnVisibility(col.id, value)
 *         }"
 *       />
 *     </div>
 *     <UButton @click="resetColumnConfig">Reset</UButton>
 *   </div>
 * </template>
 * ```
 */
