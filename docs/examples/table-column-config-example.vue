<!-- 
  Example: How to implement table column configuration in any table
  Copy this pattern to add persistent column configuration to your tables
-->

<template>
  <div class="table-container">
    <!-- Column Configuration UI -->
    <div class="column-config-section">
      <UPopover>
        <UButton variant="ghost" icon="i-lucide-settings"> Column Settings </UButton>
        <template #content>
          <div class="p-4 space-y-2 min-w-48">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Columns</span>
              <UButton variant="link" size="sm" @click="resetColumnConfig"> Reset </UButton>
            </div>
            <div
              v-for="col in columnConfig"
              :key="col.id"
              class="flex items-center justify-between"
            >
              <UCheckbox
                :id="col.id"
                :label="getColumnLabel(col.id)"
                :model-value="col.getIsVisible()"
                size="sm"
                @update:model-value="
                  (value) => {
                    col.toggleVisibility(value as boolean)
                    columnVisibility[col.id] = value as boolean
                    saveColumnVisibility()
                  }
                "
              />
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <!-- Your Table Component -->
    <UTable
      ref="table"
      :data="tableData"
      :columns="columns"
      :column-visibility="columnVisibility"
      class="your-table-classes"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Import the table configuration composable
import { useTableConfig } from '~/composables/utils/useTableConfig'

// 2. Define unique table ID and default column visibility
const TABLE_ID = 'your-unique-table-id' // Change this to your table's unique identifier
const DEFAULT_COLUMN_VISIBILITY = {
  id: false,
  name: true,
  email: true,
  status: true,
  actions: true,
  // Add all your table columns here with their default visibility
}

// 3. Set up table configuration
const tableConfig = useTableConfig()

// 4. Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(TABLE_ID)
  return savedConfig || DEFAULT_COLUMN_VISIBILITY
}

const columnVisibility = ref<Record<string, boolean>>(initializeColumnVisibility())

// 5. Auto-save function
const saveColumnVisibility = () => {
  tableConfig.saveColumnConfig(TABLE_ID, columnVisibility.value)
}

// 6. Watch for changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })

// 7. Reset function
const resetColumnConfig = () => {
  // Reset table API columns
  table?.value?.tableApi?.resetColumnVisibility()

  // Reset to default visibility and save
  columnVisibility.value = { ...DEFAULT_COLUMN_VISIBILITY }
  saveColumnVisibility()
}

// 8. Get column configuration for UI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = useTemplateRef<any>('table')
const columnConfig = computed(() => {
  return (
    table?.value?.tableApi
      ?.getAllColumns()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((column: any) => column.getCanHide()) ?? []
  )
})

// 9. Helper function for column labels
const getColumnLabel = (columnId: string) => {
  // Customize this function to return appropriate labels for your columns
  const labels: Record<string, string> = {
    id: 'ID',
    name: 'Name',
    email: 'Email',
    status: 'Status',
    actions: 'Actions',
    // Add your column labels here
  }
  return labels[columnId] || columnId
}

// 10. Initialize table column visibility when table API is ready
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

// 11. Watch for table API changes and initialize
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

// Your existing table setup...
const tableData = ref([])
const columns = ref([
  // Your table columns definition
])
</script>

<!--
IMPLEMENTATION CHECKLIST:

1. ✅ Import useTableConfig composable
2. ✅ Define unique TABLE_ID for your table
3. ✅ Define DEFAULT_COLUMN_VISIBILITY with all your columns
4. ✅ Initialize columnVisibility from localStorage
5. ✅ Add watch for auto-saving changes
6. ✅ Implement resetColumnConfig function
7. ✅ Create columnConfig computed for UI
8. ✅ Add column configuration UI to your template
9. ✅ Add table ref and column-visibility prop to UTable
10. ✅ Initialize table column visibility on mount

NOTES:
- Make sure your TABLE_ID is unique across the application
- Default visibility should match your table's initial state
- The system automatically handles persistence and restoration
- Users can reset to defaults at any time
- Configuration is scoped per table, so multiple tables won't interfere

ADVANCED FEATURES:
- You can also save page size, sorting state, and other table configurations
- Use tableConfig.saveTableConfig() for complete table state
- The system handles data corruption gracefully
- All changes are debounced and optimized
-->
