# Migration from useTableWithConfig to useTableConfig

## Overview

Successfully migrated `ExTable.vue` from using the `useTableWithConfig` composable to using `useTableConfig` directly. This provides more direct control over table configuration management while maintaining all existing functionality.

## Key Changes Made

### 1. **Import Changes**
```typescript
// Before
import { useTableWithConfig } from '~/composables/utils/useTableWithConfig'
import { useTableConfig } from '~/composables/utils/useTableConfig'

// After
import { useTableConfig } from '~/composables/utils/useTableConfig'
import type { Ref } from 'vue'
```

### 2. **Composable Usage**
```typescript
// Before - Using useTableWithConfig
const {
  columnVisibility,
  resetColumnVisibility,
  toggleColumnVisibility,
  getColumnConfig,
  resetTableApiColumns,
  initializeTableConfig,
} = useTableWithConfig<T>(props.tableId, getDefaultColumnVisibility())

// After - Using useTableConfig directly
const tableConfig = useTableConfig()

const columnVisibility = ref<Record<string, boolean>>(initializeColumnVisibility())

// Custom functions implemented
const saveColumnVisibility = () => { ... }
const resetColumnVisibility = () => { ... }
const toggleColumnVisibility = (columnId: string, isVisible: boolean) => { ... }
const resetTableApiColumns = (table: Ref<any>) => { ... }
const initializeTableConfig = (table: Ref<any>) => { ... }
```

### 3. **Column Visibility Management**
```typescript
// Initialize column visibility from localStorage or defaults
const initializeColumnVisibility = (): Record<string, boolean> => {
  const savedConfig = tableConfig.getColumnConfig(props.tableId)
  return savedConfig || getDefaultColumnVisibility()
}

// Toggle column visibility with proper removal logic
const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
  if (isVisible) {
    columnVisibility.value[columnId] = true
  } else {
    // Remove hidden columns from config completely
    delete columnVisibility.value[columnId]
  }
  saveColumnVisibility()
}
```

### 4. **Auto-Save Watcher**
```typescript
// Watch for column visibility changes and auto-save
watch(columnVisibility, saveColumnVisibility, { deep: true })
```

### 5. **Filtered Columns Logic**
```typescript
// Updated to properly handle column visibility
const filteredColumns = computed(() => {
  const columns = columnsWithRowNumber.value
  return columns.filter((col) => {
    if (!col.id) return true
    const hasConfig = Object.keys(columnVisibility.value).length > 0
    if (!hasConfig) return true // Show all columns if no config exists yet
    return columnVisibility.value[col.id] === true
  })
})

// Separate computed for filterable columns
const filterableColumns = computed(() => {
  return columnsWithRowNumber.value.filter((col) => col.enableColumnFilter === true)
})
```

### 6. **Template Updates**
```vue
<!-- Updated filter dropdown to use filterableColumns -->
<template v-for="col in filterableColumns" :key="col.id">
  <template v-if="col.enableColumnFilter">
    <!-- ... -->
  </template>
</template>
```

## Benefits of Direct useTableConfig Usage

### ✅ **Advantages**
1. **More Control**: Direct access to table configuration methods
2. **Simpler Architecture**: No intermediate composable layer
3. **Better Performance**: Fewer function calls and abstractions
4. **Easier Debugging**: Direct visibility into configuration operations
5. **Customization**: Ability to customize behavior without modifying shared composable

### ✅ **Maintained Features**
- Column visibility persistence
- Page size persistence
- Automatic localStorage saving
- Table configuration reset
- Proper initialization from saved config
- Column removal when hidden (not just set to false)

### ✅ **Key Functionality**
- **Column Visibility**: Saved/restored from localStorage
- **Page Size**: Persisted across sessions
- **Configuration Reset**: Restore to default state
- **Auto-Save**: Changes automatically saved to localStorage
- **Clean Config**: Hidden columns removed from config (not set to false)

## Usage

The component usage remains exactly the same:

```vue
<template>
  <TablesExTable
    table-id="my-unique-table"
    :columns="tableColumns"
    :data="tableData"
    @row-click="handleRowClick"
  />
</template>
```

## Migration Benefits

1. **Reduced Dependencies**: No longer depends on `useTableWithConfig`
2. **Direct Control**: Full control over configuration logic
3. **Performance**: Fewer abstraction layers
4. **Maintainability**: Easier to understand and modify
5. **Flexibility**: Can customize behavior per table if needed

The migration maintains full backward compatibility while providing more direct control over table configuration management.
