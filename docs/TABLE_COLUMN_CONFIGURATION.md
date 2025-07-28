# Table Column Configuration System

## Overview

This system provides a scalable and maintainable way to save and restore table column configurations (visibility, page size, sorting, etc.) using localStorage. The implementation supports multiple tables across the application with unique identifiers.

## Architecture

### 1. Storage Constants (`utils/constants.ts`)

```typescript
export const LOCAL_STORAGE_KEYS = {
  TABLE_COLUMN_CONFIG: 'table-column-config',
  // ... other keys
}
```

### 2. Type Definitions (`types/table.d.ts`)

- `TableColumnConfig`: Object mapping column IDs to visibility boolean
- `TableConfiguration`: Complete table configuration including column visibility, page size, sorting
- `TableConfigStorage`: Storage object containing configurations for multiple tables
- `TableConfigComposable`: Interface for table configuration methods

### 3. Core Composable (`composables/utils/useTableConfig.ts`)

The main composable provides methods for:

- `saveColumnConfig(tableId, columnVisibility)`: Save column visibility for a specific table
- `getColumnConfig(tableId)`: Get saved column configuration
- `saveTableConfig(tableId, config)`: Save complete table configuration
- `getTableConfig(tableId)`: Get complete table configuration
- `resetTableConfig(tableId)`: Reset configuration to defaults
- `getAllTableConfigs()`: Get all table configurations
- `clearAllTableConfigs()`: Clear all configurations

### 4. Enhanced Composable (`composables/utils/useTableWithConfig.ts`)

A higher-level composable that provides:

- Automatic initialization from localStorage
- Reactive column visibility management
- Auto-save functionality
- Table API integration helpers

## Usage Examples

### Basic Implementation (Recommended)

```vue
<script setup lang="ts">
import { useTableConfig } from '~/composables/utils/useTableConfig'

// Define table ID and default configuration
const TABLE_ID = 'my-table'
const DEFAULT_COLUMN_VISIBILITY = {
  id: false,
  name: true,
  email: true,
  status: true,
  actions: true,
}

// Initialize table configuration
const tableConfig = useTableConfig()
const columnVisibility = ref(tableConfig.getColumnConfig(TABLE_ID) || DEFAULT_COLUMN_VISIBILITY)

// Save changes automatically
watch(
  columnVisibility,
  () => {
    tableConfig.saveColumnConfig(TABLE_ID, columnVisibility.value)
  },
  { deep: true }
)

// Reset function
const resetColumns = () => {
  columnVisibility.value = { ...DEFAULT_COLUMN_VISIBILITY }
  tableConfig.resetTableConfig(TABLE_ID)
}

// Toggle function for checkboxes
const toggleColumn = (columnId: string, isVisible: boolean) => {
  columnVisibility.value[columnId] = isVisible
  // Auto-save is handled by the watcher
}
</script>

<template>
  <div class="column-config">
    <UCheckbox
      v-for="(isVisible, columnId) in columnVisibility"
      :key="columnId"
      :model-value="isVisible"
      :label="getColumnLabel(columnId)"
      @update:model-value="(value) => toggleColumn(columnId, value)"
    />
    <UButton @click="resetColumns">Reset</UButton>
  </div>
</template>
```

### Advanced Implementation

```vue
<script setup lang="ts">
// Using the enhanced composable
const {
  columnVisibility,
  saveColumnVisibility,
  resetColumnVisibility,
  toggleColumnVisibility,
  initializeTableConfig,
} = useTableWithConfig('advanced-table', {
  id: false,
  name: true,
  // ... other defaults
})

// Initialize table on mount
onMounted(() => {
  nextTick(() => {
    initializeTableConfig(table)
  })
})
</script>
```

## Implementation in Settlement History Page

The settlement history page (`pages/digital-wallet/settlement/index.vue`) demonstrates the complete implementation:

1. **Table ID Definition**: `'settlement-history'`
2. **Default Configuration**: Defined with appropriate defaults for each column
3. **Auto-save**: Column visibility changes are automatically saved to localStorage
4. **Restoration**: Saved configuration is restored when the page loads
5. **Reset Functionality**: Users can reset to default configuration

### Key Features:

- ✅ Persistent column visibility across page reloads
- ✅ Automatic saving on configuration changes
- ✅ Reset to defaults functionality
- ✅ Multiple table support with unique IDs
- ✅ Type-safe implementation
- ✅ Easy to integrate into existing tables

## Storage Structure

The localStorage stores configurations in this format:

```json
{
  "table-column-config": {
    "settlement-history": {
      "columnVisibility": {
        "id": false,
        "row_number": true,
        "created_date": true,
        "total_amount": true,
        "currency_id": true,
        "created_by": true,
        "total_settled": true,
        "status": true,
        "select": true
      },
      "pageSize": 25,
      "sortingState": [{ "id": "created_date", "desc": true }]
    },
    "another-table": {
      "columnVisibility": {
        /* ... */
      }
    }
  }
}
```

## Best Practices

1. **Unique Table IDs**: Use descriptive, unique identifiers for each table
2. **Default Configuration**: Always provide sensible defaults
3. **Error Handling**: The system gracefully handles corrupted or missing data
4. **Performance**: Configuration is only saved when changes occur
5. **Type Safety**: Use TypeScript interfaces for better development experience

## Migration Guide

To add table configuration to an existing table:

1. Import the composable: `import { useTableConfig } from '~/composables/utils/useTableConfig'`
2. Define table ID and defaults
3. Initialize column visibility from storage
4. Add watchers for auto-save
5. Update UI to use the reactive configuration
6. Add reset functionality

## Future Enhancements

Potential future improvements:

- Column ordering/reordering
- Column width persistence
- Advanced filtering configurations
- Export/import table configurations
- User-specific configurations (when auth is implemented)
- Column grouping configurations
